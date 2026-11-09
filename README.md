# Block Builder

Block Builder creates a running training block in the browser. You pick a race or a fitness goal, enter your current running and choose your run types. It lays out the weeks, the volume and every run, which you can then send to a watch.

**Live:** https://arthurfranck.github.io/block-builder/

## Features

- **Goals:** train for a race (5K, 10K, half marathon, marathon, or a custom distance) or get in shape over a set number of weeks.
- **Phases:** base, build, peak and taper, with cutback weeks. Each full week stays within +10% of the last full week before it: after rounding, easy runs are shortened first, then the hard runs, then the long run. If every run is already at its minimum distance (low volume with many runs), the plan says which weeks still jump and suggests fewer runs; a hand edit that makes a week jump is flagged too. A load profile chart shows weekly volume and the long run.
- **Paces:** worked out from a recent race result (easy, tempo, intervals, race pace). The finish time is read to fit the race: "1:45" for a half means 1 h 45 min, a lone "52" for a 10K means 52 minutes, and the field shows the reading (1:45:00). A time that fits no reading for that race is flagged instead of being ignored.
- **Runs per week:** 1 to 7.
- **New plan:** starts empty. Pick runs per week, enter your weekly volume and longest run, and the plan builds. Only Easy run is ticked until you add more types.
- **Run types:** easy, recovery, long, tempo, intervals, hill repeats, fartlek, progression and race pace. You can untick the long run (that day becomes an easy run), add custom types, and edit their description templates and the phases they're used in.
- **Editing:** edit, move (drag and drop), add or delete any run, with a personal note per run.
- **Today:** above the load profile, a card shows today's run with Edit and Send to watch (or, on a rest day, the next run and its date; before the plan starts, the start date and first run). Next to it, the local forecast: current conditions and feels-like temperature, high and low, rain chance, wind, sunset, and an hourly strip to 22:00 that marks the driest slot left in the day. Type a city or use your location; the choice is remembered in your browser.
- **Race countdown:** optional, with the race name, city and a link to its page (Finishers search built in).
- **Watch export:** Apple Watch (`.workout`, through WorkoutKit), Garmin and other devices (`.fit`), per run, per week or for the whole plan.
- **Other exports:** calendar (`.ics`), plus a format dropdown for the plan itself: spreadsheet (`.csv`) or printable PDF (A4 landscape week-by-day grid with phases, weekly km, run descriptions and plan totals). The dropdown remembers the last format picked.
- **Languages:** English and French.
- **Themes:** light and dark, following the device setting.
- **Phone layout:** Plan and Settings tabs.
- **Keyboard and screen readers:** messages such as "Plan saved" are announced, dialogs are named by their title, Tab stays inside an open dialog, and closing it returns to the button or run that opened it.

## Where plans are stored

Plans are saved in the visitor's browser (`localStorage`) only. The weather city is stored there too (`bb-wx`). There are no accounts and no server. **My plans → Export** downloads every plan as one JSON file, and **Import** loads it back on any device or browser. Imported files are checked field by field and cleaned before they are stored, so a file from someone else can't inject anything into the page. A saved plan saves itself 1.5 seconds after each change, and right away before another plan replaces it or the tab closes; leaving with a plan that was never saved asks first.

## Tech

- One self-contained file: `index.html` (HTML, CSS and JavaScript, no build step).
- External resources:
  - Google Fonts (Barlow, Barlow Condensed, JetBrains Mono)
  - [`@bibixx/workoutkit`](https://www.npmjs.com/package/@bibixx/workoutkit) from jsDelivr, loaded only when exporting to Apple Watch
  - [Open-Meteo](https://open-meteo.com) forecast and geocoding APIs (free, no key), called only once a city or location is set
  - [jsPDF](https://github.com/parallax/jsPDF) 4.2.1 and [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) 5.0.9 from cdnjs, loaded only when exporting a PDF
- Hosted on GitHub Pages from the `main` branch, root folder.
- `package.json`, `package-lock.json`, `playwright.config.ts` and `tests/` are for the automated tests only; the page doesn't use them. The lockfile pins the exact test tool versions, so CI and a local run use the same Playwright and axe-core. To move to newer versions, run `npm update` and commit the changed lockfile in a pull request.

## Run locally

Open `index.html` in a browser. Everything works offline except the fonts, which fall back to system fonts, the weather, the Apple Watch export and the PDF export.

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
npm ci                 # exact versions from package-lock.json
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
| `setup-form.spec.ts` | paces, finish time read to fit the race distance, running days, run types, warnings, New plan starting blank |
| `editing.spec.ts` | edit, add, delete and move runs (drag and drop on desktop), hand edits vs settings |
| `today.spec.ts` | Today card before the plan, on a run day and on a rest day, Edit from the card, forecast and driest slot (Open-Meteo mocked), unknown city, failed request |
| `race.spec.ts` | race name, Finishers link, countdown, race passed or today |
| `storage.spec.ts` | save, autosave (also just before New plan or Open), warning on leaving unsaved, rename, delete, JSON export, import of a version 1 file (`tests/fixtures/plans-v1.json`), imported files with markup or broken parts |
| `exports.spec.ts` | CSV, PDF, calendar, Garmin and Apple Watch zips |
| `i18n.spec.ts` | every string in English and French with matching placeholders, language switch |
| `mobile.spec.ts` | Plan/Settings tabs, 16px fields, tap targets, sideways grid scroll; side-by-side layout on desktop |
| `layout.spec.ts` | nothing sticks out of the page, dark mode, no script errors |
| `a11y.spec.ts` | WCAG 2.1 A/AA checks on each view and dialog, light and dark |

GitHub Actions runs every setup on each push and pull request (`.github/workflows/tests.yml`) and keeps each setup's HTML report for 14 days. `main` is protected: all six setups must pass before a pull request can merge or a push can land, admins included, and force-pushes are blocked. GitHub Pages publishes `main` as soon as it changes, so only tested code goes live.

### Known issues

The suite found these when it was written. The tests let them through so that new problems still stand out, and they flag it when one gets fixed.

Marked `test.fail` (the test passes while the issue exists, and reports an unexpected pass once it's fixed: then remove the `test.fail` line): none at the moment.

Listed in `KNOWN` in `a11y.spec.ts` (once fixed, "the known issues are still there" fails: remove the id from `KNOWN`): none at the moment.

Remove the matching bullet here as well.

## Origin and differences from the claude.ai version

This is the standalone version of a Claude artifact. The claude.ai version also has:
- Claude-written coach notes
- per-user cloud saving
- a greeting with the viewer's name

All three depend on the claude.ai artifact runtime, so they were removed here. The other way round, the weather on the Today card works only here: claude.ai artifacts block outside network calls, so the forecast can't load there.

## Changelog

- **2026-11-09 (v1.1.8):** Weekly mileage now grows at most 10% on the last full week, including after cutback weeks; before, rounding pushed some weeks up 13 to 19%. When the minimum run distances make that impossible, or a hand edit causes a jump, a warning names the weeks.
- **2026-11-09 (v1.1.7):** Switched-off run types are easier to read: the card turns grey instead of fading the text. Screen readers announce rest days as "Rest + Add run · Week 1 · Wed" instead of just "+ Add run".
- **2026-11-09 (v1.1.6):** Screen readers now announce messages like "Plan saved" and errors. In dialogs, Tab stays inside, the dialog is announced by its title, and closing it puts you back on the button or run you started from.
- **2026-11-09 (v1.1.5):** Leftovers from the claude.ai version are gone: notes are labelled "Note" (not "Coach") on the plan, in the CSV and PDF exports and in calendar events, and unused Claude messages and error texts were removed.
- **2026-11-08 (v1.1.4):** On iPhone, tapping a run-type template, a run's description or note, or the export format no longer zooms the page in: those fields use 16px text on touch screens.
- **2026-11-08 (v1.1.3):** Finish times are read to fit the race: "1:45" for a half marathon now means 1 h 45 min instead of being ignored, and a time that can't fit the race says so.
- **2026-11-07 (v1.1.2):** Imported plan files are checked before use, so a shared file can't run script on the page; a broken file still opens. Changes made just before New plan, opening another plan or closing the tab are saved. Leaving with a never-saved plan asks first.
- **2026-11-06 (v1.1.1):** iPhone fixes: the race date field no longer overlaps Weeks of training, and opening a run no longer pops the run type picker open.
- **2026-11-06 (v1.1.0):** New plan starts blank instead of from example settings: no runs per week, running days or long run day selected, and only Easy ticked. 1 and 2 runs per week are available. The long run type can be unticked. The page footer shows the version.
- **2026-11-06:** Today card above the load profile: today's run (or the next one) and the local forecast with the driest slot left in the day.
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
