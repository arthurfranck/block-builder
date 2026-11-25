// Claude Code PreToolUse hook (ADR 0010): refuse a Bash command that would commit without the git pre-commit hook.
// Catches `git commit --no-verify` (and its abbreviations), `-n` alone or bundled (`-nm`, `-an`), and
// `git -c core.hooksPath=...`, wherever they sit in the command and in each part of `&&`, `;`, `|` chains.
// Reads the hook JSON on stdin; exit 2 blocks the call and shows the message to Claude. Unit test:
// tests/unit/no-hook-bypass.unit.mjs.

// Split a command line into words and separators, keeping quoted strings whole.
export function tokenize(cmd) {
  const out = [];
  let word = null;
  for (let i = 0; i < cmd.length; i++) {
    const ch = cmd[i];
    if (ch === "'" || ch === '"') {
      const end = cmd.indexOf(ch, i + 1);
      const stop = end === -1 ? cmd.length : end;
      word = (word ?? "") + cmd.slice(i + 1, stop);
      i = stop;
    } else if (ch === "\\" && i + 1 < cmd.length) {
      word = (word ?? "") + cmd[++i];
    } else if (/\s/.test(ch)) {
      if (word !== null) out.push(word), (word = null);
    } else if (";|&\n".includes(ch)) {
      if (word !== null) out.push(word), (word = null);
      out.push({ sep: ch });
    } else {
      word = (word ?? "") + ch;
    }
  }
  if (word !== null) out.push(word);
  return out;
}

// Short options of `git commit` that take a value: whatever follows them in the same word is that value.
const TAKES_VALUE = new Set(["m", "F", "C", "c", "t"]);
// Long options of `git commit` that take a separate value word.
const LONG_WITH_VALUE = new Set(["--message", "--file", "--reuse-message", "--reedit-message", "--template", "--author", "--date", "--cleanup", "--fixup", "--squash", "--trailer", "--pathspec-from-file"]);

// Returns a reason string when the command skips the pre-commit hook, or null.
export function findBypass(cmd) {
  const tokens = tokenize(String(cmd ?? ""));
  const parts = [[]];
  for (const t of tokens) typeof t === "string" ? parts[parts.length - 1].push(t) : parts.push([]);
  for (const words of parts) {
    const g = words.indexOf("git");
    if (g === -1) continue;
    let i = g + 1;
    // git's own options before the subcommand
    while (i < words.length && words[i].startsWith("-")) {
      const w = words[i];
      if (w === "-c" || w === "-C" || w === "--git-dir" || w === "--work-tree" || w === "--namespace") {
        if (w === "-c" && /^core\.hookspath=/i.test(words[i + 1] ?? "")) return "git -c core.hooksPath skips the pre-commit hook";
        i += 2;
      } else {
        if (/^--config-env=core\.hookspath/i.test(w)) return "--config-env core.hooksPath skips the pre-commit hook";
        i += 1;
      }
    }
    if (words[i] !== "commit") continue;
    for (let j = i + 1; j < words.length; j++) {
      const w = words[j];
      if (w === "--") break;
      if (w.length > 4 && "--no-verify".startsWith(w) && w.startsWith("--no-v")) return `${w} skips the pre-commit hook`;
      if (LONG_WITH_VALUE.has(w)) { j++; continue; }
      if (/^-[^-]/.test(w)) {
        for (const letter of w.slice(1)) {
          if (letter === "n") return `-n (in ${w}) skips the pre-commit hook`;
          if (TAKES_VALUE.has(letter)) {
            if (w.endsWith(letter)) j++; // value is the next word
            break;
          }
        }
      }
    }
  }
  return null;
}

async function main() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  let command;
  try {
    command = JSON.parse(raw)?.tool_input?.command ?? "";
  } catch (_) {
    return; // not hook JSON: let it through
  }
  const reason = findBypass(command);
  if (reason) {
    process.stderr.write(
      `Blocked: ${reason} (ADR 0010). Fix what the hook reports instead; if a check is wrong, say so to Arthur.\n`,
    );
    process.exit(2);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
