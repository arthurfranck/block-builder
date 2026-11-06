import { test, expect } from './helpers';
import type { Page } from '@playwright/test';

/* Accessibility checks with axe-core (WCAG 2.1 A and AA rules). */
async function scan(page: Page) {
  let AxeBuilder: any;
  try { ({ AxeBuilder } = await import('@axe-core/playwright')); }
  catch { test.skip(true, '@axe-core/playwright is not installed (run npm install)'); }
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return r.violations.map((v: any) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.slice(0, 3).map((n: any) => n.target.join(' ')).join(' | ')}`);
}

test('plan view', async ({ app, page }) => {
  await app.showPlan();
  expect(await scan(page)).toEqual([]);
});

test('settings view', async ({ app, page }) => {
  await app.showSetup();
  expect(await scan(page)).toEqual([]);
});

test('run editor', async ({ app, page }) => {
  await app.session(0, 0).click();
  expect(await scan(page)).toEqual([]);
});

test('My plans and the watch dialog', async ({ app, page }) => {
  await page.locator('#btnPlans').click();
  expect(await scan(page), 'My plans').toEqual([]);
  await page.locator('#pClose').click();
  await page.locator('[data-act="wwatch"][data-w="0"]').click();
  expect(await scan(page), 'watch dialog').toEqual([]);
});

test('dark mode', async ({ app, page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await scan(page)).toEqual([]);
});
