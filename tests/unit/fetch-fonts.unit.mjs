/* Font fetch script (BB-89): run with `npm run test:engine` (Node's own test runner, no network). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCss, groupFaces, fontFaceCss } from '../../scripts/fetch-fonts.mjs';

const face = (subset, family, weight, url, stretch = '') => `/* ${subset} */
@font-face {
  font-family: '${family}';
  font-style: normal;
  font-weight: ${weight};
${stretch ? `  font-stretch: ${stretch};\n` : ''}  font-display: swap;
  src: url(https://fonts.gstatic.com/s/${url}.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131;
}
`;
const css = [
  face('cyrillic', 'Inter', 400, 'inter/cyr'),
  face('latin', 'Inter', 400, 'inter/lat'),
  face('latin', 'Inter', 700, 'inter/lat'),
  face('latin', 'Archivo', 800, 'archivo/lat', '125%'),
].join('');

test('reads each face from the Google css2 answer', () => {
  const faces = parseCss(css);
  assert.equal(faces.length, 4);
  assert.deepEqual(faces[3], {
    subset: 'latin', family: 'Archivo', style: 'normal', weight: '800', stretch: '125%',
    url: 'https://fonts.gstatic.com/s/archivo/lat.woff2', range: 'U+0000-00FF, U+0131',
  });
});

test('keeps only the asked subsets and merges weights that share a file into a range', () => {
  const groups = groupFaces(parseCss(css), ['latin']);
  assert.deepEqual(groups.map((g) => [g.file, g.min, g.max]), [['inter-latin.woff2', 400, 700], ['archivo-latin.woff2', 800, 800]]);
  const out = fontFaceCss(groups, 'fonts');
  assert.match(out, /font-family:"Inter";font-style:normal;font-weight:400 700;font-display:swap;src:url\("fonts\/inter-latin.woff2"\)/);
  assert.match(out, /font-weight:800;font-stretch:125%;/);
  assert.doesNotMatch(out, /gstatic|cyr/);
});

test('reads a weight range and refuses two files that would get the same name', () => {
  const ranged = parseCss(face('latin', 'Inter', '100 900', 'inter/var'));
  assert.deepEqual(groupFaces(ranged, ['latin']).map((g) => [g.min, g.max]), [[100, 900]]);
  const twoFiles = parseCss(face('latin', 'Archivo', 700, 'archivo/a') + face('latin', 'Archivo', 800, 'archivo/b'));
  assert.throws(() => groupFaces(twoFiles, ['latin']), /archivo-latin.woff2: Google serves several files/);
});

test('index.html loads every font from fonts/ and names only files that exist', () => {
  const root = new URL('../../', import.meta.url);
  const html = readFileSync(new URL('index.html', root), 'utf8');
  const block = html.slice(html.indexOf('/* fonts:start */'), html.indexOf('/* fonts:end */'));
  const urls = [...block.matchAll(/url\("([^"]+)"\)/g)].map((m) => m[1]);
  assert.equal(urls.length, 4);
  for (const u of urls) {
    assert.match(u, /^fonts\/[a-z-]+\.woff2$/);
    assert.equal(readFileSync(new URL(u, root)).subarray(0, 4).toString(), 'wOF2', u);
  }
  assert.doesNotMatch(html, /fonts\.g(oogleapis|static)\.com/);
});
