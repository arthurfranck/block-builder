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

## Run locally

Open `index.html` in a browser. Everything works offline except the fonts, which fall back to system fonts, the Apple Watch export and the PDF export.

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
