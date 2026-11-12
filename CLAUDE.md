# Instructions for Claude working in this repo

## Keep README.md current (required)

Every commit that changes `index.html` must update `README.md` in the same commit:

- **Features:** add, change or remove bullets so they match what the page actually does.
- **Where plans are stored / Tech / Run locally:** update if storage, hosting, dependencies or external resources change.

Before committing, reread the whole README against the current `index.html` and fix anything that is no longer true. Do not commit a page change with a stale README.

## Changelog and version (required)

`CHANGELOG.md` is the only changelog; README.md just links to it. For every release that changes `index.html`:

- Bump `const VERSION` in `index.html` (semantic versioning).
- Add a `## [x.y.z] - YYYY-MM-DD` section at the top of `CHANGELOG.md` ([Keep a Changelog](https://keepachangelog.com) headings), saying what changed for the person using the page.

The tests read the version from `index.html` and fail if the footer or the top `CHANGELOG.md` entry don't match it, so no test needs editing on a version bump.

## Run the tests (required)

Before every commit that changes `index.html`, run `npm test` and make sure it passes. If WebKit can't be installed where you work, run at least `npm run test:chrome` and say in the commit message that the WebKit setups were not run locally (CI runs them all).

- A change to what the page does needs a test change in the same commit: add or update tests in `tests/` for the new or changed behaviour.
- Never delete or loosen a failing test to make the suite pass; fix the page, or ask.
- If you fix a known issue (a `test.fail` line, or an id in `KNOWN` in `tests/a11y.spec.ts`), remove it and the matching bullet under Known issues in the README.
- If you change the saved-plan format, keep `tests/fixtures/plans-v1.json` importing, and add a new fixture for the new version.

## Project facts

- The whole app is `index.html`. There is no build step.
- It is served by GitHub Pages from `main`, root folder: https://arthurfranck.github.io/block-builder/
- `main` is protected: the six Tests jobs must pass before anything lands. Work on a branch and open a pull request; don't try to push to `main` directly.
- Plans live in `localStorage` under the key `bb-plans`. The export format is `{app:"block-builder", version:1, plans:{…}}`. Keep import backward compatible.
- Every user-facing string exists in both English and French (`I18N.en` / `I18N.fr`). Add both.
