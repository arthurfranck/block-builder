# 0010. Commit checks in a git pre-commit hook, not a Claude hook

- Status: Accepted
- Decided: 2026-11-25, CS-7 of the Claude setup backlog (brainstorm: `docs/brainstorms/cs-7-git-precommit.md`)

## Context
ADR 0007 makes guardrails automatic: "a pre-commit hook runs tests". Until now that hook was a Claude Code `PreToolUse` hook, so it ran only on commits Claude made; Arthur's own commits skipped it. Its 300 s timeout was nine times the measured run (about 33 s, nearly all of it `test:chrome`).

## Decision
- The checks live in `.githooks/pre-commit`: when an app, test or tooling file is staged, refuse unstaged edits in those files (the checks run on the working tree), rebuild and refuse a stale bundle, then lint, the format check, the engine tests and the desktop Chrome tests. A failure blocks the commit.
- `npm install` and `npm ci` enable it: the `prepare` script sets `core.hooksPath` to `.githooks` when it is unset, leaves another value alone with a message, and does nothing if git isn't there. The weekly health check confirms it is set.
- The old Claude test hook is removed: Claude's `git commit` runs the same git hook.
- A small Claude `PreToolUse` hook, `.claude/hooks/no-hook-bypass.mjs`, refuses any Bash command that would commit without it: `--no-verify` (and its abbreviations), `-n` alone or bundled, `git -c core.hooksPath=…`, `--config-env=core.hooksPath`, anywhere in a `&&`, `;` or `|` chain. It only reads the command, so it takes milliseconds (timeout 10 s). Unit test: `tests/unit/no-hook-bypass.unit.mjs`.

## Alternatives considered
- **Keep the Claude hook as well.** Claude can't skip its own hook, but each Claude commit would run the checks twice.
- **Keep only the Claude hook with a shorter timeout.** Hand commits stay unchecked until CI.
- **A permissions deny rule for `git commit --no-verify` instead of the bypass check.** Simpler, but rules match the start of the command, so `git commit -m x --no-verify` and bundled `-nm` would slip through.

## Consequences
- Good: every commit on a machine that ran `npm install` gets the same checks, whoever makes it.
- Good: no Claude-specific timeout to tune; the run stays inside the Bash tool's default 120 s.
- Cost: `git commit --no-verify` still skips the hook for Arthur. For Claude, the bypass check refuses it; ways it doesn't catch (deleting the hook file, setting `core.hooksPath` with `git config`) are left to CLAUDE.md, and CI (ADR 0006) still blocks the merge.
- Cost: a fresh clone has no hook until `npm install` runs.

## What the bypass check does not catch
It is meant to stop an accidental bypass, not a determined one. Not caught: deleting or emptying `.githooks/pre-commit`; `git config core.hooksPath …` run before the commit; a commit made by a script or alias (an npm script, a git alias, a file run with `sh script.sh`); variables expanded at run time (`$FLAG`); deeper shell nesting than three levels. CLAUDE.md forbids skipping the hook, and CI (ADR 0006) still blocks the merge.

## Revisit when
- The local checks grow well past a minute (then move more of them to CI only).
- A commit reaches CI with problems the hook would have caught, because it was skipped.
