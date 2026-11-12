import { test, expect, type Week } from './helpers';

/*
 * Training rules checked on the generated grid. One test per scenario checks
 * every rule with soft assertions, so a failure lists everything that broke.
 */
type Scenario = { dist: '5k' | '10k' | 'hm' | 'm' | 'custom'; customKm?: number; runs: number; weeks: number; longDay?: number; curVol: number; curLong: number; taper: number };
const SCENARIOS: Scenario[] = [
  { dist: '5k', runs: 4, weeks: 8, curVol: 25, curLong: 8, taper: 1 },
  { dist: '10k', runs: 5, weeks: 10, curVol: 30, curLong: 12, taper: 1 },
  { dist: 'hm', runs: 5, weeks: 12, curVol: 30, curLong: 12, taper: 2 },
  { dist: 'hm', runs: 7, weeks: 6, curVol: 40, curLong: 14, taper: 1 },
  { dist: 'm', runs: 6, weeks: 18, curVol: 45, curLong: 16, taper: 3 },
  { dist: 'm', runs: 3, weeks: 12, curVol: 40, curLong: 16, taper: 3 },
  { dist: 'custom', customKm: 15, runs: 4, weeks: 10, longDay: 5, curVol: 30, curLong: 12, taper: 2 },
];
const ORDER = ['base', 'build', 'peak', 'taper'];
const label = (s: Scenario) => `${s.dist === 'custom' ? s.customKm + ' km' : s.dist}, ${s.runs} runs, ${s.weeks} weeks`;
const nonRaceKm = (w: Week) => w.sessions.filter((s) => s.kind !== 'race').reduce((a, s) => a + s.km, 0);

for (const sc of SCENARIOS) {
  test(`rules hold: ${label(sc)}`, async ({ app }) => {
    const { taper, ...cfg } = sc;
    await app.configure(cfg);
    const weeks = await app.plan();
    const longDay = sc.longDay ?? 6;

    expect.soft(weeks, 'week count').toHaveLength(sc.weeks);
    const phases = weeks.map((w) => w.phase);
    expect.soft(phases.every((p, i) => i === 0 || ORDER.indexOf(p) >= ORDER.indexOf(phases[i - 1])), `phases in order: ${phases}`).toBe(true);
    expect.soft(phases.filter((p) => p === 'taper'), 'taper weeks').toHaveLength(taper);

    const last = weeks.at(-1)!;
    expect.soft(last.sessions.filter((s) => s.kind === 'race'), 'one race, last week').toHaveLength(1);
    expect.soft(weeks.slice(0, -1).flatMap((w) => w.sessions).filter((s) => s.kind === 'race'), 'no race before the last week').toHaveLength(0);

    for (const [i, w] of weeks.entries()) {
      expect.soft(w.sessions, `week ${w.n}: runs per week`).toHaveLength(sc.runs);
      if (w !== last) {
        const longs = w.sessions.filter((s) => s.kind === 'long');
        expect.soft(longs.map((s) => s.day), `week ${w.n}: one long run on the long-run day`).toEqual([longDay]);
      }
      expect.soft(w.sessions.every((s) => s.km > 0), `week ${w.n}: no empty runs`).toBe(true);
      if (i === 0) continue;
      const prev = weeks[i - 1];
      if (w.cutback) expect.soft(w.km, `week ${w.n}: cutback lighter than week ${prev.n}`).toBeLessThan(prev.km);
      if (w.phase === 'taper') expect.soft(nonRaceKm(w), `week ${w.n}: taper lighter than week ${prev.n} (race excluded)`).toBeLessThan(nonRaceKm(prev));
    }
  });
}

test.describe('weekly volume increase', () => {
  /*
   * The engine targets at most +10% a week, then trims each built week back to that cap
   * (rounding and the minimum run distances used to push some weeks to +19%, BB-12).
   */
  test('stays within 10% week to week, also after a cutback', async ({ app }) => {
    const problems: string[] = [];
    for (const sc of SCENARIOS) {
      const { taper, ...cfg } = sc;
      await app.configure(cfg);
      const weeks = await app.plan();
      weeks.forEach((w, i) => {
        if (i === 0 || w.cutback || w.phase === 'taper') return;
        const ref = weeks[i - 1].cutback ? weeks[i - 2] : weeks[i - 1];
        if (ref && w.km > ref.km * 1.1 + 0.05) problems.push(`${label(sc)}: week ${w.n} ${ref.km} → ${w.km} km (+${Math.round((w.km / ref.km - 1) * 100)}%)`);
      });
    }
    expect(problems).toEqual([]);
  });

  test('never jumps more than 20% week to week', async ({ app }) => {
    for (const sc of SCENARIOS) {
      const { taper, ...cfg } = sc;
      await app.configure(cfg);
      const weeks = await app.plan();
      weeks.forEach((w, i) => {
        if (i === 0 || w.cutback || w.phase === 'taper') return;
        const ref = weeks[i - 1].cutback ? weeks[i - 2] : weeks[i - 1];
        if (ref) expect.soft(w.km, `${label(sc)}: week ${w.n}`).toBeLessThanOrEqual(ref.km * 1.2);
      });
    }
  });
});

test.describe('weeks the 10% cap cannot hold', () => {
  test('a normal plan shows no steep-week warning', async ({ app }) => {
    await app.configure({ dist: 'hm', runs: 5, weeks: 12, curVol: 30, curLong: 12 });
    await expect(app.warnings().filter({ hasText: 'more than 10% bigger' })).toHaveCount(0);
  });

  test('when every run is already at its shortest, the jump is flagged with the fix', async ({ app }) => {
    await app.configure({ dist: '5k', runs: 5, weeks: 4, curVol: 10, curLong: 6 });
    await expect(app.warnings().filter({ hasText: 'more than 10% bigger' })).toContainText(['Week 2 is more than 10% bigger than the last full week before. Every run is already at its shortest: fewer runs per week would keep the build gentler.']);
  });

  test('a hand edit that makes a week jump is flagged too', async ({ app, page }) => {
    await app.configure({ dist: 'hm', runs: 5, weeks: 12, curVol: 30, curLong: 12 });
    await app.session(1, 0).click();
    await app.modal().locator('#eKm').fill('30');
    await app.modal().getByRole('button', { name: 'Save changes' }).click();
    await expect(app.warnings().filter({ hasText: 'more than 10% bigger' })).toContainText(['Week 2 is more than 10% bigger than the last full week before. Shortening a run would keep the build gentler.']);
  });
});

test.describe('taper long runs', () => {
  /*
   * The taper used to scale from the target peak long run (19 km for a half, 32 km for a marathon),
   * so a plan that never reached it got a longer run in the taper than at its peak (BB-39).
   */
  const LOW: Scenario[] = [
    { dist: 'hm', runs: 3, weeks: 12, curVol: 15, curLong: 6, taper: 2 },
    { dist: 'm', runs: 4, weeks: 16, curVol: 30, curLong: 14, taper: 3 },
  ];
  test('are shorter than the longest run before the taper, and get shorter week to week', async ({ app }) => {
    for (const sc of [...SCENARIOS, ...LOW]) {
      const { taper, ...cfg } = sc;
      await app.configure(cfg);
      const weeks = await app.plan();
      const longKm = (w: Week) => w.sessions.find((s) => s.kind === 'long')?.km ?? 0;
      const peak = Math.max(...weeks.filter((w) => w.phase !== 'taper').map(longKm));
      const taperLongs = weeks.filter((w) => w.phase === 'taper' && w !== weeks.at(-1)).map(longKm);
      taperLongs.forEach((km, i) => {
        expect.soft(km, `${label(sc)}: taper week ${i + 1} long run vs peak ${peak} km`).toBeLessThan(peak);
        if (i > 0) expect.soft(km, `${label(sc)}: taper week ${i + 1} vs taper week ${i}`).toBeLessThanOrEqual(taperLongs[i - 1]);
      });
    }
  });
});

test.describe('goal readiness', () => {
  /*
   * A half needs a long run of about 60% of the distance and ~30 km weeks; a marathon about 75% and ~45 km (BB-40).
   * Before this, a 15 km/week beginner got a 12 km peak long run for a half with only a low-volume warning.
   */
  const READY = 'usually calls for';

  test('a half plan that peaks too low says so, with its peak and what the race needs', async ({ app }) => {
    await app.configure({ dist: 'hm', runs: 3, weeks: 12, curVol: 15, curLong: 6 });
    const weeks = (await app.plan()).filter((w) => !w.sessions.some((s) => s.kind === 'race'));
    const long = Math.max(...weeks.flatMap((w) => w.sessions.map((s) => s.km)));
    const peak = Math.round(Math.max(...weeks.map((w) => w.sessions.reduce((a, s) => a + s.km, 0))));
    await expect(app.warnings().filter({ hasText: READY })).toHaveText([
      `This plan peaks at a ${long} km long run and ${peak} km in a week. A half marathon usually calls for a long run of about 13 km and weeks of about 30 km. Add weeks, or set the goal to Personal plan.`,
    ]);
  });

  test('a marathon plan from 30 km a week is flagged', async ({ app }) => {
    await app.configure({ dist: 'm', runs: 4, weeks: 16, curVol: 30, curLong: 14 });
    await expect(app.warnings().filter({ hasText: READY })).toContainText(['about 32 km and weeks of about 45 km']);
  });

  test('a plan that reaches the race needs shows no readiness warning', async ({ app }) => {
    await app.configure({ dist: 'hm', runs: 5, weeks: 12, curVol: 30, curLong: 12 });
    await expect(app.warnings().filter({ hasText: READY })).toHaveCount(0);
  });

  test('shorter races and the Personal plan goal are not checked', async ({ app }) => {
    await app.configure({ dist: '10k', runs: 3, weeks: 8, curVol: 12, curLong: 5 });
    await expect(app.warnings().filter({ hasText: READY })).toHaveCount(0);
    await app.configure({ goal: 'fitness', dist: 'hm', runs: 3, weeks: 12, curVol: 15, curLong: 6 });
    await expect(app.warnings().filter({ hasText: READY })).toHaveCount(0);
  });

  test('the warning is in French too', async ({ app }) => {
    await app.configure({ dist: 'hm', runs: 3, weeks: 12, curVol: 15, curLong: 6 });
    await app.setLang('fr');
    await expect(app.warnings().filter({ hasText: 'demande en général' })).toHaveCount(1);
  });
});

test.describe('hard runs per week (BB-57)', () => {
  const weekWarnings = (page: import('@playwright/test').Page) => page.locator('table.grid tr.wwarn');

  test('generated plans stay within the hard-run limit', async ({ app, page }) => {
    await expect(weekWarnings(page)).toHaveCount(0);
    await app.configure({ dist: 'm', runs: 4, weeks: 16, curVol: 30, curLong: 14 });
    await expect(weekWarnings(page)).toHaveCount(0);
    await expect(app.warnings().filter({ hasText: 'more hard runs than suit' })).toHaveCount(0);
  });

  test('a hand edit that adds a hard run is flagged on the week and in the banner', async ({ app, page }) => {
    await app.configure({ dist: 'hm', runs: 4, weeks: 12, curVol: 30, curLong: 12 });
    const toIntervals = async (day: number) => {
      await app.session(0, day).click();
      await app.modal().locator('#eType').selectOption('intervals');
      await app.modal().getByRole('button', { name: 'Save changes' }).click();
    };
    // 4 runs a week (Tue, Wed, Fri, Sun): at most one hard run. Make Tuesday and Wednesday intervals.
    await toIntervals(1);
    await toIntervals(2);
    const hard = (await app.plan())[0].sessions.filter((s) => ['hard', 'tempo'].includes(s.kind)).length;
    expect(hard).toBeGreaterThanOrEqual(2);
    // Tue and Wed intervals are also back to back (BB-44), so week 1 gets two warning rows
    const row = weekWarnings(page).and(page.locator('[data-check="tooHard"]'));
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(`${hard} hard runs this week: at 4 runs a week, keep it to 1. Change one to an easy run.`);
    // the warning sits right under week 1
    await expect(page.locator('table.grid tbody tr').nth(1)).toHaveClass(/wwarn/);
    await expect(app.warnings().filter({ hasText: 'more hard runs than suit' })).toContainText(['Week 1: more hard runs than suit 4 runs a week. Details on the week.']);

    // both back to easy runs: the warning goes away
    for (const day of [1, 2]) {
      await app.session(0, day).click();
      await app.modal().locator('#eType').selectOption('easy');
      await app.modal().getByRole('button', { name: 'Save changes' }).click();
    }
    await expect(weekWarnings(page)).toHaveCount(0);
    await expect(app.warnings().filter({ hasText: 'more hard runs than suit' })).toHaveCount(0);
  });
});

test.describe('spacing (BB-44)', () => {
  const weekWarnings = (page: import('@playwright/test').Page) => page.locator('table.grid tr.wwarn');
  const setDays = async (app: import('./helpers').App, page: import('@playwright/test').Page, runs: number, on: number[]) => {
    await app.runs(runs);
    const seg = page.locator('#daysSeg');
    for (let d = 0; d < 7; d++) {
      const b = seg.locator(`[data-day="${d}"]`);
      if ((await b.getAttribute('aria-pressed') === 'true') !== on.includes(d)) await b.click();
    }
    await app.showPlan();
  };

  test('a hard run moved next to the long run is flagged on the week, across the week boundary too', async ({ app, page }) => {
    // Default plan: Mon, Tue, Thu, Fri, Sun with the long run on Sunday. Week 2 Monday follows week 1's long run.
    await app.session(1, 0).click();
    await app.modal().locator('#eType').selectOption('intervals');
    await app.modal().getByRole('button', { name: 'Save changes' }).click();
    const row = weekWarnings(page).and(page.locator('[data-check="b2b"]'));
    await expect(row).toHaveCount(1);
    // week 2 also has a generated hard run on Tuesday, so Monday's intervals touch it as well
    await expect(row).toContainText('Long run (Sun) and Intervals (Mon), Intervals (Mon) and ');
    await expect(row).toContainText(' back to back. Keep an easy day or a rest day between hard runs and the long run.');
    await expect(app.warnings().filter({ hasText: 'right next to another hard run' })).toContainText(['Week 2: a hard run right next to another hard run or the long run. Details on the week.']);
  });

  test('runs on all 7 days after edits: no rest day, on the week', async ({ app, page }) => {
    for (const d of [2, 5]) {
      await app.cell(0, d).locator('.empty').click();
      await page.locator('#eOk').click();
    }
    const row = weekWarnings(page).and(page.locator('[data-check="noRest"]'));
    await expect(row).toHaveCount(1);
    await expect(row).toContainText('Runs on all 7 days this week: keep at least one rest day.');
    await expect(app.warnings().filter({ hasText: 'no rest day' })).toContainText(['Week 1: no rest day. Details on the week.']);
  });

  test('3 running days in a row is one setup warning, not a week warning', async ({ app, page }) => {
    await setDays(app, page, 3, [4, 5, 6]);
    await expect(app.warnings().filter({ hasText: 'in a row' })).toContainText(['Fri, Sat, Sun are 3 days in a row. Keep the middle one easy, or spread your running days.']);
    await expect(weekWarnings(page)).toHaveCount(0);
  });

  test('days that box in the long run: one setup warning, weeks not flagged for it', async ({ app, page }) => {
    await setDays(app, page, 2, [5, 6]);
    await expect(app.warnings().filter({ hasText: 'next to the long run' })).toContainText(['Every other running day is next to the long run (Sun), so the hard run lands next to it. Add a running day further from it, or move the long run.']);
    await expect(weekWarnings(page)).toHaveCount(0);
  });

  test('7 runs a week: one setup warning about the rest day', async ({ app, page }) => {
    await app.runs(7);
    await app.showPlan();
    await expect(app.warnings().filter({ hasText: 'leaves no rest day' })).toHaveCount(1);
    await expect(weekWarnings(page)).toHaveCount(0);
  });

  test('spread-out days get none of these warnings', async ({ app, page }) => {
    await expect(app.warnings().filter({ hasText: /in a row|next to the long run|rest day/ })).toHaveCount(0);
    await expect(weekWarnings(page)).toHaveCount(0);
  });
});
