import { test, expect } from './helpers';

test.describe('default example plan', () => {
  test('opens on a 12-week half marathon plan ending on race day', async ({ app, page }) => {
    const weeks = await app.plan();
    expect(weeks).toHaveLength(12);
    expect(weeks[0].dates).toBe('9 Nov – 15 Nov');
    expect(weeks[11].dates).toBe('25 Jan – 31 Jan');
    const race = weeks[11].sessions.filter((s) => s.kind === 'race');
    expect(race).toHaveLength(1);
    expect(race[0]).toMatchObject({ day: 6, km: 21.1 });
    await expect(page.locator('#planName')).toHaveValue('Half marathon block');
    await expect(page.locator('#plan .banner.info')).toBeVisible();
    await expect(page.locator('#saveStatus')).toHaveText('Not saved');
  });

  test('the footer shows the version', async ({ app, page }) => {
    await expect(page.locator('#appVersion')).toHaveText('Block Builder v1.1.10');
  });

  test('summary numbers match the grid', async ({ app }) => {
    const weeks = await app.plan();
    const totals = weeks.map((w) => w.sessions.reduce((a, s) => a + s.km, 0));
    expect(await app.stat(0)).toBe(weeks.length);
    expect(await app.stat(1)).toBe(Math.round(totals.reduce((a, b) => a + b, 0)));
    expect(await app.stat(2)).toBe(Math.round(Math.max(...totals)));
    const longest = Math.max(...weeks.flatMap((w) => w.sessions.filter((s) => s.kind === 'long').map((s) => s.km)));
    expect(await app.stat(3)).toBe(longest);
    weeks.forEach((w, i) => expect(w.km).toBeCloseTo(totals[i], 1));
  });

  test('load profile draws one bar per week', async ({ app, page }) => {
    await expect(page.locator('#profileChart svg g')).toHaveCount((await app.plan()).length);
  });
});

test.describe('race distances', () => {
  const cases = [
    { dist: '5k', km: 5, name: '5K block' },
    { dist: '10k', km: 10, name: '10K block' },
    { dist: 'm', km: 42.2, name: 'Marathon block' },
  ] as const;
  for (const c of cases) {
    test(`${c.dist}: race of ${c.km} km on the last Sunday`, async ({ app, page }) => {
      await app.configure({ dist: c.dist });
      const last = (await app.plan()).at(-1)!;
      expect(last.sessions.find((s) => s.kind === 'race')).toMatchObject({ day: 6, km: c.km });
      await expect(page.locator('#planName')).toHaveValue(c.name);
    });
  }

  test('custom distance uses the km entered', async ({ app, page }) => {
    await app.configure({ dist: 'custom', customKm: 15 });
    const last = (await app.plan()).at(-1)!;
    expect(last.sessions.find((s) => s.kind === 'race')!.km).toBe(15);
    await expect(page.locator('#planName')).toHaveValue('15 km block');
  });
});

test.describe('plan length and dates', () => {
  test('weeks of training sets the number of weeks', async ({ app }) => {
    await app.configure({ weeks: 16 });
    expect(await app.plan()).toHaveLength(16);
  });

  test('weeks are clamped between 3 and 30', async ({ app }) => {
    await app.configure({ weeks: 1 });
    expect(await app.plan()).toHaveLength(3);
    await app.configure({ weeks: 45 });
    expect(await app.plan()).toHaveLength(30);
  });

  test('moving the race date moves the whole block', async ({ app }) => {
    await app.configure({ raceDate: '2027-04-11' });
    const weeks = await app.plan();
    expect(weeks.at(-1)!.dates).toBe('5 Apr – 11 Apr');
    expect(weeks[0].dates).toBe('18 Jan – 24 Jan');
  });

  test('a race on a Saturday puts race day on Saturday', async ({ app }) => {
    await app.configure({ raceDate: '2027-01-30' });
    const last = (await app.plan()).at(-1)!;
    expect(last.sessions.find((s) => s.kind === 'race')!.day).toBe(5);
  });
});

test.describe('runs per week', () => {
  for (const runs of [1, 2, 3, 4, 5, 6, 7]) {
    test(`${runs} runs a week`, async ({ app }) => {
      await app.configure({ runs });
      for (const w of await app.plan()) {
        expect.soft(w.sessions, `week ${w.n}`).toHaveLength(runs);
        expect.soft(new Set(w.sessions.map((s) => s.day)).size, `week ${w.n} one run per day`).toBe(runs);
      }
    });
  }
});

test.describe('fitness goal', () => {
  test('builds from the start date with no race and no taper', async ({ app, page }) => {
    await app.configure({ goal: 'fitness', startDate: '2026-11-16', weeks: 10 });
    const weeks = await app.plan();
    expect(weeks).toHaveLength(10);
    expect(weeks[0].dates).toBe('16 Nov – 22 Nov');
    expect(weeks.flatMap((w) => w.sessions).some((s) => s.kind === 'race')).toBe(false);
    expect(weeks.some((w) => w.phase === 'taper')).toBe(false);
    await expect(page.locator('#planName')).toHaveValue('10-week fitness block');
    await expect(page.locator('#hello')).toContainText('Your 10-week plan starts Monday 16 Nov');
  });

  test('a start date mid-week snaps to the next Monday', async ({ app }) => {
    await app.configure({ goal: 'fitness', startDate: '2026-11-18' });
    expect((await app.plan())[0].dates).toBe('23 Nov – 29 Nov');
  });

  test('race fields are hidden', async ({ app, page }) => {
    await app.goal('fitness');
    await expect(page.locator('#raceDateF')).toBeHidden();
    await expect(page.locator('#raceBox')).toBeHidden();
    await expect(page.locator('#startDateF')).toBeVisible();
  });
});
