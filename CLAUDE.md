# Block Builder: instructions for Claude

## How Arthur works
- Act, don't ask, on anything these rules already settle. Ask only for real product or design choices.
- Before planning any feature or problem, check `docs/brainstorms/` for existing thinking on it and use it as input. If there's none, create a brainstorm file there before writing the plan.
- Structural decisions live in `docs/adr/` (index in its README). Read the relevant ADR before changing what it covers; a new structural choice gets a new ADR, and one that changes an old decision supersedes it instead of editing it.
- One backlog item per branch and PR (`bb-<n>-<slug>`). `/release <id>` is the checklist.
- After opening a PR, turn on Auto-fix right away (auto-fix + address comments) and say so; skip only if told "no Auto-fix on this one".
- Backlog: `../backlog-block-builder.md`, ids `BB-<n>`, edited with the `tool-backlog` skill. Open items only; Done log and Dropped live in `../backlog-block-builder-done.md`.
- Completing or dropping an item = move it, in the same edit: remove its row from the Active table, add it at the top of the Done log or Dropped table in the done file, bump "Last updated" in both. Never leave a done/dropped item in Active or an open item in the done file; an ID exists in exactly one file. Next ID = highest across both files + 1. Whenever you touch the backlog, check the two files are in sync (no shared IDs, no Done/Dropped status in Active) and fix any drift.
- Rank by dependencies, not score alone: never put an item above the one that would kill, absorb or rework it ("I don't want to implement a feature if it is going to be killed 3 versions later").
- Report briefly: PR link, version, tests run, what was not checked.

## Every change to `index.html`, `app.js`, `theme.js` or `engine.js`, in the same commit
1. **Version:** bump `const VERSION` in `app.js` (semver) and the matching `?v=` on the three script tags in `index.html` (a test checks) and add `## [x.y.z] - YYYY-MM-DD` at the top of `CHANGELOG.md` (Keep a Changelog headings, written for the runner, ending `(BB-n)`). Tests check footer and changelog match; no test edit needed.
2. **Docs:** reread and fix what's no longer true:
   - `docs/features.md`: every rule, number and edge case.
   - `README.md`: one line per feature, How to use it, Privacy and storage (any `localStorage` key or outside request), Repository map / Tech / Run locally. No version or date badges, no changelog.
   - `tests/README.md`: the "What each file covers" table, setups, Known issues.
   - `docs/screenshot.png` when the main screen changes noticeably (1440×900, date frozen 6 Nov 2026, default example plan, no personal data).
3. **Tests:**
   - Behaviour change → test change. Engine change → Node test in `tests/engine/engine.unit.mjs`; re-check the five athlete profiles when plan building changes.
   - Run `npm test`. Exception: copy, labels or tiny CSS → only the affected spec(s) on desktop Chrome plus the version/changelog test, and say so in the commit; CI runs the rest. No WebKit locally → `npm run test:chrome` and say WebKit wasn't run.
   - Look changed on purpose → fresh visual baselines from the Visual baselines workflow, committed in the same PR (`tests/README.md`, Visual snapshots). Look changed by accident → fix the page.
   - Never delete or loosen a failing test: fix the page, or ask.
   - Fixing a known issue (`test.fail`, or an id in `KNOWN` in `tests/a11y.spec.ts`) → remove it and its Known issues bullet.
   - Saved-plan format change → `tests/fixtures/plans-v1.json` must still import; add a fixture for the new version.

## Project facts
- App = `index.html` (markup, CSS) + `app.js` (interface, storage, exports) + `engine.js` (`BBEngine`, no DOM or storage) + `theme.js` (theme before first paint). All classic scripts, not ES modules, so the page opens from `file://`. No build step.
- No inline `<script>` or `on…=` attributes: the CSP has no script `'unsafe-inline'` (a security test checks). `app.js` has `// @ts-check`; `npm run typecheck` runs it (non-strict, `tsconfig.app.json`) and the strict test check (`tsconfig.json`).
- `app.js`, `engine.js` and `theme.js` are formatted by Prettier (`.prettierrc.json`, width 120) and linted by ESLint (`eslint.config.mjs`): run `npm run format` before committing; `npm run lint` and `npm run format:check` run in CI and in the pre-commit hook. Lines over 120 that remain are prose strings and HTML template literals (BB-78 replaces the templates).
- Every user-facing string exists in `I18N.en` and `I18N.fr` (in `app.js`).
- Plans live in `localStorage` key `bb-plans`; export is `{app:"block-builder", version:1, plans:{…}}`. Keep import backward compatible.
- GitHub Pages serves `main` (https://arthurfranck.github.io/block-builder/). `main` is protected by the six Tests jobs: never push to it, always a PR.
- Node: `~/.local/node/bin`; `gh`: `~/.local/bin/gh` if not on PATH.

## `.claude/`
- `settings.json`: pre-commit hook runs `lint` + `format:check`, then `test:engine` + `test:chrome` when `index.html`/`app.js`/`theme.js`/`engine.js` changed, blocking on failure.
- `launch.json`: preview via `node tests/serve.mjs 8765` (same server as tests and CI).
- `commands/release.md`: `/release <id> [patch|minor|major]`.
- `health.md`: profile for the weekly `codebase-health` check. Update it when a measured file is renamed or a known risk is fixed or added.
