#!/usr/bin/env node
// Check GitHub Actions workflow files before they are pushed (BB-91). GitHub silently creates no checks for a
// workflow it can't read, so a broken file makes a PR look green (BB-78: an unquoted step name with ": ").
// Usage: node scripts/check-workflows.mjs [folder]   (default .github/workflows). Exit 1 on any problem.
// Self-contained (needs only the `yaml` package), so another repo can copy it as is.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseAllDocuments, isMap, isSeq, isScalar } from "yaml";

/** Problems in one workflow file's text, as "line:col message" strings (empty when the file is fine). */
export function checkWorkflow(text) {
  const docs = parseAllDocuments(text, { uniqueKeys: true }); /* prettyErrors (default) fills in line positions */
  const where = (node) => {
    if (!node || !node.range) return "1:1";
    const before = text.slice(0, node.range[0]).split("\n");
    return `${before.length}:${before[before.length - 1].length + 1}`;
  };
  const errs = [];
  const yamlErrs = docs.flatMap((d) => [...d.errors, ...d.warnings]);
  for (const e of yamlErrs) {
    const [line, col] = e.linePos?.[0] ? [e.linePos[0].line, e.linePos[0].col] : [1, 1];
    errs.push(`${line}:${col} ${e.message.split("\n")[0].replace(/ at line \d+, column \d+:?$/, "")}`);
  }
  if (yamlErrs.length) return errs;
  if (docs.length !== 1) return [`1:1 expected one YAML document, found ${docs.length}`];
  const root = docs[0].contents;
  if (!isMap(root)) return ["1:1 the workflow must be a mapping (on:, jobs:)"];
  const get = (map, key) => map.items.find((p) => isScalar(p.key) && p.key.value === key);
  /* `on` is a YAML 1.1 boolean in some parsers; the yaml package (YAML 1.2) keeps it as the string "on" */
  if (!get(root, "on")) errs.push("1:1 missing top-level 'on' (what triggers the workflow)");
  const jobs = get(root, "jobs");
  if (!jobs) return [...errs, "1:1 missing top-level 'jobs'"];
  if (!isMap(jobs.value) || !jobs.value.items.length) return [...errs, `${where(jobs.key)} 'jobs' must list at least one job`];
  for (const job of jobs.value.items) {
    const id = isScalar(job.key) ? job.key.value : "?";
    if (!isMap(job.value)) {
      errs.push(`${where(job.key)} job '${id}' must be a mapping`);
      continue;
    }
    if (get(job.value, "uses")) continue; /* a call to a reusable workflow: no runs-on or steps of its own */
    if (!get(job.value, "runs-on")) errs.push(`${where(job.key)} job '${id}' has no 'runs-on'`);
    const steps = get(job.value, "steps");
    if (!steps || !isSeq(steps.value) || !steps.value.items.length) {
      errs.push(`${where(job.key)} job '${id}' has no steps`);
      continue;
    }
    steps.value.items.forEach((st, i) => {
      if (!isMap(st)) return errs.push(`${where(st)} job '${id}' step ${i + 1} must be a mapping`);
      const n = ["run", "uses"].filter((k) => get(st, k)).length;
      if (n !== 1) errs.push(`${where(st)} job '${id}' step ${i + 1} needs exactly one of 'run' or 'uses' (has ${n})`);
    });
  }
  return errs;
}

/** Check every .yml / .yaml file in a folder; returns "file:line:col message" strings. */
export function checkFolder(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.ya?ml$/.test(f))
    .sort()
    .flatMap((f) => checkWorkflow(readFileSync(join(dir, f), "utf8")).map((e) => `${join(dir, f)}:${e}`));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2] || ".github/workflows";
  const errs = checkFolder(dir);
  if (errs.length) {
    console.error(`Workflow check failed (GitHub would run no checks for a broken workflow):\n${errs.map((e) => "  " + e).join("\n")}`);
    process.exit(1);
  }
}
