# CS-7: commit checks for every commit

Item CS-7 of the Claude setup backlog (`~/Claude/backlog-claude-setup.md`), from the 2026-11-24 audit against Florian Bruniaux's Claude Code guide.

## Problem
- The commit checks (rebuild and stale-bundle check, lint, format check, engine tests, desktop Chrome tests) live in a Claude Code `PreToolUse` hook (`.claude/settings.json`, `.claude/hooks/test-before-commit.sh`). They run only when Claude runs `git commit`. A commit Arthur makes by hand skips them; CI catches problems only after the push.
- The hook has `timeout: 300`. The guide's hook checklist (eval-hooks criterion 4) wants interactive hooks under 30 s or guarded.

## Facts
- Measured 2026-11-25 on `main`: build 0 s, lint 1 s, format check 0 s, engine tests 0 s, `test:chrome` 32 s, about 33 s in all (one run, `date +%s` around each step).
- The Bash tool's default timeout is 120 s, so a git hook of about 33 s fits inside a Claude `git commit` call.

## Options
1. **Git hook only:** move the script into `.githooks/pre-commit`, enabled by `npm install` (`prepare`), and remove the Claude hook. One check for every commit; no Claude timeout. Anyone can skip it with `--no-verify`; CI still catches it.
2. **Both hooks:** Claude commits run the checks twice (about 66 s) unless the git hook detects Claude.
3. **Claude hook only, timeout 120 s:** hand commits stay unchecked locally.

## Chosen
Option 1 (Arthur, 2026-11-25). Recorded in ADR 0010.

Follow-up (Arthur, 2026-11-25): add a Claude hook that only inspects the command and refuses `--no-verify`, `-n` and `-c core.hooksPath` wherever they appear (option 2 of three: deny rule, command check, or CLAUDE.md alone). A deny rule was rejected because prefix matching misses flags at the end.
