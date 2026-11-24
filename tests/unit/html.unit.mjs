/* Safe HTML helper (BB-78): run with `npm run test:engine` (Node's own test runner, no browser). */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { html, esc, htmlJoin, trustedHtml, plainText, setHtml, clearHtml, SafeHtml } from '../../src/html.js';

const attack = '<img src=x onerror="alert(1)">&';
const escaped = '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;';

describe('html tag', () => {
  test('escapes plain values in text and attributes', () => {
    assert.equal(String(html`<b title="${attack}">${attack}</b>`), `<b title="${escaped}">${escaped}</b>`);
  });
  test('returns SafeHtml, and nested html is not escaped again', () => {
    const inner = html`<i>${'a&b'}</i>`;
    assert.ok(inner instanceof SafeHtml);
    assert.equal(String(html`<p>${inner}</p>`), '<p><i>a&amp;b</i></p>');
  });
  test('joins arrays, escaping plain items and keeping safe ones', () => {
    assert.equal(String(html`<ul>${['<x>', html`<li>1</li>`]}</ul>`), '<ul>&lt;x&gt;<li>1</li></ul>');
  });
  test('null and undefined render nothing; numbers and booleans render as text, as in aria-expanded="false"', () => {
    assert.equal(String(html`${null}${undefined}|${0}|${true}|${false}`), '|0|true|false');
  });
  test('keeps the static parts as written', () => {
    assert.equal(String(html`<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>`), '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>');
  });
});

describe('esc, htmlJoin, trustedHtml, plainText', () => {
  test('esc escapes once and keeps the original text', () => {
    const e = esc(attack);
    assert.equal(String(e), escaped);
    assert.equal(e.text, attack);
    assert.equal(String(html`${e}`), escaped, 'not escaped twice');
    assert.equal(esc(e), e, 'esc of SafeHtml is a no-op');
    assert.equal(String(esc(null)), '');
  });
  test('htmlJoin joins pieces and escapes plain strings', () => {
    assert.equal(String(htmlJoin([html`<li>${'<'}</li>`, '<b>'])), '<li>&lt;</li>&lt;b&gt;');
  });
  test('htmlJoin puts an escaped separator between pieces', () => {
    assert.equal(String(htmlJoin([html`<b>1</b>`, html`<b>2</b>`], ' & ')), '<b>1</b> &amp; <b>2</b>');
  });
  test('trustedHtml keeps markup as is', () => {
    assert.equal(String(html`${trustedHtml('<b>x</b>')}`), '<b>x</b>');
  });
  test('plainText gives the original text of esc() and the string of anything else', () => {
    assert.equal(plainText(esc('a<b')), 'a<b');
    assert.equal(plainText(html`<b>`), '<b>');
    assert.equal(plainText(3), '3');
  });
});

describe('setHtml and clearHtml', () => {
  const el = () => ({ innerHTML: 'old', replaceChildren() { this.innerHTML = ''; } });
  test('writes SafeHtml and arrays of it', () => {
    const e = el();
    setHtml(e, html`<b>${'<'}</b>`);
    assert.equal(e.innerHTML, '<b>&lt;</b>');
    setHtml(e, [html`<i>1</i>`, html`<i>2</i>`]);
    assert.equal(e.innerHTML, '<i>1</i><i>2</i>');
  });
  test('an empty string empties the element', () => {
    const e = el();
    setHtml(e, '');
    assert.equal(e.innerHTML, '');
  });
  test('refuses a plain string', () => {
    assert.throws(() => setHtml(el(), '<b>x</b>'), TypeError);
  });
  test('clearHtml empties the element', () => {
    const e = el();
    clearHtml(e);
    assert.equal(e.innerHTML, '');
  });
});
