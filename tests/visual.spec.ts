import { test as base, expect, App, TODAY } from './helpers';
import type { Page } from '@playwright/test';

/*
 * Visual snapshots of the main screens (BB-85, ADR 0009): a refactor that changes the look fails here.
 *
 * Runs on desktop-chrome and iphone-16-safari only (see playwright.config.ts). Baselines are Linux images
 * made in CI, in the same Playwright Docker image as the tests (.github/workflows/visual-baselines.yml),
 * so the spec is skipped on other systems. VISUAL_LOCAL=1 runs it anyway against local baselines
 * (macOS files are git-ignored), handy to check a refactor before pushing.
 *
 * Determinism: frozen date, empty storage, every outside request blocked (Google Fonts, Open-Meteo, cdnjs),
 * so the page uses the image's system fonts; the version in the footer is replaced, so a release
 * does not change every image. Animations are off and the caret hidden (toHaveScreenshot defaults).
 */
const test = base.extend<{ shot: App }>({
  shot: async ({ page, mobile }, use) => {
    await page.route(/^https?:\/\/(?!127\.0\.0\.1[:/])/, (r) => r.abort());
    await page.clock.setFixedTime(TODAY);
    const app = new App(page, mobile);
    await app.open();
    await use(app);
  },
});

test.skip(process.platform !== 'linux' && !process.env.VISUAL_LOCAL, 'baselines are Linux images made in CI (VISUAL_LOCAL=1 to run here)');

/** Settle the page, pin what changes between releases, then compare. */
async function snap(page: Page, name: string, fullPage = false) {
  await page.evaluate(async () => {
    const v = document.getElementById('appVersion');
    if (v) v.textContent = 'Block Builder v0.0.0';
    await document.fonts.ready;
  });
  await expect(page).toHaveScreenshot(name + '.png', { fullPage });
}

test('plan view', async ({ shot, page }) => {
  await shot.showPlan();
  await snap(page, 'plan', true);
});

test('settings', async ({ shot, page, mobile }) => {
  test.skip(!mobile, 'on desktop settings sit next to the plan, already in the plan view image');
  await shot.showSetup();
  await snap(page, 'settings', true);
});

test('light theme', async ({ shot, page, mobile }) => {
  await shot.setTheme('light');
  await shot.closePrefs();
  await shot.showPlan();
  await snap(page, 'plan-light', true);
  if (mobile) {
    await shot.showSetup();
    await snap(page, 'settings-light', true);
  }
});

test('run editor', async ({ shot, page }) => {
  await shot.session(0, 0).click();
  await expect(shot.modal()).toBeVisible();
  await snap(page, 'run-editor');
});

test('My plans', async ({ shot, page }) => {
  await page.locator('#btnPlans').click();
  await expect(shot.modal()).toBeVisible();
  await snap(page, 'my-plans');
});

test('watch dialog', async ({ shot, page }) => {
  await shot.showPlan();
  await page.locator('[data-act="wwatch"][data-w="0"]').click();
  await expect(shot.modal()).toBeVisible();
  await snap(page, 'watch');
});

test('quick workout sheet', async ({ shot, page }) => {
  await shot.showPlan();
  await page.locator('#plan [data-act="quick"]').first().click();
  await expect(page.locator('[data-qk="type:easy"]')).toBeVisible();
  await snap(page, 'quick-workout');
});

test('display and language panel', async ({ shot, page }) => {
  await shot.openPrefs();
  await snap(page, 'prefs');
});
