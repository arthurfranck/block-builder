# Block Builder

Block Builder creates a running training block in the browser. You pick a race or a fitness goal, enter your current running and choose your run types. It lays out the weeks, the volume and every run, which you can then send to a watch.

**Live:** https://arthurfranck.github.io/block-builder/

## Features

- **Goals:** train for a race (5K, 10K, half marathon, marathon, or a custom distance) or get in shape over a set number of weeks.
- **Phases:** base, build, peak and taper, with cutback weeks. A load profile chart shows weekly volume and the long run.
- **Paces:** worked out from a recent race result (easy, tempo, intervals, race pace).
- **Run types:** easy, recovery, long, tempo, intervals, hill repeats, fartlek, progression and race pace. You can add custom types and edit their description templates and the phases they're used in.
- **Editing:** edit, move (drag and drop), add or delete any run, with a personal note per run.
- **Race countdown:** optional, with the race name, city and a link to its page (Finishers search built in).
- **Watch export:** Apple Watch (`.workout`, through WorkoutKit), Garmin and other devices (`.fit`), per run, per week or for the whole plan.
- **Other exports:** calendar (`.ics`), plus a format dropdown for the plan itself: spreadsheet (`.csv`) or printable PDF (A4 landscape week-by-day grid with phases, weekly km, run descriptions and plan totals). The dropdown remembers the last format picked.
- **Languages:** English and French.
- **Themes:** light and dark, following the device setting.
- **Phone layout:** Plan and Settings tabs.

## Where plans are stored

Plans are saved in the visitor's browser (`localStorage`) only. There are no accounts and no server. **My plans → Export** downloads every plan as one JSON file, and **Import** loads it back on any device or browser.

## Tech

- One self-contained file: `index.html` (HTML, CSS and JavaScript, no build step).
- External resources:
  - Google Fonts (Barlow, Barlow Condensed, JetBrains Mono)
  - [`@bibixx/workoutkit`](https://www.npmjs.com/package/@bibixx/workoutkit) from jsDelivr, loaded only when exporting to Apple Watch
  - [jsPDF](https://github.com/parallax/jsPDF) 4.2.1 and [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) 5.0.9 from cdnjs, loaded only when exporting a PDF
- Hosted on GitHub Pages from the `main` branch, root folder.
- `package.json`, `playwright.config.ts` and `tests/` are for the automated tests only; the page doesn't use them.

## Run locally

Open `index.html` in a browser. Everything works offline except the fonts, which fall back to system fonts, the Apple Watch export and the PDF export.

## Tests

Automated tests use [Playwright](https://playwright.dev) and [axe-core](https://github.com/dequelabs/axe-core-npm) for accessibility. They live in `tests/` and run on six setups:

| Setup | Engine | Screen |
|---|---|---|
| `desktop-chrome` | Chromium | 1440×900 |
| `desktop-safari` | WebKit | 1440×900 |
| `iphone-16-safari` | WebKit, touch | 393×659 |
| `iphone-16-pro-max-safari` | WebKit, touch | 440×763 |
| `iphone-16-chrome` | WebKit, Chrome for iOS user agent | 393×659 |
| `iphone-17-pro-max-safari` | WebKit, touch | 440×763 |

Every iOS browser, Chrome included, runs on WebKit, so the iPhone Chrome setup checks Safari's engine with Chrome's user agent. The iPhone setups simulate screen size and touch; they are not real devices.

Run them:

```sh
npm install
npx playwright install chromium webkit
npm test               # all six setups
npm run test:desktop   # or test:mobile, test:chrome
npm run test:report    # open the last HTML report
```

Every test starts on a frozen date (Friday 6 November 2026, Paris time) with empty storage, so generated plans are the same on every run. Tests that load jsPDF or the WorkoutKit encoder from a CDN are skipped when `OFFLINE=1` is set.

| File | Covers |
|---|---|
| `plan-generation.spec.ts` | distances, weeks, dates, runs per week, fitness goal |
| `plan-rules.spec.ts` | phase order, taper length, cutback and taper volume, one race on race day, long-run day, weekly increase |
| `setup-form.spec.ts` | paces, running days, run types, warnings |
| `editing.spec.ts` | edit, add, delete and move runs (drag and drop on desktop), hand edits vs settings |
| `race.spec.ts` | race name, Finishers link, countdown, race passed or today |
| `storage.spec.ts` | save, autosave, rename, delete, JSON export, import of a version 1 file (`tests/fixtures/plans-v1.json`) |
| `exports.spec.ts` | CSV, PDF, calendar, Garmin and Apple Watch zips |
| `i18n.spec.ts` | every string in English and French with matching placeholders, language switch |
| `mobile.spec.ts` | Plan/Settings tabs, 16px fields, tap targets, sideways grid scroll; side-by-side layout on desktop |
| `layout.spec.ts` | nothing sticks out of the page, dark mode, no script errors |
| `a11y.spec.ts` | WCAG 2.1 A/AA checks on each view and dialog, light and dark |

GitHub Actions runs every setup on each push and pull request (`.github/workflows/tests.yml`) and keeps each setup's HTML report for 14 days. Results are reports only: GitHub Pages publishes `main` whether or not the tests pass.

Two tests are marked as known failures (`test.fail`) and pass while the issue exists:
- **Weekly increase over 10%:** some weeks rise 13 to 19% after rounding and the 4 km minimum per run.
- **Text areas under 16px on touch screens:** the run-type templates and the run editor's description and note fields are 13.5px, so iOS zooms in when they are tapped.

When one of these is fixed, the test reports an unexpected pass: remove its `test.fail` line.

## Origin and differences from the claude.ai version

This is the standalone version of a Claude artifact. The claude.ai version also has:
- Claude-written coach notes
- per-user cloud saving
- a greeting with the viewer's name

All three depend on the claude.ai artifact runtime, so they were removed here.

## Changelog

- **2026-11-06:** Export the plan as PDF or CSV from a format dropdown (replaces the Export CSV button).
- **2026-11-06:** First standalone release:
  - Coach notes removed.
  - Plans saved in the browser only, with JSON export and import.
  - Plain file downloads.
  - Design QA fixes:
    - Plan/Settings tabs on phone.
    - Lighter header.
    - 16px form fields on touch screens.
    - Visible rest days.
    - Compact week watch button.
    - Darker text colors to pass WCAG AA contrast.
    - Fixed-size chart text.
    - Race name shown only once.
    - Plan name follows the goal until you rename it.
