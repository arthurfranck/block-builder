import { test, expect } from './helpers';
import type { Page } from '@playwright/test';

/*
 * Accessibility checks with axe-core (WCAG 2.0 and 2.1, A and AA rules).
 *
 * Known issues: rule ids listed here are let through so that new problems still stand out.
 * Each scan must report exactly these: a new problem fails the test, and so does fixing
 * one of these (then remove it from the list and from the README's Tests section).
 * None at the moment (the two found when the suite was written were fixed in BB-14).
 */
const KNOWN: string[] = [];

async function scan(page: Page) {
  let AxeBuilder: any;
  try { ({ AxeBuilder } = await import('@axe-core/playwright')); }
  catch { test.skip(true, '@axe-core/playwright is not installed (run npm install)'); }
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const details = r.violations.map((v: any) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.slice(0, 3).map((n: any) => n.target.join(' ')).join(' | ')}`);
  return { ids: r.violations.map((v: any) => v.id).filter((id: string) => !KNOWN.includes(id)), details };
}
const clean = async (page: Page, what: string) => {
  const { ids, details } = await scan(page);
  expect(ids, `${what}:\n${details.join('\n')}`).toEqual([]);
};

test('plan view', async ({ app, page }) => {
  await app.showPlan();
  await clean(page, 'plan view');
});

test('settings view', async ({ app, page }) => {
  await app.showSetup();
  await clean(page, 'settings view');
});

test('run editor', async ({ app, page }) => {
  await app.session(0, 0).click();
  await clean(page, 'run editor');
});

test('My plans and the watch dialog', async ({ app, page }) => {
  await page.locator('#btnPlans').click();
  await clean(page, 'My plans');
  await page.locator('#pClose').click();
  await page.locator('[data-act="wwatch"][data-w="0"]').click();
  await clean(page, 'watch dialog');
});

test('light theme', async ({ app, page }) => {
  await page.locator('#themeSel').selectOption('light');
  await app.showPlan();
  await clean(page, 'light theme, plan view');
  await app.showSetup();
  await clean(page, 'light theme, settings view');
});

test('the known issues are still there', async ({ app, page }) => {
  await app.showSetup();
  const details = (await scan(page)).details;
  await app.showPlan();
  details.push(...(await scan(page)).details);
  const found = KNOWN.filter((id) => details.some((d) => d.startsWith(id + ' ')));
  expect(found, 'a known issue is fixed: remove it from KNOWN and from the README').toEqual(KNOWN);
});

test('a rest day is announced with what it shows, plus the week and day', async ({ app, page }) => {
  await app.showPlan();
  await expect(app.cell(0, 2).getByRole('button', { name: 'Rest + Add run · Week 1 · Wed' })).toBeVisible();
});

/* Screen reader and keyboard basics that axe can't see (BB-6). */
test.describe('dialogs and messages', () => {
  test('messages are announced: toasts appear inside a polite status region', async ({ app, page }) => {
    await page.locator('#btnSave').click();
    await expect(page.getByRole('status').locator('.toast').last()).toHaveText('Plan saved.');
    await expect(page.locator('#toastRoot')).toHaveAttribute('aria-live', 'polite');
  });

  test('a dialog is named by its heading', async ({ app, page }) => {
    await page.locator('#btnPlans').click();
    await expect(page.getByRole('dialog', { name: 'My plans' })).toBeVisible();
    await page.keyboard.press('Escape');
    await app.session(0, 0).click();
    await expect(page.getByRole('dialog', { name: 'Week 1 · Mon' })).toBeVisible();
  });

  test('Tab and Shift+Tab stay inside the open dialog', async ({ app, page }) => {
    await app.session(0, 0).click();
    const inModal = () => page.evaluate(() => !!document.activeElement?.closest('#modalRoot .modal'));
    const last = app.modal().locator('button').last();
    await last.focus();
    await page.keyboard.press('Tab');
    expect(await inModal()).toBe(true);
    await expect(last).not.toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(last).toBeFocused();
    for (let i = 0; i < 25; i++) { await page.keyboard.press('Tab'); expect(await inModal()).toBe(true); }
  });

  test('closing a dialog puts focus back on what opened it', async ({ app, page }) => {
    await page.locator('#btnPlans').click();
    await expect(app.modal()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#btnPlans')).toBeFocused();
  });

  test('saving a run puts focus back on that run, even though the grid is redrawn', async ({ app, page }) => {
    const id = await app.session(0, 0).getAttribute('data-s');
    await app.session(0, 0).click();
    await app.modal().getByRole('button', { name: 'Save changes' }).click();
    await expect(app.modal()).toHaveCount(0);
    await expect(page.locator(`button.ses[data-s="${id}"]`)).toBeFocused();
  });
});
