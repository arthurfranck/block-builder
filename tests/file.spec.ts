import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

/* README "Run locally": opening index.html from disk must still build a plan.
   The engine is a classic script (engine.js) for this reason: browsers block ES module imports from file://. */
test('index.html opened from disk (file://) loads the engine and builds the plan', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(pathToFileURL(resolve('index.html')).href);
  await expect(page.locator('table.grid tbody tr').first()).toBeVisible();
  expect(errors).toEqual([]);
});
