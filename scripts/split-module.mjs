// Split ES modules by moving top-level code between files, with imports and exports worked out from scope analysis
// (BB-76). Works on any folder of ES modules; nothing in it is specific to Block Builder.
//
//   node scripts/split-module.mjs move <from.js> <startLine> <endLine> <to.js> [--title "one-line purpose"]
//     Moves lines start..end of <from.js> (whole top-level statements and their comments) to the end of <to.js>
//     (created if missing), then runs `resolve`.
//   node scripts/split-module.mjs resolve [dir] [--external a.js,b.js]
//     For every module in dir (default: the folder of the files given, or src): each name it uses but does not
//     declare is imported from the one module that declares it at top level, else kept from an existing import
//     elsewhere (so `html` from html.js follows the code that uses it), else left as a global. Unused imports are
//     dropped. A top-level declaration gets `export` exactly when another module imports it. External modules
//     (default: none) are never rewritten and only provide names through existing imports.
//
// Refuses, and changes nothing, when a module would assign to an imported binding (ES modules forbid it: add a
// setter in the declaring module first) or when a name is declared at top level in two modules.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, basename, join, resolve as resolvePath } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(join(process.cwd(), 'package.json'));
const espree = require('espree');
const escope = require('eslint-scope');

const parse = (code, file) => {
  try {
    return espree.parse(code, { ecmaVersion: 'latest', sourceType: 'module', range: true, loc: true, comment: true });
  } catch (e) {
    throw new Error(`${file}: ${e.message}`, { cause: e });
  }
};

/** Top-level facts of one module: declarations, imports, names it uses without declaring, writes to imports. */
export function analyze(code, file = 'module') {
  const ast = parse(code, file);
  const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'module' });
  const mod = sm.globalScope.childScopes.find((s) => s.type === 'module');
  const declared = new Map(); // name -> top-level statement node (the ExportNamedDeclaration when exported)
  const imports = []; // {source, imported ('*' for namespace, 'default'), local, node}
  for (const st of ast.body) {
    if (st.type === 'ImportDeclaration') {
      for (const sp of st.specifiers)
        imports.push({
          source: st.source.value,
          imported: sp.type === 'ImportNamespaceSpecifier' ? '*' : sp.type === 'ImportDefaultSpecifier' ? 'default' : sp.imported.name,
          local: sp.local.name,
        });
      continue;
    }
    const d = st.type === 'ExportNamedDeclaration' ? st.declaration : st;
    if (!d) continue;
    for (const v of mod.variables)
      if (v.defs.some((df) => df.type !== 'ImportBinding' && df.name.range[0] >= d.range[0] && df.name.range[1] <= d.range[1]))
        declared.set(v.name, st);
  }
  const used = new Set(sm.globalScope.through.map((r) => r.identifier.name));
  const importWrites = [];
  for (const v of mod.variables) {
    const isImport = v.defs.some((df) => df.type === 'ImportBinding');
    if (isImport && v.references.some((r) => r.isWrite())) importWrites.push(v.name);
  }
  const unresolvedWrites = sm.globalScope.through.filter((r) => r.isWrite()).map((r) => r.identifier.name);
  const importUsed = new Set();
  for (const v of mod.variables) if (v.defs.some((df) => df.type === 'ImportBinding') && v.references.length) importUsed.add(v.name);
  return { ast, declared, imports, used, importWrites, unresolvedWrites, importUsed };
}

const rel = (fromFile, toFile) => {
  const r = join(dirname(fromFile), basename(toFile)) === toFile ? './' + basename(toFile) : null;
  if (!r) throw new Error(`${toFile}: modules must sit in one folder`);
  return r;
};

/** Recompute imports and exports of every non-external module in `files`. Returns {file: newCode}; throws on conflicts. */
export function resolveAll(files, external = new Set(), read = (f) => readFileSync(f, 'utf8')) {
  const code = Object.fromEntries(files.map((f) => [f, read(f)]));
  const info = Object.fromEntries(files.map((f) => [f, analyze(code[f], f)]));
  const own = files.filter((f) => !external.has(basename(f)));
  // who declares what (own modules only)
  const owner = new Map();
  const clash = [];
  for (const f of own)
    for (const n of info[f].declared.keys()) {
      if (owner.has(n) && owner.get(n) !== f) clash.push(`${n}: ${basename(owner.get(n))} and ${basename(f)}`);
      owner.set(n, f);
    }
  if (clash.length) throw new Error('declared in two modules:\n  ' + clash.join('\n  '));
  // names known through existing imports of non-own modules: local -> spec
  const known = new Map();
  for (const f of own) for (const im of info[f].imports) if (!own.some((o) => rel(f, o) === im.source)) known.set(im.local, im);
  const needs = new Map(own.map((f) => [f, new Map()])); // file -> Map(source -> Map(imported -> local))
  const exportsNeeded = new Map(own.map((f) => [f, new Set()]));
  const errors = [];
  for (const f of own) {
    const I = info[f];
    const add = (source, imported, local) => {
      const m = needs.get(f);
      if (!m.has(source)) m.set(source, new Map());
      m.get(source).set(imported, local);
    };
    // names this module uses: unresolved through-refs, plus its own import bindings that are still referenced
    const want = new Set([...I.used, ...I.importUsed]);
    for (const n of want) {
      if (I.declared.has(n)) continue;
      if (owner.has(n)) {
        add(rel(f, owner.get(n)), n, n);
        exportsNeeded.get(owner.get(n)).add(n);
      } else if (known.has(n)) {
        const k = known.get(n);
        add(k.source, k.imported, n);
      } // else a global
    }
    for (const n of [...I.importWrites, ...I.unresolvedWrites]) if (owner.has(n) && owner.get(n) !== f) errors.push(`${basename(f)} assigns ${n}, declared in ${basename(owner.get(n))}`);
  }
  if (errors.length) throw new Error('assignment to an imported binding (add a setter in the declaring module):\n  ' + errors.join('\n  '));
  const out = {};
  for (const f of own) {
    const I = info[f];
    let src = code[f];
    const edits = []; // [start, end, text]
    // exports: add or remove the keyword
    for (const [n, st] of I.declared) {
      const want = exportsNeeded.get(f).has(n);
      if (st.type === 'ExportNamedDeclaration' && !want) {
        const others = [...I.declared].filter(([m, s]) => s === st && m !== n).some(([m]) => exportsNeeded.get(f).has(m));
        if (!others) edits.push([st.range[0], st.declaration.range[0], '']);
      } else if (st.type !== 'ExportNamedDeclaration' && want) edits.push([st.range[0], st.range[0], 'export ']);
    }
    // imports: replace the whole import block
    const imps = I.ast.body.filter((s) => s.type === 'ImportDeclaration');
    const lines = [];
    const order = [...new Set([...I.imports.map((i) => i.source), ...needs.get(f).keys()])];
    for (const source of order) {
      const m = needs.get(f).get(source);
      if (!m) continue;
      const ns = [...m].filter(([imp]) => imp === '*');
      const named = [...m].filter(([imp]) => imp !== '*' && imp !== 'default');
      const def = [...m].find(([imp]) => imp === 'default');
      for (const [, local] of ns) lines.push(`import * as ${local} from "${source}";`);
      const parts = [];
      if (def) parts.push(def[1]);
      if (named.length) parts.push(`{ ${named.map(([imp, local]) => (imp === local ? imp : `${imp} as ${local}`)).join(', ')} }`);
      if (parts.length) lines.push(`import ${parts.join(', ')} from "${source}";`);
    }
    const block = lines.join('\n');
    if (imps.length) {
      // remove each import statement with its line ending, then put the block where the first one was
      for (const s of imps.slice(1)) edits.push([s.range[0], src.indexOf('\n', s.range[1]) + 1 || s.range[1], '']);
      edits.push([imps[0].range[0], imps[0].range[1], block]);
    } else if (block) {
      const first = I.ast.body[0];
      // after the leading comments
      const at = first ? first.range[0] - (src.slice(0, first.range[0]).match(/[^\n]*$/)?.[0].length || 0) : src.length;
      edits.push([at, at, block + '\n\n']);
    }
    edits.sort((a, b) => b[0] - a[0] || b[1] - a[1]);
    for (const [s, e, t] of edits) src = src.slice(0, s) + t + src.slice(e);
    out[f] = src;
  }
  return out;
}

/** Move lines start..end (1-based, inclusive) of `from` to the end of `to`. Returns {from, to} code. */
export function moveLines(fromCode, start, end, toCode, title) {
  const L = fromCode.split('\n');
  if (start < 1 || end > L.length || start > end) throw new Error(`lines ${start}-${end} out of range`);
  const ast = parse(fromCode, 'from');
  const lineStart = (n) => L.slice(0, n - 1).join('\n').length + (n > 1 ? 1 : 0);
  const a = lineStart(start);
  const b = lineStart(end) + L[end - 1].length;
  for (const st of ast.body) {
    const [s, e] = st.range;
    if (s < b && e > a && (s < a || e > b)) throw new Error(`a statement at line ${st.loc.start.line}-${st.loc.end.line} crosses the range edge`);
    if (st.type === 'ImportDeclaration' && s >= a && e <= b) throw new Error(`line ${st.loc.start.line}: import statements are not moved`);
  }
  const moved = L.slice(start - 1, end).join('\n');
  const rest = [...L.slice(0, start - 1), ...L.slice(end)].join('\n');
  const head = toCode ?? `// @ts-check\n${title ? `/* ${title} */\n` : ''}`;
  return { from: rest, to: head.replace(/\n*$/, '\n\n') + moved + '\n' };
}

function main(argv) {
  const [cmd, ...rest] = argv;
  const opt = (name) => {
    const i = rest.indexOf(name);
    if (i < 0) return undefined;
    const v = rest[i + 1];
    rest.splice(i, 2);
    return v;
  };
  const title = opt('--title');
  const external = new Set((opt('--external') || '').split(',').filter(Boolean));
  let dir;
  const writes = {};
  if (cmd === 'move') {
    const [from, s, e, to] = rest;
    if (!to) throw new Error('usage: move <from.js> <startLine> <endLine> <to.js> [--title "…"]');
    const r = moveLines(readFileSync(from, 'utf8'), +s, +e, existsSync(to) ? readFileSync(to, 'utf8') : null, title);
    writes[resolvePath(from)] = r.from;
    writes[resolvePath(to)] = r.to;
    dir = dirname(resolvePath(from));
  } else if (cmd === 'resolve') dir = resolvePath(rest[0] || 'src');
  else throw new Error('usage: split-module.mjs move|resolve … (see the header)');
  const files = [...new Set([...readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => join(dir, f)), ...Object.keys(writes)])];
  const out = resolveAll(files, external, (f) => writes[f] ?? readFileSync(f, 'utf8'));
  for (const f of files) {
    const code = out[f] ?? writes[f];
    if (code !== undefined && (!existsSync(f) || code !== readFileSync(f, 'utf8'))) {
      writeFileSync(f, code);
      console.log('wrote', f);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv.slice(2));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
