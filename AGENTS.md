# AGENTS.md

Agent-readable notes for working on **Tana Themer**.

**Read this first** when you are about to:
- Add a new theme (built-in or personal)
- Tweak an existing theme's colours
- Debug a "this part of Tana Outliner isn't tinted correctly" report
- Cut a new release

It captures things that took past sessions a while to figure out, plus the tooling that makes those things one-shot the next time. Skim the relevant section, don't rederive.

## TL;DR — every release does all of this, every time

1. Bump `Info.plist` version
2. CHANGELOG entry
3. README status line
4. `bash scripts/sign-and-notarize.sh` (full rebuild + sign + notarize + staple + sync back to project root)
5. `git commit && git tag vX.Y.Z && git push origin main --tags`
6. `gh release create vX.Y.Z dist/tana-themer-X.Y.Z.zip …`
7. **NotePlan #own-dev bullet** for today (`mcp__noteplan__noteplan_edit_content`)
8. **Tana Outliner #code update** — bump CodeBuild + add child note under node `oaN2rs3n7R8S` (`mcp__tana-local__set_field_content` + `mcp__tana-local__import_tana_paste`)

Steps 1–6 are public-repo standard. Steps 7–8 are Julian's standard for any code work (see "Maintainer logging" below). Both are required, not optional. Full detail in "Common workflows → Release workflow" further down.

**For risky / experimental / vague-spec work** — don't go straight to this checklist. Use a feature branch first, build + test it from there, only merge to `main` once it's proven. See "Branch-based development" further down for the policy + workflow.

---

## How themes work (architecture in 60 seconds)

Tana Outliner's renderer (the Electron app at `/Applications/Tana.app`, or the web app at `app.tana.inc`) defines roughly **759 CSS custom properties** on the `<html>` element. Examples: `--colorPanelBackground`, `--colorWidgetPanelBackground`, `--colorLink`. Every visual surface in Tana Outliner — backgrounds, text colours, borders, scrollbars — reads its value from one of these variables.

A Tana Themer "theme" is just **a subset of those variables, given new values**, scoped to a CSS class that Themer toggles on `<html>`.

The injected CSS for the **Claude** theme (light mode) looks like this:

```css
html.isLightMode.tana-theme-claude {
  --colorPanelBackground: #faf9f5;
  --colorWidgetPanelBackground: #faf9f5;
  --colorLink: #c96442;
  /* …74 vars total */
}
```

Because Tana Outliner's own stylesheets read these variables at render time, **any element using a variable you override is automatically tinted** — including elements that don't exist yet (new saved searches, new panels, future Tana Outliner features that use already-known vars). You're overriding the look-up table, not the elements.

**Two surfaces, one source-of-truth-per-surface:**

| Surface | Theme storage | Notes |
|---|---|---|
| macOS desktop app | `themes.js` (a Node module) | The daemon evaluates this into Tana Outliner's renderer via CDP. |
| Browser (Tampermonkey) | The `THEMES` object inside `tana-themer.user.js` | A separate copy. Kept in sync manually with `themes.js`. |

Both files have a **marker comment** indicating where new themes get inserted:
```
// ── Add new built-in themes above this line (used by scripts/new-theme.sh) ──
```

`scripts/new-theme.sh` knows about this marker and uses it.

---

## Key files

| Path | What it is | When you touch it |
|---|---|---|
| `themes.js` | Desktop theme definitions (single source of truth for the daemon). | Adding/tweaking themes. |
| `tana-themer.user.js` | Browser userscript. Has its own embedded copy of `THEMES`. | Adding/tweaking themes (must mirror `themes.js`). Bump `@version` when you change any theme. |
| `Tana Themer.app/Contents/Resources/daemon/themes.js` | A copy of `themes.js` baked into the bundle. | Synced automatically by `scripts/install.sh` and `scripts/sign-and-notarize.sh`. Don't edit directly — edit the root `themes.js` and let the pipeline copy it. |
| `Tana Themer.app/Contents/Info.plist` | `CFBundleShortVersionString` is the user-visible version. | Bump on every release. |
| `CHANGELOG.md` | Keep-a-Changelog format. | New entry per release. |
| `README.md` | Themes table is a section. | Add a row when you add a built-in theme. |
| `scripts/new-theme.sh` | Scaffolds a new built-in theme into both `themes.js` and `tana-themer.user.js`. | Adding a built-in theme. |
| `scripts/inspect-tana-vars.js` | CDP-based introspection of Tana Outliner's live CSS variables. | Debugging "what variable controls X?" |
| `scripts/sign-and-notarize.sh` | Full release pipeline: sign, notarize, staple, dist zip, sync back to project root. | Releases. |
| `scripts/install.sh` | Dev-side: sync source into bundle, copy to /Applications, build dist zip. **Not signed.** | Local testing. For releases use `sign-and-notarize.sh`. |
| `scripts/entitlements.plist` | Hardened-runtime entitlements for codesign. | Intentionally empty. Leave alone unless notarization fails and asks for a specific entitlement. |

---

## Common workflows

### Adding a new built-in theme (browser + desktop)

1. **Scaffold:**
   ```bash
   bash scripts/new-theme.sh "My Theme Name" [light|dark]
   ```
   Inserts a working starter entry into both `themes.js` and `tana-themer.user.js` at the marker. Slugifies the id (`my-theme-name`). Runs `node --check` on the result.

2. **Tune the colours.** Open both files, search for the theme name (e.g. `My Theme Name`), edit the `vars: { … }` block. Keep them in sync between the two files.

3. **Add a row to the README themes table** (see `README.md`, look for `## Themes included`).

4. **Bump `tana-themer.user.js`'s `@version`** (top of file). Roughly: new theme → minor bump (1.X.0 → 1.X+1.0).

5. **Release** — see Release workflow below.

### Adding a personal theme (desktop only, no rebuild)

This path is for users adding themes without contributing to the project. Documented in README, no source changes required:

1. Drop a `.json` file into `~/Library/Application Support/TanaThemer/user-themes/`
2. Schema is identical to one entry from `themes.js`, expressed as JSON. See `~/Library/Application Support/TanaThemer/user-themes/EXAMPLE.json.disabled` for a working starter.
3. Restart Tana Outliner. The daemon re-reads user themes on each CDP attach.

If a user's theme has the same `id` as a built-in, it **replaces** the built-in for that install. The daemon logs the override to `~/Library/Logs/tana-themer.log`.

### Fixing a "this Tana Outliner surface doesn't tint correctly" report

A user reports that **a specific area** of Tana Outliner (e.g. widget panels on the home view) is showing default Tana Outliner colours instead of theme colours. This means a CSS variable governs that surface and **the theme isn't overriding it**.

**Don't guess at variable names** — past sessions burned a whole release cycle (v3.3.1) on speculative overrides that turned out to be the wrong names. Use the inspector instead.

1. Make sure Tana Themer is running (daemon attached, CDP port 9222 open). The easiest signal: `curl -fsS http://localhost:9222/json` returns JSON. (Tana Outliner must be open with the debug port.)

2. Run the inspector:
   ```bash
   node scripts/inspect-tana-vars.js
   ```

3. The script prints:
   - Total CSS variables Tana Outliner defines (~759 at time of writing).
   - All background-/panel-/widget-/surface-related vars with their current resolved values.
   - A scan of "white-ish panel-sized elements" in the DOM and their class names.
   - An attempted mapping from those elements to the CSS variable controlling their background.

4. Look through the var list for ones that **default to white-ish values** (`white`, `#ffffff`, `rgba(255, …, …, …)`) and **aren't being overridden by your theme**. Those are the candidates.

5. Add the chosen vars to the theme's `vars: { … }` block in BOTH `themes.js` and `tana-themer.user.js`. Set them to the same colour family as the theme's main background (for light themes, often the same as `--colorPanelBackground`; for dark themes, similarly).

6. Sync, bump patch version, release.

#### Pitfall: similar variable names mean different things

`--colorWidgetBackground` and `--colorWidgetPanelBackground` are **both real Tana Outliner vars** and they control **different** containers. Don't assume that overriding one is enough; the inspector will tell you which specific variable governs the element you care about. (See `CHANGELOG.md` for v3.3.1 vs v3.3.2 — the difference between those two releases is exactly this distinction.)

### Release workflow

Once the theme work is done and committed locally:

1. **Bump the version** in `Tana Themer.app/Contents/Info.plist` (`CFBundleShortVersionString` AND `CFBundleVersion` — both, same value).

2. **Add a CHANGELOG entry** at the top of `CHANGELOG.md`. Follow Keep-a-Changelog format (Added/Changed/Fixed sections). Date in ISO format.

3. **Update README's `> **Status:** vX.Y.Z`** line near the top.

4. **Sign + notarize + build the release zip:**
   ```bash
   bash scripts/sign-and-notarize.sh
   ```
   This:
   - Copies the bundle to `/tmp` (necessary — iCloud-backed Documents adds `com.apple.FinderInfo` xattrs that codesign refuses to operate on).
   - Strips xattrs, signs every inner shell script + the bundle with `--options runtime --timestamp` and Developer ID.
   - Submits to Apple's notary service via `xcrun notarytool submit --wait` (1–5 minutes typical).
   - Staples the notarization ticket to the bundle.
   - Verifies with `spctl` (should report `source=Notarized Developer ID`).
   - Builds `dist/tana-themer-X.Y.Z.zip` from the stapled bundle.
   - **Syncs the stapled bundle back to the project root**, so the local `Tana Themer.app` is also signed.

5. **Commit and tag:**
   ```bash
   git add -A
   git commit -m "feat: …"   # or fix:, chore:, etc per Conventional Commits
   git tag vX.Y.Z
   git push origin main --tags
   ```

6. **Create the GitHub release:**
   ```bash
   gh release create vX.Y.Z dist/tana-themer-X.Y.Z.zip \
     --title "vX.Y.Z — short title" \
     --notes "$(cat <<EOF
   …release notes in Markdown…
   EOF
   )"
   ```

7. **Log to NotePlan #own-dev** *(maintainer-specific — see "Maintainer logging" below).* One-line bullet appended to today's daily note, summarising what shipped. Required, not optional — Julian's standard is to log every code task to NotePlan immediately, not at session end.

8. **Log to Tana Outliner #code** *(maintainer-specific — see "Maintainer logging" below).* Bump the `CodeBuild` field on the project's parent node and append a child note describing the release.

#### Maintainer logging

This project's parent #code node in Tana Outliner is **`oaN2rs3n7R8S`** ("Tana Theme in App and Browser" under Julian's Daily notes). Every release should:

- **Tana Outliner** — call `mcp__tana-local__set_field_content` to increment `CodeBuild` (fieldId `xOgoSzux0lIB`) by 1, then `mcp__tana-local__import_tana_paste` to add a child block under `oaN2rs3n7R8S` describing the release (one bullet per significant change, plus a "Release: <github-url>" line and "Build: <new-number>" line).
- **NotePlan** — call `mcp__noteplan__noteplan_edit_content` with action `append`, type `bullet`, date today (`YYYYMMDD`), content beginning with `* ` and ending with `#own-dev`. One concise line, descriptive enough to read at a glance later.

Field IDs, option IDs, the Status enum, and the rest of Julian's global Tana Outliner conventions are in `~/.claude/CLAUDE.md` ("Tana Integration — #code Tag" section). Don't duplicate them here — single source of truth.

The Tana Outliner MCP server is sometimes flaky; if `import_tana_paste` returns "Unable to connect," retry once or twice before giving up. If it stays down, surface that to the user with the URL of the release so they can paste a note manually.

Skip both 7 and 8 only if you have a clear reason (e.g. running in a fork that's not Julian's). Otherwise they're as required as the version bump.

#### Pitfall: pre-requisites for signing

`scripts/sign-and-notarize.sh` needs **two** things to be set up on the build machine:

- A **Developer ID Application certificate** in the login Keychain (`security find-identity -v -p codesigning`). The script auto-detects it.
- An **`xcrun notarytool` keychain profile** named `tana-themer-notary`. Set it up once with:
  ```bash
  xcrun notarytool store-credentials "tana-themer-notary" \
      --key /path/to/AuthKey_XXXXXX.p8 \
      --key-id XXXXXX \
      --issuer YOUR-ISSUER-UUID
  ```
  (For Julian's setup: the API key is at `/Users/julian/Documents/AI-DIR/AuthKey_TC2967UH6C.p8`, Key ID `TC2967UH6C`. The Issuer ID has to come from App Store Connect → Users and Access → Integrations.)

If either is missing the script will say so and exit.

---

## Branch-based development (for risky changes)

Default policy: **branch automatically when there are risk signals**, work directly on `main` otherwise. The goal is that experimental work never has the chance to break `main`, while small confident changes don't pay branching overhead.

### Risk signals — branch on these without being asked

- The user uses words like *"new idea"*, *"experimental"*, *"try this"*, *"see if it works"*, *"big change"*, *"not sure"*, *"might be wrong"*.
- The change crosses many files or refactors core logic.
- The change can't be verified cheaply (e.g. needs the user to test in Tana Outliner over a few days).
- Requirements are vague — we're still discovering what we want.

### Direct-on-`main` is fine for

- Small bug fixes (one or two files).
- Theme tweaks (colour adjustments).
- Docs-only changes.
- Anything where the user has clearly already decided what they want.

### User overrides

- **"Use a branch for this"** → branch even for trivial work.
- **"Work directly on main"** → skip the branch even for risky work.

### Branch lifecycle, end to end

**A. Create the branch.**
```bash
git checkout -b feat/<short-descriptive-name>
```

**B. Develop on the branch.** Commits go to the branch, not `main`. `main` stays untouched throughout.

**C. Build a testable, signed `.app` from the branch.**
```bash
# Optional: mark the version so it's distinguishable from main builds
# Edit Info.plist CFBundleShortVersionString to "X.Y.Z-dev" or "X.Y.Z-rc1"

bash scripts/sign-and-notarize.sh
```
Identical pipeline to a real release — produces a signed, notarized, stapled `.app` at the project root and a corresponding zip in `dist/`. Just no git tag, no GitHub release, no NotePlan/Tana Outliner logging.

**D. Install the branch build for live testing.**
Critical: **don't touch `/Applications/Tana Themer.app`**. That stays at the last-shipped `main` version as the rollback target. Install the branch build by opening the freshly-built project-root `.app` instead:
```bash
open "Tana Themer.app"   # from the project root, on the branch
```
Click **Enable** in the dialog → the dispatcher copies the BRANCH daemon to `~/Library/Application Support/TanaThemer/daemon/` and registers the LaunchAgent. Tana Outliner now runs with branch behaviour.

**E. Decide.**

If the branch is **good** → merge to `main` + ship a real release:
```bash
git checkout main
git merge --ff-only feat/<name>             # or --no-ff for a merge commit
# Bump Info.plist to the real next version (strip -dev/-rc suffix)
# Update CHANGELOG, README status line
bash scripts/sign-and-notarize.sh
# Then run the full release-workflow steps 5–8: git tag + push, gh release create,
# NotePlan #own-dev, Tana Outliner #code (see TL;DR at top of file)
git branch -d feat/<name>
git push origin --delete feat/<name>
```

If the branch is **bad** → throw it away and restore `main`'s installed state:
```bash
git checkout main
git branch -D feat/<name>
git push origin --delete feat/<name>
# Restore main's daemon by re-Enabling the /Applications copy:
open "/Applications/Tana Themer.app"
# Click Disable when I quit Tana Outliner → quit Tana Outliner → reopen .app → Enable
```
`/Applications` is still at last-shipped `main`, so this fully restores the runtime.

**F. Nuclear reset** (only if local state got weird during testing):
1. Open `/Applications/Tana Themer.app` → More options… → Remove completely.
2. Set Up & Enable from scratch.

### Pitfalls

- **The project-root `.app` reflects whatever branch you last ran `sign-and-notarize.sh` on.** It is NOT a snapshot of `main`. If you want the project-root `.app` to mirror `main` again, `git checkout main && bash scripts/sign-and-notarize.sh`, or just `gh release download` the latest main zip and `ditto -x -k` it into the project root.
- **Don't bump version + tag + release on a branch.** Those happen only on merge to `main`. Branch builds can use `-dev` / `-rc1` / etc. in Info.plist for clarity but don't have to.
- **Don't log to NotePlan or Tana Outliner for branch builds.** Steps 7 + 8 of the release workflow are for shipped main releases only. Branch work logs only when it merges.
- **Don't push a `feat/*` branch without naming it descriptively.** It'll outlive its usefulness on origin if everyone forgets what `feat/wip` was for.

### Quick reference

| User says | I do |
|---|---|
| "I've got a new idea, big change, might not work" | Create `feat/<name>`, work there from the start |
| "Let me test this before we merge" | Run `sign-and-notarize.sh` on the branch, tell user to open project-root `.app` |
| "Looks good, ship it" | Merge to `main`, bump version properly, run full release pipeline (incl. NotePlan + Tana Outliner) |
| "Scrap it" | Delete branch local + remote, reinstall main daemon via `/Applications/Tana Themer.app` |
| "Use a branch even though this is small" | Branch anyway |
| "Just do it on main" | Skip the branch even if risky |

---

## CSS variable reference (the categories that matter for theming)

Tana Outliner defines ~759 vars. You don't need to override all of them — Tana Outliner inherits sensible defaults for everything you don't touch. But **for a comprehensive theme**, cover at least these categories:

| Category | Representative vars |
|---|---|
| **Main backgrounds** | `--colorPanelBackground` (main editor), `--colorPanelBackgroundDimmed` (sidebars), `--colorPanelBackgroundHighlighted`, `--colorCanvasBackground`, `--colorNavigationAltPanelBackground`, `--colorUIContextMenuBackground` |
| **Widget / card containers** | `--colorWidgetBackground`, `--colorWidgetPanelBackground` *(critical — governs Late / Today / Triage / Inbox cards on the home view)*, `--colorCardBackground`, `--colorUICardBackground`, `--colorOverlayBackground`, `--colorMenuBackground`, `--colorPopoverBackground`, `--colorPopoverPanelBackground`, `--colorListPanelBackground`, `--colorSavedSearchBackground`, `--colorFloatingPanelBackground` |
| **Navigation chrome** | `--colorNavigationPanelBackground`, `--colorNavigationGridItemBackground` *(defaults to hardcoded `white`)*, `--colorTopBarBackground`, `--colorPanelToolbarBackground`, `--colorSidebarItemHoverBackground`, `--colorSidebarFadeColor`, `--colorSidebarItemHoverText` |
| **Text** | `--colorEditorText`, `--colorEditorTextHighlight` (headings), `--colorEditorTextMuted`, `--colorUIText`, `--colorUITextMuted`, `--colorUITextDisabled`, `--colorUITextOnHighlight` |
| **Accents** | `--colorLink`, `--colorLinkMuted`, `--colorHoverLink`, `--colorFocus`, `--colorFocusInactive`, `--colorFocusWithin`, `--colorFocusText` |
| **Selection** | `--colorSelected`, `--colorSelectedUnfocused`, `--colorTextSelectedUnfocused`, `--colorTextHighlightedBackground` |
| **Borders** | `--colorUIStroke`, `--colorUIStrokeSoft`, `--colorUIStrokeHover`, `--colorUITupleStroke`, `--colorUIListItemHovered` |
| **Bullets (Tana Outliner's signature dots)** | `--colorBulletDefaultFill`, `--colorBulletDefaultOutline`, `--colorBulletExpandLine`, `--colorBulletExpandLineSelected`, `--colorBulletExpandLineReference`, `--colorBulletExpandLineHoverBackground` |
| **Tooltips** | `--colorTooltipBackground`, `--colorTooltipText` |
| **Inline code** | `--inlineCode`, `--inlineCodeBackground` |
| **Scrollbars** | `--scrollbarForeground`, `--scrollbarForegroundHover`, `--scrollbarForegroundActive` (use rgba() with the theme's accent colour) |
| **Shadows** | `--shadowSoft`, `--shadowHard` (use rgba() tinted toward the theme's text colour) |
| **Buttons** | `--colorButtonNeutralBackground`, `--colorButtonNeutralStroke`, `--colorButtonNeutralText`, `--colorButtonNeutralHoverBackground` |
| **AI Chat panels** | `--colorAIChatPanelBackground` (was hard to spot — Tana Outliner's AI chat container) |
| **Config panels** | `--colorConfigBackground` |

The `claude` theme in `themes.js` is currently the **most comprehensive** (~74 vars overridden) and is a good template for new light themes. The `nord` theme is a good template for new dark themes (~50 vars).

### Variables that surprise

A few vars are easy to miss:

- `--colorNavigationGridItemBackground` defaults to **hardcoded `white`** (not a variable reference). If you don't override it on a light theme, sidebar grid items will be pure white even if everything else around them is warm.
- `--colorWidgetPanelBackground` defaults to **`rgba(255, 255, 255, .8)`** (semi-transparent white). This governs the right-side widget cards (Late / Today / Triage / Inbox). Easy to miss because "widget" suggests a tiny element but it's the container.
- Tana Outliner uses **`oklch()`** colour notation for many neutral greys (e.g. `oklch(.9520942425 .0000008619 240)`). These render as cool bluish greys. If you're building a warm theme and notice cool-grey patches in places like AI chat backgrounds or filter toolbars, override the `oklch()` vars too. The inspector script shows all of them.

---

## The inspector script — what it does

`scripts/inspect-tana-vars.js` is the **single most useful debugging tool** in this project. It:

1. Connects to Tana Outliner via the CDP port (9222) the daemon already exposes.
2. Reads every `--*` custom property defined in any stylesheet on the page.
3. For each, resolves its current computed value on the `<html>` element.
4. Walks the DOM looking for elements with near-white computed backgrounds and reports their class names — useful for "what's *that* panel?" questions.
5. Tries to map those panels back to the CSS variable controlling their background.

Run it:

```bash
node scripts/inspect-tana-vars.js
```

Pre-requisite: Tana Themer's daemon is running (any theme enabled) so the CDP port is open. No code changes need to be made first; the inspector is read-only and side-effect-free.

When a user reports a tinting bug, this is always step 1.

---

## Quick command reference

```bash
# Local development — replace /Applications/Tana Themer.app with the dev build
bash scripts/install.sh

# Add a new built-in theme (scaffolded into both source files)
bash scripts/new-theme.sh "Theme Name" [light|dark]

# Debug a tinting issue
node scripts/inspect-tana-vars.js

# Full release — sign, notarize, staple, build zip, sync back
bash scripts/sign-and-notarize.sh

# Verify a built bundle's Gatekeeper status
spctl -a -vv --type execute "Tana Themer.app"

# Check git status while filtering signature noise
git status --short    # _CodeSignature/ and CodeResources are gitignore'd
```

---

## House style for theme entries

When adding a new theme to `themes.js`, follow the format of recent themes (`claude`, `nord-frost`, `nord-aurora`) rather than older ones. Specifically:

- A short comment block above the theme entry explaining the design intent (palette family, mood, what's distinctive).
- The `id`, `name`, `mode`, `preview` on one line each (not condensed onto one line — but if you see existing themes condensed, leave them alone).
- The `vars` block ordered roughly by category: backgrounds → text → accents → selection → borders → bullets → nav cards → tooltips → code → scrollbars → shadows → buttons.

The userscript file uses one extra level of indentation (the `THEMES` object lives inside an IIFE) — match that.

---

## When to ship which version bump

Following SemVer:

- **Patch (X.Y.Z+1)** — fixing a tinting bug in one theme, fixing the dispatcher, fixing the signing pipeline, README fixes, no user-visible behaviour change.
- **Minor (X.Y+1.0)** — adding a new built-in theme, adding a new feature like Path A user-themes, adding a new CLI option, adding a new variable category coverage that wasn't there before.
- **Major (X+1.0.0)** — breaking change for users (e.g. removing themes, renaming theme ids, changing the LaunchAgent label so existing installs need manual cleanup). We haven't shipped one of these and probably won't anytime soon.

If you're unsure between patch and minor, prefer minor for additions and patch for fixes.

---

## Things future sessions might want to add but haven't yet

(Honest list of known gaps — don't treat as priorities unless asked.)

- **Dark mode for the Claude theme.** Currently only light. Anthropic's Claude has a dark mode too; would be a useful "Claude Dark" companion.
- **CI auto-build on tag push.** GitHub Actions could run `scripts/sign-and-notarize.sh` and create the release automatically. Requires storing the Developer ID cert and notarytool credentials as encrypted GitHub Secrets. Not done — releases are local-only right now.
- **A standardised theme test harness** that takes screenshots of every Tana Outliner surface under each theme. Manual smoke-test is the current state.
- **The userscript `@author` field still says "Julian"** while everything else uses `hellbender-jules`. Flagged across sessions but never bundled with a release.
- **Other light themes (Warm Sepia, CoffeeBuddy Pro) likely have the same `--colorWidgetPanelBackground` bug** as Claude did pre-v3.3.2. Nobody's reported them; if reported, apply the same fix.
