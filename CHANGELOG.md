# Changelog

All notable changes to Tana Themer (themes for Tana Outliner) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.3.4] — 2026-05-21

### Fixed
- **Theming now actually works against the renamed host app.** The Tana
  desktop bundle has been renamed on disk to `/Applications/Tana
  Outliner.app` with executable `Tana Outliner` (with the space). v3.3.3
  was a labels-only update that left the daemon's hardcoded paths
  pointing at the old `/Applications/Tana.app/Contents/MacOS/Tana` and
  the process detector calling `pgrep -x Tana` — so on a machine where
  the rename had landed, the daemon never detected the app, never
  relaunched it with `--remote-debugging-port=9222`, and never injected.
  v3.3.4 updates:
  - `TANA_APP` constant in `tana-themer-daemon.js`
  - `pgrep` / `pkill` invocations in both the daemon and the
    `.app` dispatcher to target `"Tana Outliner"` (quoted because the
    process name contains a space)

## [3.3.3] — 2026-05-21

### Changed
- **Renamed product references from "Tana" to "Tana Outliner"** across
  user-facing docs (README, AGENTS), the Apple Events usage description
  shown in the macOS permission prompt, the userscript `@description`,
  and the two default theme display names ("Tana Light" / "Tana Dark"
  → "Tana Outliner Light" / "Tana Outliner Dark"). Theme IDs
  (`tana-light`, `tana-dark`), CSS variable names, file paths
  (`/Applications/Tana.app`), URLs (`app.tana.inc`), the repo name
  (`tana-themer`), and all other code identifiers are unchanged — this
  is a pure labelling update with no behavioural change. Existing
  installs upgrade silently; saved theme preferences carry over by ID.
- Userscript `@version` bumped 1.3.0 → 1.4.0 for the theme name change.

## [3.3.2] — 2026-05-13

### Fixed
- **Claude theme widget panels now actually tint to the warm bg.**
  v3.3.1 added 10 speculative variable overrides hoping one would
  hit the widget-panel container. A definitive CDP-based introspection
  of Tana's live CSS (see `scripts/inspect-tana-vars.js`) found that
  the panels are controlled by `--colorWidgetPanelBackground`
  (defaulting to `rgba(255, 255, 255, .8)` — semi-transparent white),
  which is what was bleeding through. The v3.3.1 guesses were all
  real Tana vars, just for *different* container types.
- Also overrode `--colorNavigationGridItemBackground` (defaults to
  hardcoded `white` in Tana) and a handful of other vars confirmed
  to exist in Tana's stylesheet but to default to white/light values
  not matching the Claude palette: `--colorPopoverPanelBackground`,
  `--colorNavigationPanelBackground`, `--colorTopBarBackground`,
  `--colorPanelToolbarBackground`, `--colorConfigBackground`,
  `--colorAIChatPanelBackground`, `--colorUICardBackground`,
  `--colorUICardBackgroundActive`.

### Added
- `scripts/inspect-tana-vars.js` — diagnostic utility that connects
  to a running Tana session via CDP (port 9222) and enumerates every
  CSS custom property Tana defines, with the values currently
  resolving on `:root`. Useful for future theme development — strip
  away guesswork by seeing exactly what variables Tana exposes.

## [3.3.1] — 2026-05-13

### Fixed
- **Claude theme: side widget panels stayed pure white** while the
  main editor showed the warm off-white background. The Late /
  Today / Triage / Inbox cards on the home view reference a CSS
  variable that none of the existing themes had been overriding.
  Added 10 speculative widget / overlay / card background variable
  overrides — Tana ignores the ones it doesn't use, applies the
  ones it does, so widget panels now match the main background.
  The fix is scoped to the Claude theme; other light themes
  (Warm Sepia, CoffeeBuddy Pro) likely have the same issue and
  can be patched the same way if anyone reports it.

## [3.3.0] — 2026-05-13

### Added
- **Claude** — a new built-in light theme inspired by claude.ai's
  UI. The signature touch: the background is a warm off-white
  (`#faf9f5`) rather than pure white, which reads as "white" but
  feels softer for long-form work — the same effect Anthropic uses
  in Claude itself. Anthropic terracotta (`#c96442`) drives every
  accent: links, focus, bullets, inline-code text, scrollbars,
  borders-on-hover. Text is warm dark grey (`#2a2520`) instead of
  pure black, keeping the whole UI in the same warm temperature.
- 54 vars, light mode, available in both desktop and browser
  surfaces. Userscript `@version` bumped 1.2.0 → 1.3.0.

## [3.2.0] — 2026-04-29

### Added
- **Two new built-in themes** built on the Nord palette, split into
  the two halves the official Nord designers themselves describe:
  - **Nord Frost** — cool, icy. Polar Night backgrounds with the
    four Frost colours (`#8fbcbb` teal, `#88c0d0` cyan, `#81a1c1`
    medium blue, `#5e81ac` dark blue) driving every accent.
  - **Nord Aurora** — warm, vivid. Same Polar Night base but
    accents drawn from all five Aurora colours: green primary
    links (`#a3be8c`), purple focus (`#b48ead`), orange
    focus-within (`#d08770`), yellow highlights + bullets +
    sidebar hover (`#ebcb8b`), red inline code (`#bf616a`).
- Both themes are dark-mode, each set 54 CSS variables, and ship in
  both the desktop `themes.js` and the browser userscript
  (`tana-themer.user.js`, bumped to userscript `@version 1.2.0`).

## [3.1.1] — 2026-04-29

### Changed
- **The `.app` is now code-signed with a Developer ID and notarized
  by Apple.** macOS 15 (Sequoia) had removed the right-click → Open
  Gatekeeper bypass — unsigned apps could only be opened via System
  Settings → Privacy & Security. Signed + notarized builds open with
  a single double-click and no Gatekeeper dialogs at all, online or
  offline (notarization ticket is stapled to the bundle).
- New `scripts/sign-and-notarize.sh` automates the whole release
  pipeline: clean xattrs, sign all inner scripts + the bundle with
  hardened runtime + secure timestamp, submit to Apple's notary
  service, staple, verify with `spctl`, and rebuild the dist zip.
- `scripts/entitlements.plist` is intentionally empty — Tana Themer
  needs no special hardened-runtime exceptions, keeping the security
  posture minimal.
- README's first-launch instructions no longer mention right-click
  bypass; the signed build just opens.

### Added
- `.gitignore` now excludes `*.p8`, `*.p12`, `*.pem`, `*.cer` and
  notarization log files so signing secrets can't be committed by
  accident.

## [3.1.0] — 2026-04-29

### Added
- **Personal themes** (desktop). Drop a `.json` file into
  `~/Library/Application Support/TanaThemer/user-themes/` and it
  appears in the picker on next Tana launch — no rebuild, no daemon
  restart, no editing source files. Invalid files are skipped and
  the reason is logged to `~/Library/Logs/tana-themer.log`. A user
  theme with the same `id` as a built-in replaces the built-in for
  that install.
- **Set Up & Enable** now provisions the `user-themes/` directory
  with a `README.txt` (schema docs) and `EXAMPLE.json.disabled`
  (rename to `.json` and tweak — instant theme).
- **`scripts/new-theme.sh "Theme Name" [light|dark]`** — scaffold
  script for adding new built-in themes. Inserts a working starter
  entry into both `themes.js` (desktop) and `tana-themer.user.js`
  (browser) at the right spot, slugifies the id, and runs
  `node --check` to confirm the result still parses. Optional
  second argument selects light or dark mode (default: dark).
- README rewritten with a clear two-path "Adding themes" section:
  Path A (personal, desktop-only, JSON drop-in) and Path B (built-in,
  shared, scaffold script).

### Changed
- The Enable action now always re-runs `install_files`, so dropping
  a new `.app` build into `/Applications` and toggling Disable →
  Enable fully refreshes the installed daemon code. Previously an
  upgrade required Remove completely + Set Up & Enable.

## [3.0.1] — 2026-04-29

### Fixed
- **Control panel dialog never appeared** in the *Enabled* and
  *Disabled (but installed)* states. AppleScript's `display dialog`
  is hard-limited to 3 buttons; v3.0.0 was trying to show 4 (Remove
  completely / View logs / primary action / Quit), so the script
  errored out silently and the .app exited without rendering
  anything. Each state now shows ≤3 buttons, with **View logs** and
  **Remove completely** tucked behind a *More options…* submenu.
  Pressing Esc on any dialog dismisses it cleanly.

### Changed
- AppleScript stderr is no longer swallowed — dispatcher errors are
  appended to `~/Library/Logs/tana-themer.log` so future regressions
  are debuggable.
- *Remove completely* now also unloads the legacy `xyz.inness`
  LaunchAgent (if present from a pre-3.0.1 install) and `pkill`s any
  stray helper process.

## [3.0.0] — 2026-04-28

First public release.

### Added
- **Tana Themer.app** is now a self-installing native control panel.
  Double-click it to set up, enable, disable, view logs, or remove
  Tana Themer completely — no Terminal, no install script required
  for end users.
- Background **LaunchAgent** runs the helper silently and auto-starts
  it at login.
- **Deferred disable**: clicking *Disable when I quit Tana* leaves
  your current Tana session untouched. The helper exits the moment
  you next quit Tana yourself. A *Cancel disable* button lets you
  change your mind.
- **Symmetric enable**: if Tana is already running without the
  debug port when you click Enable, the dialog asks whether to
  restart Tana now or wait until next launch.
- `scripts/install.sh` for developers — syncs source into the
  bundle, installs to `/Applications`, and produces a versioned
  `dist/` zip ready to attach to a GitHub release.
- MIT license, README security note, and a public GitHub home.

### Changed
- The desktop daemon (`tana-themer-daemon.js`) is now a long-running
  watcher rather than a one-shot launcher. It polls for Tana,
  relaunches it once per session with `--remote-debugging-port=9222`,
  injects the theme over CDP, and re-injects on every page navigation.
- The browser userscript (`tana-themer.user.js`) is unchanged.

### Removed
- The Terminal window that previously appeared when launching the
  desktop helper. The helper now runs as a background LaunchAgent
  with logs written to `~/Library/Logs/tana-themer.log`.
- `desktop-inject.js` (replaced by `tana-themer-daemon.js`).
