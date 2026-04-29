#!/bin/bash
# new-theme.sh — scaffold a new built-in theme entry in both
# themes.js (desktop) and tana-themer.user.js (browser userscript).
#
# Usage:  bash scripts/new-theme.sh "My Theme Name" [light|dark]
#
# After running, edit the inserted entry in both files to set the
# real colour values, then run scripts/install.sh to rebuild the
# desktop helper.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
THEMES_JS="$PROJECT_DIR/themes.js"
USERSCRIPT="$PROJECT_DIR/tana-themer.user.js"

MARKER_THEMES_JS="// ── Add new built-in themes above this line (used by scripts/new-theme.sh) ──"
MARKER_USERSCRIPT="// ── Add new built-in themes above this line (used by scripts/new-theme.sh) ──"

usage() {
    echo "Usage: bash scripts/new-theme.sh \"Theme Name\" [light|dark]" >&2
    echo "" >&2
    echo "Examples:" >&2
    echo "  bash scripts/new-theme.sh \"Solarized Dark\"" >&2
    echo "  bash scripts/new-theme.sh \"Paper White\" light" >&2
    exit 1
}

if [ "$#" -lt 1 ] || [ -z "${1:-}" ]; then usage; fi
NAME="$1"
MODE="${2:-dark}"

if [ "$MODE" != "light" ] && [ "$MODE" != "dark" ]; then
    echo "Error: mode must be 'light' or 'dark' (got '$MODE')" >&2
    exit 1
fi

# Slugify: lowercase, spaces → hyphens, strip non-alnum-hyphen.
ID=$(printf '%s' "$NAME" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')
if [ -z "$ID" ]; then
    echo "Error: name slugified to empty string. Use letters/digits." >&2
    exit 1
fi

# Refuse to overwrite an existing theme id.
if grep -qE "['\"]${ID}['\"]: \{" "$THEMES_JS" 2>/dev/null \
   || grep -qE "['\"]${ID}['\"]: \{" "$USERSCRIPT" 2>/dev/null; then
    echo "Error: theme id '${ID}' already exists in themes.js or the userscript." >&2
    echo "Pick a different name or remove the existing entry first." >&2
    exit 1
fi

# Verify markers exist.
if ! grep -qF "$MARKER_THEMES_JS" "$THEMES_JS"; then
    echo "Error: marker comment not found in $THEMES_JS" >&2
    echo "Expected: $MARKER_THEMES_JS" >&2
    exit 1
fi
if ! grep -qF "$MARKER_USERSCRIPT" "$USERSCRIPT"; then
    echo "Error: marker comment not found in $USERSCRIPT" >&2
    echo "Expected: $MARKER_USERSCRIPT" >&2
    exit 1
fi

# Default preview swatches by mode.
if [ "$MODE" = "light" ]; then
    SWATCHES="'#fafafa', '#3070d0', '#222222'"
    BG_DEFAULT="#fafafa"
    TEXT_DEFAULT="#222222"
    LINK_DEFAULT="#3070d0"
else
    SWATCHES="'#1a1b26', '#7aa2f7', '#c0caf5'"
    BG_DEFAULT="#1a1b26"
    TEXT_DEFAULT="#c0caf5"
    LINK_DEFAULT="#7aa2f7"
fi

# Render templates. The desktop themes.js entry uses 2-space indent;
# the userscript THEMES sub-object is one level deeper (4 spaces).

read -r -d '' TEMPLATE_THEMES_JS <<EOF || true
  // ─── ${NAME} ─────────────────────────────────────────────
  '${ID}': {
    id:      '${ID}',
    name:    '${NAME}',
    mode:    '${MODE}',
    preview: [${SWATCHES}],
    vars: {
      '--colorPanelBackground':         '${BG_DEFAULT}',
      '--colorPanelBackgroundDimmed':   '${BG_DEFAULT}',
      '--colorEditorText':              '${TEXT_DEFAULT}',
      '--colorEditorTextHighlight':     '${TEXT_DEFAULT}',
      '--colorEditorTextMuted':         '${TEXT_DEFAULT}',
      '--colorUIText':                  '${TEXT_DEFAULT}',
      '--colorLink':                    '${LINK_DEFAULT}',
      '--colorFocus':                   '${LINK_DEFAULT}',
      // TODO: tune the rest. See README "Key variables" section.
    },
  },

EOF

read -r -d '' TEMPLATE_USERSCRIPT <<EOF || true
    // ─── ${NAME} ─────────────────────────────────────────────
    '${ID}': {
      id:      '${ID}',
      name:    '${NAME}',
      mode:    '${MODE}',
      preview: [${SWATCHES}],
      vars: {
        '--colorPanelBackground':         '${BG_DEFAULT}',
        '--colorPanelBackgroundDimmed':   '${BG_DEFAULT}',
        '--colorEditorText':              '${TEXT_DEFAULT}',
        '--colorEditorTextHighlight':     '${TEXT_DEFAULT}',
        '--colorEditorTextMuted':         '${TEXT_DEFAULT}',
        '--colorUIText':                  '${TEXT_DEFAULT}',
        '--colorLink':                    '${LINK_DEFAULT}',
        '--colorFocus':                   '${LINK_DEFAULT}',
        // TODO: tune the rest. See README "Key variables" section.
      },
    },

EOF

# Insert template before the marker line in each file. Uses awk's
# getline on a temp file so multi-line content is handled cleanly.
insert_before_marker() {
    local file="$1" template="$2" marker="$3"
    local tmpl_file out_file
    tmpl_file=$(mktemp)
    out_file=$(mktemp)
    printf '%s\n' "$template" > "$tmpl_file"
    awk -v marker="$marker" -v tmpl="$tmpl_file" '
        index($0, marker) {
            while ((getline line < tmpl) > 0) print line
            close(tmpl)
        }
        { print }
    ' "$file" > "$out_file"
    mv "$out_file" "$file"
    rm -f "$tmpl_file"
}

insert_before_marker "$THEMES_JS"   "$TEMPLATE_THEMES_JS"   "$MARKER_THEMES_JS"
insert_before_marker "$USERSCRIPT"  "$TEMPLATE_USERSCRIPT"  "$MARKER_USERSCRIPT"

# Sanity-check the JS files still parse.
if command -v node >/dev/null; then
    if ! node --check "$THEMES_JS" 2>/dev/null; then
        echo "Warning: themes.js no longer parses after insertion. Revert with git." >&2
    fi
fi

echo "✓ Added theme '${NAME}' (id: ${ID}, mode: ${MODE})"
echo ""
echo "Edited:"
echo "  • $THEMES_JS"
echo "  • $USERSCRIPT"
echo ""
echo "Next steps:"
echo "  1. Open both files and tune the colour values inside the new"
echo "     '${ID}' block. Search for '─── ${NAME} ───' to jump to it."
echo "  2. Run: bash scripts/install.sh    (rebuild + reinstall the desktop app)"
echo "  3. Re-paste tana-themer.user.js into Tampermonkey for the browser version."
echo "  4. Open Tana → click the 🎨 button → pick '${NAME}'."
