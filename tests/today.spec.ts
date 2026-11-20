import { test, expect, TODAY } from './helpers';
import type { Page } from '@playwright/test';

/* Frozen "today" is Friday 6 November 2026. The default plan starts Monday 9 November;
   13 weeks before the 31 January race moves week 1 to Monday 2 November, so today falls in week 1. */

const FORECAST = (() => {
  const time = Array.from({ length: 24 }, (_, h) => `2026-11-06T${String(h).padStart(2, '0')}:00`);
  const rain = time.map((_, h) => (h === 15 ? 5 : 60));
  return {
    current: { time: '2026-11-06T09:00', temperature_2m: 8.4, apparent_temperature: 5.6, weather_code: 61, wind_speed_10m: 17.2 },
    hourly: { time, temperature_2m: time.map((_, h) => 6 + h / 4), precipitation_probability: rain, weather_code: time.map(() => 61), wind_speed_10m: time.map(() => 15) },
    daily: { temperature_2m_max: [12.1], temperature_2m_min: [4.2], precipitation_probability_max: [80], sunset: ['2026-11-06T17:20'] },
  };
})();

async function openWeather(page: Page) {
  const line = page.locator('#wx .wxline');
  if ((await line.getAttribute('aria-expanded')) !== 'true') await line.click();
  await expect(page.locator('#wxMore')).toBeVisible();
}

async function mockWeather(page: Page, ok = true) {
  await page.route('https://geocoding-api.open-meteo.com/**', (r) =>
    ok ? r.fulfill({ json: /name=Nowhere/.test(r.request().url()) ? {} : { results: [{ name: 'Deauville', latitude: 49.36, longitude: 0.07, country: 'France' }] } }) : r.abort());
  await page.route('https://api.open-meteo.com/**', (r) => (ok ? r.fulfill({ json: FORECAST }) : r.abort()));
}

/* Dates with a weekday come from toLocaleDateString: Chromium writes "Mon 9 Nov", WebKit "Mon, 9 Nov". */
test('before the plan starts, the Today card names the start date and the first run', async ({ app, page }) => {
  await app.showPlan();
  const card = page.locator('#plan .today');
  await expect(card).toContainText('Plan starts 9 Nov');
  await expect(card).toContainText(/First run: Mon,? 9 Nov/);
});

test('the Today card sits above the load profile', async ({ app, page }) => {
  await app.showPlan();
  const order = await page.locator('#plan > .today, #plan > .profile').evaluateAll((els) => els.map((e) => e.className));
  expect(order).toEqual(['today', 'profile']);
});

test("on a run day the Today card shows today's run", async ({ app, page }) => {
  await app.configure({ weeks: 13 });
  await app.showPlan();
  const fri = (await app.plan())[0].sessions.find((s) => s.day === 4)!;
  const card = page.locator('#plan .today');
  await expect(card).toContainText('Week 1');
  await expect(card.locator('.tses .tn b')).toHaveText(fri.name);
  await expect(card.locator('.tses .tbig b')).toHaveText(`${fri.km} km`);
  await expect(card.locator('.tses .tbig span')).toHaveText(/^≈ \d+ min$/);
  await expect(card.locator('.wbar i').first()).toBeVisible();
});

test("Edit on the Today card opens today's run", async ({ app, page }) => {
  await app.configure({ weeks: 13 });
  await app.showPlan();
  await page.locator('#plan .today [data-act="tedit"]').click();
  await expect(app.modal().getByRole('heading')).toHaveText('Week 1 · Fri');
});

test('on a rest day the Today card names the next run', async ({ app, page }) => {
  await app.configure({ weeks: 13, runs: 3 });
  await app.showPlan();
  const card = page.locator('#plan .today');
  await expect(card).toContainText('Rest day');
  await expect(card).toContainText(/Next: Sun,? 8 Nov/);
});

test('a city shows the forecast, the driest slot and is remembered', async ({ app, page }) => {
  await mockWeather(page);
  await app.showPlan();
  await openWeather(page);
  await page.locator('#wxQ').fill('Deauville');
  await page.locator('#wxForm button[type="submit"]').click();
  const wx = page.locator('#wx');
  await expect(wx.locator('.tmp')).toHaveText('8°');
  await expect(wx).toContainText('Rain');
  await expect(wx).toContainText('feels 6°');
  await expect(wx).toContainText('high 12° · low 4°');
  await expect(wx).toContainText('sunset 17:20');
  await expect(wx.locator('.wxh.best .hr')).toHaveText('15:00');
  await expect(wx.locator('.wxbest')).toContainText('15:00, 5% rain');
  await page.reload();
  await expect(page.locator('#wx .wxline')).toContainText('Deauville');
  await expect(page.locator('#wx .tmp')).toHaveText('8°');
});

test('an unknown city says so', async ({ app, page }) => {
  await mockWeather(page);
  await app.showPlan();
  await openWeather(page);
  await page.locator('#wxQ').fill('Nowhere');
  await page.locator('#wxForm button[type="submit"]').click();
  await expect(page.locator('#wx')).toContainText('No city called “Nowhere”');
});

test('a failed forecast request explains what to do', async ({ app, page }) => {
  await mockWeather(page, false);
  await app.showPlan();
  await openWeather(page);
  await page.locator('#wxQ').fill('Deauville');
  await page.locator('#wxForm button[type="submit"]').click();
  await expect(page.locator('#wx')).toContainText("The forecast couldn't load.");
});

test('after a failed forecast, redraws do not refetch until a growing wait has passed (BB-11)', async ({ app, page }) => {
  let calls = 0;
  await page.route('https://geocoding-api.open-meteo.com/**', (r) => r.fulfill({ json: { results: [{ name: 'Deauville', latitude: 49.36, longitude: 0.07, country: 'France' }] } }));
  await page.route('https://api.open-meteo.com/**', (r) => { calls++; return r.abort(); });
  await app.showPlan();
  await openWeather(page);
  await page.locator('#wxQ').fill('Deauville');
  await page.locator('#wxForm button[type="submit"]').click();
  await expect(page.locator('#wx')).toContainText("The forecast couldn't load.");
  expect(calls).toBe(1);
  const redraw = async (km: number) => { await app.setField('curVol', km); await app.showPlan(); await expect(page.locator('#plan .today')).toBeVisible(); };
  for (const km of [31, 32, 33]) await redraw(km);
  expect(calls, 'redraws within 30 s of the failure do not refetch').toBe(1);
  await page.clock.setFixedTime(new Date(TODAY.getTime() + 31e3));
  await redraw(34);
  await expect.poll(() => calls).toBe(2);
  await redraw(35);
  expect(calls, 'after a second failure the wait doubles').toBe(2);
  await page.clock.setFixedTime(new Date(TODAY.getTime() + 31e3 + 61e3));
  await redraw(36);
  await expect.poll(() => calls).toBe(3);
});

/* ---------- BB-28: Today as hero ---------- */
/** Week 1 of a 13-week plan starts Monday 2 November; Tuesday 3 November is the hill session. */
async function onHillDay(app: import('./helpers').App, page: Page) {
  await app.configure({ weeks: 13, recDist: '10', recTime: '46:00' });
  await page.clock.setFixedTime(new Date('2026-11-03T09:00:00+01:00'));
  await app.setField('curVol', 26);
  await app.showPlan();
  await expect(page.locator('#plan .today .tses .tn b')).toHaveText('Hill repeats');
}

test('the workout bar draws warm-up, every rep and recovery, and cool-down', async ({ app, page }) => {
  await onHillDay(app, page);
  const card = page.locator('#plan .today');
  const n = +(/(\d+) ×/.exec((await card.locator('.wbarlbl').innerText()))![1]);
  await expect(card.locator('.wbar i')).toHaveCount(2 + 2 * n);
  await expect(card.locator('.wbar i.rec')).toHaveCount(n);
  await expect(card.locator('.wbarlbl')).toContainText('2 km warm-up');
  await expect(card.locator('.wbarlbl')).toContainText('2 km cool-down');
  await expect(card.locator('.wbar')).toHaveAttribute('aria-label', /Warm-up 2 km/);
});

test('the Today card lists the paces of the run, from the recent race', async ({ app, page }) => {
  await onHillDay(app, page);
  const chip = page.locator('#tdPaces .pc[data-k="easy"]');
  await expect(chip).toHaveText(/^Easy \d:\d\d\/km$/);
  await expect(page.locator('#tdHeat')).toBeEmpty();
});

test('a hot day slows easy paces and says to run hard parts by effort', async ({ app, page }) => {
  const hot = JSON.parse(JSON.stringify(FORECAST));
  hot.hourly.apparent_temperature = hot.hourly.time.map(() => 27.4);
  await page.route('https://geocoding-api.open-meteo.com/**', (r) => r.fulfill({ json: { results: [{ name: 'Nice', latitude: 43.7, longitude: 7.27, country: 'France' }] } }));
  await page.route('https://api.open-meteo.com/**', (r) => r.fulfill({ json: hot }));
  await onHillDay(app, page);
  const before = (await page.locator('#tdPaces .pc[data-k="easy"] b').innerText()).trim();
  await openWeather(page);
  await page.locator('#wxQ').fill('Nice');
  await page.locator('#wxForm button[type="submit"]').click();
  await expect(page.locator('#tdHeat')).toContainText('Hot today (feels 27°). Easy and tempo paces 10 s/km slower.');
  await expect(page.locator('#tdHeat')).toContainText('by effort, not pace');
  const [m, sec] = before.split(':').map(Number);
  const slower = `${Math.floor((m * 60 + sec + 10) / 60)}:${String((m * 60 + sec + 10) % 60).padStart(2, '0')}`;
  await expect(page.locator('#tdPaces .pc[data-k="easy"] b')).toHaveText(slower);
  await expect(page.locator('#tdPaces .pc[data-k="easy"] s')).toHaveText(before);
});

test('the weather is one line that opens the full forecast, and remembers it', async ({ app, page }) => {
  await mockWeather(page);
  await app.showPlan();
  const line = page.locator('#wx .wxline');
  await expect(line).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#wxMore')).toBeHidden();
  await openWeather(page);
  await page.locator('#wxQ').fill('Deauville');
  await page.locator('#wxForm button[type="submit"]').click();
  await expect(line).toContainText('8° rain · rain 80% · driest 15:00 · Deauville');
  await line.click();
  await expect(line).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#wxMore')).toBeHidden();
  await page.reload();
  await app.showPlan();
  await expect(page.locator('#wx .wxline')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#wx .wxline')).toContainText('Deauville');
});

test('Send on the Today card names the device last used', async ({ app, page }) => {
  await app.configure({ weeks: 13 });
  const send = page.locator('#plan .today [data-act="twatch"]');
  await expect(send).toHaveText('Send to Apple Watch');
  await send.click();
  await app.modal().locator('[data-dev="garmin"]').click();
  await app.download(() => app.modal().locator('#dGo').click());
  await expect(send).toHaveText('Send to Garmin');
});
