#!/bin/bash
# run-daemon.sh — locate Node.js and exec the Tana Themer daemon.
# Used by the LaunchAgent so node-path changes (Homebrew updates, NVM
# version bumps) don't require regenerating the plist.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DAEMON="$SCRIPT_DIR/daemon/tana-themer-daemon.js"

NODE=""
for candidate in \
    "/opt/homebrew/bin/node" \
    "/usr/local/bin/node" \
    "/opt/homebrew/opt/node/bin/node" \
    "/usr/bin/node"
do
    if [ -x "$candidate" ]; then NODE="$candidate"; break; fi
done

if [ -z "$NODE" ]; then
    NVM_BASE="${NVM_DIR:-$HOME/.nvm}/versions/node"
    if [ -d "$NVM_BASE" ]; then
        BEST=$(ls -1 "$NVM_BASE" 2>/dev/null | sort -rV | head -1)
        if [ -n "$BEST" ] && [ -x "$NVM_BASE/$BEST/bin/node" ]; then
            NODE="$NVM_BASE/$BEST/bin/node"
        fi
    fi
fi

if [ -z "$NODE" ]; then
    NODE=$(command -v node 2>/dev/null || true)
fi

if [ -z "$NODE" ]; then
    echo "[tana-themer] ERROR: Node.js (v18+) not found" >&2
    exit 1
fi

exec "$NODE" "$DAEMON"
