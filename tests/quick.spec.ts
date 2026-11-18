import { test, expect, zipNames } from './helpers';

/* BB-58 quick workout: one workout from the run types, sent to a watch without touching the plan. */
const sheet = (page: import('@playwright/test').Page) => page.locator('#modalRoot .modal');
async function openQuick(app: import('./helpers').App) {
  await app.showPlan();
  await app.page.locator('#plan [data-act="quick"]').first().click();
  await expect(sheet(app.page).getByRole('heading')).toHaveText('Quick workout');
}

test('the sheet opens on a medium tempo with a live preview', async ({ app, page }) => {
  await openQuick(app);
  const s = sheet(page);
  await expect(s.locator('[data-qk="type:tempo"]')).toHaveAttribute('aria-checked', 'true');
  await expect(s.locator('[data-qk="size:m"]')).toHaveAttribute('aria-checked', 'true');
  await expect(s.locator('.qprev .tn b')).toHaveText('Tempo');
  await expect(s.locator('.qprev .tbig span')).toHaveText(/^≈ \d+ min$/);
  await expect(s.locator('.qprev .wbar i')).toHaveCount(3);
  await expect(s.locator('#qwSteps')).toContainText('Warm-up 2 km');
});

test('size and target race reshape a quality workout', async ({ app, page }) => {
  await openQuick(app);
  const s = sheet(page);
  await s.locator('[data-qk="type:intervals"]').click();
  await s.locator('[data-qk="race:5k"]').click();
  /* 5K intervals: short = 400 m reps, long = 1 km reps */
  await s.locator('[data-qk="size:s"]').click();
  await expect(s.locator('#qwSteps')).toContainText('× (400 m');
  await expect(s.locator('[data-qk="size:s"] span')).toContainText('× 400 m');
  await s.locator('[data-qk="size:l"]').click();
  await expect(s.locator('#qwSteps')).toContainText('× (1 km');
  await s.locator('[data-qk="race:hm"]').click();
  await expect(s.locator('#qwSteps')).toContainText('× (1.6 km');
});

test('Time switches the whole workout to minutes and is remembered', async ({ app, page }) => {
  await openQuick(app);
  const s = sheet(page);
  await s.locator('[data-qk="unit:t"]').click();
  await expect(s.locator('#qwSteps')).toContainText('Warm-up 10 min');
  await expect(s.locator('#qwSteps')).not.toContainText(/\d km/);
  await page.reload();
  await openQuick(app);
  await expect(sheet(page).locator('[data-qk="unit:t"]')).toHaveAttribute('aria-checked', 'true');
});

test('easy types use a distance or duration stepper', async ({ app, page }) => {
  await openQuick(app);
  const s = sheet(page);
  await s.locator('[data-qk="type:easy"]').click();
  await expect(s.locator('.qstep output')).toHaveText('8 km');
  await s.locator('[data-qk="amt:+"]').click();
  await expect(s.locator('.qstep output')).toHaveText('8.5 km');
  await expect(s.locator('#qwKm')).toHaveText('8.5 km');
  await s.locator('[data-qk="unit:t"]').click();
  await expect(s.locator('.qstep output')).toHaveText('45 min');
  await s.locator('[data-qk="amt:-"]').click();
  await expect(s.locator('.qstep output')).toHaveText('40 min');
  await expect(s.locator('#qwSteps')).toHaveText(/^40 min @ \d:\d\d\/km$/);
});

test('warm-up and cool-down can be left out', async ({ app, page }) => {
  await openQuick(app);
  const s = sheet(page);
  await s.locator('#qwWucd').uncheck();
  await expect(s.locator('#qwSteps')).not.toContainText('Warm-up');
  await expect(s.locator('.qprev .wbar i')).toHaveCount(1);
});

test('Send downloads one workout named for the day, and leaves the plan alone', async ({ app, page }) => {
  const before = JSON.stringify(await app.plan());
  await openQuick(app);
  const s = sheet(page);
  await s.locator('[data-qk="dev:garmin"]').click();
  await expect(s.locator('#qwSend')).toHaveText('Send to Garmin');
  const { name, buf } = await app.download(() => s.locator('#qwSend').click());
  expect(name).toBe('quick-2026-11-06-tempo-medium-garmin.zip');
  expect(zipNames(buf)).toEqual(['quick-2026-11-06-tempo-medium.fit']);
  expect(JSON.stringify(await app.plan())).toBe(before);
  await expect(page.locator('#plan .toolbar')).toBeVisible();
});

test('a rest day offers a quick easy run', async ({ app, page }) => {
  await app.configure({ weeks: 13, runs: 3 });
  await page.locator('#plan .today [data-act="quick"]').click();
  await expect(sheet(page).locator('[data-qk="type:easy"]')).toHaveAttribute('aria-checked', 'true');
});

test('in French', async ({ app, page }) => {
  await app.setLang('fr');
  await app.showPlan();
  await page.locator('#plan [data-act="quick"]').first().click();
  await expect(sheet(page).getByRole('heading')).toHaveText('Séance rapide');
  await expect(sheet(page).locator('[data-qk="unit:t"]')).toHaveText('Temps');
});

/* ---------- step 3: fine-tune, own paces, recent workouts, empty plan ---------- */
test('fine-tune changes reps, rep and recovery, and resets with the size', async ({ app, page }) => {
  await openQuick(app);
  const s = sheet(page);
  await s.locator('[data-qk="type:intervals"]').click();
  await s.locator('#qwFt summary').click();
  const reps = s.locator('.qft').nth(0).locator('output');
  const n = +(await reps.innerText());
  await s.locator('[data-qk="ft:n,+"]').click();
  await expect(reps).toHaveText(String(n + 1));
  await expect(s.locator('#qwSteps')).toContainText(`${n + 1} × (`);
  await s.locator('[data-qk="ft:rep,+"]').click();
  await expect(s.locator('#qwFt')).toHaveAttribute('open', '');
  await s.locator('[data-qk="size:l"]').click();
  await s.locator('[data-qk="size:m"]').click();
  await expect(s.locator('#qwSteps')).toContainText(`${n} × (`);
});

test('without a race time in the plan, the sheet takes its own and keeps it out of the plan', async ({ app, page }) => {
  await app.configure({ recDist: '0' });
  await openQuick(app);
  const s = sheet(page);
  await expect(s.locator('.qpaces')).toHaveText('No race time: the watch shows effort, not pace.');
  await expect(s.locator('#qwSteps')).toContainText('@ tempo');
  await s.locator('#qwRecDist').selectOption('10');
  await s.locator('#qwRecTime').fill('46:00');
  await s.locator('#qwRecTime').blur();
  await expect(s.locator('.qpaces')).toHaveText('Paces from this race, kept for quick workouts only.');
  await expect(s.locator('#qwSteps')).toContainText(/@ \d:\d\d\/km/);
  await s.locator('[data-qk="cancel"]').click();
  await openQuick(app);
  await expect(sheet(page).locator('#qwRecTime')).toHaveValue('46:00');
  await sheet(page).locator('[data-qk="cancel"]').click();
  await app.showSetup();
  await expect(page.locator('#recDist')).toHaveValue('0');
});

test('a sent workout comes back as a Recent chip', async ({ app, page }) => {
  await openQuick(app);
  let s = sheet(page);
  await expect(s.locator('.qrec')).toHaveCount(0);
  await s.locator('[data-qk="dev:garmin"]').click();
  await app.download(() => s.locator('#qwSend').click());
  await openQuick(app);
  s = sheet(page);
  await s.locator('[data-qk="type:hills"]').click();
  await expect(s.locator('.qrec')).toHaveText(['Tempo · Medium · Half marathon']);
  await s.locator('.qrec').click();
  await expect(s.locator('[data-qk="type:tempo"]')).toHaveAttribute('aria-checked', 'true');
});

test('a new, empty plan offers a quick workout', async ({ app, page }) => {
  await page.locator('#btnNew').click();
  await app.showPlan();
  await page.locator('#plan .qempty [data-act="quick"]').click();
  await expect(sheet(page).getByRole('heading')).toHaveText('Quick workout');
  await expect(sheet(page).locator('#qwRecDist')).toBeVisible();
});
