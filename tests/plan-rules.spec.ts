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
      `This plan peaks at a ${long} km long run and ${peak} km in a week. A half marathon usually calls for a long run of about 13 km and weeks of about 30 km. Add weeks, or set the goal to Get in shape.`,
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

  test('shorter races and the Get in shape goal are not checked', async ({ app }) => {
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
