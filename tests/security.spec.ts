import { test, expect, ONLINE } from './helpers';

/*
 * Supply chain and Content Security Policy (BB-5).
 * The page declares a CSP in a <meta> tag, loads jsPDF with integrity hashes, and serves the
 * WorkoutKit encoder from vendor/ instead of a CDN.
 */
const violations = (page: import('@playwright/test').Page) => {
  const found: string[] = [];
  page.on('console', (m) => { if (/Content Security Policy|Refused to (load|connect|execute|apply)/i.test(m.text())) found.push(m.text()); });
  return found;
};

test('the page declares a strict Content Security Policy', async ({ app, page }) => {
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("default-src 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("base-uri 'none'");
  expect(csp).toContain('connect-src https://api.open-meteo.com https://geocoding-api.open-meteo.com;');
  expect(csp).not.toContain('jsdelivr');
});

test('loading the page and both downloaded libraries breaks no policy rule', async ({ app, page }) => {
  test.skip(!ONLINE, 'needs cdnjs to load jsPDF');
  const found = violations(page);
  const hosts = new Set<string>();
  page.on('request', (r) => { hosts.add(new URL(r.url()).host); });
  await page.reload();
  await app.exportAs('pdf');
  await page.locator('[data-act="wwatch"][data-w="0"]').click();
  await app.modal().locator('[data-dev="apple"]').click();
  await app.download(() => page.locator('#dGo').click());
  expect(found).toEqual([]);
  expect([...hosts].filter((h) => /jsdelivr/.test(h)), 'WorkoutKit comes from vendor/, not a CDN').toEqual([]);
});

test('a jsPDF file that does not match its integrity hash is refused', async ({ app, page }) => {
  let ran = false;
  await page.exposeFunction('__ranTampered', () => { ran = true; });
  await page.route(/cdnjs\.cloudflare\.com\/.*jspdf\.umd\.min\.js/, (r) => r.fulfill({
    contentType: 'application/javascript',
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: 'window.__ranTampered();window.jspdf={jsPDF:function(){}};',
  }));
  await page.locator('#expFmt').selectOption('pdf');
  await page.locator('[data-act="export"]').click();
  await expect(app.toast()).toHaveText("Couldn't load the PDF builder. Check your connection and try again.");
  expect(ran).toBe(false);
});
