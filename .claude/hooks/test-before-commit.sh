#!/bin/sh
# Claude Code PreToolUse hook: before a `git commit`, if an app file (index.html, app.js, theme.js, engine.js) differs from HEAD
# (staged or not), run lint, the format check and the desktop Chrome tests, and block the commit if any fails.
input=$(cat)
case "$input" in *"git commit"*) ;; *) exit 0 ;; esac
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
git diff --quiet HEAD -- index.html theme.js src 2>/dev/null && exit 0
# Node may live outside the default PATH (see CLAUDE.md)
[ -d "$HOME/.local/node/bin" ] && PATH="$HOME/.local/node/bin:$PATH"
log=$(mktemp)
# BB-79: lint and formatting first, they take a second.
if ! { npm run --silent lint && npm run --silent format:check; } >"$log" 2>&1; then
  { echo "Commit blocked: 'npm run lint' or 'npm run format:check' failed. Run 'npm run format', fix the lint errors, then commit again."; tail -40 "$log"; } >&2
  rm -f "$log"; exit 2
fi
if npm run --silent test:engine >"$log" 2>&1 && npm run --silent test:chrome >"$log" 2>&1; then
  rm -f "$log"; exit 0
fi
{
  echo "Commit blocked: an app file changed and 'npm run test:engine' or 'npm run test:chrome' failed. Fix the page (don't loosen tests), then commit again."
  tail -40 "$log"
} >&2
rm -f "$log"
exit 2
