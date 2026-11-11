import { test, expect } from './helpers';

const overflowing = (page: import('@playwright/test').Page) =>
  page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    return [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((e) => e.offsetParent && !e.closest('.grid-wrap, svg, .modal-bg'))
      .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > W + 1 || r.left < -1); })
      .map((e) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${[...e.classList].join('.')}`);
  });

test('nothing sticks out of the page on the plan view', async ({ app, page }) => {
  await app.showPlan();
  expect(await overflowing(page)).toEqual([]);
});

test('nothing sticks out of the page on the settings view', async ({ app, page }) => {
  await app.openCustomise();
  await page.locator('#types details').first().evaluate((d: HTMLDetailsElement) => (d.open = true));
  expect(await overflowing(page)).toEqual([]);
});

test('long names wrap instead of breaking the layout', async ({ app, page }) => {
  await app.showSetup();
  await page.locator('#raceBox [data-race="edit"]').click();
  await page.locator('#rName').fill('Semi-marathon international de la ville de Boulogne-Billancourt et des environs');
  await page.locator('#rCity').fill('Boulogne-Billancourt');
  await page.locator('#raceBox [data-race="save"]').click();
  await app.showPlan();
  expect(await overflowing(page)).toEqual([]);
});

const NIGHT = 'rgb(11, 15, 16)';
const DAY = 'rgb(242, 245, 244)';
const bg = (page: any) => page.locator('body');

test('dark is the default theme, even on a device set to light', async ({ app, page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(bg(page)).toHaveCSS('background-color', NIGHT);
  await expect(page.locator('#themeSeg [data-theme-v="dark"]')).toHaveAttribute('aria-pressed', 'true');
});

test('the light theme is kept after a reload', async ({ app, page }) => {
  await app.setTheme('light');
  await expect(bg(page)).toHaveCSS('background-color', DAY);
  await page.reload();
  await expect(bg(page)).toHaveCSS('background-color', DAY);
  await expect(page.locator('#themeSeg [data-theme-v="light"]')).toHaveAttribute('aria-pressed', 'true');
});

test('Auto follows the device setting', async ({ app, page }) => {
  await app.setTheme('auto');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(bg(page)).toHaveCSS('background-color', DAY);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(bg(page)).toHaveCSS('background-color', NIGHT);
});

test('the volt accent is only on today and the primary button', async ({ app, page }) => {
  const VOLT = 'rgb(212, 255, 58)';
  await expect(page.locator('#btnSave')).toHaveCSS('background-color', VOLT);
  await expect(page.locator('.today')).toHaveCSS('border-top-color', VOLT);
  const others = await page.evaluate((volt) => [...document.querySelectorAll('body *')]
    .filter((el) => !el.closest('.today, .btn.primary'))
    .filter((el) => { const c = getComputedStyle(el); return [c.color, c.backgroundColor, c.borderTopColor].includes(volt); })
    .map((el) => el.tagName + '.' + el.className), VOLT);
  expect(others).toEqual([]);
});

test('the page loads without script errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/index.html');
  await expect(page.locator('table.grid')).toBeVisible();
  expect(errors).toEqual([]);
});

test.describe('display and language panel', () => {
  test('theme and language stay behind the gear until it is opened', async ({ app, page }) => {
    await expect(page.locator('#btnSave')).toBeVisible();
    await expect(page.locator('#langSel')).toBeHidden();
    await expect(page.locator('#themeSeg')).toBeHidden();
    await expect(page.locator('#btnPrefs')).toHaveAttribute('aria-expanded', 'false');
    await app.openPrefs();
    await expect(page.locator('#btnPrefs')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#themeSeg [data-theme-v="dark"]')).toBeFocused();
    expect(await overflowing(page)).toEqual([]);
  });

  test('Escape closes the panel and puts focus back on the gear', async ({ app, page }) => {
    await app.openPrefs();
    await page.keyboard.press('Escape');
    await expect(page.locator('#prefsPanel')).toBeHidden();
    await expect(page.locator('#btnPrefs')).toBeFocused();
  });

  test('a tap outside closes the panel, a tap inside keeps it open', async ({ app, page }) => {
    await app.setTheme('light');
    await expect(page.locator('#prefsPanel')).toBeVisible();
    await page.locator('.brand').click();
    await expect(page.locator('#prefsPanel')).toBeHidden();
  });
});
