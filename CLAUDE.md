# Instructions for Claude working in this repo

## Keep README.md current (required)

Every commit that changes `index.html` must update `README.md` in the same commit:

- **Features:** add, change or remove bullets so they match what the page actually does.
- **Where plans are stored / Tech / Run locally:** update if storage, hosting, dependencies or external resources change.
- **Changelog:** add one dated line (YYYY-MM-DD) at the top of the list, saying what changed for the person using the page.

Before committing, reread the whole README against the current `index.html` and fix anything that is no longer true. Do not commit a page change with a stale README.

## Project facts

- The whole app is `index.html`. There is no build step.
- It is served by GitHub Pages from `main`, root folder: https://arthurfranck.github.io/block-builder/
- Plans live in `localStorage` under the key `bb-plans`. The export format is `{app:"block-builder", version:1, plans:{…}}`. Keep import backward compatible.
- Every user-facing string exists in both English and French (`I18N.en` / `I18N.fr`). Add both.
