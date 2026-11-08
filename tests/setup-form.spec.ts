import { test, expect } from './helpers';

test.describe('paces', () => {
  test('a recent race time gives paces and a race-time equivalent', async ({ app, page }) => {
    await app.showSetup();
    await expect(page.locator('#paceHint')).toContainText(/Paces: easy \d:\d\d\/km, tempo \d:\d\d\/km/);
    await app.showPlan();
    await expect(page.locator('#plan .summary .stat').nth(4)).toContainText('Half marathon equivalent');
  });

  test('a faster race time gives faster paces', async ({ app, page }) => {
    await app.showSetup();
    const slow = await page.locator('#paceHint').textContent();
    await app.configure({ recTime: '42:00' });
    await app.showSetup();
    const fast = await page.locator('#paceHint').textContent();
    const easy = (s: string | null) => { const m = /easy (\d):(\d\d)/.exec(s!)!; return +m[1] * 60 + +m[2]; };
    expect(easy(fast)).toBeLessThan(easy(slow));
  });

  test('no recent race: effort descriptions and a warning', async ({ app, page }) => {
    await app.configure({ recDist: '0' });
    await expect(app.warnings()).toContainText(['Without a recent race time']);
    await app.showSetup();
    await expect(page.locator('#paceHint')).toHaveText('Add a recent race and time to get paces.');
    await app.showPlan();
    expect((await app.plan())[0].sessions.some((s) => /conversational pace/.test(s.desc))).toBe(true);
  });

  test('an unreadable time says so instead of quietly dropping the paces', async ({ app, page }) => {
    await app.configure({ recTime: 'fast' });
    await expect(app.warnings()).toContainText(["Couldn't read fast as a 10K finish time"]);
    await expect(app.warnings()).not.toContainText(['Without a recent race time']);
    await app.showSetup();
    await expect(page.locator('#paceHint')).toContainText('for example 52:00');
  });

  /* "1:45" for a half means 1 h 45 min, not 1 min 45 s: the reading that fits the distance wins. */
  const paceHint = async (app: import('./helpers').App, page: import('@playwright/test').Page) => {
    await app.showSetup();
    return page.locator('#paceHint').textContent();
  };
  for (const c of [
    { recDist: '21.0975', short: '1:45', full: '1:45:00' },
    { recDist: '42.195', short: '3:30', full: '3:30:00' },
    { recDist: '10', short: '52', full: '52:00' },
  ]) {
    test(`${c.short} for a ${c.recDist} km race reads as ${c.full}`, async ({ app, page }) => {
      await app.configure({ recDist: c.recDist, recTime: c.full });
      const expected = await paceHint(app, page);
      expect(expected).toMatch(/^Paces: easy/);
      await app.configure({ recTime: c.short });
      expect(await paceHint(app, page)).toBe(expected);
      await expect(page.locator('#recTime')).toHaveValue(c.full);
      await expect(app.warnings()).not.toContainText(['Without a recent race time']);
    });
  }

  test('mm:ss stays minutes and seconds when that fits', async ({ app, page }) => {
    await app.configure({ recDist: '5', recTime: '25:00' });
    await app.showSetup();
    await expect(page.locator('#recTime')).toHaveValue('25:00');
    await expect(page.locator('#paceHint')).toContainText(/Paces: easy \d:\d\d\/km/);
  });

  test('picking the race after typing the time applies the right reading', async ({ app, page }) => {
    await app.configure({ recDist: '0', recTime: '1:45' });
    await app.configure({ recDist: '21.0975' });
    await app.showSetup();
    await expect(page.locator('#recTime')).toHaveValue('1:45:00');
    await expect(page.locator('#paceHint')).toContainText(/Paces: easy/);
  });

  test('a time that fits no reading for the distance is flagged', async ({ app }) => {
    await app.configure({ recDist: '5', recTime: '1:30' });
    await expect(app.warnings()).toContainText(["Couldn't read 1:30 as a 5K finish time"]);
  });
});

test.describe('week shape', () => {
  test('the long run follows the long-run day', async ({ app }) => {
    await app.configure({ longDay: 5 });
    const weeks = await app.plan();
    for (const w of weeks.slice(0, -1)) expect.soft(w.sessions.find((s) => s.kind === 'long')!.day, `week ${w.n}`).toBe(5);
  });

  test('running days must match runs per week, otherwise a warning', async ({ app, page }) => {
    await app.showSetup();
    await page.locator('#daysSeg [data-day="3"]').click();
    await expect(page.locator('#daysCount')).toHaveText('(4 of 5)');
    await app.showPlan();
    await expect(app.warnings()).toContainText(['You picked 4 running days for 5 runs a week']);
  });

  test('picking the right days places runs on those days', async ({ app, page }) => {
    await app.runs(3);
    for (const d of [1, 3, 6]) await expect(page.locator(`#daysSeg [data-day="${d}"]`)).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#daysSeg [data-day="3"]').click();
    await page.locator('#daysSeg [data-day="2"]').click();
    await app.showPlan();
    for (const w of (await app.plan()).slice(0, -1)) expect.soft(w.sessions.map((s) => s.day), `week ${w.n}`).toEqual([1, 2, 6]);
  });
});

test.describe('run types', () => {
  test('turning off every quality type leaves only easy running', async ({ app }) => {
    for (const id of ['tempo', 'intervals', 'hills', 'racepace']) await app.typeToggle(id);
    await app.showPlan();
    await expect(app.warnings()).toContainText(['No quality run types are ticked']);
    expect((await app.plan()).flatMap((w) => w.sessions).some((s) => s.kind === 'hard')).toBe(false);
  });

  test('easy cannot be turned off, long can', async ({ app, page }) => {
    await app.showSetup();
    await expect(page.locator('#t-on-easy')).toBeDisabled();
    await expect(page.locator('#t-on-long')).toBeEnabled();
  });

  test('with the long run type off, no run is a long run', async ({ app }) => {
    await app.typeToggle('long');
    await app.showPlan();
    const sessions = (await app.plan()).flatMap((w) => w.sessions);
    expect(sessions.some((s) => s.kind === 'long')).toBe(false);
    await expect(app.warnings()).toHaveCount(0);
  });

  test('a renamed run type shows in the plan', async ({ app, page }) => {
    await app.showSetup();
    await page.locator('#t-name-tempo').fill('Threshold');
    await page.locator('#t-name-tempo').dispatchEvent('change');
    await app.showPlan();
    expect((await app.plan()).flatMap((w) => w.sessions).some((s) => s.name === 'Threshold')).toBe(true);
  });

  test('a custom run type can be added and removed', async ({ app, page }) => {
    await app.showSetup();
    const n = await page.locator('#types .type').count();
    await app.pick('#btnAddType');
    const custom = page.locator('#types .type').last();
    await expect(custom.locator('.tname')).toHaveValue('Custom run');
    await custom.getByRole('button', { name: /Remove/ }).click();
    await expect(page.locator('#types .type')).toHaveCount(n);
  });

  test('too many quality types for the week triggers a warning', async ({ app }) => {
    await app.typeToggle('fartlek');
    await app.typeToggle('progression');
    await app.runs(4);
    await app.showPlan();
    await expect(app.warnings()).toContainText([/quality run types with 4 runs a week/]);
  });
});

test.describe('warnings', () => {
  test('a short marathon block', async ({ app }) => {
    await app.configure({ dist: 'm', weeks: 8 });
    await expect(app.warnings()).toContainText([/8 weeks is short for a marathon\. 14 or more/]);
  });

  test('a block over 24 weeks', async ({ app }) => {
    await app.configure({ weeks: 26 });
    await expect(app.warnings()).toContainText([/Blocks over 24 weeks tend to go stale/]);
  });

  test('a low starting volume', async ({ app }) => {
    await app.configure({ curVol: 10 });
    await expect(app.warnings()).toContainText([/10 km\/week is a low starting point/]);
  });

  test('a race date too close for the block length', async ({ app }) => {
    await app.configure({ raceDate: '2026-11-22' });
    await expect(app.warnings()).toContainText([/week 1 started on/]);
  });

  test('the example banner goes away after the first change', async ({ app, page }) => {
    await expect(page.locator('#plan .banner.info')).toBeVisible();
    await app.configure({ curVol: 35 });
    await expect(page.locator('#plan .banner.info')).toHaveCount(0);
  });
});

test.describe('New plan starts blank', () => {
  test.beforeEach(async ({ app, page }) => {
    await page.locator('#btnNew').click();
  });

  test('the setup is empty and only Easy is ticked', async ({ app, page }) => {
    await app.showSetup();
    await expect(page.locator('#runsSeg button[aria-pressed="true"]')).toHaveCount(0);
    await expect(page.locator('#runsSeg [data-runs="1"]')).toBeVisible();
    await expect(page.locator('#runsSeg [data-runs="2"]')).toBeVisible();
    await expect(page.locator('#daysSeg button[aria-pressed="true"]')).toHaveCount(0);
    await expect(page.locator('#longDay')).toHaveValue('-1');
    for (const id of ['curVol', 'curLong', 'recTime']) await expect(page.locator('#' + id)).toHaveValue('');
    await expect(page.locator('#recDist')).toHaveValue('0');
    const ticked = await page.locator('#types input[type=checkbox]:checked').evaluateAll((els) => els.map((e) => e.id));
    expect(ticked).toEqual(['t-on-easy']);
  });

  test('no plan until runs per week, weekly volume and longest run are set', async ({ app, page }) => {
    await app.showPlan();
    await expect(page.locator('table.grid')).toHaveCount(0);
    await expect(page.locator('#plan .banner.info')).toContainText('Fill in the setup');
    await expect(page.locator('#plan .banner.info li')).toHaveCount(3);
    await app.configure({ runs: 3, curVol: 25 });
    await app.showPlan();
    await expect(page.locator('table.grid')).toHaveCount(0);
    await expect(page.locator('#plan .banner.info li')).toHaveCount(1);
    await app.configure({ curLong: 10 });
    await app.showPlan();
    await expect(page.locator('table.grid')).toBeVisible();
    expect(await app.plan()).toHaveLength(12);
  });

  test('Save plan is refused while the setup is incomplete', async ({ app, page }) => {
    await page.locator('#btnSave').click();
    await expect(app.toast()).toContainText('Fill in the setup');
    await expect(page.locator('#saveStatus')).toHaveText('Not saved');
  });

  test('a plan built from the blank setup has only easy runs', async ({ app }) => {
    await app.configure({ runs: 2, curVol: 20, curLong: 8 });
    await app.showPlan();
    const weeks = await app.plan();
    expect(weeks.flatMap((w) => w.sessions).filter((s) => s.kind !== 'race').every((s) => s.kind === 'easy' || s.kind === 'long')).toBe(true);
    for (const w of weeks.slice(0, -1)) expect.soft(w.sessions, `week ${w.n}`).toHaveLength(2);
  });
});
