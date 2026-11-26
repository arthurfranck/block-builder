#!/usr/bin/env node
// Check GitHub Actions workflow files before they are pushed (BB-91). GitHub silently creates no checks for a
// workflow it can't read, so a broken file makes a PR look green (BB-78: an unquoted step name with ": ").
// Usage: node scripts/check-workflows.mjs [folder]   (default .github/workflows). Exit 1 on any problem,
// including a folder that doesn't exist. Self-contained (needs only the `yaml` package), so another repo can copy it.
import { readdirSync, readFileSync, existsSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parseAllDocuments, isMap, isSeq, isScalar } from "yaml";

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
/* a key that is there with an empty value (`runs-on:`) is as bad as a missing one for GitHub */
const filled = (v) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && !v.length);

/** Problems in one workflow file's text, as "line:col message" strings (empty when the file is fine). */
export function checkWorkflow(text) {
  /* merge: `<<: *anchor` keys are expanded, as GitHub does; prettyErrors (default) fills in line positions */
  const docs = parseAllDocuments(text, { uniqueKeys: true, merge: true });
  const pos = (node) => {
    if (!node || !node.range) return "1:1";
    const before = text.slice(0, node.range[0]).split("\n");
    return `${before.length}:${before[before.length - 1].length + 1}`;
  };
  const yamlErrs = docs.flatMap((d) => [...d.errors, ...d.warnings]);
  if (yamlErrs.length)
    return yamlErrs.map((e) => {
      const [line, col] = e.linePos?.[0] ? [e.linePos[0].line, e.linePos[0].col] : [1, 1];
      return `${line}:${col} ${e.message.split("\n")[0].replace(/ at line \d+, column \d+:?$/, "")}`;
    });
  if (docs.length !== 1) return [`1:1 expected one YAML document, found ${docs.length}`];
  /* rules run on the resolved value (aliases and merge keys expanded); the syntax tree only gives line numbers */
  const wf = docs[0].toJS();
  const ast = docs[0].contents;
  if (!isObj(wf)) return ["1:1 the workflow must be a mapping (on:, jobs:)"];
  const node = (map, key) => (isMap(map) ? map.items.find((p) => isScalar(p.key) && p.key.value === key) : undefined);
  const errs = [];
  if (!filled(wf.on)) errs.push("1:1 missing or empty top-level 'on' (what triggers the workflow)");
  if (!("jobs" in wf)) return [...errs, "1:1 missing top-level 'jobs'"];
  if (!isObj(wf.jobs) || !Object.keys(wf.jobs).length) return [...errs, `${pos(node(ast, "jobs")?.key)} 'jobs' must list at least one job`];
  const jobsAst = node(ast, "jobs")?.value;
  for (const [id, job] of Object.entries(wf.jobs)) {
    const jp = node(jobsAst, id);
    const at = pos(jp?.key);
    if (!isObj(job)) {
      errs.push(`${at} job '${id}' must be a mapping`);
      continue;
    }
    if (filled(job.uses)) continue; /* a call to a reusable workflow: no runs-on or steps of its own */
    if (!filled(job["runs-on"])) errs.push(`${at} job '${id}' has no 'runs-on'`);
    if (!Array.isArray(job.steps) || !job.steps.length) {
      errs.push(`${at} job '${id}' has no steps`);
      continue;
    }
    const stepsAst = node(jp?.value, "steps")?.value;
    job.steps.forEach((st, i) => {
      const sat = isSeq(stepsAst) ? pos(stepsAst.items[i]) : at;
      if (!isObj(st)) return errs.push(`${sat} job '${id}' step ${i + 1} must be a mapping`);
      const n = ["run", "uses"].filter((k) => filled(st[k])).length;
      if (n !== 1) errs.push(`${sat} job '${id}' step ${i + 1} needs exactly one non-empty 'run' or 'uses' (has ${n})`);
    });
  }
  return errs;
}

/** Check every .yml / .yaml file in a folder; returns "file:line:col message" strings. A missing folder is an error. */
export function checkFolder(dir) {
  if (!existsSync(dir)) return [`${dir}: folder not found`];
  return readdirSync(dir)
    .filter((f) => /\.ya?ml$/.test(f))
    .sort()
    .flatMap((f) => checkWorkflow(readFileSync(join(dir, f), "utf8")).map((e) => `${join(dir, f)}:${e}`));
}

/* run as a command: compare real file URLs, so paths with spaces or reached through a symlink still run the check */
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const dir = process.argv[2] || ".github/workflows";
  const errs = checkFolder(dir);
  if (errs.length) {
    console.error(`Workflow check failed (GitHub would run no checks for a broken workflow):\n${errs.map((e) => "  " + e).join("\n")}`);
    process.exit(1);
  }
}
