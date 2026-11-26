// Fetch the page's web fonts from Google Fonts once, into fonts/, so the page never asks Google (BB-89, ADR 0011).
// Downloads the woff2 files Google serves for QUERY (only the SUBSETS below), each family's OFL licence,
// and rewrites the @font-face rules in index.html between the fonts:start and fonts:end markers.
// Rerun it to change weights or update the fonts: node scripts/fetch-fonts.mjs [page] [fontsDir]
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';

const QUERY = 'family=Archivo:wdth,wght@125,700;125,800&family=Inter:wght@400;500;600;700&display=swap';
const SUBSETS = ['latin-ext', 'latin'];
// Google picks the format from the user agent; a current browser gets woff2.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const START = '/* fonts:start */';
const END = '/* fonts:end */';

const page = process.argv[2] || 'index.html';
const dir = process.argv[3] || 'fonts';

async function get(url, as = 'text') {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  return as === 'bytes' ? Buffer.from(await r.arrayBuffer()) : r.text();
}

/** Parse Google's css2 answer into one entry per subset comment + @font-face block. */
export function parseCss(css) {
  const faces = [];
  for (const m of css.matchAll(/\/\* ([\w-]+) \*\/\s*@font-face\s*{([^}]*)}/g)) {
    const prop = (name) => m[2].match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();
    faces.push({
      subset: m[1],
      family: prop('font-family')?.replace(/['"]/g, ''),
      style: prop('font-style'),
      weight: Number(prop('font-weight')),
      stretch: prop('font-stretch'),
      url: prop('src')?.match(/url\(([^)]+)\)/)?.[1],
      range: prop('unicode-range'),
    });
  }
  return faces;
}

/** One rule per file: Google repeats the same variable file for every weight, so merge them into a range. */
export function groupFaces(faces, subsets) {
  const byUrl = new Map();
  for (const f of faces.filter((f) => subsets.includes(f.subset))) {
    const g = byUrl.get(f.url);
    if (g) {
      g.min = Math.min(g.min, f.weight);
      g.max = Math.max(g.max, f.weight);
    } else byUrl.set(f.url, { ...f, min: f.weight, max: f.weight });
  }
  return [...byUrl.values()].map((g) => ({ ...g, file: `${g.family.toLowerCase()}-${g.subset}.woff2` }));
}

export function fontFaceCss(groups, href) {
  return groups
    .map((g) =>
      [
        `@font-face{font-family:"${g.family}";font-style:${g.style};font-weight:${g.min === g.max ? g.min : `${g.min} ${g.max}`};`,
        g.stretch ? `font-stretch:${g.stretch};` : '',
        `font-display:swap;src:url("${href}/${g.file}") format("woff2");unicode-range:${g.range}}`,
      ].join(''),
    )
    .join('\n');
}

async function main() {
  const groups = groupFaces(parseCss(await get(`https://fonts.googleapis.com/css2?${QUERY}`)), SUBSETS);
  if (!groups.length) throw new Error('Google returned no font faces for ' + SUBSETS.join(', '));
  await mkdir(dir, { recursive: true });
  for (const g of groups) await writeFile(join(dir, g.file), await get(g.url, 'bytes'));
  for (const fam of new Set(groups.map((g) => g.family))) {
    const name = fam.toLowerCase().replace(/\s+/g, '');
    await writeFile(join(dir, `${name}-OFL.txt`), await get(`https://raw.githubusercontent.com/google/fonts/main/ofl/${name}/OFL.txt`));
  }
  const html = await readFile(page, 'utf8');
  const a = html.indexOf(START);
  const b = html.indexOf(END);
  if (a < 0 || b < a) throw new Error(`${page}: markers ${START} … ${END} not found`);
  const href = relative(dirname(page), dir).split('\\').join('/');
  await writeFile(page, html.slice(0, a + START.length) + '\n' + fontFaceCss(groups, href) + '\n' + html.slice(b));
  console.log(groups.map((g) => `${dir}/${g.file}  ${g.family} ${g.subset} ${g.min}-${g.max}`).join('\n'));
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
