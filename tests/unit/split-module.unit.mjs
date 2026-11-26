/* Module split tool (BB-76): run with `npm run test:engine` (Node's own test runner, no browser). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { analyze, resolveAll, moveLines, rangeOf } from '../../scripts/split-module.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));

/** Run moveLines then resolveAll on an in-memory folder; returns the new files by base name. */
function split(files, from, first, last, to, init) {
  const [s, e] = /^\d+$/.test(first) ? [+first, +last] : rangeOf(files[from], first, last);
  const r = moveLines(files[from], s, e, files[to] ?? null, 'test module', init);
  const all = { ...files, [from]: r.from, [to]: r.to };
  const out = resolveAll(Object.keys(all).map((f) => '/m/' + f), new Set(['lib.js']), (f) => all[f.slice(3)]);
  return Object.fromEntries(Object.keys(all).map((f) => [f, out['/m/' + f] ?? all[f]]));
}

const app = `import { h } from "./lib.js";

let count = 0;
/** says hello */
function hello(name) {
  count++;
  return h("Hello " + name);
}
const loud = (x) => hello(x).toUpperCase();
document.title = loud("you");
function report() {
  return count;
}
`;
const lib = 'export const h = (s) => s;\n';

test('moving declarations: imports and exports are worked out both ways', () => {
  const out = split({ 'app.js': app, 'lib.js': lib }, 'app.js', 'count', 'hello', 'greet.js');
  // the comment above hello travels with it; lib's h follows the code that uses it
  assert.match(out['greet.js'], /^\/\/ @ts-check\n\/\* test module \*\/\n\nimport \{ h \} from "\.\/lib\.js";\n\nexport let count = 0;\n\/\*\* says hello \*\/\nexport function hello/);
  assert.match(out['app.js'], /^import \{ hello, count \} from "\.\/greet\.js";/m);
  assert.doesNotMatch(out['app.js'], /lib\.js/, 'app no longer uses h, so its import goes');
  assert.doesNotMatch(out['app.js'], /^export /m, 'nothing imports from app');
  assert.equal(out['lib.js'], lib, 'external modules are never rewritten');
});

test('--init: load-time statements are wrapped and called where they were', () => {
  const out = split({ 'app.js': app, 'lib.js': lib }, 'app.js', 'count', 'report', 'greet.js', 'initGreet');
  assert.match(out['greet.js'], /export function initGreet\(\) \{\ndocument\.title = loud\("you"\);\n\}/);
  assert.match(out['app.js'], /^initGreet\(\);$/m);
  assert.match(out['app.js'], /import \{ initGreet \} from "\.\/greet\.js";/);
  assert.doesNotMatch(out['greet.js'].split('export function initGreet')[0], /document\.title/, 'nothing runs at module load');
});

test('refuses to assign an imported binding, and names declared in two modules', () => {
  const writes = 'let lang = "en";\nfunction other() {}\nfunction setIt() {\n  lang = "fr";\n}\n';
  assert.throws(() => split({ 'app.js': writes, 'lib.js': lib }, 'app.js', 'lang', 'lang', 'i18n.js'), /app\.js assigns lang, declared in i18n\.js/);
  assert.throws(
    () => resolveAll(['/m/a.js', '/m/b.js'], new Set(), (f) => ({ '/m/a.js': 'export const x = 1;\n', '/m/b.js': 'const x = 2;\n' })[f]),
    /declared in two modules:\n {2}x: a\.js and b\.js/,
  );
});

test('a range must hold whole statements; a destructuring is exported once', () => {
  assert.throws(() => moveLines(app, 5, 6, null), /crosses the range edge/);
  const api = 'import * as e from "./lib.js";\nconst { a, b } = e;\nconst use = () => a + b;\n';
  const out = split({ 'api.js': api, 'lib.js': lib }, 'api.js', 'use', 'use', 'user.js');
  assert.match(out['api.js'], /^export const \{ a, b \} = e;$/m);
  assert.match(out['user.js'], /import \{ a, b \} from "\.\/api\.js";/);
});

test('moving into a module that imported the moved names drops those imports', () => {
  const files = { 'app.js': 'function f() {}\nfunction g() {\n  f();\n}\n', 'lib.js': lib };
  let out = split(files, 'app.js', 'g', 'g', 'two.js');
  assert.match(out['two.js'], /import \{ f \} from "\.\/app\.js";/);
  out = split(out, 'app.js', 'f', 'f', 'two.js');
  assert.doesNotMatch(out['two.js'], /^import/m);
  assert.equal(out['app.js'].trim(), '');
});

test('this repo: resolve finds nothing to change in src/', async () => {
  const prettier = await import('prettier');
  const opts = { ...JSON.parse(readFileSync(root + '.prettierrc.json', 'utf8')), parser: 'babel' };
  const dir = root + 'src/';
  const files = readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => dir + f);
  const out = resolveAll(files, new Set(['engine.js', 'html.js']));
  for (const f of files)
    if (out[f] !== undefined) assert.equal(await prettier.format(out[f], opts), readFileSync(f, 'utf8'), f + ' imports or exports are out of date');
  // and no module imports the entry
  for (const f of files) assert.doesNotMatch(readFileSync(f, 'utf8'), /from "\.\/app\.js"/, f);
  assert.ok(analyze(readFileSync(dir + 'app.js', 'utf8')).declared.size < 5, 'app.js only wires modules');
});
