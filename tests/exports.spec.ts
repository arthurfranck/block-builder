import { test, expect, parseCSV, zipNames, ONLINE } from './helpers';
import { readFileSync } from 'node:fs';
import path from 'node:path';

test.describe('CSV', () => {
  test('one row per run with dates, days and descriptions', async ({ app }) => {
    const weeks = await app.plan();
    const { name, buf } = await app.exportAs('csv');
    expect(name).toBe('half-marathon-block.csv');
    const rows = parseCSV(buf.toString('utf8'));
    expect(rows[0]).toEqual(['Week', 'Phase', 'Date', 'Day', 'Run', 'Km', 'Description', 'Note']);
    const body = rows.slice(1);
    expect(body).toHaveLength(weeks.flatMap((w) => w.sessions).length);
    expect(body[0].slice(0, 4)).toEqual(['1', 'base', '2026-11-09', 'Mon']);
    expect(body.at(-1)!.slice(0, 5)).toEqual(['12', 'taper', '2027-01-31', 'Sun', 'Race day']);
    expect(body.every((r) => r.length === 8 && +r[5] > 0)).toBe(true);
  });

  test('French headers when the page is in French', async ({ app, page }) => {
    await app.setLang('fr');
    const { name, buf } = await app.exportAs('csv');
    expect(name).toBe('plan-semi-marathon.csv');
    expect(parseCSV(buf.toString('utf8'))[0][0]).toBe('Semaine');
  });

  test('the format dropdown remembers the last choice', async ({ app, page }) => {
    await expect(page.locator('#expFmt')).toHaveValue('csv');
    await page.locator('#expFmt').selectOption('pdf');
    await app.open();
    await expect(page.locator('#expFmt')).toHaveValue('pdf');
  });
});

test.describe('PDF', () => {
  test('a printable PDF with every week', async ({ app }) => {
    test.skip(!ONLINE, 'needs cdnjs to load jsPDF');
    const { name, buf } = await app.exportAs('pdf');
    expect(name).toBe('half-marathon-block.pdf');
    const pdf = buf.toString('latin1');
    expect(pdf.startsWith('%PDF-')).toBe(true);
    const pages = (pdf.match(/\/Type \/Page[^s]/g) || []).length;
    expect(pages).toBeGreaterThanOrEqual(2);
    expect(pdf).toContain('Half marathon block');
    expect(pdf).toContain('W12');
    expect(pdf).toContain('Race day');
    // BB-43: a table of the run types used, with why and how each should feel
    expect(pdf).toContain('Run types in this plan');
    expect(pdf).toContain('out of 10');
  });

  test('without a connection the PDF option explains why it failed', async ({ app, page }) => {
    await page.route(/cdnjs\.cloudflare\.com/, (r) => r.abort());
    await page.locator('#expFmt').selectOption('pdf');
    await page.locator('[data-act="export"]').click();
    await expect(app.toast()).toHaveText("Couldn't load the PDF builder. Check your connection and try again.");
    await expect(page.locator('[data-act="export"]')).toBeEnabled();
  });
});

test('calendar export has one all-day event per run', async ({ app, page }) => {
  const weeks = await app.plan();
  const { name, buf } = await app.download(() => page.locator('[data-act="ics"]').click());
  expect(name).toBe('half-marathon-block.ics');
  const ics = buf.toString('utf8');
  expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
  expect((ics.match(/BEGIN:VEVENT/g) || []).length).toBe(weeks.flatMap((w) => w.sessions).length);
  expect(ics).toContain('DTSTART;VALUE=DATE:20261109');
  expect(ics).toContain('DTSTART;VALUE=DATE:20270131');
});

test.describe('watch export', () => {
  async function sendWeek1(app: import('./helpers').App, device: 'apple' | 'garmin' | 'other') {
    await app.page.locator('[data-act="wwatch"][data-w="0"]').click();
    await app.modal().locator(`[data-dev="${device}"]`).click();
    return app.download(() => app.page.locator('#dGo').click());
  }

  test('Garmin: a zip of .fit workouts, one per run', async ({ app }) => {
    const n = (await app.plan())[0].sessions.length;
    const { name, buf } = await sendWeek1(app, 'garmin');
    expect(name).toBe('half-marathon-block-week-01-garmin.zip');
    const files = zipNames(buf);
    expect(files).toHaveLength(n);
    expect(files.every((f) => /^w01-\w+-[a-z0-9-]+\.fit$/.test(f))).toBe(true);
    for (const f of files) {
      const at = buf.indexOf(Buffer.from(f)) + f.length;
      expect(buf.subarray(at + 8, at + 12).toString('latin1'), `${f} is a FIT file`).toBe('.FIT');
    }
  });

  test('the device choice is remembered', async ({ app, page }) => {
    await sendWeek1(app, 'other');
    await page.locator('[data-act="wwatch"][data-w="1"]').click();
    await expect(app.modal().locator('[data-dev="other"]')).toHaveAttribute('aria-checked', 'true');
  });

  test('a single run from the editor', async ({ app, page }) => {
    await app.session(0, 6).click();
    await page.locator('#eWatchBtn').click();
    await app.modal().locator('[data-dev="garmin"]').click();
    const { buf } = await app.download(() => page.locator('#dGo').click());
    expect(zipNames(buf)).toHaveLength(1);
  });

  test('two runs of the same type on the same day keep both files (BB-15)', async ({ app, page }) => {
    /* the editor can't stack two runs on a day (moving swaps days), but an imported plan can */
    const p = structuredClone(JSON.parse(readFileSync(path.join(__dirname, 'fixtures', 'plans-v1.json'), 'utf8')).plans['spring-10k-v1']);
    const w0 = p.plan.weeks[0];
    const s0 = w0.sessions[0];
    w0.sessions.push({ ...s0, id: s0.id + 'b' });
    await page.locator('#btnPlans').click();
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('#pImport').click()]);
    await chooser.setFiles({ name: 'two.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'block-builder', version: 1, plans: { two: p } })) });
    await app.modal().getByRole('button', { name: 'Open' }).click();
    await app.showPlan();
    await expect(app.session(0, s0.day)).toHaveCount(2);
    const { buf } = await sendWeek1(app, 'garmin');
    const names = zipNames(buf);
    expect(new Set(names).size).toBe(names.length);
    const dup = names.filter((f) => /-2\.fit$/.test(f));
    expect(dup).toHaveLength(1);
    expect(names).toContain(dup[0].replace(/-2\.fit$/, '.fit'));
  });

  test('Apple Watch: a zip of .workout files', async ({ app }) => {
    const n = (await app.plan())[0].sessions.length;
    const { name, buf } = await sendWeek1(app, 'apple');
    expect(name).toBe('half-marathon-block-week-01-apple.zip');
    const files = zipNames(buf);
    expect(files).toHaveLength(n);
    expect(files.every((f) => f.endsWith('.workout'))).toBe(true);
  });
});
