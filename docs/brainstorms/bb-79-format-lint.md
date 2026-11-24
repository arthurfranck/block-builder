# BB-79: formatter and linter

**Problem.** `app.js` had 260 lines over 160 characters (the longest 2,218) and `engine.js` 29. Diffs are hard to review, and the split into modules (BB-76) would mix moved code with reflowed code in one unreadable diff. Nothing checked for unused code or undefined names.

**Options.**
1. **Prettier and ESLint**, the default pair: Prettier owns layout, ESLint (recommended rules) owns correctness. Two dev dependencies plus `globals` and `@eslint/js`.
2. **Biome**: one tool and faster, but fewer rules, and the team (AI agents included) knows the ESLint ecosystem best.
3. **ESLint only, with style rules**: style rules are deprecated in ESLint core.

**Decided (2026-11-24).** Option 1.
- **Width 120**, measured on a scratch copy: at 100, 120 and 160 the result is the same about 100 long lines, because Prettier never rewraps text inside strings or template literals. 120 reads well in GitHub diffs and keeps the file shorter than 100.
- **What stays over 160:** 23 French and English prose strings (splitting them hurts translation), and about 78 lines of HTML in template literals. BB-78 replaces those templates with a helper, so wrapping them by hand now would be thrown away.
- **Scope:** Prettier on `app.js`, `engine.js`, `theme.js` and the ESLint config. ESLint also on `tests/engine/*.mjs`. The Playwright tests (single quotes, their own style) are left for a later item, so this diff stays the page scripts only.
- **ESLint for modules from the start (ADR 0008):** flat config, `src/**/*.js` and `*.mjs` as modules; today's page scripts as classic scripts until BB-86.
- **Kept as house style:** empty `catch (_) {}` around storage calls (allowed explicitly).
- **What lint found:** 13 unused engine imports in `app.js`, a few dead variables and redundant first values, a raw no-break space in a regex (now escaped), and one real bug: `engine.js` called `nextMonday()`, which only existed in `app.js`. It worked in the page because classic scripts share one global scope, but a Personal plan with no start date crashed in Node and would crash once the engine is a module. The engine now has its own `nextMonday`, exported, and the app uses it; a Node test covers it.
- **Where it runs:** `npm run lint` and `npm run format:check` in the CI static checks job and in the pre-commit hook, before the Chrome tests.
