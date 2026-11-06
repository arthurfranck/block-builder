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
  await app.showSetup();
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

test('dark mode follows the device setting', async ({ app, page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(14, 20, 23)');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(242, 245, 244)');
});

test('the page loads without script errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/index.html');
  await expect(page.locator('table.grid')).toBeVisible();
  expect(errors).toEqual([]);
});
