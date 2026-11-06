import { test, expect, mobileOnly, desktopOnly } from './helpers';

test.describe('phone layout', () => {
  test.beforeEach(({ mobile }) => mobileOnly(mobile));

  test('Plan and Settings tabs show one panel at a time', async ({ app, page }) => {
    await expect(page.locator('#mtabs')).toBeVisible();
    await expect(page.locator('#plan')).toBeVisible();
    await expect(page.locator('#setup')).toBeHidden();
    await page.locator('#mtabs [data-tab="setup"]').click();
    await expect(page.locator('#setup')).toBeVisible();
    await expect(page.locator('#plan')).toBeHidden();
    await expect(page.locator('#mtabs [data-tab="setup"]')).toHaveAttribute('aria-selected', 'true');
  });

  test('"See the plan" and "Edit settings" switch tabs', async ({ app, page }) => {
    await page.locator('#plan .banner.info [data-tabgo="setup"]').click();
    await expect(page.locator('#setup')).toBeVisible();
    await page.locator('#setup .see-plan').click();
    await expect(page.locator('#plan')).toBeVisible();
  });

  test('the tabs stay on screen when scrolling', async ({ app, page }) => {
    await page.evaluate(() => window.scrollTo(0, 1500));
    const box = await page.locator('#mtabs').boundingBox();
    expect(box!.y).toBeLessThanOrEqual(1);
  });

  const smallFields = (page: import('@playwright/test').Page, scope: string) =>
    page.evaluate((scope) =>
      [...document.querySelectorAll<HTMLElement>(`${scope} input, ${scope} select, ${scope} textarea`)]
        .filter((e) => e.offsetParent && parseFloat(getComputedStyle(e).fontSize) < 16)
        .map((e) => e.id || e.className), scope);

  test('form fields use at least 16px text, so iOS does not zoom in', async ({ app, page }) => {
    await app.showSetup();
    expect(await smallFields(page, 'header.top')).toEqual([]);
    expect(await smallFields(page, '#setup .sec:not(:has(#types))')).toEqual([]);
  });

  /*
   * Known issue, found when this suite was written: the generic `textarea { font-size: 13.5px }`
   * rule comes after the touch-screen 16px rule and overrides it, so the run-type templates and
   * the run editor's description and note fields are 13.5px and iOS zooms in when they are tapped.
   * Remove test.fail() once fixed.
   */
  test('text areas use at least 16px text too', async ({ app, page }) => {
    test.fail(true, 'known issue: textareas are 13.5px on touch screens');
    await app.showSetup();
    await page.locator('#types details').first().evaluate((d: HTMLDetailsElement) => (d.open = true));
    expect(await smallFields(page, '#types')).toEqual([]);
    await app.showPlan();
    await app.session(0, 0).tap();
    expect(await smallFields(page, '#modalRoot')).toEqual([]);
  });

  test('main controls are big enough to tap', async ({ app, page }) => {
    for (const sel of ['#mtabs [data-tab="plan"]', '#mtabs [data-tab="setup"]', '#btnSave', '#btnPlans', '#btnNew']) {
      const b = await page.locator(sel).boundingBox();
      expect.soft(b!.height, sel).toBeGreaterThanOrEqual(32);
    }
    await app.showSetup();
    expect((await page.locator('#setup .see-plan').boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });

  test('the week grid scrolls sideways inside its box, not the page', async ({ app, page }) => {
    const grid = await page.locator('.grid-wrap').evaluate((e) => ({ scroll: e.scrollWidth, client: e.clientWidth }));
    expect(grid.scroll).toBeGreaterThan(grid.client);
    const doc = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: innerWidth }));
    expect(doc.scroll).toBeLessThanOrEqual(doc.width);
  });

  test('tapping a run opens the editor, which fits the screen', async ({ app, page }) => {
    await app.session(0, 0).tap();
    const modal = await app.modal().boundingBox();
    const width = page.viewportSize()!.width;
    expect(modal!.x).toBeGreaterThanOrEqual(0);
    expect(modal!.x + modal!.width).toBeLessThanOrEqual(width);
    await expect(page.locator('#eOk')).toBeVisible();
  });

  test('tapping a rest day adds a run', async ({ app, page }) => {
    await app.cell(0, 2).locator('.empty').tap();
    await page.locator('#eOk').tap();
    await expect(app.session(0, 2)).toContainText('5 km');
  });
});

test.describe('desktop layout', () => {
  test.beforeEach(({ mobile }) => desktopOnly(mobile));

  test('settings and plan side by side, no tabs', async ({ app, page }) => {
    await expect(page.locator('#mtabs')).toBeHidden();
    await expect(page.locator('#setup')).toBeVisible();
    await expect(page.locator('#plan')).toBeVisible();
    const s = (await page.locator('#setup').boundingBox())!, p = (await page.locator('#plan').boundingBox())!;
    expect(s.x + s.width).toBeLessThanOrEqual(p.x);
  });
});
