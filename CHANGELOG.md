# Changelog

All notable changes to Block Builder. Format: [Keep a Changelog](https://keepachangelog.com), versioning: [Semantic Versioning](https://semver.org).

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
