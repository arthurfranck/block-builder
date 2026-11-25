/* Claude hook that refuses commits skipping the git pre-commit hook (ADR 0010): run with `npm run test:engine`. */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { findBypass } from '../../.claude/hooks/no-hook-bypass.mjs';

const blocked = [
  'git commit --no-verify -m "x"',
  'git commit -m "fix" --no-verify',
  'git commit --no-ver -m x',
  'git commit -n -m x',
  'git commit -nm "x"',
  'git commit -anm x',
  'git commit -m x -n',
  'cd block-builder && git commit -n -m x',
  'npm run build; git commit -qn -m x',
  'git -c core.hooksPath=/dev/null commit -m x',
  'git -c core.hooksPath= commit -m x',
  'git --config-env=core.hooksPath=X commit -m x',
];

const allowed = [
  'git commit -m "x"',
  'git commit -q -F - <<EOF',
  'git commit -m "use -n and --no-verify carefully"',
  'git commit -m -n',
  'git commit -am "message"',
  'git commit --message --no-verify',
  'git log -n 3',
  'git status',
  'grep -n commit file.txt',
  'echo "git commit --no-verify"',
  'git -C ~/Claude/block-builder commit -m x',
  'git commit -m x -- -n',
];

describe('findBypass', () => {
  for (const cmd of blocked) test(`blocks: ${cmd}`, () => assert.ok(findBypass(cmd), cmd));
  for (const cmd of allowed) test(`allows: ${cmd}`, () => assert.equal(findBypass(cmd), null, cmd));
});

describe('hook process', () => {
  const hook = fileURLToPath(new URL('../../.claude/hooks/no-hook-bypass.mjs', import.meta.url));
  const run = (input) => spawnSync(process.execPath, [hook], { input });
  test('exits 2 with a message for a bypass', () => {
    const r = run(JSON.stringify({ tool_input: { command: 'git commit -n -m x' } }));
    assert.equal(r.status, 2);
    assert.match(String(r.stderr), /ADR 0010/);
  });
  test('exits 0 for a normal commit and for input that is not hook JSON', () => {
    assert.equal(run(JSON.stringify({ tool_input: { command: 'git commit -m x' } })).status, 0);
    assert.equal(run('not json').status, 0);
  });
});
