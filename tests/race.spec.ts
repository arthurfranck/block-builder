import { test, expect } from './helpers';

/* Default race: Sunday 31 January 2027, 86 days after the frozen "today" (6 November 2026). */

test('the header counts down to race day', async ({ app, page }) => {
  await expect(page.locator('#hello')).toContainText('86 days to your half marathon on 31 Jan.');
  await expect(page.locator('#hello')).toContainText('Week 1 starts Monday 9 Nov.');
});

test('adding a race shows its name, city and countdown', async ({ app, page }) => {
  await app.showSetup();
  await page.locator('#raceBox [data-race="edit"]').click();
  await page.locator('#rName').fill('Semi de Paris');
  await page.locator('#rCity').fill('Paris');
  await page.locator('#raceBox [data-race="save"]').click();
  await expect(page.locator('#raceBox')).toContainText('Semi de Paris');
  await expect(page.locator('#planName')).toHaveValue('Semi de Paris');
  await app.showPlan();
  const cd = page.locator('#hello .countdown');
  await expect(cd.locator('.num')).toContainText('86');
  await expect(cd.locator('.rn')).toHaveText('Semi de Paris');
  await expect(cd.locator('.rm')).toContainText('Paris ·');
});

test('a Finishers link fills in the race name and links the countdown', async ({ app, page }) => {
  await app.showSetup();
  await page.locator('#raceBox [data-race="edit"]').click();
  await page.locator('#rUrl').fill('https://www.finishers.com/course/semi-marathon-de-boulogne');
  await expect(page.locator('#rName')).toHaveValue('Semi Marathon de Boulogne');
  await page.locator('#raceBox [data-race="save"]').click();
  await app.showPlan();
  await expect(page.locator('#hello a.rn')).toHaveAttribute('href', 'https://www.finishers.com/course/semi-marathon-de-boulogne');
});

test('a race needs a name', async ({ app, page }) => {
  await app.showSetup();
  await page.locator('#raceBox [data-race="edit"]').click();
  await page.locator('#raceBox [data-race="save"]').click();
  await expect(app.toast()).toHaveText('Give the race a name.');
  await expect(page.locator('#rName')).toBeFocused();
});

test('removing the race removes the countdown', async ({ app, page }) => {
  await app.showSetup();
  await page.locator('#raceBox [data-race="edit"]').click();
  await page.locator('#rName').fill('Test race');
  await page.locator('#raceBox [data-race="save"]').click();
  await page.locator('#raceBox [data-race="clear"]').click();
  await expect(page.locator('#raceBox')).toContainText('Optional: name your race');
  await app.showPlan();
  await expect(page.locator('#hello .countdown')).toHaveCount(0);
});

test('once the race has passed, the header says so', async ({ app }) => {
  await app.configure({ raceDate: '2026-11-01', weeks: 6 });
  await expect(app.page.locator('#hello')).toContainText('Your half marathon was on 1 Nov.');
});

test('on race day the header wishes a good race', async ({ app }) => {
  await app.configure({ raceDate: '2026-11-06', weeks: 6 });
  await expect(app.page.locator('#hello')).toContainText('Race day. Enjoy your half marathon');
});
