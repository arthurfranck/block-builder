# Instructions for Claude working in this repo

## Keep the docs current (required)

The docs are split by reader. Every commit that changes `index.html` or `engine.js` must update them in the same commit:

- **`docs/features.md`** (every rule, number and edge case): add, change or remove bullets so they match what the page actually does.
- **`README.md`** (short, for runners first): keep **one line per feature** under Features and the How to use it steps true. Update **Privacy and storage** if a `localStorage` key or an outside request is added or removed, and **Repository map / Tech / Run locally** if files, hosting or dependencies change. Detail goes in `docs/features.md`, not the README.
- **`tests/README.md`**: update the "What each file covers" table when tests are added or changed, and the setups if `playwright.config.ts` changes.
- **`docs/screenshot.png`**: retake it when the main screen looks noticeably different (1440×900, frozen date 6 Nov 2026, default example plan, no personal data).

Before committing, reread all three files against the current `index.html` and fix anything that is no longer true. Do not commit a page change with stale docs. Don't add version or date badges to the README: they go stale; the Tests badge updates itself.

## Changelog and version (required)

`CHANGELOG.md` is the only changelog; README.md just links to it. For every release that changes `index.html` or `engine.js`:

- Bump `const VERSION` in `index.html` (semantic versioning).
- Add a `## [x.y.z] - YYYY-MM-DD` section at the top of `CHANGELOG.md` ([Keep a Changelog](https://keepachangelog.com) headings), saying what changed for the person using the page.

The tests read the version from `index.html` and fail if the footer or the top `CHANGELOG.md` entry don't match it, so no test needs editing on a version bump.

## Run the tests (required)

Before every commit that changes `index.html` or `engine.js`, run `npm test` and make sure it passes. If WebKit can't be installed where you work, run at least `npm run test:chrome` and say in the commit message that the WebKit setups were not run locally (CI runs them all).

- A change to what the page does needs a test change in the same commit: add or update tests in `tests/` for the new or changed behaviour.
- Never delete or loosen a failing test to make the suite pass; fix the page, or ask.
- If you fix a known issue (a `test.fail` line, or an id in `KNOWN` in `tests/a11y.spec.ts`), remove it and the matching bullet under Known issues in `tests/README.md`.
- If you change the saved-plan format, keep `tests/fixtures/plans-v1.json` importing, and add a new fixture for the new version.

## Project facts

- The app is `index.html` plus `engine.js` (the plan engine: paces, generate, warnings, week checks; no DOM, no storage). `engine.js` is a classic script exposing `BBEngine`, not an ES module, so the page still opens from disk (file://). There is no build step.
- Engine changes need a Node test in `tests/engine/engine.unit.mjs` (`npm run test:engine`, also run by `npm test` and CI). Re-check the five athlete profiles there when changing how plans are built.
- It is served by GitHub Pages from `main`, root folder: https://arthurfranck.github.io/block-builder/
- `main` is protected: the six Tests jobs must pass before anything lands. Work on a branch and open a pull request; don't try to push to `main` directly.
- Plans live in `localStorage` under the key `bb-plans`. The export format is `{app:"block-builder", version:1, plans:{…}}`. Keep import backward compatible.
- Every user-facing string exists in both English and French (`I18N.en` / `I18N.fr`). Add both.

## Claude Code setup (`.claude/`)

- `settings.json` has a PreToolUse hook (`hooks/test-before-commit.sh`): before any `git commit`, if `index.html` or `engine.js` differs from HEAD, it runs `npm run test:engine` and `npm run test:chrome` and blocks the commit when it fails. It does not replace the full `npm test` run above.
- `launch.json` serves the repo with `node tests/serve.mjs 8765` (the same server the tests and CI use) for the preview pane.
- `/release <id> [patch|minor|major]` (`commands/release.md`) walks through branch, version bump, CHANGELOG, README, tests, commit and pull request for one backlog item.
- `health.md` is the profile for the `codebase-health` skill (a weekly health check, run outside the repo): quick tests, tracked metrics, rules and known risks. Update it when a file it measures is renamed, or when a known risk is fixed or added.
