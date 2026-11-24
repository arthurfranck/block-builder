# BB-85: visual snapshot tests

**Problem.** BB-76 (split app.js), BB-78 (safe rendering) and BB-82 (CSS tokens) move a lot of markup and CSS without meaning to change the look. The current specs check behaviour, structure and a few computed styles, so a refactor that shifts spacing, drops a class or reorders CSS can pass every test while the page looks different.

**Constraint.** Screenshots depend on the OS, its fonts and the browser build. CI runs on Linux in Playwright's pinned Docker image; this laptop is macOS with no Docker. A baseline made on one never matches the other.

**Options.**
1. **Linux baselines only, made in CI.** A workflow runs the visual spec with `--update-snapshots` in the same image as the tests and uploads the images; they are committed from that artifact. Locally the spec is skipped (or run against local, uncommitted macOS baselines with `VISUAL_LOCAL=1`).
2. **Baselines for both Linux and macOS.** Local runs compare too, but the macOS files drift with every macOS or font update on one machine, and two sets must be kept in step.
3. **A hosted visual service (Percy, Chromatic, Argos).** Good review UI, but an account, a token and outside uploads for a small static app.

**Decided (2026-11-24).** Option 1, written down in ADR 0009.
- Setups: `desktop-chrome` and `iphone-16-safari` only (one Chromium, one WebKit phone), as the backlog item says. That answers ADR 0006's open question.
- Screens: plan view (dark and light), settings (dark and light), run editor, My plans, watch dialog, quick workout sheet, display and language panel. Desktop plan view and settings are one page side by side, so phones get both separately.
- Determinism: date frozen (the shared fixture), every outside request blocked (Google Fonts, Open-Meteo, cdnjs) so the page uses the system fonts in the pinned image, animations off and caret hidden (Playwright defaults for `toHaveScreenshot`). Font choice is still checked by `layout.spec.ts`.
- Baselines: `.github/workflows/visual-baselines.yml`, run by hand (`workflow_dispatch`) or by a branch push whose commit message contains `[snapshots]`; it uploads `tests/visual.spec.ts-snapshots/`. A deliberate look change = run it, download, commit the images in the same PR.
