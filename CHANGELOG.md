# Changelog

All notable changes to Block Builder. Format: [Keep a Changelog](https://keepachangelog.com), versioning: [Semantic Versioning](https://semver.org).

## [1.5.0] - 2026-11-19

### Changed
- On phones the plan is a list of week cards with a row per day, instead of a wide grid you had to scroll sideways (BB-23). Earlier weeks fold behind "Show N earlier weeks", so this week comes first, outlined; shown again, they are dimmed. Desktop keeps the grid and drag and drop.

## [1.4.1] - 2026-11-19

### Fixed
- Importing a plan you already have no longer overwrites it silently (BB-4). A newer copy in the file replaces yours, the same version is skipped, and if yours was changed more recently it is kept and the file's version is added as "(imported)". The open plan reloads when it is replaced, so autosave can't write over the import.

## [1.4.0] - 2026-11-19

### Added
- Recovery after the race: None (the default), 1 week or 2 weeks, under the race date (BB-42). The plan then carries on after race day with easy weeks: no hard runs, fewer and shorter runs (about 40% then 60% of your biggest week, 30% then 50% after a marathon), nothing in the two days after the race, strides back in the second week. Weeks to go, the race flag and the training weeks don't change; the header, load profile, calendar, spreadsheet and PDF show the recovery weeks.

## [1.3.0] - 2026-11-19

### Added
- "Why this run" for every built-in run type: what the run is for and how it should feel (effort out of 10, talk test). It shows in the run editor (and changes with the type), in the Quick workout sheet, and as a "Run types in this plan" table at the end of the PDF (BB-43).

## [1.2.0] - 2026-11-19

### Added
- Experience level under "Your running now": New to running, Regular or Experienced (BB-49). New runners get no hard runs in the base phase, then one a week at most, a lighter week every 3rd week and shorter easy runs, so week 1 no longer starts above your weekly volume. Experienced runners can have 2 hard runs a week from 4 runs a week when the days leave a gap. Regular builds the plan as before, and plans you saved earlier open as Regular.

## [1.1.33] - 2026-11-18

### Changed
- The Quick workout button under Goal reads "Quick workout", without the arrow.

## [1.1.32] - 2026-11-18

### Added
- Quick workout from the Goal row in the settings: "Just want one session? Quick workout →" sits under "Train for a race" and "Personal plan". It opens the quick workout and leaves your plan's goal as it is (BB-58).

## [1.1.31] - 2026-11-18

### Added
- Quick workout fine-tune takes a **target pace** you type (min:sec per km) for the reps; the watch alerts you around it, even without a race time (BB-58).

### Changed
- Fine-tune stands out: a bordered row with an icon, what it changes, a "Tuned" tag once used, and Reset fine-tune.
- Jog recoveries stay in time when a quick workout is measured by distance.

### Fixed
- On iPhone Chrome, the quick workout (and every other dialog) was taller than the visible screen, so its top and its buttons sat behind the browser bars. Dialogs now fit the visible screen.
- Lowering the reps to 1 in fine-tune no longer hides the reps control.

## [1.1.30] - 2026-11-18

### Added
- Quick workout, step 4 (BB-58): with a plan open, "Also add it to …" (off by default) puts the workout on a day you choose in the plan as well as sending it. It then counts in the plan's weekly checks like any run you add.

## [1.1.29] - 2026-11-18

### Added
- Quick workout, step 3 (BB-58):
  - **Fine-tune:** set the reps, rep length and recovery of a quality workout, in distance or time.
  - **Your paces:** when your plan has no race time (or there is no plan yet), enter a recent race in the sheet. It is kept for quick workouts only and never changes your plan.
  - **Recent:** the last 5 quick workouts you sent come back as chips at the top, one tap to pick again.
  - **Empty plan:** a new, empty plan offers "Just want one session? Build a quick workout".

## [1.1.28] - 2026-11-18

### Added
- Quick workout (BB-58, step 2): build one workout from the run types and send it to your watch without changing the plan. Open it from the plan toolbar, or from "Run anyway?" on a rest day. Choose the type, measure by distance or time (remembered), set the distance or duration for easy runs, or Short / Medium / Long and the target race for quality sessions, with warm-up and cool-down on or off. A live preview shows the distance, estimated time, workout bar and steps before you send it to Apple Watch, Garmin or another device.

## [1.1.27] - 2026-11-18

### Fixed
- Watch export: two runs with the same name on the same day no longer share a file name, so one no longer overwrites the other when the zip is opened; the second gets `-2` (BB-15).

### Changed
- Watch export works from a workout's own title and file name instead of its plan week, ready for single workouts outside a plan (BB-58, step 1). Plan exports look the same.

## [1.1.26] - 2026-11-18

### Changed
- Long run limits (BB-45): the long run is now kept to about 40% of the week (45% at 3 runs a week, 50% at 2), to 2:30 for a half marathon and 3:00 for a marathon at your easy pace, and grows by at most 2 km or 15 minutes (whichever is more) a week. The km it gives up go to the easy runs. A 30 km/week marathon plan, for example, peaks at an 18.5 km long run instead of 22.5 km, and its first long run can start below your current longest run. Plans that were within these limits don't change.

## [1.1.25] - 2026-11-18

### Changed
- The plan engine (paces, plan building, warnings and week checks) now lives in its own file, `engine.js`, next to `index.html` (BB-7). Plans come out the same; the engine is now tested on its own, including the five athlete profiles from the November audit. The page still works opened from disk.

## [1.1.24] - 2026-11-18

### Changed
- Today card as hero (BB-28): today's run leads with its distance in large type and an estimated time, a bar drawing the workout step by step (warm-up, each rep and recovery, cool-down, coloured by effort) and the target paces it uses. **Send to watch** is the main button, named after the device you last used (e.g. "Send to Apple Watch"), with Edit beside it. The forecast folds into one line that opens the full forecast; the open/closed choice is remembered.

### Added
- Heat note on the Today card: when it feels 22° or more at the driest slot left today, easy and tempo paces show 10 s/km slower (20 s/km from 28°) and hard parts are to be run by effort. The watch file keeps the plan paces.

### Fixed
- Before the plan starts, the first run's date on the Today card no longer shows in the large title font.

## [1.1.23] - 2026-11-12

### Changed
- The no-race goal is now called "Personal plan" ("Plan perso" in French) instead of "Get in shape" / "Me remettre en forme" (BB-67): it builds a training plan without a race date. New plans are named "10-week personal plan" / "Plan perso 10 semaines"; saved plans keep their name.

## [1.1.22] - 2026-11-12

### Changed
- Summary numbers above the plan (BB-26): weeks to go (the current week counts, up to race day; before the plan starts, every week), peak week and longest run with "km" after the number, and the race target time as "1h55" (hover for the exact time) labelled "Half marathon target" instead of "equivalent". Total km is gone from the screen; the PDF still lists plan totals.

## [1.1.21] - 2026-11-12

### Changed
- Load profile (BB-25): phases are now shaded bands behind the bars, each labelled (base, build, peak, taper) when it has room, instead of a colour legend; the legend keeps only the long-run line.
- The race week's bar carries a flag, placed on the week that holds the race rather than on the last bar.

### Added
- The current week is marked on the load profile: its number in bold and a dashed line where today falls inside it. Hovering a bar says "this week" or "race week".

## [1.1.20] - 2026-11-12

### Changed
- Fewer lines (BB-31): the countdown, load profile, plan grid, Customise workouts, filled race box and My plans rows lost their 1px outlines, and so did the lines between setup sections and between days in the plan grid (the lines between weeks stay). Cards now stand out by their surface: page, card, then a second level for things inside a card (run type cards, plans in My plans).
- The Today card is the only one lifted, with a soft shadow on top of its volt frame; its weather side is set apart by its tint instead of a line.
- Light theme: the page background is one step darker (#E8EDEB) so white cards read without outlines; text contrast still passes in both themes.
- Buttons, fields, chips, selects and the gear menu keep their borders.

## [1.1.19] - 2026-11-12

### Changed
- New type (BB-22): Archivo, wide and heavy, for the brand, the greeting, the countdown, the summary numbers, the week numbers, the temperature and the run name on the Today card; Inter for everything else, with figures of equal width so distances and paces line up. JetBrains Mono and Barlow are gone (two fonts loaded instead of three).
- Capitals only on small labels (section names, column heads, phases). Titles, run names and dialog headings are now in normal case.

## [1.1.18] - 2026-11-12

### Added
- Spacing checks on the plan as shown, so hand edits count (BB-44). A hard run on the same or the next day as another hard run, the long run or race day (Sunday into the next Monday counts) gets a warning line under its week naming the runs and days; so does a week with runs on all 7 days. The warnings above the plan name the weeks.
- Running-day warnings, shown once instead of on every week: 3 or more running days in a row at 4 runs a week or fewer ("Fri, Sat, Sun are 3 days in a row. Keep the middle one easy..."), running days that leave every run next to the long run, and 7 runs a week (no rest day). When the days chosen make a hard run touch the long run, the weeks aren't flagged for it.

## [1.1.17] - 2026-11-12

### Added
- Hard runs per week are checked on the plan as shown, so hand edits count (BB-57). A week with more hard runs than its runs per week allow (1 at 4 runs or fewer, 2 above) gets a warning line right under it, saying how many there are and to change one to an easy run, plus a line in the warnings above the plan naming the weeks. Generated plans already respect the limit, so this shows up only after edits.

## [1.1.16] - 2026-11-12

### Changed
- Run colours follow effort, cool to hot (BB-21): recovery blue, easy green, long run yellow, steady quality (tempo, progression, race pace, fartlek) orange, hard quality (intervals, hills, custom quality types) red, race day magenta. Used on the run type chips, the plan grid, the Today card and the PDF. Tempo and intervals used to share one pink, and the long run was a cool blue.
- Every run still shows its name next to its colour bar, so nothing relies on colour alone. Text colours pass 4.5:1 in both themes; the light-theme long run bar was darkened to stay above 3:1.
- Weather: rain chance and rain drops use the recovery blue, lightning the yellow (they borrowed the old long-run blue and race gold).

## [1.1.15] - 2026-11-11

### Changed
- Run types in the settings are now compact chips in two groups, Easy and Quality, with a line saying how many are on (BB-24). Tap a chip to switch that run type on or off; Easy run shows a lock because it can't be turned off. The section went from about 960 px to about 300 px tall.
- Names, kind, phases, description templates and Add run type moved into a "Customise workouts" section that starts folded. Inside, the cards are the same as before, minus their tick box (the chip does that now). Open cards stay open when something changes.

## [1.1.14] - 2026-11-11

### Added
- Goal readiness warning for half and full marathons (BB-40): when the longest run before race day is under about 60% of a half (75% of a marathon), or the biggest week is under about 30 km (45 km), the plan says how far it peaks, what the race usually needs, and suggests more weeks or the Get in shape goal. Checked on the plan as shown, so hand edits count. Not shown for the Get in shape goal or shorter races.

## [1.1.13] - 2026-11-10

### Changed
- Theme and language moved out of the header into a gear menu at its end (BB-61). The header now leads with the plan name, My plans, New plan and Save; on phone the brand and gear share the first row and the plan name gets its own line instead of being cut to "Half marat…".
- Theme is a Dark / Light / Auto switch (one tap, no native picker) with a hint that Auto follows the device; "Auto (device)" shortened to "Auto".
- The menu closes on Escape (focus back to the gear) or a tap outside; the language select is labelled by a visible "Language" label.

## [1.1.12] - 2026-11-10

### Changed
- Dark "night track" colour scheme is now the default, whatever the device setting. A single volt accent (#D4FF3A) marks only today's run and the main button; the brand mark, countdown, focus ring and selected items use the text colour instead of orange (BB-20).
- Light theme kept as a deliberate choice: the volt fills the main button with dark text, and lines in the accent use olive (#557000) to stay readable on light backgrounds.

### Added
- Theme picker in the header: Dark, Light, or Auto (follows the device). Remembered on the device (`bb-theme`), applied before the page paints so there is no flash.

## [1.1.11] - 2026-11-09

### Changed
- The language picker in the header is a dropdown (English / Français) instead of two EN/FR buttons. On phones and tablets it uses 16px text, so iOS doesn't zoom in when you tap it. Tests updated, plus a new check that the dropdown shows the current language and switches back to English.

## [1.1.10] - 2026-11-09

### Fixed
- Taper long runs scale from the longest run actually built before the taper (75%, then 60%), not from the target peak (19 km for a half, 32 km for a marathon). Plans that start from low volume never reach that target, so their taper long run could be longer than any run before it: a half at 3 runs and 15 km/week peaked at 12 km and got 14.5 km in taper week 1 (59% of the week); a marathon at 4 runs and 30 km/week peaked at 22.5 km and got 24 km. They now get 9 km and 17 km. Plans that reach the target peak are unchanged.
- Tests: new check that taper long runs stay below the peak long run and step down, across the rule scenarios and two low-volume plans. It failed on the previous version for the half above and for the existing 3-run marathon scenario.

## [1.1.9] - 2026-11-09

### Security
- jsPDF and jsPDF-AutoTable load from cdnjs with Subresource Integrity (sha512, matching the hashes cdnjs publishes). A changed or tampered file is refused and the PDF export says it couldn't load.
- The WorkoutKit encoder (`@bibixx/workoutkit` 0.2.0, MIT) is vendored in `vendor/workoutkit-0.2.0/` instead of being imported from jsDelivr. Apple Watch export no longer needs a CDN.
- A Content Security Policy in a `<meta>` tag: `default-src 'none'`; scripts from the page and cdnjs; styles from the page and Google Fonts; fonts from Google Fonts; network requests only to the Open-Meteo forecast and geocoding APIs; no plugins, forms or `<base>`. Inline script stays allowed until the app moves out of `index.html` (BB-7).
- Tests: new `security.spec.ts` (policy present, no violations during load, PDF and Apple Watch export, no jsDelivr request, tampered jsPDF refused). The Apple Watch export test no longer needs a connection.

## [1.1.8] - 2026-11-09

### Fixed
- Weekly mileage could rise 13 to 19% on the week before (worst after a cutback week), because each run is rounded to 0.5 km and has a minimum distance. Each built week is now trimmed back to +10% of the last full week: easy runs first (0.5 km at a time, longest first, down to 4 km, recovery 3 km), then the hard runs, then the long run. Across 3,528 setting combinations, weeks over the cap went from 5,541 (worst +217%) to 159 (worst +31%), all with every run at its minimum.

### Added
- A warning names the weeks that still rise more than 10%: with every run at its shortest, it suggests fewer runs per week; after a hand edit, it suggests shortening a run.
- Tests: the +10% check is no longer an expected failure; three new checks for the warning.

## [1.1.7] - 2026-11-09

### Fixed
- Switched-off run types (Fartlek and Progression by default) are no longer faded to 80% opacity, which put their grey summary line below the 4.5:1 contrast minimum. The card now gets the darker surface and a grey name; all its text stays at 4.8:1 or more in light and dark themes.
- Rest-day cells were announced as "+ Add run" while showing "Rest + Add run". They are now announced with what they show, plus the week and day ("Rest + Add run · Week 1 · Wed").
- Tests: no accessibility issues are let through any more (the `KNOWN` list is empty); a new check covers the rest-day name.

## [1.1.6] - 2026-11-09

### Added
- Messages (saved, exported, errors) appear in a polite status region, so screen readers announce them. Before, they were silent.
- Dialogs are named by their heading (for example "My plans", "Week 1 · Mon").
- Tab and Shift+Tab cycle inside an open dialog instead of reaching the page behind it, including in Safari, which skips buttons on Tab by default.
- Closing a dialog (Escape, Cancel, Save, clicking outside) puts focus back on the control that opened it. After saving a run, focus lands on that run even though the grid is redrawn.
- Tests: five checks for the status region, dialog names, the Tab trap and focus return.

## [1.1.5] - 2026-11-09

### Changed
- Notes are labelled "Note" instead of "Coach" on the plan grid, in the PDF and calendar exports, and in the CSV header ("Note" instead of "Coach note" / "Conseil du coach"). The Rebuild warning says "notes" instead of "coach notes".

### Removed
- Leftovers from the claude.ai version that could never show here: coach-note and Claude access messages, the "storage connecting" and "can't save to this page" messages, claude.ai download error codes, and the viewer avatar and colour on the Today card.
- Tests: a translation check fails if any string mentions Claude or a coach.

## [1.1.4] - 2026-11-08

### Fixed
- iPhone: tapping a run-type template, a run's description or note, or the export format dropdown no longer zooms the page in. Those fields were 13.5px and 13px on touch screens because their own font rules came after the 16px touch-screen rule; a later rule now sets them to 16px.
- Tests: the text-area check is no longer an expected failure, and it now covers the export dropdown too.

## [1.1.3] - 2026-11-08

### Fixed
- Recent race finish time is read to fit the race distance. "1:45" for a half marathon and "3:30" for a marathon mean hours and minutes, a lone number means minutes ("52" for a 10K), and mm:ss stays mm:ss when it fits ("25:00" for a 5K). The field then shows the reading in full (1:45:00). Before, "1:45" was read as 1 min 45 s and the paces silently fell back to effort descriptions.
- A time that fits no reading for the chosen race is flagged in the warnings and the pace hint, with an example, instead of being treated as no time.

## [1.1.2] - 2026-11-07

### Security
- Imported plan files are checked field by field before they are stored or shown: numbers must be numbers, phases, run kinds and ids come from fixed lists, and race links must be http(s). A shared file can no longer run script on the page. Plans already in the browser are checked the same way when read.

### Fixed
- A change made in the 1.5 seconds before New plan, opening another plan, closing the tab or switching apps is now saved instead of lost.
- Leaving the page with a plan that was never saved asks first.
- A plan file with missing or broken parts (a week without runs, a run on an unknown day, a broken watch workout) opens instead of breaking the page.
- Tests: CI no longer kills apt while it installs browser libraries, which left the package lock held and failed every retry. The Today card tests accept WebKit's "Mon, 9 Nov" date format.

## [1.1.1] - 2026-11-06

### Fixed
- iPhone (Safari and Chrome): the race date field no longer overflows onto Weeks of training. Date inputs drop the native iOS styling that forced a minimum width, and setup rows use columns that can shrink.
- iPhone: opening a run no longer pops the run type picker open. Popups now focus the dialog itself instead of their first field.
- Tests: the footer version test and the "New plan starts blank" tests never opened the page, so they always failed.

## [1.1.0] - 2026-11-06

### Added
- 1 and 2 runs per week (default days: Sunday; Thursday and Sunday).
- Version number in the page footer, from a single `VERSION` constant.
- A message listing what is missing (runs per week, weekly volume, longest run) instead of a half-built plan.

### Changed
- New plan starts blank: weekly volume, longest run, recent race, finish time, runs per week, running days and long run day are empty, and only Easy run is ticked.
- The long run type can be unticked; that day then becomes an easy run.
- Save plan is refused until the required fields are filled in.
- "No quality run types ticked" warning reworded.

## Before 1.1.0 - 2026-11-06

Unversioned releases, the same day as 1.1.0.

### Added
- Today card above the load profile: today's run (or the next one) and the local forecast with the driest slot left in the day.
- Export the plan as PDF or CSV from a format dropdown (replaces the Export CSV button).
- First standalone release: coach notes removed; plans saved in the browser only, with JSON export and import; plain file downloads.

### Fixed
- Design QA: Plan/Settings tabs on phone, lighter header, 16px form fields on touch screens, visible rest days, compact week watch button.
