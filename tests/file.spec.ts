import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

/* README "Run locally": opening index.html from disk must still build a plan.
   Browsers block ES module imports from file://, so the committed app.js is a classic script that esbuild bundles
   from src/ (engine included, ADR 0008). A module or a missing engine would throw here. */
test('index.html opened from disk (file://) runs the bundled app and engine and builds the plan', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(pathToFileURL(resolve('index.html')).href);
  await expect(page.locator('table.grid tbody tr').first()).toBeVisible();
  expect(errors).toEqual([]);
});
