import { test, expect } from './helpers';
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

async function mockWeather(page: Page, ok = true) {
  await page.route('https://geocoding-api.open-meteo.com/**', (r) =>
    ok ? r.fulfill({ json: /name=Nowhere/.test(r.request().url()) ? {} : { results: [{ name: 'Deauville', latitude: 49.36, longitude: 0.07, country: 'France' }] } }) : r.abort());
  await page.route('https://api.open-meteo.com/**', (r) => (ok ? r.fulfill({ json: FORECAST }) : r.abort()));
}

test('before the plan starts, the Today card names the start date and the first run', async ({ app, page }) => {
  await app.showPlan();
  const card = page.locator('#plan .today');
  await expect(card).toContainText('Plan starts 9 Nov');
  await expect(card).toContainText('First run: Mon 9 Nov');
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
  await expect(card.locator('.tses .tn span')).toHaveText(`${fri.km} km`);
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
  await expect(card).toContainText('Next: Sun 8 Nov');
});

test('a city shows the forecast, the driest slot and is remembered', async ({ app, page }) => {
  await mockWeather(page);
  await app.showPlan();
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
  await expect(page.locator('#wx .eyebrow')).toContainText('Deauville');
  await expect(page.locator('#wx .tmp')).toHaveText('8°');
});

test('an unknown city says so', async ({ app, page }) => {
  await mockWeather(page);
  await app.showPlan();
  await page.locator('#wxQ').fill('Nowhere');
  await page.locator('#wxForm button[type="submit"]').click();
  await expect(page.locator('#wx')).toContainText('No city called “Nowhere”');
});

test('a failed forecast request explains what to do', async ({ app, page }) => {
  await mockWeather(page, false);
  await app.showPlan();
  await page.locator('#wxQ').fill('Deauville');
  await page.locator('#wxForm button[type="submit"]').click();
  await expect(page.locator('#wx')).toContainText("The forecast couldn't load.");
});
