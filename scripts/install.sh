#!/bin/bash
# install.sh — dev-side: sync source into the .app bundle, copy to
# /Applications, and produce a versioned zip in dist/.
#
# Convention: .app bundles install to /Applications (system-wide),
# and the script produces a versioned dist/{project}-{version}.zip
# suitable for attaching to a GitHub release.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_NAME="Tana Themer.app"
APP_SRC="$PROJECT_DIR/$APP_NAME"
APP_RES="$APP_SRC/Contents/Resources"
INSTALL_TARGET="/Applications/$APP_NAME"
DIST_DIR="$PROJECT_DIR/dist"

# ── Read version from Info.plist ────────────────────────────────────────────
VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" \
    "$APP_SRC/Contents/Info.plist")
PROJECT_SLUG="tana-themer"
ZIP_NAME="${PROJECT_SLUG}-${VERSION}.zip"

echo "▸ Tana Themer v${VERSION}"

# ── Sync source into bundle ─────────────────────────────────────────────────
echo "▸ Syncing source files into $APP_NAME/Contents/Resources/"
rm -rf "$APP_RES/daemon"
mkdir -p "$APP_RES/daemon"
cp "$PROJECT_DIR/tana-themer-daemon.js" \
   "$PROJECT_DIR/desktop-ui.js" \
   "$PROJECT_DIR/themes.js" \
   "$PROJECT_DIR/package.json" \
   "$APP_RES/daemon/"
cp -R "$PROJECT_DIR/node_modules" "$APP_RES/daemon/"
cp "$PROJECT_DIR/run-daemon.sh" "$APP_RES/run-daemon.sh"
chmod +x "$APP_RES/run-daemon.sh"
cp "$PROJECT_DIR/plist-template.xml" "$APP_RES/plist-template.xml"
chmod +x "$APP_SRC/Contents/MacOS/TanaThemer"

# ── Smoke checks ────────────────────────────────────────────────────────────
echo "▸ Smoke-checking scripts"
bash -n "$APP_SRC/Contents/MacOS/TanaThemer"
bash -n "$APP_RES/run-daemon.sh"
node --check "$APP_RES/daemon/tana-themer-daemon.js"

# ── Install to /Applications ────────────────────────────────────────────────
echo "▸ Installing to $INSTALL_TARGET"
if [ -e "$INSTALL_TARGET" ]; then
    rm -rf "$INSTALL_TARGET"
fi
cp -R "$APP_SRC" "$INSTALL_TARGET"

# ── Build dist zip ──────────────────────────────────────────────────────────
echo "▸ Building $DIST_DIR/$ZIP_NAME"
mkdir -p "$DIST_DIR"
rm -f "$DIST_DIR/$ZIP_NAME"
( cd "$PROJECT_DIR" && \
  ditto -c -k --sequesterRsrc --keepParent "$APP_NAME" "$DIST_DIR/$ZIP_NAME" )

echo ""
echo "✓ Installed: $INSTALL_TARGET"
echo "✓ Archive:   $DIST_DIR/$ZIP_NAME"
echo "✓ Version:   $VERSION"
echo ""
echo "Next: open '$INSTALL_TARGET' to set up & enable."
