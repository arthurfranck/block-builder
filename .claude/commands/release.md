---
description: Ship one backlog item - branch, version bump, CHANGELOG, README, tests, commit, review, PR
argument-hint: <backlog id, e.g. BB-25> [patch|minor|major]
---

Release the change for backlog item `$1` (version bump: `$2`, default `patch`). Follow CLAUDE.md; this is the order.

1. **Branch.** If on `main`, create `bb-<number>-<short-slug>` from an up-to-date `main` (`git pull` first). One backlog item per branch and PR.
2. **Version** (only if `index.html`, `theme.js` or `src/` changed): bump `const VERSION` in `src/app.js` by `$2`, run `npm run build`, and set the same version in the `?v=` of the two `<script src>` tags in `index.html` (BB-74: stops a cached older script running with the new page). No test needs editing; the tests read it.
3. **CHANGELOG.md** (only if `index.html`, `theme.js` or `src/` changed): add `## [x.y.z] - YYYY-MM-DD` at the top with Keep a Changelog headings (Added / Changed / Fixed / Security). Write what changed for the person using the page and end the main bullet with `($1)`.
4. **Docs:** reread them against `index.html` and `src/` and update what is no longer true: `docs/features.md` (rules and details), `README.md` (one line per feature, How to use it, Privacy and storage, tech) and `tests/README.md` (test table, known issues). No changelog line in the README.
5. **Tests:** a behaviour change needs a test change. Run the targeted tests that CLAUDE.md sets out (Every change, 3. Tests), never the full `npm test` locally. Never loosen a failing test. Node is in `~/.local/node/bin` if `npm` is not on PATH.
6. **Commit:** `feat|fix|chore: <what> (vX.Y.Z, $1)`, body with what changed, the specs and setups run locally with their counts, and that CI runs the rest. The git pre-commit hook (ADR 0010) re-runs the checks if an app file changed and blocks the commit on failure.
7. **Review:** before the PR, have the branch reviewed in a fresh context as `~/.claude/CLAUDE.md` sets out (Pull requests). If that file or its Pull requests section isn't there (another machine, a cloud session): give a subagent in this same checkout only the repo path and branch name, and have it run the `code-review` skill at `medium` on the branch. Fix the findings that hold up, redoing steps 2-6 for what the fix touches (version and CHANGELOG if `src/` changed, docs, tests, a commit in step 6's format), and keep the list of findings and what was done for the PR body.
8. **PR:** push the branch and open a PR with `gh pr create` (GitHub CLI may be at `~/.local/bin/gh`). Title ends with `($1)`; body says what changed, how it was checked, the review findings and what was done with each, and the version. Then turn on Auto-fix as CLAUDE.md says (How Arthur works).
9. **Report:** as CLAUDE.md says (How Arthur works, Report briefly). After the merge, the item's row is removed from `../backlog-block-builder.md` (Active) and added at the top of the Done log in `../backlog-block-builder-done.md`, with what it brought; both files' dates bumped.
