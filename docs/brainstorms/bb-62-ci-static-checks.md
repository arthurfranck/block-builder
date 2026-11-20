# BB-62: CI static checks

**Problem.** Nothing type-checks the tests, and dependency advisories are only seen when someone runs `npm audit` by hand (2026-11-11 audit: imports 5/10).

**Options.**
- Type-check everything (`tests/**/*.ts`, `.mjs`, the page). The `.mjs` engine tests give ~70 implicit-any errors under strict and the page is an inline script, so it is a much bigger job.
- Type-check the Playwright tests (`tests/*.ts`, `playwright.config.ts`) now; the page comes with `// @ts-check` once its script is a file (BB-66).
- Audit inside each of the six test jobs, or once in a separate job.

**Chosen.** Strict `tsc -p .` (no emit) on the TypeScript tests only, plus `npm audit --audit-level=high`, both in one separate `static checks` job so the six browser jobs stay unchanged. TypeScript 7.0.2 pinned in the lockfile as a dev dependency.

**Later.** `// @ts-check` on the app script (BB-66). Type-checking `tests/engine/*.mjs` would need JSDoc types for `BBEngine`.
