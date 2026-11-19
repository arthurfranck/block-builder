import { test, expect, mobileOnly, desktopOnly } from './helpers';

test.describe('phone layout', () => {
  test.beforeEach(({ mobile }) => mobileOnly(mobile));

  test('the gear sits on the brand row and the plan name gets its own line', async ({ app, page }) => {
    const box = async (sel: string) => (await page.locator(sel).boundingBox())!;
    const brand = await box('.brand'), gear = await box('#btnPrefs'), name = await box('#planName'), save = await box('#btnSave');
    expect(Math.abs((gear.y + gear.height / 2) - (brand.y + brand.height / 2))).toBeLessThan(12);
    expect(name.y).toBeGreaterThan(brand.y + brand.height - 1);
    expect(save.y).toBeGreaterThan(name.y + name.height - 1);
    expect(name.width).toBeGreaterThan(200);
  });

  test('with a plan, the page shows the plan with an Edit plan button instead of tabs (BB-29)', async ({ app, page }) => {
    await expect(page.locator('#mtabs')).toBeHidden();
    await expect(page.locator('#btnEditPlan')).toBeVisible();
    await expect(page.locator('#plan')).toBeVisible();
    await expect(page.locator('#plan .today')).toBeVisible();
    await expect(page.locator('#setup')).toBeHidden();
  });

  test('Edit plan opens the settings as a sheet over the plan, which follows edits live (BB-29)', async ({ app, page }) => {
    const before = (await app.plan()).length;
    await page.locator('#btnEditPlan').tap();
    const sheet = page.locator('#setup[role="dialog"]');
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute('aria-modal', 'true');
    await expect(sheet.locator('#sheetTitle')).toHaveText('Edit plan');
    await expect(sheet.locator('.sec h3')).toHaveText(['Goal', 'Race', 'Your running now', 'Week shape', 'Run types']);
    await sheet.evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished)));
    const b = (await sheet.boundingBox())!, v = page.viewportSize()!;
    expect(Math.abs(b.y + b.height - v.height)).toBeLessThanOrEqual(1);
    expect(Math.round(b.width)).toBe(v.width);
    expect(await page.locator('header.top').evaluate((e) => (e as HTMLElement).inert)).toBe(true);
    await app.setField('weeks', before + 2);
    expect(await app.plan()).toHaveLength(before + 2);
    await page.locator('#btnSheetDone').tap();
    await expect(sheet).toHaveCount(0);
    await expect(page.locator('#setup')).toBeHidden();
    await expect(page.locator('#btnEditPlan')).toBeFocused();
    expect(await page.locator('header.top').evaluate((e) => (e as HTMLElement).inert)).toBe(false);
  });

  test('Escape, a tap outside, and "Edit settings" in the banner open and close the sheet (BB-29)', async ({ app, page }) => {
    await page.locator('#plan .banner.info [data-tabgo="setup"]').tap();
    await expect(page.locator('#setup[role="dialog"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#setup')).toBeHidden();
    await page.locator('#btnEditPlan').tap();
    await page.locator('#sheetBg').tap({ position: { x: 10, y: 10 } });
    await expect(page.locator('#setup')).toBeHidden();
  });

  test('a new plan keeps the Plan and Settings tabs until the setup is complete', async ({ app, page }) => {
    await page.locator('#btnNew').tap();
    await page.locator('#introNav [data-intro="skip"]').tap();
    await expect(page.locator('#mtabs')).toBeVisible();
    await expect(page.locator('#btnEditPlan')).toBeHidden();
    await page.locator('#mtabs [data-tab="plan"]').tap();
    await expect(page.locator('#setup')).toBeHidden();
    await expect(page.locator('#mtabs [data-tab="plan"]')).toHaveAttribute('aria-selected', 'true');
    await page.locator('#mtabs [data-tab="setup"]').tap();
    await expect(page.locator('#plan')).toBeHidden();
    await app.configure({ dist: '10k', raceDate: '2027-02-28', weeks: 10, runs: 3, curVol: 20, curLong: 8 });
    await expect(page.locator('#mtabs')).toBeHidden();
    await expect(page.locator('#btnEditPlan')).toBeVisible();
  });

  test('the Edit plan button stays on screen when scrolling', async ({ app, page }) => {
    await page.evaluate(() => window.scrollTo(0, 1500));
    const box = await page.locator('#btnEditPlan').boundingBox();
    expect(box!.y).toBeLessThanOrEqual(12);
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

  /* Text areas and the export dropdown have their own smaller font rules; a later touch-screen rule lifts them to 16px. */
  test('text areas and the export dropdown use at least 16px text too', async ({ app, page }) => {
    await app.openCustomise();
    await page.locator('#types details').first().evaluate((d: HTMLDetailsElement) => (d.open = true));
    expect(await smallFields(page, '#types')).toEqual([]);
    await app.showPlan();
    expect(await smallFields(page, '#plan .toolbar')).toEqual([]);
    await app.session(0, 0).tap();
    expect(await smallFields(page, '#modalRoot')).toEqual([]);
  });

  test('main controls are big enough to tap', async ({ app, page }) => {
    for (const sel of ['#btnEditPlan', '#btnSave', '#btnPlans', '#btnNew']) {
      const b = await page.locator(sel).boundingBox();
      expect.soft(b!.height, sel).toBeGreaterThanOrEqual(32);
    }
    await app.showSetup();
    expect((await page.locator('#btnSheetDone').boundingBox())!.height).toBeGreaterThanOrEqual(44);
  });

  test('weeks are cards with a row per day, with no sideways scroll (BB-23)', async ({ app, page }) => {
    const width = page.viewportSize()!.width;
    const grid = await page.locator('.grid-wrap').evaluate((e) => ({ scroll: e.scrollWidth, client: e.clientWidth }));
    expect(grid.scroll).toBeLessThanOrEqual(grid.client);
    const doc = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: innerWidth }));
    expect(doc.scroll).toBeLessThanOrEqual(doc.width);
    await expect(page.locator('table.grid thead')).toBeHidden();
    // the 7 days of week 1 stack top to bottom, each labelled, inside the screen
    const days = page.locator('table.grid tr.wrow').first().locator('td.day');
    await expect(days).toHaveCount(7);
    const boxes = await days.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, r: r.right, h: r.height, lbl: getComputedStyle(e, '::before').content }; }));
    boxes.forEach((b, i) => {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.r).toBeLessThanOrEqual(width);
      if (i) expect(b.y).toBeGreaterThanOrEqual(boxes[i - 1].y + boxes[i - 1].h - 1);
    });
    expect(boxes.map((b) => b.lbl)).toEqual(['"Mon"', '"Tue"', '"Wed"', '"Thu"', '"Fri"', '"Sat"', '"Sun"']);
  });

  test('earlier weeks fold away so the current week comes first, and can be shown dimmed (BB-23)', async ({ app, page }) => {
    // 12 weeks to 3 Jan 2027: week 1 starts 12 Oct, so on 6 Nov the current week is week 4
    await app.configure({ raceDate: '2027-01-03' });
    await app.showPlan();
    const toggle = page.locator('#plan .mpast');
    await expect(toggle).toHaveText('Show 3 earlier week(s)');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('table.grid tr.wrow:visible').first()).toHaveClass(/\bnow\b/);
    await expect(page.locator('table.grid tr.wrow.now .wkcell .n')).toHaveText('W4');
    await expect(page.locator('table.grid tr.past:visible')).toHaveCount(0);
    await toggle.tap();
    await expect(toggle).toHaveText('Hide 3 earlier week(s)');
    await expect(page.locator('table.grid tr.wrow.past:visible')).toHaveCount(3);
    expect(+(await page.locator('table.grid tr.wrow.past').first().evaluate((e) => getComputedStyle(e).opacity))).toBeLessThan(1);
    expect(await app.plan()).toHaveLength(12);
  });

  test('tapping a run opens the editor, which fits the screen', async ({ app, page }) => {
    await app.session(0, 0).tap();
    const modal = await app.modal().boundingBox();
    const width = page.viewportSize()!.width;
    expect(modal!.x).toBeGreaterThanOrEqual(0);
    expect(modal!.x + modal!.width).toBeLessThanOrEqual(width);
    await expect(page.locator('#eOk')).toBeVisible();
  });

  test('dialogs open as bottom sheets: full width, resting on the bottom edge (BB-33)', async ({ app, page }) => {
    const { width, height } = page.viewportSize()!;
    for (const open of [() => app.session(0, 0).tap(), () => page.locator('#btnPlans').tap()]) {
      await open();
      const m = app.modal();
      await m.evaluate((e) => Promise.all(e.getAnimations().map((a) => a.finished)));
      const b = (await m.boundingBox())!;
      expect(b.x).toBe(0);
      expect(Math.round(b.width)).toBe(width);
      expect(Math.abs(b.y + b.height - height)).toBeLessThanOrEqual(1);
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(await m.evaluate((e) => getComputedStyle(e).borderTopLeftRadius)).toBe('16px');
      await page.keyboard.press('Escape');
      await expect(m).toHaveCount(0);
    }
  });

  test('the sheet slides up, and simply appears when the phone asks for less motion (BB-33)', async ({ app, page }) => {
    await app.session(0, 0).tap();
    expect(await app.modal().evaluate((e) => getComputedStyle(e).animationName)).toBe('sheetUp');
    await page.keyboard.press('Escape');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await app.session(0, 0).tap();
    expect(await app.modal().evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
  });

  test('opening the run editor does not focus a field, so no picker or keyboard pops up', async ({ app, page }) => {
    await app.session(0, 0).tap();
    await expect(app.modal()).toBeVisible();
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'SELECT', 'TEXTAREA']).not.toContain(focused);
  });

  test('race date and weeks of training sit side by side without overlapping', async ({ app, page }) => {
    await app.showSetup();
    const date = (await page.locator('#raceDate').boundingBox())!;
    const weeks = (await page.locator('#weeks').boundingBox())!;
    expect(date.x + date.width).toBeLessThanOrEqual(weeks.x);
    expect(date.x + date.width).toBeLessThanOrEqual((await page.locator('#raceDateF').boundingBox())!.x + (await page.locator('#raceDateF').boundingBox())!.width + 0.5);
  });

  test('tapping a rest day adds a run', async ({ app, page }) => {
    await app.cell(0, 2).locator('.empty').tap();
    await page.locator('#eOk').tap();
    await expect(app.session(0, 2)).toContainText('5 km');
  });
});

test.describe('desktop layout', () => {
  test.beforeEach(({ mobile }) => desktopOnly(mobile));

  test('dialogs stay centred, not bottom sheets (BB-33)', async ({ app, page }) => {
    await app.session(0, 0).click();
    const b = (await app.modal().boundingBox())!, v = page.viewportSize()!;
    expect(Math.abs(b.x + b.width / 2 - v.width / 2)).toBeLessThanOrEqual(2);
    expect(b.width).toBeLessThanOrEqual(560);
    expect(await app.modal().evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
  });

  test('keeps the week grid with every week, and no fold button (BB-23)', async ({ app, page }) => {
    await app.configure({ raceDate: '2027-01-03' });
    await app.showPlan();
    await expect(page.locator('table.grid thead')).toBeVisible();
    await expect(page.locator('#plan .mpast')).toBeHidden();
    await expect(page.locator('table.grid tr.wrow:visible')).toHaveCount(12);
  });

  test('settings and plan side by side, no tabs', async ({ app, page }) => {
    await expect(page.locator('#mtabs')).toBeHidden();
    await expect(page.locator('#setup')).toBeVisible();
    await expect(page.locator('#plan')).toBeVisible();
    const s = (await page.locator('#setup').boundingBox())!, p = (await page.locator('#plan').boundingBox())!;
    expect(s.x + s.width).toBeLessThanOrEqual(p.x);
  });
});
