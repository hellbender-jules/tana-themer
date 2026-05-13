#!/bin/bash
# sign-and-notarize.sh — code-sign Tana Themer.app with Developer ID,
# submit to Apple's notary service, staple the ticket, and rebuild the
# distribution zip.
#
# Prerequisites:
#   • Developer ID Application certificate in the login Keychain
#   • An xcrun notarytool keychain profile (see README "Releasing")
#
# Usage:
#   bash scripts/sign-and-notarize.sh
#
# Environment overrides:
#   TT_SIGN_IDENTITY    Code-signing identity (default: auto-detect from
#                       the only Developer ID Application cert)
#   TT_NOTARY_PROFILE   notarytool keychain profile (default: tana-themer-notary)
#   TT_TEAM_ID          Apple Developer Team ID (default: derived from cert)

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_NAME="Tana Themer.app"
APP_SOURCE="$PROJECT_DIR/$APP_NAME"
ENTITLEMENTS="$PROJECT_DIR/scripts/entitlements.plist"
DIST_DIR="$PROJECT_DIR/dist"
NOTARY_PROFILE="${TT_NOTARY_PROFILE:-tana-themer-notary}"

# Sign in a /tmp working copy. The source bundle in iCloud-backed
# Documents picks up com.apple.FinderInfo extended attributes that
# can't be stripped in place, and codesign refuses to operate on
# files that carry them.
WORK_DIR="$(mktemp -d)"
APP_PATH="$WORK_DIR/$APP_NAME"
trap 'rm -rf "$WORK_DIR"' EXIT

# ── Sanity checks ───────────────────────────────────────────────────────────
[ -d "$APP_SOURCE" ]    || { echo "Error: $APP_NAME not found at $APP_SOURCE" >&2; exit 1; }
[ -f "$ENTITLEMENTS" ]  || { echo "Error: $ENTITLEMENTS not found" >&2; exit 1; }
command -v codesign >/dev/null         || { echo "Error: codesign missing" >&2; exit 1; }
command -v xcrun >/dev/null            || { echo "Error: xcrun missing" >&2; exit 1; }
xcrun --find stapler >/dev/null        || { echo "Error: stapler missing" >&2; exit 1; }

# ── Resolve signing identity + team ID ──────────────────────────────────────
if [ -n "${TT_SIGN_IDENTITY:-}" ]; then
    IDENTITY="$TT_SIGN_IDENTITY"
else
    # Auto-detect the only Developer ID Application certificate.
    IDENTITY=$(security find-identity -v -p codesigning 2>/dev/null \
        | grep "Developer ID Application:" \
        | sed -E 's/^ *[0-9]+\) [A-F0-9]+ "(.+)"$/\1/' \
        | head -1)
    if [ -z "$IDENTITY" ]; then
        echo "Error: no 'Developer ID Application' certificate found in Keychain." >&2
        echo "       Set TT_SIGN_IDENTITY explicitly or install your Developer ID cert." >&2
        exit 1
    fi
fi

if [ -n "${TT_TEAM_ID:-}" ]; then
    TEAM_ID="$TT_TEAM_ID"
else
    TEAM_ID=$(printf '%s' "$IDENTITY" | sed -nE 's/.*\(([A-Z0-9]{10})\).*/\1/p')
fi
[ -n "$TEAM_ID" ] || { echo "Error: could not derive Team ID from identity '$IDENTITY'." >&2; exit 1; }

# ── Read version from source Info.plist ─────────────────────────────────────
VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" \
    "$APP_SOURCE/Contents/Info.plist")
ZIP_NAME="tana-themer-${VERSION}.zip"
NOTARIZATION_ZIP="$WORK_DIR/notarize.zip"

echo "▸ Identity:  $IDENTITY"
echo "▸ Team ID:   $TEAM_ID"
echo "▸ Profile:   $NOTARY_PROFILE"
echo "▸ Version:   $VERSION"
echo "▸ Source:    $APP_SOURCE"
echo "▸ Work copy: $APP_PATH"
echo ""

# ── Copy bundle to working dir + clean metadata ─────────────────────────────
echo "▸ Copying bundle to clean working dir"
ditto "$APP_SOURCE" "$APP_PATH"
xattr -rc "$APP_PATH" 2>/dev/null || true
find "$APP_PATH" -name ".DS_Store" -delete 2>/dev/null || true

# ── Sign every executable script + the bundle ───────────────────────────────
# Resource scripts must be signed individually; --deep on the bundle
# isn't enough for shell scripts under Resources/ to satisfy notarization.
echo "▸ Signing inner shell scripts"
while IFS= read -r -d '' script; do
    codesign --force --options runtime --timestamp \
        --entitlements "$ENTITLEMENTS" \
        --sign "$IDENTITY" \
        "$script"
done < <(find "$APP_PATH/Contents" -type f \( -name "*.sh" -o -path "*/MacOS/*" \) -print0)

echo "▸ Signing the bundle (deep)"
codesign --force --options runtime --timestamp --deep \
    --entitlements "$ENTITLEMENTS" \
    --sign "$IDENTITY" \
    "$APP_PATH"

echo "▸ Verifying signature"
codesign --verify --strict --verbose=2 "$APP_PATH"
echo ""

# ── Notarize ────────────────────────────────────────────────────────────────
echo "▸ Building notarization zip: $NOTARIZATION_ZIP"
ditto -c -k --sequesterRsrc --keepParent "$APP_PATH" "$NOTARIZATION_ZIP"

echo "▸ Submitting to Apple notary service (--wait, may take 1–5 minutes)"
xcrun notarytool submit "$NOTARIZATION_ZIP" \
    --keychain-profile "$NOTARY_PROFILE" \
    --wait

# ── Staple ──────────────────────────────────────────────────────────────────
echo ""
echo "▸ Stapling notarization ticket"
xcrun stapler staple "$APP_PATH"

echo "▸ Validating staple"
xcrun stapler validate "$APP_PATH"

echo "▸ Gatekeeper assessment"
spctl -a -vv --type execute "$APP_PATH" || true

# ── Rebuild distribution zip from the stapled bundle ────────────────────────
mkdir -p "$DIST_DIR"
rm -f "$DIST_DIR/$ZIP_NAME"
ditto -c -k --sequesterRsrc --keepParent "$APP_PATH" "$DIST_DIR/$ZIP_NAME"

# ── Sync the signed + stapled bundle back to the project root ───────────────
# So the .app sitting next to the source files is always the latest
# signed build, ready to double-click for local testing. The
# _CodeSignature/ dir and CodeResources file are .gitignore'd, so this
# doesn't pollute git status.
echo "▸ Syncing signed bundle back to project root"
rm -rf "$APP_SOURCE"
ditto "$APP_PATH" "$APP_SOURCE"
spctl -a -vv --type execute "$APP_SOURCE" || true

echo ""
echo "✓ Signed, notarized, stapled."
echo "✓ Dist:        $DIST_DIR/$ZIP_NAME"
echo "✓ Project app: $APP_SOURCE"
echo ""
echo "Verify on a test machine:"
echo "  curl -L -o /tmp/$ZIP_NAME <release-url>"
echo "  unzip /tmp/$ZIP_NAME -d /tmp/"
echo "  spctl -a -vv --type execute /tmp/'$APP_NAME'"
