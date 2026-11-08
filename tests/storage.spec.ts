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
