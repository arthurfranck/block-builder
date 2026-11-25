# 0010. Commit checks in a git pre-commit hook, not a Claude hook

- Status: Accepted
- Decided: 2026-11-25, CS-7 of the Claude setup backlog (brainstorm: `docs/brainstorms/cs-7-git-precommit.md`)

## Context
ADR 0007 makes guardrails automatic: "a pre-commit hook runs tests". Until now that hook was a Claude Code `PreToolUse` hook, so it ran only on commits Claude made; Arthur's own commits skipped it. Its 300 s timeout was nine times the measured run (about 33 s, nearly all of it `test:chrome`).

## Decision
- The checks live in `.githooks/pre-commit`: when an app file is staged, rebuild and refuse a stale bundle, then lint, the format check, the engine tests and the desktop Chrome tests. A failure blocks the commit.
- `npm install` and `npm ci` enable it: the `prepare` script sets `core.hooksPath` to `.githooks` (and does nothing if git isn't there).
- The Claude hook and `.claude/settings.json` are removed: Claude's `git commit` runs the same git hook.

## Alternatives considered
- **Keep the Claude hook as well.** Claude can't skip its own hook, but each Claude commit would run the checks twice.
- **Keep only the Claude hook with a shorter timeout.** Hand commits stay unchecked until CI.

## Consequences
- Good: every commit on a machine that ran `npm install` gets the same checks, whoever makes it.
- Good: no Claude-specific timeout to tune; the run stays inside the Bash tool's default 120 s.
- Cost: `git commit --no-verify` skips the hook, for Arthur and for Claude. CI (ADR 0006) still blocks the merge, and CLAUDE.md's rule against loosening checks covers Claude.
- Cost: a fresh clone has no hook until `npm install` runs.

## Revisit when
- The local checks grow well past a minute (then move more of them to CI only).
- A commit reaches CI with problems the hook would have caught, because it was skipped.
