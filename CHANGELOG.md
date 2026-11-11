# Changelog

All notable changes to Block Builder. Format: [Keep a Changelog](https://keepachangelog.com), versioning: [Semantic Versioning](https://semver.org).

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
