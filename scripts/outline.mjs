// Print the top-level statements of an ES module with their line ranges and declared names: a map for splitting it.
// usage: node scripts/outline.mjs <file.js> [fromLine] [toLine]
import { readFileSync } from 'node:fs';
import { analyze } from './split-module.mjs';
const [file, a = 1, b = Infinity] = process.argv.slice(2);
const code = readFileSync(file, 'utf8');
const { ast, declared } = analyze(code, file);
const names = new Map();
for (const [n, st] of declared) names.set(st, [...(names.get(st) || []), n]);
const lines = code.split('\n');
for (const st of ast.body) {
  const s = st.loc.start.line, e = st.loc.end.line;
  if (e < +a || s > +b) continue;
  const label = names.get(st)?.join(', ') || lines[s - 1].trim().slice(0, 70);
  console.log(`${s}-${e}\t${st.type.replace('Declaration', '').replace('Statement', '')}\t${label.slice(0, 120)}`);
}
