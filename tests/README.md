# Block Builder tests

Browser tests use [Playwright](https://playwright.dev) and [axe-core](https://github.com/dequelabs/axe-core-npm) for accessibility, and run on six setups. The plan engine (`engine.js`) also has Node unit tests in `engine/` (no browser): paces, watch workouts, and the five athlete profiles from the November audit checked against the plan rules (taper length, cutbacks, +10% a week, hard runs per week and their spacing, nothing hard near race day, long run share, duration and growth).

`package.json`, `package-lock.json`, `playwright.config.ts` and this folder are for the tests only; the page doesn't use them.

## Run them

```sh
npm ci                 # exact versions from package-lock.json
npx playwright install chromium webkit
npm test               # engine unit tests, then all six browser setups
npm run test:engine    # engine unit tests only (Node, no browser)
npm run test:desktop   # or test:mobile, test:chrome
npm run test:report    # open the last HTML report
```

Every test starts on a frozen date (Friday 6 November 2026, Paris time) with empty storage, so generated plans are the same on every run. Tests that load jsPDF from cdnjs are skipped when `OFFLINE=1` is set. The page is served by a small Node server, `serve.mjs` (`node tests/serve.mjs 8765`).

## Browser setups

| Setup | Engine | Screen |
|---|---|---|
| `desktop-chrome` | Chromium | 1440×900 |
| `desktop-safari` | WebKit | 1440×900 |
| `iphone-16-safari` | WebKit, touch | 393×659 |
| `iphone-16-pro-max-safari` | WebKit, touch | 440×763 |
| `iphone-16-chrome` | WebKit, Chrome for iOS user agent | 393×659 |
| `iphone-17-pro-max-safari` | WebKit, touch | 440×763 |

Every iOS browser, Chrome included, runs on WebKit, so the iPhone Chrome setup checks Safari's engine with Chrome's user agent. The iPhone setups simulate screen size and touch; they are not real devices.

## What each file covers

| File | Covers |
|---|---|
| `engine/engine.unit.mjs` | paces, watch workouts, the five athlete profiles against the plan rules at each experience level, what each level changes (BB-49), recovery weeks after the race (BB-42), week 1 within the stated volume (BB-41) |
| `plan-generation.spec.ts` | distances, weeks, dates, runs per week, fitness goal, load profile (phase bands, race flag, current week and today), summary numbers (weeks to go, units, French labels), recovery weeks after the race |
| `plan-rules.spec.ts` | phase order, taper length, cutback and taper volume, one race on race day, long-run day, weekly increase, goal readiness, hard runs per week, hard runs back to back or next to the long run and no rest day (on the week and in the banner, also after edits), days in a row and 7 runs a week (setup warnings), week 1 against the volume run now |
| `setup-form.spec.ts` | paces, finish time read to fit the race distance, running days, run type chips and Customise workouts, warnings, New plan starting blank, experience level choice, setup steps on phones and sections on desktop |
| `editing.spec.ts` | edit, add, delete and move runs (drag and drop on desktop), hand edits vs settings, "why this run" line in the editor |
| `today.spec.ts` | Today card before the plan, on a run day and on a rest day, Edit from the card, workout bar, paces, heat note, Send button naming the last device, one-line weather that opens and is remembered, forecast and driest slot (Open-Meteo mocked), unknown city, failed request |
| `quick.spec.ts` | quick workout sheet: default tempo and preview, size and target race, distance or time (remembered), easy stepper, warm-up off, Send file name and the plan left alone, rest-day link, French, fine-tune, own paces kept out of the plan, Recent chips, empty plan entry, add to plan, reps down to 1, recoveries in time, typed target pace, the sheet fits the screen, Goal row entry, "why this run" line |
| `race.spec.ts` | race name, Finishers link, countdown, race passed or today |
| `storage.spec.ts` | save, autosave (also just before New plan or Open), warning on leaving unsaved, rename, delete, JSON export, import of a version 1 file (`fixtures/plans-v1.json`), imported files with markup or broken parts, recovery weeks saved, importing a plan that is already here |
| `exports.spec.ts` | CSV, PDF, calendar, Garmin and Apple Watch zips, two same-name runs on one day kept apart, PDF run types table |
| `i18n.spec.ts` | every string in English and French with matching placeholders, language switch |
| `mobile.spec.ts` | Plan/Settings tabs, gear on the brand row and plan name on its own line, 16px fields, tap targets, week cards with no sideways scroll and folded earlier weeks; side-by-side layout and the week grid kept on desktop |
| `layout.spec.ts` | nothing sticks out of the page, run colours follow effort (setup chips match the plan grid), gear menu (theme and language hidden until opened, Escape and outside tap close it), theme picker (dark default, light kept after reload, Auto follows the device), volt accent only on today and the main button, no script errors, type (Archivo for the brand and big numbers, Inter elsewhere, capitals only on small labels), cards separated by surface instead of borders with only Today lifted |
| `security.spec.ts` | Content Security Policy present and not broken by the page or either export, WorkoutKit not fetched from a CDN, a tampered jsPDF file refused |
| `file.spec.ts` | the page opened from disk (file://) loads the engine and builds a plan |
| `a11y.spec.ts` | WCAG 2.1 A/AA checks on each view and dialog, dark and light |

## Continuous integration

GitHub Actions runs every setup on each push and pull request (`.github/workflows/tests.yml`) and keeps each setup's HTML report for 14 days. Jobs run inside Playwright's own Docker image, which already has the browsers and their system libraries, so nothing is installed through apt. `main` is protected: all six setups must pass before a pull request can merge or a push can land, admins included, and force-pushes are blocked. GitHub Pages publishes `main` as soon as it changes, so only tested code goes live.

## Test tool versions

The lockfile pins the exact test tool versions, so CI and a local run use the same Playwright and axe-core. Dependabot (`.github/dependabot.yml`) opens a weekly pull request for newer test tools and GitHub Actions. To move to newer versions by hand, run `npm update`, set the Playwright container image in `.github/workflows/tests.yml` to the same version (CI stops with a message if they differ), and commit both in a pull request.

## Known issues

The suite found these when it was written. The tests let them through so that new problems still stand out, and they flag it when one gets fixed.

Marked `test.fail` (the test passes while the issue exists, and reports an unexpected pass once it's fixed: then remove the `test.fail` line): none at the moment.

Listed in `KNOWN` in `a11y.spec.ts` (once fixed, "the known issues are still there" fails: remove the id from `KNOWN`): none at the moment.

Remove the matching bullet here as well.
