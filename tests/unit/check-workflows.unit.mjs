/* Workflow file check (BB-91): run with `npm run test:engine` (Node's own test runner, no browser). */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { checkWorkflow, checkFolder } from '../../scripts/check-workflows.mjs';

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
    assert.match(checkWorkflow(ok.replace('on: [push, pull_request]\n', '')).join(), /missing top-level 'on'/);
    assert.match(checkWorkflow('name: x\non: push\n').join(), /missing top-level 'jobs'/);
  });
  test('a job with no runs-on, or no steps', () => {
    assert.match(checkWorkflow(ok.replace('    runs-on: ubuntu-latest\n', '')).join(), /^4:3 job 'build' has no 'runs-on'/);
    assert.match(checkWorkflow('on: push\njobs:\n  a:\n    runs-on: x\n    steps: []\n').join(), /job 'a' has no steps/);
  });
  test('a step needs exactly one of run or uses', () => {
    assert.match(checkWorkflow(ok.replace('        run: npm test\n', '')).join(), /step 2 needs exactly one of 'run' or 'uses' \(has 0\)/);
    assert.match(checkWorkflow(ok.replace('        run: npm test\n', '        run: npm test\n        uses: x/y@v1\n')).join(), /\(has 2\)/);
  });
  test('two YAML documents in one file fail', () => {
    assert.match(checkWorkflow(ok + '---\n' + ok).join(), /one YAML document, found 2/);
  });
});

describe('the repository', () => {
  test("this repo's own workflows pass", () => {
    assert.deepEqual(checkFolder('.github/workflows'), []);
  });
  test('the command line exits 1 and names the file on a broken workflow', async () => {
    const { mkdtempSync, writeFileSync } = await import('node:fs');
    const { tmpdir } = await import('node:os');
    const dir = mkdtempSync(tmpdir() + '/wf-');
    writeFileSync(dir + '/bad.yml', ok.replace('"Unit tests (Node): engine"', 'Unit tests (Node): engine'));
    assert.throws(() => execFileSync('node', ['scripts/check-workflows.mjs', dir], { stdio: 'pipe' }), (e) =>
      e.status === 1 && /bad\.yml:8:\d+ Nested mappings/.test(String(e.stderr)));
  });
});
