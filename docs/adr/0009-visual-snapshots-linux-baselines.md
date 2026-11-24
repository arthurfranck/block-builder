# 0009. Visual snapshots on two setups, with Linux baselines made in CI

- Status: Accepted
- Decided: 2026-11-24, BB-85 (brainstorm: `docs/brainstorms/bb-85-visual-snapshots.md`)

## Context
The refactors planned under ADR 0008 (BB-76 split by feature, BB-78 safe rendering, BB-82 CSS tokens) move markup and CSS without meaning to change the look. The behaviour specs would not notice a shifted margin or a lost class. ADR 0006 left open which setups visual snapshots should run on. Screenshots depend on the OS, its fonts and the browser build: CI runs Linux in Playwright's pinned Docker image, while local work happens on macOS without Docker.

## Decision
- `tests/visual.spec.ts` compares the main screens with `toHaveScreenshot`: plan view (dark and light), settings on the phone (dark and light), run editor, My plans, watch dialog, quick workout sheet, display and language panel.
- It runs on `desktop-chrome` and `iphone-16-safari` only (one Chromium desktop, one WebKit phone); the other four setups ignore it.
- Committed baselines are Linux images, made by `.github/workflows/visual-baselines.yml` in the same image as the Tests jobs. The spec is skipped on other systems; `VISUAL_LOCAL=1` runs it against local macOS baselines, which git ignores.
- Every outside request is blocked during the spec (fonts, weather, CDN), the date is frozen and the footer version is replaced, so images change only when the page does.

## Alternatives considered
- **Baselines for Linux and macOS.** Local runs would compare too, but the macOS set drifts with each macOS or font update on one machine.
- **A hosted visual service (Percy, Chromatic, Argos).** Better review UI, but an account, a token and uploads to a third party.
- **All six setups.** About three times the images for little more coverage: the four iPhone setups share WebKit and two share a viewport.

## Consequences
- Good: a refactor that changes the look fails CI with a diff image in the report.
- Cost: a deliberate look change needs one more step: run Visual baselines on the branch, download the artifact, commit the images in the same PR.
- Cost: images use the Docker image's system fonts, not Archivo and Inter (Google Fonts is blocked); `layout.spec.ts` still checks the font choice.
- Cost: a Playwright upgrade can change rendering, so the Dependabot PR may need fresh baselines.

## Revisit when
- Baselines need regenerating so often that the extra step slows delivery.
- The fonts are vendored (then the images can use them).
