import { defineConfig, devices } from '@playwright/test';

/*
 * Six setups: two desktop browsers and four iPhone screens.
 * Every iPhone browser, Chrome included, runs on WebKit (Apple requires it),
 * so "iPhone 16 Chrome" is WebKit with Chrome for iOS's user agent.
 */
const CHROME_IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1';

const PORT = 4173;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    locale: 'en-GB',
    timezoneId: 'Europe/Paris',
    acceptDownloads: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-safari', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } } },
    { name: 'iphone-16-safari', use: { ...devices['iPhone 16'] } },
    { name: 'iphone-16-pro-max-safari', use: { ...devices['iPhone 16 Pro Max'] } },
    { name: 'iphone-16-chrome', use: { ...devices['iPhone 16'], userAgent: CHROME_IOS_UA } },
    { name: 'iphone-17-pro-max-safari', use: { ...devices['iPhone 17 Pro Max'] } },
  ],
  webServer: {
    command: `node tests/serve.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: !process.env.CI,
  },
});
