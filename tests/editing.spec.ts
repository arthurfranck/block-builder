import { test, expect, desktopOnly } from './helpers';

/* Week 1 of the default plan runs Mon, Tue, Thu, Fri, Sun: Wednesday (day 2) is a rest day. */

test('editing a run updates the grid, the note badge and the week total', async ({ app, page }) => {
  const before = (await app.plan())[0];
  const mon = before.sessions.find((s) => s.day === 0)!;
  await app.session(0, 0).click();
  await expect(app.modal().getByRole('heading')).toHaveText('Week 1 · Mon');
  await page.locator('#eKm').fill(String(mon.km + 2));
  await page.locator('#eNote').fill('Hilly route');
  await page.locator('#eOk').click();
  await expect(app.modal()).toHaveCount(0);
  const after = (await app.plan())[0];
  const edited = after.sessions.find((s) => s.day === 0)!;
  expect(edited.km).toBe(mon.km + 2);
  expect(edited.note).toBe(true);
  expect(after.km).toBeCloseTo(before.km + 2, 1);
});

test('changing the run type rewrites the description', async ({ app, page }) => {
  await app.session(0, 0).click();
  await page.locator('#eType').selectOption('intervals');
  await expect(page.locator('#eDesc')).toHaveValue(/warm-up with strides/);
  await page.locator('#eOk').click();
  const s = (await app.plan())[0].sessions.find((x) => x.day === 0)!;
  expect(s).toMatchObject({ name: 'Intervals', kind: 'hard' });
});

test('cancel and Escape leave the run unchanged', async ({ app, page }) => {
  const before = await app.plan();
  await app.session(0, 0).click();
  await page.locator('#eKm').fill('99');
  await page.locator('#eCancel').click();
  await app.session(0, 0).click();
  await page.keyboard.press('Escape');
  await expect(app.modal()).toHaveCount(0);
  expect(await app.plan()).toEqual(before);
});

test('deleting a run leaves a rest day', async ({ app, page }) => {
  await app.session(0, 0).click();
  await page.locator('#eDel').click();
  await expect(app.session(0, 0)).toHaveCount(0);
  await expect(app.cell(0, 0).locator('.empty')).toBeVisible();
});

test('adding a run on a rest day opens it in the editor', async ({ app, page }) => {
  await app.cell(0, 2).locator('.empty').click();
  await expect(app.modal()).toBeVisible();
  await expect(page.locator('#eKm')).toHaveValue('5');
  await page.locator('#eOk').click();
  await expect(app.session(0, 2)).toContainText('Easy run');
  await expect(app.session(0, 2)).toContainText('5 km');
});

test('moving a run to another day from the editor swaps the days', async ({ app, page }) => {
  const monName = (await app.session(0, 0).locator('.t').textContent())!;
  await app.session(0, 0).click();
  await page.locator('#eDay').selectOption('2');
  await page.locator('#eOk').click();
  await expect(app.session(0, 2).locator('.t')).toHaveText(monName);
  await expect(app.session(0, 0)).toHaveCount(0);
});

test('drag and drop moves a run within its week', async ({ app, mobile }) => {
  desktopOnly(mobile);
  const monName = (await app.session(0, 0).locator('.t').textContent())!;
  await app.session(0, 0).dragTo(app.cell(0, 2));
  await expect(app.session(0, 2).locator('.t')).toHaveText(monName);
  await expect(app.session(0, 0)).toHaveCount(0);
});

test.describe('hand edits and settings', () => {
  test.beforeEach(async ({ app, page }) => {
    await app.session(0, 0).click();
    await page.locator('#eNote').fill('mine');
    await page.locator('#eOk').click();
  });

  test('changing a setting asks before replacing hand edits', async ({ app, page }) => {
    await app.configure({ curVol: 40 });
    await expect(page.locator('#plan .banner').filter({ hasText: 'You edited sessions by hand' })).toBeVisible();
    await page.locator('[data-act="keep"]').click();
    expect((await app.plan())[0].sessions.find((s) => s.day === 0)!.note).toBe(true);
  });

  test('rebuild plan applies the new settings and drops hand edits', async ({ app, page }) => {
    await app.configure({ curVol: 40 });
    await page.locator('[data-act="regen"]').click();
    expect((await app.plan())[0].sessions.some((s) => s.note)).toBe(false);
  });

  test('rebuild from settings asks for confirmation', async ({ app, page }) => {
    await page.locator('[data-act="rebuild"]').click();
    await expect(app.modal()).toContainText('Rebuild the plan?');
    await page.locator('#cNo').click();
    expect((await app.plan())[0].sessions.find((s) => s.day === 0)!.note).toBe(true);
    await page.locator('[data-act="rebuild"]').click();
    await page.locator('#cYes').click();
    expect((await app.plan())[0].sessions.some((s) => s.note)).toBe(false);
  });
});
