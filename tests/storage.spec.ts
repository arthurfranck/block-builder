import { test, expect } from './helpers';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const FIXTURE = path.join(__dirname, 'fixtures', 'plans-v1.json');
const stored = (page: import('@playwright/test').Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('bb-plans') || '{}'));

test('saving keeps the plan in this browser across a reload', async ({ app, page }) => {
  await app.configure({ dist: '10k', weeks: 9 });
  await page.locator('#btnSave').click();
  await expect(app.toast()).toHaveText('Plan saved.');
  await expect(page.locator('#saveStatus')).toContainText('Saved in this browser');
  const saved = Object.values(await stored(page)) as any[];
  expect(saved).toHaveLength(1);
  expect(saved[0]).toMatchObject({ name: '10K block', inputs: { dist: '10k', weeks: 9 } });

  await app.open();
  await page.locator('#btnPlans').click();
  await expect(app.modal().locator('.pl')).toHaveCount(1);
  await app.modal().getByRole('button', { name: 'Open' }).click();
  await expect(page.locator('#planName')).toHaveValue('10K block');
  expect(await app.plan()).toHaveLength(9);
});

test('changes to a saved plan save themselves', async ({ app, page }) => {
  await page.locator('#btnSave').click();
  await app.configure({ curVol: 36 });
  await expect(page.locator('#saveStatus')).toHaveText('Unsaved changes');
  await expect(page.locator('#saveStatus')).toContainText('Saved in this browser', { timeout: 5000 });
  const saved = Object.values(await stored(page)) as any[];
  expect(saved[0].inputs.curVol).toBe(36);
});

test('renaming the plan', async ({ app, page }) => {
  await page.locator('#planName').fill('Winter block');
  await page.locator('#planName').press('Enter');
  await page.locator('#planName').blur();
  await page.locator('#btnSave').click();
  expect((Object.values(await stored(page)) as any[])[0].name).toBe('Winter block');
});

test('deleting a saved plan asks first', async ({ app, page }) => {
  await page.locator('#btnSave').click();
  await page.locator('#btnPlans').click();
  await app.modal().getByRole('button', { name: 'Delete' }).click();
  await expect(app.modal()).toContainText('Delete plan?');
  await page.locator('#cYes').click();
  await expect(app.toast()).toHaveText('Plan deleted.');
  expect(await stored(page)).toEqual({});
  await expect(page.locator('#saveStatus')).toHaveText('Not saved');
});

test('My plans is empty at first and Export is disabled', async ({ app, page }) => {
  await page.locator('#btnPlans').click();
  await expect(app.modal()).toContainText('No saved plans yet');
  await expect(page.locator('#pExport')).toBeDisabled();
});

test('export writes every plan to one JSON file', async ({ app, page }) => {
  await page.locator('#btnSave').click();
  await page.locator('#btnPlans').click();
  const { name, buf } = await app.download(() => page.locator('#pExport').click());
  expect(name).toBe('block-builder-plans-2026-11-06.json');
  const j = JSON.parse(buf.toString());
  expect(j).toMatchObject({ app: 'block-builder', version: 1 });
  const plans = Object.values(j.plans) as any[];
  expect(plans).toHaveLength(1);
  expect(plans[0].plan.weeks).toHaveLength(12);
});

test('import of a version 1 file (backward compatibility)', async ({ app, page }) => {
  await page.locator('#btnPlans').click();
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('#pImport').click()]);
  await chooser.setFiles(FIXTURE);
  await expect(app.toast()).toHaveText('Imported 1 plan(s).');
  await expect(app.modal().locator('.pl')).toContainText(['Spring 10K']);
  await app.modal().getByRole('button', { name: 'Open' }).click();
  await expect(page.locator('#planName')).toHaveValue('Spring 10K');
  const fixture = JSON.parse(readFileSync(FIXTURE, 'utf8')).plans['spring-10k-v1'];
  const weeks = await app.plan();
  expect(weeks).toHaveLength(fixture.plan.weeks.length);
  expect(weeks[0].sessions.map((s) => s.name)).toEqual(fixture.plan.weeks[0].sessions.map((s: any) => s.name));
});

test('import rejects a file that is not a Block Builder export', async ({ app, page }) => {
  await page.locator('#btnPlans').click();
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('#pImport').click()]);
  await chooser.setFiles({ name: 'other.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') });
  await expect(app.toast()).toHaveText("That file isn't a Block Builder export.");
  expect(await stored(page)).toEqual({});
});

test('New plan asks before discarding unsaved changes', async ({ app, page }) => {
  await app.configure({ dist: '5k' });
  await page.locator('#btnNew').click();
  await expect(app.modal()).toContainText('Start a new plan?');
  await page.locator('#cNo').click();
  await expect(page.locator('#planName')).toHaveValue('5K block');
  await page.locator('#btnNew').click();
  await page.locator('#cYes').click();
  await expect(page.locator('#planName')).toHaveValue('Half marathon block');
  await expect(page.locator('#plan .banner.info')).toContainText('Fill in the setup');
});

/* ---------- imported files are untrusted: nothing in them may run as code ---------- */

const importJSON = async (app: import('./helpers').App, page: import('@playwright/test').Page, plans: Record<string, unknown>) => {
  await page.locator('#btnPlans').click();
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('#pImport').click()]);
  await chooser.setFiles({ name: 'shared.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'block-builder', version: 1, plans })) });
};
const fixturePlan = () => structuredClone(JSON.parse(readFileSync(FIXTURE, 'utf8')).plans['spring-10k-v1']);

test('an imported plan with markup in its fields runs no script and shows as text', async ({ app, page }) => {
  const evil = '<img src=x onerror="window.__xss=(window.__xss||0)+1">';
  const p = fixturePlan();
  p.name = 'Shared ' + evil;
  p.plan.weeks[0].phase = 'x' + evil;
  p.plan.weeks[0].n = evil;
  p.plan.weeks[0].sessions[0].km = '5' + evil;
  p.plan.weeks[0].sessions[0].typeId = '"><img src=x onerror="window.__xss=1">';
  p.types[0].id = '"><img src=x onerror="window.__xss=1">';
  p.inputs.race = { name: 'Trap race', city: '', url: 'javascript:window.__xss=1' };
  await importJSON(app, page, { evil: p });
  await expect(app.toast()).toHaveText('Imported 1 plan(s).');
  await app.modal().getByRole('button', { name: 'Open' }).click();
  await app.showPlan();
  await expect(page.locator('#planName')).toHaveValue('Shared ' + evil);
  const weeks = await app.plan();
  expect(weeks[0].n).toBe(1);
  expect(weeks[0].phase).toBe('base');
  expect(weeks[0].sessions[0].km).toBe(0); // "5<img …>" is not a number
  await app.session(0, weeks[0].sessions[0].day).first().click();
  await expect(app.modal()).toBeVisible();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
  expect(await page.locator('img[src="x"]').count()).toBe(0);
  const stored = (Object.values(await page.evaluate(() => JSON.parse(localStorage.getItem('bb-plans') || '{}'))) as any[])[0];
  expect(stored.inputs.race.url).toBe('');
  expect(stored.plan.weeks[0].phase).toBe('base');
});

test('an imported plan with missing or broken parts still opens', async ({ app, page }) => {
  const p = fixturePlan();
  delete p.plan.weeks[1].sessions;
  p.plan.weeks[2].sessions[0].day = 9;
  p.plan.weeks[2].sessions[1].watch = { blocks: 'nope' };
  p.types = p.types.filter((t: any) => t.id !== 'long');
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await importJSON(app, page, { broken: p });
  await expect(app.toast()).toHaveText('Imported 1 plan(s).');
  await app.modal().getByRole('button', { name: 'Open' }).click();
  const weeks = await app.plan();
  expect(weeks).toHaveLength(p.plan.weeks.length);
  expect(weeks[1].sessions).toHaveLength(0);
  expect(weeks[2].sessions).toHaveLength(p.plan.weeks[2].sessions.length - 1);
  await page.locator('[data-act="rebuild"]').click();
  if (await page.locator('#cYes').count()) await page.locator('#cYes').click();
  expect(errors).toEqual([]);
});

/* ---------- autosave must not lose the last change ---------- */

test('a change made just before New plan is saved, not lost', async ({ app, page }) => {
  await page.locator('#btnSave').click();
  await page.locator('#planName').fill('Renamed just now');
  await page.locator('#planName').press('Enter');
  await page.locator('#btnNew').click();
  const saved = Object.values(await stored(page)) as any[];
  expect(saved).toHaveLength(1);
  expect(saved[0].name).toBe('Renamed just now');
});

test('a change made just before opening another plan is saved, not lost', async ({ app, page }) => {
  await importJSON(app, page, { 'spring-10k-v1': fixturePlan() });
  await page.locator('#pClose').click();
  await page.locator('#btnSave').click();
  await app.configure({ curVol: 41 });
  await page.locator('#btnPlans').click();
  await app.modal().locator('.pl', { hasText: 'Spring 10K' }).getByRole('button', { name: 'Open' }).click();
  await expect(page.locator('#planName')).toHaveValue('Spring 10K');
  const mine = (Object.values(await stored(page)) as any[]).find((p) => p.name !== 'Spring 10K');
  expect(mine.inputs.curVol).toBe(41);
});

test('leaving the page with an unsaved plan asks first', async ({ app, page }) => {
  await app.configure({ dist: '5k' });
  const dialog = new Promise<string>((ok) => page.once('dialog', (d) => { ok(d.type()); d.dismiss(); }));
  await page.close({ runBeforeUnload: true });
  expect(await dialog).toBe('beforeunload');
});

test('the experience level is saved with the plan, and older plans open as Regular (BB-49)', async ({ app, page }) => {
  await app.pick('#levelSeg [data-level="new"]');
  await app.showPlan();
  await page.locator('#btnSave').click();
  await expect(app.toast()).toHaveText('Plan saved.');
  expect((Object.values(await stored(page)) as any[])[0].inputs.level).toBe('new');

  const old = fixturePlan();
  delete old.inputs.level;
  await page.evaluate((p) => localStorage.setItem('bb-plans', JSON.stringify({ [p.id]: p })), old);
  await app.open();
  await page.locator('#btnPlans').click();
  await app.modal().getByRole('button', { name: 'Open' }).click();
  await app.showSetup();
  await expect(page.locator('#levelSeg [data-level="regular"]')).toHaveAttribute('aria-pressed', 'true');
});

test('recovery weeks after the race are saved and reopen (BB-42)', async ({ app, page }) => {
  await app.pick('#recSeg [data-rec="1"]');
  await app.showPlan();
  await page.locator('#btnSave').click();
  await expect(app.toast()).toHaveText('Plan saved.');
  const p = (Object.values(await stored(page)) as any[])[0];
  expect(p.inputs.recWeeks).toBe(1);
  expect(p.plan.weeks.at(-1).phase).toBe('recovery');
  await app.open();
  await page.locator('#btnPlans').click();
  await app.modal().getByRole('button', { name: 'Open' }).click();
  await app.showPlan();
  expect((await app.plan()).at(-1)!.phase).toBe('recovery');
});

test.describe('import of a plan that is already here (BB-4)', () => {
  const T = 1790848800000; // updatedAt in the fixture
  const seed = async (page: import('@playwright/test').Page, o: { name: string; updatedAt: number }) => {
    const p = { ...fixturePlan(), ...o };
    await page.evaluate((p) => localStorage.setItem('bb-plans', JSON.stringify({ 'spring-10k-v1': p })), p);
  };
  const importFixture = async (app: import('./helpers').App, page: import('@playwright/test').Page) => {
    await page.locator('#btnPlans').click();
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('#pImport').click()]);
    await chooser.setFiles(FIXTURE);
  };
  const names = (app: import('./helpers').App) => app.modal().locator('.pl .info b');

  test('a copy changed more recently here is kept, and the file is added beside it', async ({ app, page }) => {
    await seed(page, { name: 'Spring 10K (edited here)', updatedAt: T + 60000 });
    await app.open();
    await importFixture(app, page);
    await expect(app.toast()).toHaveText('Imported 1 plan(s). 1 added as a copy, because the plan here was changed more recently.');
    await expect(names(app)).toHaveText(['Spring 10K (edited here)', 'Spring 10K (imported)'], { useInnerText: true });
  });

  test('an older copy here is replaced by the newer file', async ({ app, page }) => {
    await seed(page, { name: 'Old spring plan', updatedAt: T - 60000 });
    await app.open();
    await importFixture(app, page);
    await expect(app.toast()).toHaveText('Imported 1 plan(s).');
    await expect(names(app)).toHaveText(['Spring 10K']);
  });

  test('the same version is not imported twice', async ({ app, page }) => {
    await seed(page, { name: 'Spring 10K', updatedAt: T });
    await app.open();
    await importFixture(app, page);
    await expect(app.toast()).toHaveText('Nothing new: 1 plan(s) already up to date.');
    await expect(names(app)).toHaveText(['Spring 10K']);
  });

  test('the open plan reloads when a newer copy replaces it, so autosave cannot overwrite it', async ({ app, page }) => {
    await seed(page, { name: 'Old spring plan', updatedAt: T - 60000 });
    await app.open();
    await page.locator('#btnPlans').click();
    await app.modal().getByRole('button', { name: 'Open' }).click();
    await expect(page.locator('#planName')).toHaveValue('Old spring plan');
    await importFixture(app, page);
    await expect(app.toast()).toHaveText('Imported 1 plan(s).');
    await expect(page.locator('#planName')).toHaveValue('Spring 10K');
  });
});

test.describe('autosave and header (BB-32)', () => {
  const stored2 = (page: import('@playwright/test').Page) => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('bb-plans') || '{}')).length);

  test('the example plan is never saved on its own, even once edited', async ({ app, page }) => {
    await expect(page.locator('#btnSave')).toHaveText('Keep this plan');
    await app.configure({ weeks: 10 });
    await page.waitForTimeout(2000);
    expect(await stored2(page)).toBe(0);
    await expect(page.locator('#saveStatus')).toHaveText('Not saved');
  });

  test('Keep this plan saves the example, hides the button, then changes save themselves', async ({ app, page }) => {
    await page.locator('#btnSave').click();
    await expect(app.toast()).toHaveText('Plan saved.');
    await expect(page.locator('#btnSave')).toBeHidden();
    await app.configure({ weeks: 9 });
    await expect(page.locator('#saveStatus')).toContainText('Saved in this browser', { timeout: 5000 });
    const saved = Object.values(JSON.parse(await page.evaluate(() => localStorage.getItem('bb-plans') || '{}'))) as any[];
    expect(saved).toHaveLength(1);
    expect(saved[0].inputs.weeks).toBe(9);
  });

  test('the switcher after the plan name opens My plans; Quick workout is in the header', async ({ app, page }) => {
    await expect(page.locator('#btnPlans')).toHaveAttribute('aria-label', 'My plans');
    await page.locator('#btnPlans').click();
    await expect(page.getByRole('dialog', { name: 'My plans' })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.locator('#btnQuick').click();
    await expect(page.getByRole('dialog', { name: 'Quick workout' })).toBeVisible();
  });
});

test.describe('saving plans to a file and the weekly reminder (BB-84)', () => {
  const DAY = 864e5;
  const backup = (page: import('@playwright/test').Page) =>
    page.evaluate(() => JSON.parse(localStorage.getItem('bb-backup') || 'null'));
  /* move the first unsaved-to-file change back in time, then reopen the plan so the plan view redraws */
  const ageChanges = async (app: import('./helpers').App, page: import('@playwright/test').Page, days: number) => {
    await page.evaluate((since) => localStorage.setItem('bb-backup', JSON.stringify({ since })), TODAY_MS - days * DAY);
    await page.locator('#btnPlans').click();
    await app.modal().getByRole('button', { name: 'Open' }).first().click();
    await app.showPlan();
  };
  const TODAY_MS = new Date('2026-11-06T09:00:00+01:00').getTime();

  test('My plans says when plans were last saved to a file', async ({ app, page }) => {
    await page.locator('#btnSave').click();
    await page.locator('#btnPlans').click();
    await expect(page.locator('#bkLast')).toHaveText('Last saved to a file: never.');
    await expect(page.locator('#pExport')).toHaveText('Save plan');
    await app.download(() => page.locator('#pExport').click());
    await expect(page.locator('#bkLast')).toHaveText('Last saved to a file: 6 Nov 2026.');
    expect(await backup(page)).toEqual({ at: TODAY_MS });
  });

  test('no reminder in the first week, then one with Save plan and Later', async ({ app, page }) => {
    await page.locator('#btnSave').click();
    expect(await backup(page)).toEqual({ since: TODAY_MS });
    await expect(page.locator('#bkBanner')).toHaveCount(0);

    await ageChanges(app, page, 6);
    await expect(page.locator('#bkBanner')).toHaveCount(0);

    await ageChanges(app, page, 8);
    const banner = page.locator('#bkBanner');
    await expect(banner).toContainText('Your plans are only kept in this browser');
    await banner.getByRole('button', { name: 'Later' }).click();
    await expect(page.locator('#bkBanner')).toHaveCount(0);
    expect((await backup(page)).snooze).toBe(TODAY_MS + 7 * DAY);
  });

  test('Save plan in the reminder downloads every plan and hides it', async ({ app, page }) => {
    await page.locator('#btnSave').click();
    await ageChanges(app, page, 8);
    const { name, buf } = await app.download(() => page.locator('#bkBanner').getByRole('button', { name: 'Save plan' }).click());
    expect(name).toBe('block-builder-plans-2026-11-06.json');
    expect(Object.keys(JSON.parse(buf.toString()).plans)).toHaveLength(1);
    await expect(page.locator('#bkBanner')).toHaveCount(0);
    expect(await backup(page)).toEqual({ at: TODAY_MS });
  });

  test('shows on launch when due, never on the example of a first visit (BB-88)', async ({ app, page }) => {
    await expect(page.locator('#bkBanner')).toHaveCount(0);
    await page.locator('#btnSave').click();
    await page.evaluate((since) => localStorage.setItem('bb-backup', JSON.stringify({ since })), TODAY_MS - 30 * DAY);
    await app.open();
    await app.showPlan();
    await expect(page.locator('#bkBanner')).toBeVisible();
  });

  test('asks the browser to keep the storage once a plan is saved', async ({ app, page }) => {
    await page.addInitScript(() => {
      const w = window as any; w.__persist = 0;
      Object.defineProperty(navigator, 'storage', { configurable: true, value: { persist: () => { w.__persist++; return Promise.resolve(true); } } });
    });
    await app.open();
    expect(await page.evaluate(() => (window as any).__persist)).toBe(0);
    await page.locator('#btnSave').click();
    await expect(page.locator('#saveStatus')).toContainText('Saved in this browser');
    expect(await page.evaluate(() => (window as any).__persist)).toBe(1);
  });
});

test.describe('reopening the last plan on launch (BB-88)', () => {
  /* a second saved plan, changed after the first one */
  const addNewer = (page: import('@playwright/test').Page) => page.evaluate(() => {
    const all = JSON.parse(localStorage.getItem('bb-plans') || '{}');
    const first = Object.values(all)[0] as any;
    all['newer-plan'] = { ...first, name: 'Spring 10K', updatedAt: first.updatedAt + 60000 };
    localStorage.setItem('bb-plans', JSON.stringify(all));
  });
  const reopen = async (app: import('./helpers').App, page: import('@playwright/test').Page, name: string) => {
    await page.locator('#btnPlans').click();
    await app.modal().locator('.pl', { hasText: name }).getByRole('button', { name: 'Open' }).click();
    await expect(page.locator('#planName')).toHaveValue(name);
  };

  test('a first visit shows the example; after saving, a reload opens that plan', async ({ app, page }) => {
    await expect(page.locator('#planName')).toHaveValue('Half marathon block');
    await expect(page.locator('#btnSave')).toBeVisible();
    await app.configure({ dist: '10k', weeks: 9 });
    await page.locator('#btnSave').click();
    await expect(app.toast()).toHaveText('Plan saved.');
    await app.open();
    await expect(page.locator('#planName')).toHaveValue('10K block');
    await expect(page.locator('#btnSave')).toBeHidden();
    await expect(page.locator('#saveStatus')).toContainText('Saved in this browser');
    await app.showPlan();
    await expect(page.locator('#plan')).not.toContainText('Example settings');
  });

  test('reopens the plan open last, not the one changed last', async ({ app, page }) => {
    await page.locator('#btnSave').click();
    await expect(app.toast()).toHaveText('Plan saved.');
    await addNewer(page);
    await app.open();
    await expect(page.locator('#planName')).toHaveValue('Half marathon block');
    await reopen(app, page, 'Spring 10K');
    await app.open();
    await expect(page.locator('#planName')).toHaveValue('Spring 10K');
  });

  test('if the plan open last was deleted, the most recently changed one opens; with none left, the example', async ({ app, page }) => {
    await page.locator('#btnSave').click();
    await expect(app.toast()).toHaveText('Plan saved.');
    await addNewer(page);
    await page.evaluate(() => localStorage.setItem('bb-last', 'gone'));
    await app.open();
    await expect(page.locator('#planName')).toHaveValue('Spring 10K');
    await page.evaluate(() => localStorage.setItem('bb-plans', '{}'));
    await app.open();
    await expect(page.locator('#planName')).toHaveValue('Half marathon block');
    await expect(page.locator('#btnSave')).toBeVisible();
  });
});
