#!/bin/sh
# Claude Code PreToolUse hook: before a `git commit`, if index.html differs from HEAD
# (staged or not), run the desktop Chrome tests and block the commit if they fail.
input=$(cat)
case "$input" in *"git commit"*) ;; *) exit 0 ;; esac
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
git diff --quiet HEAD -- index.html 2>/dev/null && exit 0
# Node may live outside the default PATH (see CLAUDE.md)
[ -d "$HOME/.local/node/bin" ] && PATH="$HOME/.local/node/bin:$PATH"
log=$(mktemp)
if npm run --silent test:chrome >"$log" 2>&1; then
  rm -f "$log"; exit 0
fi
{
  echo "Commit blocked: index.html changed and 'npm run test:chrome' failed. Fix the page (don't loosen tests), then commit again."
  tail -40 "$log"
} >&2
rm -f "$log"
exit 2
