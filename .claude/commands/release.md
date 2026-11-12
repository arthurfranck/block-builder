---
description: Ship one backlog item - branch, version bump, CHANGELOG, README, tests, commit, PR
argument-hint: <backlog id, e.g. BB-25> [patch|minor|major]
---

Release the change for backlog item `$1` (version bump: `$2`, default `patch`). Follow CLAUDE.md; this is the order.

1. **Branch.** If on `main`, create `bb-<number>-<short-slug>` from an up-to-date `main` (`git pull` first). One backlog item per branch and PR.
2. **Version** (only if `index.html` changed): bump `const VERSION` in `index.html` by `$2`. No test needs editing; the tests read it.
3. **CHANGELOG.md** (only if `index.html` changed): add `## [x.y.z] - YYYY-MM-DD` at the top with Keep a Changelog headings (Added / Changed / Fixed / Security). Write what changed for the person using the page and end the main bullet with `($1)`.
4. **README.md:** reread it against `index.html` and update Features, storage, tech and the test table if they are no longer true. No changelog line in the README.
5. **Tests:** a behaviour change needs a test change. Run `npm test` (or at least `npm run test:chrome`, saying in the commit message that WebKit was not run locally). Never loosen a failing test. Node is in `~/.local/node/bin` if `npm` is not on PATH.
6. **Commit:** `feat|fix|chore: <what> (vX.Y.Z, $1)`, body with what changed and the local test count. The project hook re-runs the Chrome tests if `index.html` changed and blocks the commit on failure.
7. **PR:** push the branch and open a PR with `gh pr create` (GitHub CLI may be at `~/.local/bin/gh`). Title ends with `($1)`; body says what changed, how it was checked, and the version.
8. **Report:** PR link, version, tests run. After the merge, the backlog file next to the repo (`../backlog-block-builder.md`) gets the item moved to the Done log with what it brought.
