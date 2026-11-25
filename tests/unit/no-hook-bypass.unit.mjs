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
  // found by the fresh-context review of cbdfc1c
  'git commit -m "say \\"hi\\"" -n',
  'git commit -m x &>/dev/null -n',
  'git commit -m x 2>&1 --no-verify',
  '(git commit -n -m x)',
  '/usr/bin/git commit -n -m x',
  'bash -c "git commit -n -m x"',
  'sh -lc "cd x && git commit --no-verify -m y"',
  'eval git commit -n -m x',
  'git --config-env core.hooksPath=X commit -m x',
  'GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=/dev/null git commit -m x',
  'git commit -mm -n',
  'npm run build 2>&1 || git commit -n -m x',
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
  'git commit -uno -m x',
  'git commit -S -m x',
  'git commit -m x 2>&1',
  'git commit -m "$(echo -n hi)"',
  'git commit -m x && echo -n done',
  'bash -c "git commit -m x"',
];

describe('findBypass', () => {
  for (const cmd of blocked) test(`blocks: ${cmd}`, () => assert.ok(findBypass(cmd), cmd));
  for (const cmd of allowed) test(`allows: ${cmd}`, () => assert.equal(findBypass(cmd), null, cmd));
});

describe('hook process', () => {
  test('runs from a path with a space in it', async () => {
    const { mkdtempSync, copyFileSync, mkdirSync } = await import('node:fs');
    const { join } = await import('node:path');
    const { tmpdir } = await import('node:os');
    const dir = join(mkdtempSync(join(tmpdir(), 'bb hook ')), 'with space');
    mkdirSync(dir);
    const copy = join(dir, 'no-hook-bypass.mjs');
    copyFileSync(fileURLToPath(new URL('../../.claude/hooks/no-hook-bypass.mjs', import.meta.url)), copy);
    const r = spawnSync(process.execPath, [copy], { input: JSON.stringify({ tool_input: { command: 'git commit -n -m x' } }) });
    assert.equal(r.status, 2);
  });
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
