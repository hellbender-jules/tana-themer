# Tana Themer

Custom themes for [Tana](https://app.tana.inc) — works in both the **browser** (via Tampermonkey) and the **macOS desktop app** (via CDP injection).

> **Status:** v3.3.2, MIT-licensed, signed + notarized. Tested on macOS 14+ with Tana 1.0+ and Node.js 18+. Not affiliated with Tana.

## Themes included

| Theme | Mode | Description |
|---|---|---|
| **Tana Light** | Light | Tana default |
| **Tana Dark** | Dark | Tana default |
| **Claude** | Light | Inspired by claude.ai — warm off-white background (#faf9f5, not pure white), Anthropic terracotta accents, warm dark text |
| **Nord** | Dark | Arctic, cool blues — [nordtheme.com](https://www.nordtheme.com) |
| **Nord Frost** | Dark | Cool half of Nord — Polar Night + Frost cyans/teals/blues for every accent |
| **Nord Aurora** | Dark | Warm half of Nord — Polar Night + Aurora greens/yellows/oranges/purples |
| **Catppuccin Mocha** | Dark | Warm pastel purples and blues |
| **Rosé Pine** | Dark | Natural pine and rose tones |
| **Warm Sepia** | Light | Parchment tones for long-form writing |
| **CoffeeBuddy Pro** | Light | Warm coffee browns — ported from NotePlan CoffeeBuddy-Professional |
| **CoffeeBuddy Dark** | Dark | Rich espresso darks with golden accents — ported from NotePlan CoffeeBuddy-Dark |
| **Charcoal Squashed** | Dark | Cool neutral charcoal with yellow-green + cyan pops — ported from NotePlan Charcoal Squashed |

## Install — Browser (Tampermonkey)

1. Install [Tampermonkey](https://www.tampermonkey.net) for Chrome or Safari
2. Open Tampermonkey → Dashboard → **+** (new script)
3. Paste the contents of `tana-themer.user.js` and save (⌘S)
4. Open [app.tana.inc](https://app.tana.inc) — the 🎨 button appears in the bottom-right corner

## Install — macOS Desktop App

The desktop version runs as a silent background helper (LaunchAgent) — no terminal window. The `Tana Themer.app` is a control panel: double-click it to enable, disable, view logs, or remove it.

### Prerequisites

- macOS 11 or later
- [Tana desktop app](https://tana.inc) installed at `/Applications/Tana.app`
- [Node.js](https://nodejs.org) 18 or later (`node -v` to check)

### Quick install (recommended)

1. Download the latest `tana-themer-*.zip` from the [Releases page](https://github.com/hellbender-jules/tana-themer/releases/latest)
2. Unzip it — you'll get `Tana Themer.app`
3. Drag `Tana Themer.app` to `/Applications`
4. Double-click it
5. Click **Set Up & Enable** in the dialog that appears

That's it. The helper runs in the background, auto-starts at login, and applies your theme to Tana whenever Tana is launched.

The release builds are **code-signed with a Developer ID and notarized by Apple**, so Gatekeeper opens them without prompts on macOS 11+ (including Sequoia, which removed the right-click → Open bypass for unsigned apps). To verify before installing:

```bash
spctl -a -vv --type execute "/path/to/Tana Themer.app"
# expected: accepted, source=Notarized Developer ID
```

### Build from source

```bash
git clone https://github.com/hellbender-jules/tana-themer
cd tana-themer
npm install
bash scripts/install.sh        # syncs source → bundle, installs to /Applications, builds dist zip
open "/Applications/Tana Themer.app"
```

### Daily use

Just launch Tana normally (Dock, Spotlight, anywhere). The first launch of each session blinks Tana once as the helper relaunches it with the debug port enabled — after that, Tana behaves normally with the theme applied.

### Control panel actions

Open `Tana Themer.app` any time to see status and pick from:

| State | Available actions |
|---|---|
| Not set up yet | **Set Up & Enable** |
| Running | **Disable when I quit Tana**, **View logs**, **Remove completely** |
| Disable pending | **Cancel disable**, **View logs** |
| Disabled (installed) | **Enable**, **View logs**, **Remove completely** |

**Disable when I quit Tana** is deferred on purpose — your current Tana session is left untouched, and the helper exits the moment you next quit Tana yourself.

### How the desktop injection works

| Step | What happens |
|---|---|
| 1 | LaunchAgent starts the daemon at login (or when you click Enable) |
| 2 | Daemon polls every 2 s for the Tana process |
| 3 | If Tana is running without the debug port, daemon kills + relaunches it with `--remote-debugging-port=9222` |
| 4 | Daemon opens a CDP WebSocket and evaluates `window.__TT_THEMES__ = {...}` |
| 5 | Evaluates `desktop-ui.js` — same picker + CSS logic as the Tampermonkey script |
| 6 | Listens for `Page.frameNavigated` and re-injects on each navigation |

Theme preference is saved to Tana's own `localStorage`, so your choice persists across restarts.

### File overview

| File | Purpose |
|---|---|
| `themes.js` | Single source of truth — all theme objects |
| `desktop-ui.js` | Renderer-side script injected into Tana's Electron window via CDP |
| `tana-themer-daemon.js` | Long-running Node daemon — polls, relaunches Tana, injects |
| `run-daemon.sh` | LaunchAgent entrypoint — locates Node and execs the daemon |
| `plist-template.xml` | LaunchAgent template (paths filled in at install time) |
| `Tana Themer.app` | Native control panel (.app) — handles install/enable/disable/remove |
| `scripts/install.sh` | Dev-side: syncs source into the bundle, copies to `/Applications`, builds dist zip |

### Where things live after install

| Path | What |
|---|---|
| `/Applications/Tana Themer.app` | The control-panel app |
| `~/Library/Application Support/TanaThemer/daemon/` | Active daemon code |
| `~/Library/Application Support/TanaThemer/user-themes/` | Drop `*.json` files here for personal themes (desktop only) |
| `~/Library/LaunchAgents/io.github.hellbendereu.tana-themer.plist` | LaunchAgent registration |
| `~/Library/Logs/tana-themer.log` | Daemon stdout/stderr |

## Security

Tana Themer launches Tana with `--remote-debugging-port=9222`, which opens a Chrome DevTools Protocol (CDP) port bound to `localhost`. Anything else that can run code as your user on the same machine could attach to that port and execute JavaScript inside Tana's renderer — same trust model as launching Chrome with `--remote-debugging-port`.

Don't run Tana Themer on:
- a shared / multi-user account
- a machine where you don't trust everything else running as your user

The injected CSS and picker UI are open-source in this repo and execute entirely in your local Tana renderer — nothing is sent over the network and no Tana data leaves your machine. Theme preference is stored in Tana's own `localStorage`.

If you find a vulnerability, please open a GitHub issue (or, for sensitive reports, contact the repo owner privately).

## Adding themes

There are two paths depending on whether the theme is for **you only** or for **everyone using Tana Themer**.

### Path A — Personal themes (desktop only, no rebuild)

Drop a `.json` file into `~/Library/Application Support/TanaThemer/user-themes/`, restart Tana, done. The directory is created on Set Up & Enable and contains a `README.txt` and an `EXAMPLE.json.disabled` you can rename to `.json` and tweak.

**JSON schema:**

```json
{
  "id":      "my-personal-theme",
  "name":    "My Personal Theme",
  "mode":    "dark",
  "preview": ["#1a1b26", "#7aa2f7", "#c0caf5"],
  "vars": {
    "--colorPanelBackground":     "#1a1b26",
    "--colorPanelBackgroundDimmed": "#16171f",
    "--colorEditorText":          "#c0caf5",
    "--colorLink":                "#7aa2f7"
  }
}
```

**Rules:**
- `id` must be unique. Using the same id as a built-in theme **replaces** the built-in for your install.
- `mode` must be `"light"` or `"dark"`.
- `vars` is any subset of the [CSS variables listed below](#key-variables) — you don't need them all.
- Invalid JSON or missing required fields → file is **silently skipped** and a reason is appended to `~/Library/Logs/tana-themer.log`. Other themes still load.
- Themes are reloaded each time the daemon attaches to Tana — quit Tana and reopen it to pick up new files. (Disable → Enable from the .app forces a daemon restart if needed.)

This path **only affects the desktop app**. The browser userscript has its themes embedded — see Path B if you want a theme available in both.

### Path B — Built-in themes (shipped with the project, browser + desktop)

Built-ins live in `themes.js` (desktop) and the embedded `THEMES` object in `tana-themer.user.js` (browser). The two are kept in sync manually — there's a scaffold script that does the boilerplate for you.

**One command:**

```bash
bash scripts/new-theme.sh "Solarized Dark"
# add `light` as a second arg if you want a light theme
```

This appends a working starter entry to **both** files at the right spot, slugifies the id (`solarized-dark`), runs `node --check` on the result, and prints next steps. Then:

1. Open `themes.js` and `tana-themer.user.js`, find the new block (search for the theme name), and tune the colour values.
2. Run `bash scripts/install.sh` to rebuild and reinstall the desktop helper.
3. Re-paste `tana-themer.user.js` into Tampermonkey if you also use the browser version.
4. Open Tana → click 🎨 → pick your new theme.

If you'd like your theme included for everyone, open a pull request — the scaffold output is exactly the form expected.

### Manual approach (Path B by hand)

If you'd rather edit the files directly, add an entry to the `THEMES` object in both files:

```js
'my-theme': {
  id: 'my-theme',
  name: 'My Theme',
  mode: 'dark',                          // 'light' or 'dark'
  preview: ['#bg-color', '#accent', '#text-color'],  // 3 swatches for the picker
  vars: {
    '--colorPanelBackground':   '#1a1a2e',
    '--colorEditorText':        '#eaeaea',
    '--colorLink':              '#e94560',
    // ... add as many or as few vars as you like
  },
},
```

Insert above the `// ── Add new built-in themes above this line ──` marker comment in both files.

### Key variables

The variables you can put inside `vars` (Path A or B). All optional — set as many or as few as you like.

| Variable | Controls |
|---|---|
| `--colorPanelBackground` | Main content background |
| `--colorPanelBackgroundDimmed` | Secondary panels, sidebar |
| `--colorNavigationAltPanelBackground` | Left navigation area |
| `--colorUIContextMenuBackground` | Dropdowns, popovers |
| `--colorEditorText` | Main content text |
| `--colorEditorTextHighlight` | Headings, emphasized text |
| `--colorEditorTextMuted` | Muted / secondary text |
| `--colorUIText` | UI chrome text |
| `--colorUITextMuted` | Muted UI text |
| `--colorLink` | Links, primary accent |
| `--colorFocus` | Focus ring, selection accent |
| `--colorFocusWithin` | Hover accent |
| `--colorSelected` | Selected item background |
| `--colorUIStroke` | Standard borders |
| `--colorUIStrokeSoft` | Subtle borders |
| `--colorBulletDefaultFill` | Bullet dot color |
| `--inlineCode` | Inline code text |
| `--inlineCodeBackground` | Inline code background |
| `--scrollbarForeground` | Scrollbar thumb |
| `--colorTooltipBackground` | Tooltip background |
| `--colorTooltipText` | Tooltip text |

Tana uses a two-layer system:
- **Primitive palette** — fixed color scales (`--colorGray100` … `--colorGray975`, etc.)
- **Semantic tokens** — the variables above, which reference the palette

You can reference Tana's primitives in your values:

```js
'--colorLink': 'var(--colorGreen400)'
```

## Contributing

Pull requests welcome. The fastest way to add a new built-in theme is `bash scripts/new-theme.sh "Your Theme Name"` — see [Adding themes › Path B](#path-b--built-in-themes-shipped-with-the-project-browser--desktop) above.

## License

[MIT](LICENSE) — © 2026 hellbender-jules

## How it works

Both the browser and desktop versions share the same CSS injection strategy:

1. Read the saved theme from `localStorage` (key `tana-themer-active`)
2. Add `html.isDarkMode` / `html.isLightMode` + `html.tana-theme-<id>` classes to `<html>`
3. Inject a `<style id="tana-themer-styles">` block scoped to `html.isDarkMode.tana-theme-<id>` (or `isLightMode`) — same specificity as Tana's own rules, later in source order → wins without `!important`
4. Inject a floating 🎨 picker button (`#tt-root`) into `document.body`

The browser userscript (`tana-themer.user.js`) is self-contained and runs via Tampermonkey at `document-start`.
The desktop injector (`desktop-inject.js`) uses CDP to achieve the same result in the Electron renderer, and re-injects on every SPA navigation.
