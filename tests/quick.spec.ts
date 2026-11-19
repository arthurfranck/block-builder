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

/* ---------- step 4: add to plan ---------- */
test('Add to plan puts the workout on the chosen day as well as sending it', async ({ app, page }) => {
  const before = await app.plan();
  await openQuick(app);
  const s = sheet(page);
  await expect(s.locator('#qwAdd')).not.toBeChecked();
  await s.locator('#qwAdd').check();
  /* frozen today (Fri 6 Nov) is before the plan: the date starts on its first day, Mon 9 Nov */
  await expect(s.locator('#qwAddDate')).toHaveValue('2026-11-09');
  await s.locator('#qwAddDate').fill('2026-11-11');
  await s.locator('[data-qk="dev:garmin"]').click();
  await app.download(() => s.locator('#qwSend').click());
  const after = await app.plan();
  expect(after[0].sessions).toHaveLength(before[0].sessions.length + 1);
  const added = after[0].sessions.find((x) => x.day === 2)!;
  expect(added.name).toBe('Tempo');
  expect(added.kind).toBe('tempo');
});

test('Add to plan is not offered without a plan', async ({ app, page }) => {
  await page.locator('#btnNew').click();
  await app.showPlan();
  await page.locator('#plan .qempty [data-act="quick"]').click();
  await expect(sheet(page).locator('#qwAdd')).toHaveCount(0);
});

/* ---------- fixes from the iPhone test (2026-11-18) ---------- */
test('reps can go down to 1 and back up', async ({ app, page }) => {
  await openQuick(app);
  const s = sheet(page);
  await s.locator('[data-qk="type:intervals"]').click();
  await s.locator('#qwFt summary').click();
  const reps = s.locator('.qft').nth(0).locator('output');
  for (let n = +(await reps.innerText()); n > 1; n--) await s.locator('[data-qk="ft:n,-"]').click();
  await expect(reps).toHaveText('1');
  await expect(s.locator('#qwSteps')).not.toContainText(' × (');
  await s.locator('[data-qk="ft:n,+"]').click();
  await expect(reps).toHaveText('2');
  await expect(s.locator('#qwSteps')).toContainText('2 × (');
});

test('recoveries stay in time when measuring by distance', async ({ app, page }) => {
  await openQuick(app);
  const s = sheet(page);
  await s.locator('[data-qk="unit:d"]').click();
  await s.locator('[data-qk="type:intervals"]').click();
  await expect(s.locator('#qwSteps')).toContainText(/\d+ min recovery/);
  await s.locator('#qwFt summary').click();
  await expect(s.locator('.qft').nth(2)).toContainText('Recovery time');
});

test('fine-tune takes a typed target pace, shows it is tuned, and resets', async ({ app, page }) => {
  await openQuick(app);
  const s = sheet(page);
  await s.locator('[data-qk="type:intervals"]').click();
  await s.locator('#qwFt summary').click();
  await expect(s.locator('#qwFt .qtag')).toHaveCount(0);
  await s.locator('#qwPace').fill('abc');
  await s.locator('#qwPace').blur();
  await expect(s.locator('#qwPaceHint')).toHaveText('Type a pace like 4:30 (between 2:30 and 10:00 per km).');
  await s.locator('#qwPace').fill('4:05');
  await s.locator('#qwPace').blur();
  await expect(s.locator('#qwSteps')).toContainText('@ 4:05/km');
  await expect(s.locator('#qwFt .qtag')).toHaveText('Tuned');
  await s.locator('[data-qk="ftreset:1"]').click();
  await expect(s.locator('#qwSteps')).not.toContainText('4:05');
  await expect(s.locator('#qwFt .qtag')).toHaveCount(0);
});

test('a typed target pace works without any race time', async ({ app, page }) => {
  await app.configure({ recDist: '0' });
  await openQuick(app);
  const s = sheet(page);
  await s.locator('#qwFt summary').click();
  await s.locator('#qwPace').fill('4:40');
  await s.locator('#qwPace').blur();
  await expect(s.locator('#qwSteps')).toContainText('@ 4:40/km');
  await s.locator('[data-qk="dev:garmin"]').click();
  const { buf } = await app.download(() => s.locator('#qwSend').click());
  expect(zipNames(buf)).toHaveLength(1);
});

test('the sheet fits inside the visible screen', async ({ app, page }) => {
  await openQuick(app);
  const box = await sheet(page).boundingBox();
  const h = await page.evaluate(() => window.innerHeight);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(h);
  await expect(sheet(page).locator('#qwSend')).toBeInViewport();
});

test('the Goal row offers a quick workout without changing the goal', async ({ app, page }) => {
  await app.showSetup();
  const pressed = () => page.locator('#goalSeg button[aria-pressed="true"]').getAttribute('data-goal');
  const goal = await pressed();
  await page.locator('#btnQuickGoal').click();
  await expect(sheet(page).getByRole('heading')).toHaveText('Quick workout');
  await sheet(page).locator('[data-qk="cancel"]').click();
  expect(await pressed()).toBe(goal);
  await expect(page.locator('#btnQuickGoal')).toBeFocused();
});

test('the sheet says why the chosen type is worth running (BB-43)', async ({ app, page }) => {
  await openQuick(app);
  const s = sheet(page);
  await expect(s.locator('#qwWhy')).toContainText('Why this run: Raises the pace you can hold for a long time');
  await s.locator('[data-qk="type:hills"]').click();
  await expect(s.locator('#qwWhy')).toContainText('Builds leg strength and power');
});
