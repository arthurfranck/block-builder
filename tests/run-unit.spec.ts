import { test, expect, zipNames } from './helpers';

/* BB-54: runs shown in km or minutes. A display preference: the plan is still built in km. */
const cellAmounts = (page: import('@playwright/test').Page) =>
  page.locator('table.grid .ses .k').allTextContents();

test.describe('runs shown in minutes', () => {
  test('km by default; minutes switch the grid, week totals and Today line, and back', async ({ app, page }) => {
    await app.showPlan();
    const km = await cellAmounts(page);
    expect(km.length).toBeGreaterThan(0);
    expect(km.every((x) => /^\d+(\.\d+)? km$/.test(x))).toBe(true);
    await app.openPrefs();
    await expect(page.locator('#runUnitSeg [data-run-unit="d"]')).toHaveAttribute('aria-pressed', 'true');
    await app.closePrefs();

    await app.setRunUnit('t');
    await app.showPlan();
    const min = await cellAmounts(page);
    expect(min).toHaveLength(km.length);
    expect(min.every((x) => /^(\d+ min|\d+ h \d\d)$/.test(x))).toBe(true);
    await expect(page.locator('.wkcell .km').first()).toHaveText(/^(\d+ min|\d+ h \d\d)$/);
    /* frozen today is before the plan starts: the first-run line names the run in minutes */
    await expect(page.locator('.tnext').first()).toContainText(/\d+ min/);

    await app.setRunUnit('d');
    await app.showPlan();
    expect(await cellAmounts(page)).toEqual(km);
  });

  test('a longer run of the same kind takes longer', async ({ app, page }) => {
    const weeks = await app.plan();
    await app.setRunUnit('t');
    await app.showPlan();
    const min = await cellAmounts(page);
    const toMin = (x: string) => {
      const h = /^(\d+) h (\d\d)$/.exec(x);
      return h ? +h[1] * 60 + +h[2] : parseInt(x, 10);
    };
    const runs = weeks.flatMap((w) => w.sessions).map((s, i) => ({ ...s, min: toMin(min[i]) }));
    const long = runs.filter((s) => s.kind === 'long').sort((a, b) => a.km - b.km);
    expect(long.length).toBeGreaterThan(1);
    expect(long[long.length - 1].min).toBeGreaterThan(long[0].min);
  });

  test("on a run day the Today card shows the run's time big and its km under it", async ({ app, page }) => {
    await app.configure({ weeks: 13 });
    await app.showPlan();
    const fri = (await app.plan())[0].sessions.find((s) => s.day === 4)!;
    await app.setRunUnit('t');
    await app.showPlan();
    const card = page.locator('#plan .today .tses').first();
    await expect(card.locator('.tbig b')).toHaveText(/^(\d+ min|\d+ h \d\d)$/);
    await expect(card.locator('.tbig span')).toHaveText(`${fri.km} km`);
  });

  test('the choice is remembered on this device', async ({ app, page }) => {
    await app.setRunUnit('t');
    await page.reload();
    await app.showPlan();
    expect((await cellAmounts(page))[0]).toMatch(/min$/);
    await app.openPrefs();
    await expect(page.locator('#runUnitSeg [data-run-unit="t"]')).toHaveAttribute('aria-pressed', 'true');
  });

  test('calendar events and watch workouts are named in minutes', async ({ app, page }) => {
    await app.setRunUnit('t');
    await app.showPlan();
    const { buf } = await app.download(() => page.locator('[data-act="ics"]').click());
    const summaries = buf.toString('utf8').match(/^SUMMARY:.*$/gm) || [];
    expect(summaries.length).toBeGreaterThan(0);
    expect(summaries.every((x) => /· (\d+ min|\d+ h \d\d)\r?$/.test(x))).toBe(true);

    await page.locator('[data-act="wwatch"][data-w="0"]').click();
    await app.modal().locator('[data-dev="garmin"]').click();
    const zip = await app.download(() => page.locator('#dGo').click());
    expect(zipNames(zip.buf).length).toBeGreaterThan(0);
    const fit = zip.buf.toString('latin1');
    expect(fit).toMatch(/W1 [^\0]+ \d+m\0/);
    expect(fit).not.toMatch(/W1 [^\0]+ \d+(\.\d+)?k\0/);
  });

  test('French labels', async ({ app, page }) => {
    await app.openPrefs();
    await page.locator('#langSel').selectOption('fr');
    await expect(page.locator('#runUnitLbl')).toHaveText('Sorties affichées en');
    await expect(page.locator('#runUnitSeg [data-run-unit="t"]')).toHaveText('minutes');
  });
});
