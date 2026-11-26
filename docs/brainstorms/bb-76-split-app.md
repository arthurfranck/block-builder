# BB-76: split src/app.js by feature

**Problem.** `src/app.js` was one 4,851-line module (main at 5b4442d): 17 sections, about 270 top-level names (counted after the split: 271 across the interface modules), every string in English and French. ADR 0008 decided one ES module per feature, moved one section at a time behind the tests. BB-80 (one state), BB-81 (strict types) and BB-87 (deploy from CI) wait on it.

**Facts measured before moving** (scope analysis of the file, script kept in the PR as `scripts/outline.mjs` + `split-module.mjs`):
- Only 4 variables were assigned outside their section: `LANG`, `DAYS`, `DAYS1` (language switch) and `RUN_UNIT` (km or minutes). Setters fix that (`useLang`, `useRunUnit`).
- Code that runs at load (event wiring, a few calls) sits in most sections, 42 statements in all (scope analysis of main at 5b4442d), most of them in the last section.
- Sections call each other a lot (plan view, setup, storage, quick workout), so modules will import each other in cycles.

**Options.**
- **By hand.** Hundreds of import lines to write and keep right; mistakes show only at run time.
- **A script that moves a range and recomputes imports and exports.** Chosen. eslint-scope (already installed through ESLint) gives each module's declared and used names; the script imports each used name from the one module that declares it and exports exactly what others import. Reusable on any folder of ES modules; BB-80 can use it too.

**Load order.** With cycles, top-level code in a module can run before a module it needs. So feature modules only declare; their load-time code goes into `init<Feature>()`, called from `src/app.js` where the code used to be (the script's `--init`). Recorded as ADR 0012.

**Steps (one commit each, the Chrome suite run by the pre-commit hook at each):**
1. Unwrap the IIFE; setters.
2. strings, i18n, state, engine-api, prefs, dom.
3. The features: setup, plan-view, weather, workout, today, quick, race, plan-edit, modal, editor, watch, fit, exports, plan-file, storage, intro, sheet, prefs panel; effort helpers out of setup.

**Not in scope.** Breaking the cycles (BB-80), strict types (BB-81), splitting strings into en/fr files (one `I18N` object is what `t()` and the tests read; no gain yet).
