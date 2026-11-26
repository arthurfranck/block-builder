# 0011. Fonts served from the repo, not Google Fonts

- Status: Accepted
- Decided: 2026-11-26, BB-89 (brainstorm: `docs/brainstorms/bb-89-vendor-fonts.md`)

## Context
The page loaded Archivo and Inter from Google Fonts: a stylesheet from `fonts.googleapis.com`, then files from `fonts.gstatic.com`. Every first visit told Google the visitor's IP, the type fell back to system fonts offline, and the visual snapshots (ADR 0009) had to block Google, so their images showed other fonts than the live page.

## Decision
- The woff2 files live in `fonts/` with each family's OFL licence, and `@font-face` rules sit in `index.html` between `/* fonts:start */` and `/* fonts:end */`.
- `scripts/fetch-fonts.mjs` writes both: it downloads the files Google serves for the page's css2 query, keeping the `latin` and `latin-ext` subsets, and merges weights that share a variable file into one rule. Changing weights or updating the fonts means rerunning it, never editing the rules by hand.
- The CSP allows fonts only from the page (`font-src 'self'`) and styles no longer from Google.

## Alternatives considered
- **Keep Google Fonts.** No files in the repo, but the outside request, the offline fallback and the snapshot gap stay.
- **Fontsource npm packages.** Updated by Dependabot, but cut differently from what the page used, and a copy step on top of a dependency.
- **All of Google's subsets.** Cyrillic, Greek and Vietnamese would keep the real type in names typed in those scripts, for about three times the files; the interface itself is English and French.

## Consequences
- Good: opening the page reaches no outside host until a city, the PDF export or the weather needs one.
- Good: offline and `file://` show the real type; visual snapshots can use it.
- Cost: about 200 KB of fonts in the repo; updates are by hand (rerun the script), not automatic.
- Cost: text in scripts outside `latin` / `latin-ext` shows in the system font.

## Revisit when
- The interface gains a language outside the Latin script.
- A font upgrade is wanted (rerun the script, refresh the visual baselines).
