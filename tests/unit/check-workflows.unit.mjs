/* Workflow file check (BB-91): run with `npm run test:engine` (Node's own test runner, no browser). */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, copyFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { checkWorkflow, checkFolder } from '../../scripts/check-workflows.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const script = root + 'scripts/check-workflows.mjs';

const ok = `name: Tests
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: "Unit tests (Node): engine"
        run: npm test
  reuse:
    uses: ./.github/workflows/other.yml
`;

describe('checkWorkflow', () => {
  test('a valid workflow, with a quoted name containing ": " and a reusable-workflow job, passes', () => {
    assert.deepEqual(checkWorkflow(ok), []);
  });
  test('BB-78: an unquoted step name with ": " fails at its line', () => {
    const bad = ok.replace('"Unit tests (Node): engine"', 'Unit tests (Node): engine');
    const errs = checkWorkflow(bad);
    assert.equal(errs.length, 1);
    assert.match(errs[0], /^8:\d+ Nested mappings are not allowed/);
  });
  test('a duplicate key fails', () => {
    assert.match(checkWorkflow(ok.replace('    runs-on: ubuntu-latest\n', '    runs-on: ubuntu-latest\n    runs-on: macos-latest\n')).join(), /unique/i);
  });
  test('missing on, missing jobs', () => {
    assert.match(checkWorkflow(ok.replace('on: [push, pull_request]\n', '')).join(), /missing or empty top-level 'on'/);
    assert.match(checkWorkflow('name: x\non: push\n').join(), /missing top-level 'jobs'/);
  });
  test('a job with no runs-on, or no steps', () => {
    assert.match(checkWorkflow(ok.replace('    runs-on: ubuntu-latest\n', '')).join(), /^4:3 job 'build' has no 'runs-on'/);
    assert.match(checkWorkflow('on: push\njobs:\n  a:\n    runs-on: x\n    steps: []\n').join(), /job 'a' has no steps/);
  });
  test('a step needs exactly one of run or uses', () => {
    assert.match(checkWorkflow(ok.replace('        run: npm test\n', '')).join(), /step 2 needs exactly one non-empty 'run' or 'uses' \(has 0\)/);
    assert.match(checkWorkflow(ok.replace('        run: npm test\n', '        run: npm test\n        uses: x/y@v1\n')).join(), /\(has 2\)/);
  });
  test('a key with an empty value counts as missing (GitHub rejects it)', () => {
    assert.match(checkWorkflow(ok.replace('runs-on: ubuntu-latest', 'runs-on:')).join(), /job 'build' has no 'runs-on'/);
    assert.match(checkWorkflow(ok.replace('run: npm test', 'run:')).join(), /step 2 needs exactly one non-empty 'run' or 'uses' \(has 0\)/);
    assert.match(checkWorkflow(ok.replace('on: [push, pull_request]', 'on:')).join(), /missing or empty top-level 'on'/);
  });
  test('anchors, aliases and merge keys are resolved first, as GitHub does', () => {
    const anchored = `on: push
jobs:
  a: &job
    runs-on: ubuntu-latest
    steps:
      - &checkout
        uses: actions/checkout@v4
      - <<: *checkout
        name: again
  b: *job
`;
    assert.deepEqual(checkWorkflow(anchored), []);
  });
  test('two YAML documents in one file fail', () => {
    assert.match(checkWorkflow(ok + '---\n' + ok).join(), /one YAML document, found 2/);
  });
});

describe('the repository', () => {
  test("this repo's own workflows pass (the staged copies, as the hook checks them)", () => {
    /* not the working tree: an unstaged workflow edit must not block an unrelated commit (the hook runs these tests) */
    const git = (...a) => execFileSync('git', ['-C', root, ...a], { encoding: 'utf8' });
    const files = git('ls-files', '--', '.github/workflows').split('\n').filter((f) => /\.ya?ml$/.test(f));
    assert.ok(files.length >= 2, `found ${files.length} workflow files`);
    assert.deepEqual(files.flatMap((f) => checkWorkflow(git('show', ':' + f)).map((e) => `${f}:${e}`)), []);
  });
  test('a folder that does not exist fails', () => {
    assert.match(checkFolder(root + '.github/workflow').join(), /folder not found/);
  });
  test('the command line exits 1 and names the file, also run from a path with a space or through a symlink', () => {
    const dir = mkdtempSync(tmpdir() + '/wf-');
    writeFileSync(dir + '/bad.yml', ok.replace('"Unit tests (Node): engine"', 'Unit tests (Node): engine'));
    /* the copies import yaml from the repo's node_modules */
    const spaced = root + 'scripts/check workflows copy.mjs';
    const linked = mkdtempSync(tmpdir() + '/wfl-') + '/link.mjs';
    copyFileSync(script, spaced);
    symlinkSync(script, linked);
    try {
      for (const s of [script, spaced, linked])
        assert.throws(() => execFileSync('node', [s, dir], { stdio: 'pipe' }), (e) =>
          e.status === 1 && /bad\.yml:8:\d+ Nested mappings/.test(String(e.stderr)), s);
    } finally {
      execFileSync('rm', ['-f', spaced]);
    }
  });
  test('the command line exits 1 on a folder that does not exist', () => {
    assert.throws(() => execFileSync('node', [script, root + '.github/workflow'], { stdio: 'pipe' }), (e) => e.status === 1);
  });
});
