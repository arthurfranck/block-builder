// Claude Code PreToolUse hook (ADR 0010): refuse a Bash command that would commit without the git pre-commit hook.
// Catches `git commit --no-verify` (and its abbreviations), `-n` alone or bundled (`-nm`, `-an`), and config that
// points core.hooksPath elsewhere (`git -c`, `--config-env`, GIT_CONFIG_* variables), in every part of `&&`, `||`,
// `;`, `|`, `( )` and backtick chains, and inside `sh -c` / `bash -c` / `eval`. Meant to stop an accidental bypass,
// not a determined one: the gaps it leaves are listed in ADR 0010.
// Reads the hook JSON on stdin; exit 2 blocks the call and shows the message to Claude.
// Unit test: tests/unit/no-hook-bypass.unit.mjs.
import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";

// Split a command line into words and separators, the way a POSIX shell quotes them.
export function tokenize(cmd) {
  const out = [];
  let word = null;
  const push = () => {
    if (word !== null) out.push(word), (word = null);
  };
  for (let i = 0; i < cmd.length; i++) {
    const ch = cmd[i];
    if (ch === "'") {
      const end = cmd.indexOf("'", i + 1);
      const stop = end === -1 ? cmd.length : end;
      word = (word ?? "") + cmd.slice(i + 1, stop);
      i = stop;
    } else if (ch === '"') {
      let s = "";
      for (i++; i < cmd.length && cmd[i] !== '"'; i++) {
        if (cmd[i] === "\\" && '"\\$`'.includes(cmd[i + 1] ?? "")) s += cmd[++i];
        else s += cmd[i];
      }
      word = (word ?? "") + s;
    } else if (ch === "\\" && i + 1 < cmd.length) {
      word = (word ?? "") + cmd[++i];
    } else if (/\s/.test(ch)) {
      push();
    } else if (ch === "&" && (/[<>]/.test(cmd[i - 1] ?? "") || cmd[i + 1] === ">")) {
      word = (word ?? "") + ch; // a redirect such as 2>&1 or &>file, not a separator
    } else if (";|&\n()`".includes(ch)) {
      push();
      out.push({ sep: ch });
    } else {
      word = (word ?? "") + ch;
    }
  }
  push();
  return out;
}

const base = (w) => w.replace(/^[{(]+/, "").split("/").pop();
const HOOKS_PATH = /^core\.hookspath=/i;
const ENV_HOOKS_PATH = /^GIT_CONFIG_(KEY_\d+=core\.hookspath|PARAMETERS=.*core\.hookspath)/i;
// Short options of `git commit` whose value must follow: attached (-mfix) or as the next word (-m fix).
const VALUE_REQUIRED = new Set(["m", "F", "C", "c", "t"]);
// Short options whose value is optional and only ever attached (-uno, -Skey): the rest of the word is that value.
const VALUE_ATTACHED = new Set(["u", "S"]);
// Long options of `git commit` that take a separate value word.
const LONG_WITH_VALUE = new Set(["--message", "--file", "--reuse-message", "--reedit-message", "--template", "--author", "--date", "--cleanup", "--fixup", "--squash", "--trailer", "--pathspec-from-file"]);

function checkCommit(words, from) {
  for (let j = from; j < words.length; j++) {
    const w = words[j];
    if (w === "--") break;
    if (w.length > 5 && w.startsWith("--no-v") && "--no-verify".startsWith(w)) return `${w} skips the pre-commit hook`;
    if (LONG_WITH_VALUE.has(w)) {
      j++;
      continue;
    }
    if (/^-[^-]/.test(w)) {
      for (let k = 1; k < w.length; k++) {
        const letter = w[k];
        if (letter === "n") return `-n (in ${w}) skips the pre-commit hook`;
        if (VALUE_ATTACHED.has(letter)) break;
        if (VALUE_REQUIRED.has(letter)) {
          if (k === w.length - 1) j++; // value is the next word
          break;
        }
      }
    }
  }
  return null;
}

// Returns a reason string when the command skips the pre-commit hook, or null.
export function findBypass(cmd, depth = 0) {
  if (depth > 3) return null;
  const tokens = tokenize(String(cmd ?? ""));
  const parts = [[]];
  for (const t of tokens) typeof t === "string" ? parts[parts.length - 1].push(t) : parts.push([]);
  const all = parts.flat();
  const commits = [];
  for (const words of parts) {
    for (let k = 0; k < words.length; k++) {
      const b = base(words[k]);
      // A nested shell: check its script too.
      if (["sh", "bash", "zsh"].includes(b) && /^-[a-z]*c[a-z]*$/.test(words[k + 1] ?? "")) {
        const inner = findBypass(words[k + 2], depth + 1);
        if (inner) return inner;
      }
      if (b === "eval") {
        const inner = findBypass(words.slice(k + 1).join(" "), depth + 1);
        if (inner) return inner;
      }
      if (b !== "git") continue;
      let i = k + 1;
      // git's own options before the subcommand
      while (i < words.length && words[i].startsWith("-")) {
        const w = words[i];
        if (w === "-c" || w === "--config-env") {
          if (HOOKS_PATH.test(words[i + 1] ?? "")) return `git ${w} core.hooksPath skips the pre-commit hook`;
          i += 2;
        } else if (w === "-C" || w === "--git-dir" || w === "--work-tree" || w === "--namespace") {
          i += 2;
        } else {
          if (/^--config-env=core\.hookspath/i.test(w)) return "--config-env core.hooksPath skips the pre-commit hook";
          i += 1;
        }
      }
      if (words[i] === "commit") commits.push([words, i + 1]);
    }
  }
  if (commits.length && all.some((w) => ENV_HOOKS_PATH.test(w))) return "GIT_CONFIG_* setting core.hooksPath skips the pre-commit hook";
  for (const [words, from] of commits) {
    const reason = checkCommit(words, from);
    if (reason) return reason;
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

// Run only when executed directly (works with spaces, non-ASCII and symlinks in the path).
const self = process.argv[1] ? pathToFileURL(realpathSync(process.argv[1])).href : "";
if (import.meta.url === self) main();
