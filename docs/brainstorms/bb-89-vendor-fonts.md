# BB-89: serve Archivo and Inter from the repo

**Problem.** The page loads its two typefaces from Google Fonts: one stylesheet from `fonts.googleapis.com`, then the font files from `fonts.gstatic.com`. That is an outside request on every first load (Google sees the visitor's IP), the type falls back to system fonts offline or from `file://` without a network, and the visual snapshots (BB-85, ADR 0009) block Google Fonts, so the baselines show the Docker image's system fonts instead of the real ones.

**What Google serves today** (css2 query `Archivo:wdth,wght@125,700;125,800` + `Inter:wght@400;500;600;700`): variable woff2 files cut by script subset. Each family uses one file per subset for every weight asked, so the whole set is 2 families × 7 subsets.

**Options.**
- **Fontsource npm packages** (`@fontsource-variable/*`): one more dependency and a copy step; the files are cut differently from what the page uses now, so the look could shift.
- **The exact files Google serves now, fetched by a script.** Chosen. Same bytes as the live page, so the only look change in the snapshots is "real fonts instead of system fonts".

**Which subsets.** `latin` and `latin-ext` only. The interface is English and French (all in `latin`); `latin-ext` covers names with other Latin accents. Cyrillic, Greek and Vietnamese typed in a plan name fall back to the system font (today Google would serve them). Four files, about 200 KB in all, loaded only for the characters on screen (`unicode-range`).

**How.**
- `scripts/fetch-fonts.mjs` reads the css2 query and subsets from its top, downloads the CSS and the woff2 files into `fonts/` (`archivo-latin.woff2`, …), fetches each family's `OFL.txt` from github.com/google/fonts, and rewrites the `@font-face` block in `index.html` between `/* fonts:start */` and `/* fonts:end */` (one rule per file, weight as a range). Rerun it to change weights or update the fonts.
- `index.html`: the `<link>` tags go; CSP becomes `font-src 'self'` and `style-src` drops `fonts.googleapis.com`.
- `tests/serve.mjs` serves `.woff2` as `font/woff2`.

**Proof.**
- `layout.spec.ts` checks no request leaves for Google, the `@font-face` rules point at `fonts/`, and `document.fonts` reports Archivo and Inter loaded (not just named in CSS).
- Security spec: CSP has no Google hosts.
- Visual baselines regenerated in CI with the real fonts; ADR 0009 gets a note (its "Revisit when" named this).

**Reusable.** The script takes no project-specific values beyond the query and subsets at its top, so another tool can copy it. Not shared across repos (same as `check-workflows.mjs`).
