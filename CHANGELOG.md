# Changelog

All notable changes to Block Builder. Format: [Keep a Changelog](https://keepachangelog.com), versioning: [Semantic Versioning](https://semver.org).

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
