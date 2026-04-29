# Changelog

All notable changes to Tana Themer are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
