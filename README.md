# Block Builder

Block Builder creates a running training block in the browser. You pick a race or a fitness goal, enter your current running and choose your run types. It lays out the weeks, the volume and every run, which you can then send to a watch.

**Live:** https://arthurfranck.github.io/block-builder/

## Features

- **Goals:** train for a race (5K, 10K, half marathon, marathon, or a custom distance) or build a personal plan over a set number of weeks. For a half or a full marathon, the plan warns when it peaks too low for the race (longest run under about 60% of a half or 75% of a marathon, or biggest week under about 30 or 45 km) and suggests more weeks or the Personal plan goal.
- **Phases:** base, build, peak and taper, with cutback weeks. Taper long runs step down from the longest run the plan actually reached (75%, then 60%). Each full week stays within +10% of the last full week before it: after rounding, easy runs are shortened first, then the hard runs, then the long run. If every run is already at its minimum distance (low volume with many runs), the plan says which weeks still jump and suggests fewer runs; a hand edit that makes a week jump is flagged too. A load profile chart shows weekly volume and the long run.
- **Paces:** worked out from a recent race result (easy, tempo, intervals, race pace). The finish time is read to fit the race: "1:45" for a half means 1 h 45 min, a lone "52" for a 10K means 52 minutes, and the field shows the reading (1:45:00). A time that fits no reading for that race is flagged instead of being ignored.
- **Runs per week:** 1 to 7.
- **New plan:** starts empty. Pick runs per week, enter your weekly volume and longest run, and the plan builds. Only Easy run is switched on until you add more types.
- **Run types:** easy, recovery, long, tempo, intervals, hill repeats, fartlek, progression and race pace, shown as chips grouped Easy and Quality: tap one to switch it on or off (Easy run is always on). You can switch off the long run (that day becomes an easy run). Under "Customise workouts" you can rename types, add custom ones, and edit their description templates and the phases they're used in.
- **Effort colours:** each run's colour bar shows how hard it is, cool to hot: recovery, easy, long run, steady quality (tempo, progression, race pace, fartlek), hard quality (intervals, hills, custom quality types), race day. Same colours on the chips, the plan, the Today card and the PDF.
- **Summary:** above the plan, weeks to go (counting the current week, up to race day), peak week and longest run in km, and the target time for the race worked out from your recent race (for example 1h55; hover for the exact time). Plan totals are in the PDF.
- **Load profile:** a bar per week (cutback weeks paler, the long run as a line), drawn over shaded phase bands labelled base, build, peak and taper. The current week's number is in bold with a dashed line on today, and the race week carries a flag.
- **Editing:** edit, move (drag and drop), add or delete any run, with a personal note per run. A week with more hard runs than its runs per week allow (1 at 4 runs or fewer, 2 above), whether built that way or edited, gets a warning line right under it and a line in the warnings above the plan. The same goes for a hard run on the day next to another hard run, the long run or race day (Sunday into Monday counts), and for a week with runs on all 7 days.
- **Running days check:** picking 3 or more days in a row at 4 runs a week or fewer, days that leave every run next to the long run, or 7 runs a week gives one warning about the days chosen, not one per week.
- **Today:** above the load profile, a card shows today's run with Edit and Send to watch (or, on a rest day, the next run and its date; before the plan starts, the start date and first run). Next to it, the local forecast: current conditions and feels-like temperature, high and low, rain chance, wind, sunset, and an hourly strip to 22:00 that marks the driest slot left in the day. Type a city or use your location; the choice is remembered in your browser.
- **Race countdown:** optional, with the race name, city and a link to its page (Finishers search built in).
- **Watch export:** Apple Watch (`.workout`, through WorkoutKit), Garmin and other devices (`.fit`), per run, per week or for the whole plan.
- **Other exports:** calendar (`.ics`), plus a format dropdown for the plan itself: spreadsheet (`.csv`) or printable PDF (A4 landscape week-by-day grid with phases, weekly km, run descriptions and plan totals). The dropdown remembers the last format picked.
- **Languages:** English and French (the browser language by default), changed from the gear menu at the end of the header.
- **Themes:** dark "night track" by default, with a light theme or Auto (follows the device) in the gear menu at the end of the header; the choice is remembered on the device. The volt accent marks only today's run and the main button. Cards are told apart by their surface rather than outlines; only the Today card is framed and lifted.
- **Phone layout:** Plan and Settings tabs.
- **Keyboard and screen readers:** messages such as "Plan saved" are announced, dialogs are named by their title, Tab stays inside an open dialog, and closing it returns to the button or run that opened it.

## Where plans are stored

Plans are saved in the visitor's browser (`localStorage`) only. The weather city is stored there too (`bb-wx`). There are no accounts and no server. **My plans → Export** downloads every plan as one JSON file, and **Import** loads it back on any device or browser. Imported files are checked field by field and cleaned before they are stored, so a file from someone else can't inject anything into the page. A saved plan saves itself 1.5 seconds after each change, and right away before another plan replaces it or the tab closes; leaving with a plan that was never saved asks first.

## Tech

- One file for the app: `index.html` (HTML, CSS and JavaScript, no build step), plus vendored third-party code in `vendor/` (see `vendor/README.md`).
- External resources:
  - Google Fonts (Archivo, expanded and heavy, for the brand and big numbers; Inter for everything else)
  - [Open-Meteo](https://open-meteo.com) forecast and geocoding APIs (free, no key), called only once a city or location is set
  - [jsPDF](https://github.com/parallax/jsPDF) 4.2.1 and [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) 5.0.9 from cdnjs, loaded only when exporting a PDF, with integrity hashes: if the CDN serves a different file, the browser refuses it
- Vendored: [`@bibixx/workoutkit`](https://www.npmjs.com/package/@bibixx/workoutkit) 0.2.0 (MIT) in `vendor/workoutkit-0.2.0/`, loaded only when exporting to Apple Watch.
- Content Security Policy (in a `<meta>` tag): scripts only from the page itself and cdnjs, styles from the page and Google Fonts, network requests only to Open-Meteo, no plugins, forms or `<base>` changes. Inline script is still allowed because the app lives in `index.html`; moving it to its own file would let the policy drop `'unsafe-inline'`.
- Hosted on GitHub Pages from the `main` branch, root folder.
- `package.json`, `package-lock.json`, `playwright.config.ts` and `tests/` are for the automated tests only; the page doesn't use them. The lockfile pins the exact test tool versions, so CI and a local run use the same Playwright and axe-core. Dependabot (`.github/dependabot.yml`) opens a weekly pull request for newer test tools and GitHub Actions. To move to newer versions by hand, run `npm update`, set the Playwright container image in `.github/workflows/tests.yml` to the same version (CI stops with a message if they differ), and commit both in a pull request.

## Run locally

Open `index.html` in a browser. Everything works offline except the fonts, which fall back to system fonts, the weather, the Apple Watch export and the PDF export.

To serve it the way the tests and CI do, run `node tests/serve.mjs 8765` and open http://127.0.0.1:8765/. Working on it with Claude Code: see the `.claude/` section in CLAUDE.md (pre-commit test hook, preview config, `/release` command).

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

Every test starts on a frozen date (Friday 6 November 2026, Paris time) with empty storage, so generated plans are the same on every run. Tests that load jsPDF from cdnjs are skipped when `OFFLINE=1` is set.

| File | Covers |
|---|---|
| `plan-generation.spec.ts` | distances, weeks, dates, runs per week, fitness goal, load profile (phase bands, race flag, current week and today), summary numbers (weeks to go, units, French labels) |
| `plan-rules.spec.ts` | phase order, taper length, cutback and taper volume, one race on race day, long-run day, weekly increase, goal readiness, hard runs per week, hard runs back to back or next to the long run and no rest day (on the week and in the banner, also after edits), days in a row and 7 runs a week (setup warnings) |
| `setup-form.spec.ts` | paces, finish time read to fit the race distance, running days, run type chips and Customise workouts, warnings, New plan starting blank |
| `editing.spec.ts` | edit, add, delete and move runs (drag and drop on desktop), hand edits vs settings |
| `today.spec.ts` | Today card before the plan, on a run day and on a rest day, Edit from the card, forecast and driest slot (Open-Meteo mocked), unknown city, failed request |
| `race.spec.ts` | race name, Finishers link, countdown, race passed or today |
| `storage.spec.ts` | save, autosave (also just before New plan or Open), warning on leaving unsaved, rename, delete, JSON export, import of a version 1 file (`tests/fixtures/plans-v1.json`), imported files with markup or broken parts |
| `exports.spec.ts` | CSV, PDF, calendar, Garmin and Apple Watch zips |
| `i18n.spec.ts` | every string in English and French with matching placeholders, language switch |
| `mobile.spec.ts` | Plan/Settings tabs, gear on the brand row and plan name on its own line, 16px fields, tap targets, sideways grid scroll; side-by-side layout on desktop |
| `layout.spec.ts` | nothing sticks out of the page, run colours follow effort (setup chips match the plan grid), gear menu (theme and language hidden until opened, Escape and outside tap close it), theme picker (dark default, light kept after reload, Auto follows the device), volt accent only on today and the main button, no script errors, type (Archivo for the brand and big numbers, Inter elsewhere, capitals only on small labels), cards separated by surface instead of borders with only Today lifted |
| `security.spec.ts` | Content Security Policy present and not broken by the page or either export, WorkoutKit not fetched from a CDN, a tampered jsPDF file refused |
| `a11y.spec.ts` | WCAG 2.1 A/AA checks on each view and dialog, dark and light |

GitHub Actions runs every setup on each push and pull request (`.github/workflows/tests.yml`) and keeps each setup's HTML report for 14 days. Jobs run inside Playwright's own Docker image, which already has the browsers and their system libraries, so nothing is installed through apt. The tests serve the page with a small Node server (`tests/serve.mjs`). `main` is protected: all six setups must pass before a pull request can merge or a push can land, admins included, and force-pushes are blocked. GitHub Pages publishes `main` as soon as it changes, so only tested code goes live.

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

What changed in each version is in [CHANGELOG.md](CHANGELOG.md). The version shown in the page footer is the latest entry there.
