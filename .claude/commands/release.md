---
description: Ship one backlog item - branch, version bump, CHANGELOG, README, tests, commit, PR
argument-hint: <backlog id, e.g. BB-25> [patch|minor|major]
---

Release the change for backlog item `$1` (version bump: `$2`, default `patch`). Follow CLAUDE.md; this is the order.

1. **Branch.** If on `main`, create `bb-<number>-<short-slug>` from an up-to-date `main` (`git pull` first). One backlog item per branch and PR.
2. **Version** (only if `index.html`, `theme.js` or `src/` changed): bump `const VERSION` in `src/app.js` by `$2`, run `npm run build`, and set the same version in the `?v=` of the two `<script src>` tags in `index.html` (BB-74: stops a cached older script running with the new page). No test needs editing; the tests read it.
3. **CHANGELOG.md** (only if `index.html`, `theme.js` or `src/` changed): add `## [x.y.z] - YYYY-MM-DD` at the top with Keep a Changelog headings (Added / Changed / Fixed / Security). Write what changed for the person using the page and end the main bullet with `($1)`.
4. **Docs:** reread them against `index.html` and `src/` and update what is no longer true: `docs/features.md` (rules and details), `README.md` (one line per feature, How to use it, Privacy and storage, tech) and `tests/README.md` (test table, known issues). No changelog line in the README.
5. **Tests:** a behaviour change needs a test change. Run the targeted tests that CLAUDE.md sets out (Every change, 3. Tests), never the full `npm test` locally. Never loosen a failing test. Node is in `~/.local/node/bin` if `npm` is not on PATH.
6. **Commit:** `feat|fix|chore: <what> (vX.Y.Z, $1)`, body with what changed, the specs and setups run locally with their counts, and that CI runs the rest. The project hook re-runs the Chrome tests if an app file changed and blocks the commit on failure.
7. **PR:** push the branch and open a PR with `gh pr create` (GitHub CLI may be at `~/.local/bin/gh`). Title ends with `($1)`; body says what changed, how it was checked, and the version.
8. **Report:** PR link, version, tests run. After the merge, the item's row is removed from `../backlog-block-builder.md` (Active) and added at the top of the Done log in `../backlog-block-builder-done.md`, with what it brought; both files' dates bumped.
