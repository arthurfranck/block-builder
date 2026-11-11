import { test as base, expect, type Page, type Locator } from '@playwright/test';
import { readFileSync } from 'node:fs';

/** Frozen "today" for every test: Friday 6 November 2026, 09:00 Paris. */
export const TODAY = new Date('2026-11-06T09:00:00+01:00');

export type Kind = 'easy' | 'recovery' | 'hard' | 'long' | 'race';
export type Session = { day: number; name: string; km: number; kind: Kind; desc: string; note: boolean };
export type Week = { n: number; phase: string; cutback: boolean; km: number; dates: string; sessions: Session[] };

type Fixtures = { app: App; mobile: boolean };

export const test = base.extend<Fixtures>({
  mobile: async ({}, use, testInfo) => {
    await use(!!testInfo.project.use.isMobile);
  },
  app: async ({ page, mobile }, use) => {
    await page.clock.setFixedTime(TODAY);
    const app = new App(page, mobile);
    await app.open();
    await use(app);
  },
});
export { expect };

/** Skip a test on phones (drag and drop, hover) or on desktop (tabs, touch). */
export const desktopOnly = (mobile: boolean) => test.skip(mobile, 'desktop-only behaviour');
export const mobileOnly = (mobile: boolean) => test.skip(!mobile, 'phone-only behaviour');

export class App {
  constructor(readonly page: Page, readonly mobile: boolean) {}

  async open(path = '/index.html') {
    await this.page.goto(path);
    await expect(this.page.locator('table.grid')).toBeVisible();
  }

  /* ---------- navigation (phones show one panel at a time) ---------- */
  async showSetup() {
    if (this.mobile) await this.page.locator('#mtabs [data-tab="setup"]').click();
    await expect(this.page.locator('#setup')).toBeVisible();
  }
  async showPlan() {
    if (this.mobile) await this.page.locator('#mtabs [data-tab="plan"]').click();
    await expect(this.page.locator('#plan')).toBeVisible();
  }

  /* ---------- display and language panel (gear at the end of the header) ---------- */
  async openPrefs() {
    const panel = this.page.locator('#prefsPanel');
    if (await panel.isHidden()) await this.page.locator('#btnPrefs').click();
    await expect(panel).toBeVisible();
  }
  async setLang(l: 'en' | 'fr') {
    await this.openPrefs();
    await this.page.locator('#langSel').selectOption(l);
  }
  async setTheme(v: 'dark' | 'light' | 'auto') {
    await this.openPrefs();
    await this.page.locator(`#themeSeg [data-theme-v="${v}"]`).click();
  }

  /* ---------- setup form ---------- */
  async setField(id: string, value: string | number) {
    await this.showSetup();
    const el = this.page.locator('#' + id);
    const tag = await el.evaluate((e) => e.tagName);
    if (tag === 'SELECT') await el.selectOption(String(value));
    // Set the value without focusing the field: a later blur would fire a second change event.
    else await el.evaluate((e: HTMLInputElement, v) => { e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); }, String(value));
  }
  async pick(selector: string) {
    await this.showSetup();
    await this.page.locator(selector).click();
  }
  goal(g: 'race' | 'fitness') { return this.pick(`#goalSeg [data-goal="${g}"]`); }
  distance(d: '5k' | '10k' | 'hm' | 'm' | 'custom') { return this.pick(`#distSeg [data-dist="${d}"]`); }
  runs(n: number) { return this.pick(`#runsSeg [data-runs="${n}"]`); }
  typeToggle(id: string) { return this.pick(`#t-on-${id}`); }
  /** Open "Customise workouts", where run type names, phases and templates live. */
  async openCustomise() {
    await this.showSetup();
    const more = this.page.locator('#typesMore');
    if (!(await more.evaluate((d: HTMLDetailsElement) => d.open))) await more.locator(':scope > summary').click();
    await expect(this.page.locator('#types')).toBeVisible();
  }

  /** Configure a plan in one go; only the fields given are touched. */
  async configure(o: { goal?: 'race' | 'fitness'; dist?: '5k' | '10k' | 'hm' | 'm' | 'custom'; customKm?: number; weeks?: number;
    raceDate?: string; startDate?: string; runs?: number; longDay?: number; curVol?: number; curLong?: number; recDist?: string; recTime?: string }) {
    if (o.goal) await this.goal(o.goal);
    if (o.dist) await this.distance(o.dist);
    if (o.customKm !== undefined) await this.setField('customKm', o.customKm);
    if (o.runs !== undefined) await this.runs(o.runs);
    if (o.longDay !== undefined) await this.setField('longDay', o.longDay);
    if (o.raceDate) await this.setField('raceDate', o.raceDate);
    if (o.startDate) await this.setField('startDate', o.startDate);
    if (o.weeks !== undefined) await this.setField('weeks', o.weeks);
    if (o.curVol !== undefined) await this.setField('curVol', o.curVol);
    if (o.curLong !== undefined) await this.setField('curLong', o.curLong);
    if (o.recDist !== undefined) await this.setField('recDist', o.recDist);
    if (o.recTime !== undefined) await this.setField('recTime', o.recTime);
    await this.showPlan();
  }

  /* ---------- reading the plan ---------- */
  warnings(): Locator { return this.page.locator('#plan .banner:not(.info) li'); }

  async plan(): Promise<Week[]> {
    return this.page.evaluate(() => {
      const kindOf = (el: HTMLElement) => {
        if (el.classList.contains('race')) return 'race';
        const m = /--k:var\(--(\w+)\)/.exec(el.getAttribute('style') || '');
        return m ? m[1] : 'easy';
      };
      return [...document.querySelectorAll<HTMLTableRowElement>('table.grid tbody tr:not(.wnote)')].map((tr) => ({
        n: +tr.querySelector('.wkcell .n')!.textContent!.replace(/\D/g, ''),
        phase: tr.querySelector('.wkcell .ph')!.textContent!.trim(),
        cutback: tr.classList.contains('cutback'),
        km: parseFloat(tr.querySelector('.wkcell .km')!.textContent!),
        dates: tr.querySelector('.wkcell .meta span')!.textContent!.trim(),
        sessions: [...tr.querySelectorAll<HTMLElement>('td.day')].flatMap((td) =>
          [...td.querySelectorAll<HTMLElement>('.ses')].map((s) => ({
            day: +td.dataset.d!,
            name: s.querySelector('.t')!.textContent!,
            km: parseFloat(s.querySelector('.k')!.textContent!),
            kind: kindOf(s),
            desc: s.querySelector('.d')!.textContent!,
            note: !!s.querySelector('.nb'),
          })),
        ),
      }));
    }) as Promise<Week[]>;
  }

  async stat(i: number) { return +(await this.page.locator('#plan .summary .stat b').nth(i).textContent())!; }

  session(week: number, day: number): Locator {
    return this.page.locator(`table.grid td.day[data-w="${week}"][data-d="${day}"] .ses`);
  }
  cell(week: number, day: number): Locator {
    return this.page.locator(`table.grid td.day[data-w="${week}"][data-d="${day}"]`);
  }

  /* ---------- downloads ---------- */
  async download(trigger: () => Promise<unknown>) {
    const [dl] = await Promise.all([this.page.waitForEvent('download'), trigger()]);
    const path = await dl.path();
    return { name: dl.suggestedFilename(), buf: readFileSync(path!) };
  }
  async exportAs(fmt: 'csv' | 'pdf') {
    await this.showPlan();
    await this.page.locator('#expFmt').selectOption(fmt);
    return this.download(() => this.page.locator('[data-act="export"]').click());
  }

  toast(): Locator { return this.page.locator('.toast').last(); }
  modal(): Locator { return this.page.locator('#modalRoot .modal'); }
}

/** File names inside a stored (uncompressed) zip, read from its central directory. */
export function zipNames(buf: Buffer): string[] {
  const names: string[] = [];
  for (let i = 0; i + 46 <= buf.length; i++) {
    if (buf.readUInt32LE(i) !== 0x02014b50) continue;
    const len = buf.readUInt16LE(i + 28);
    names.push(buf.subarray(i + 46, i + 46 + len).toString('utf8'));
    i += 45 + len;
  }
  return names;
}

/** Minimal CSV parser for the app's export (all fields quoted, CRLF rows, UTF-8 BOM). */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], f = '', q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { f += '"'; i++; }
      else if (c === '"') q = false;
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}

/** True when the CDNs the app loads on demand (cdnjs, jsDelivr) can be reached from the test machine. */
export const ONLINE = !process.env.OFFLINE;
