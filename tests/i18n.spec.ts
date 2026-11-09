import { test, expect } from './helpers';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/* The I18N object is read straight from index.html, so these checks need no browser. */
function loadI18N(): Record<'en' | 'fr', Record<string, string>> {
  const html = readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const m = /const I18N=(\{[\s\S]*?\n\}\});/.exec(html);
  if (!m) throw new Error('I18N object not found in index.html');
  return new Function(`return (${m[1].replace(/;$/, '')})`)();
}
const tokens = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort();

test.describe('translations', () => {
  test.skip(({ browserName, isMobile }) => browserName !== 'chromium' || isMobile, 'file check, run once');

  test('every English string has a French one, and no French string is orphaned', () => {
    const { en, fr } = loadI18N();
    expect(Object.keys(en).filter((k) => !(k in fr)), 'missing in French').toEqual([]);
    expect(Object.keys(fr).filter((k) => !(k in en)), 'missing in English').toEqual([]);
    expect(Object.entries(fr).filter(([, v]) => !String(v).trim()).map(([k]) => k), 'empty French strings').toEqual([]);
  });

  test('both languages use the same {placeholders}', () => {
    const { en, fr } = loadI18N();
    const bad = Object.keys(en).filter((k) => k in fr && tokens(en[k]).join() !== tokens(fr[k]).join());
    expect(bad).toEqual([]);
  });

  test('no claude.ai leftovers: no string mentions Claude or a coach', () => {
    const { en, fr } = loadI18N();
    for (const L of [en, fr]) {
      expect(Object.entries(L).filter(([, v]) => /claude|coach/i.test(String(v))).map(([k]) => k)).toEqual([]);
    }
  });

  test('day names come in sevens, CSV headers in eights', () => {
    const { en, fr } = loadI18N();
    for (const L of [en, fr]) {
      expect(L.days.split('|')).toHaveLength(7);
      expect(L.days1.split('|')).toHaveLength(7);
      expect(L.csvHead.split('|')).toHaveLength(8);
    }
  });
});

test.describe('language switch', () => {
  test('French translates the page and the plan', async ({ app, page }) => {
    await page.locator('#langSel').selectOption('fr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('#btnSave')).toHaveText('Enregistrer');
    await expect(page.locator('table.grid thead th').nth(1)).toHaveText('Lun');
    await expect(page.locator('#planName')).toHaveValue('Plan semi-marathon');
    expect((await app.plan()).at(-1)!.sessions.some((s) => s.name === 'Jour de course')).toBe(true);
    await expect(page.locator('#hello')).toContainText('J-86');
  });

  test('the choice survives a reload', async ({ app, page }) => {
    await page.locator('#langSel').selectOption('fr');
    await app.open();
    await expect(page.locator('#langSel')).toHaveValue('fr');
    await expect(page.locator('#btnPlans')).toHaveText('Mes plans');
  });

  test('the language dropdown shows the current language and switches back', async ({ app, page }) => {
    const sel = page.locator('#langSel');
    await expect(sel).toHaveValue('en');
    await expect(sel.locator('option')).toHaveText(['English', 'Français']);
    await sel.selectOption('fr');
    await expect(sel).toHaveAttribute('aria-label', 'Langue');
    await sel.selectOption('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#btnSave')).toHaveText('Save plan');
  });

  test('a French browser opens in French', async ({ browser }) => {
    const ctx = await browser.newContext({ locale: 'fr-FR' });
    const page = await ctx.newPage();
    await page.goto('/index.html');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await ctx.close();
  });

  test('hand-edited runs keep their text and the page says so', async ({ app, page }) => {
    await app.session(0, 0).click();
    await page.locator('#eNote').fill('x');
    await page.locator('#eOk').click();
    const before = (await app.plan())[0].sessions[0].name;
    await page.locator('#langSel').selectOption('fr');
    await expect(app.toast()).toContainText('Les séances modifiées à la main gardent leur texte');
    expect((await app.plan())[0].sessions[0].name).toBe(before);
  });
});
