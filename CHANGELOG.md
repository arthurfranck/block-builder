# Changelog

All notable changes to Block Builder. Format: [Keep a Changelog](https://keepachangelog.com), versioning: [Semantic Versioning](https://semver.org).

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
