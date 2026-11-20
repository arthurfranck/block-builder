# BB-66: app script out of index.html, CSP without 'unsafe-inline', @ts-check

**Problem.** The app was a ~1,500-line inline `<script>` in `index.html`, plus a small theme script in `<head>`. The CSP had to allow `script-src 'unsafe-inline'`, so an injected script would run, and nothing type-checked the page.

**Options.**
- ES modules (`app.js`, `exports.js`, … with `import`). Clean boundaries, but modules don't load from `file://`, and the README promises the page opens from disk (`tests/file.spec.ts`).
- One classic `app.js` (same closure, moved as is), plus a classic `theme.js` in `<head>` so the theme is still set before first paint. Keeps `file://`.
- Keep the theme script inline with a CSP hash. Fragile: any edit changes the hash.
- Further split of `app.js` into several classic files: needs shared globals between files; not worth it until there is a reason.

**Chosen.** Classic `app.js` and `theme.js`, CSP `script-src 'self' https://cdnjs.cloudflare.com`. A security test checks the policy and that the page has no inline script or `on…=` handler.

**Type checking.** `// @ts-check` on `app.js`, enforced by `tsconfig.app.json` (non-strict) in `npm run typecheck` and CI. Strict would mean hundreds of implicit-any errors in an untyped script. Non-strict found 33 errors: missing DOM element types (fixed with a `$$` helper and JSDoc casts), Date arithmetic, `S.inputs` typing, and a real duplicate: `secRace` was declared twice in both `I18N.en` and `I18N.fr` (same values, harmless).

**Later.** Strict mode for `app.js` with JSDoc types for the state; type `BBEngine` (now `any` in `types/globals.d.ts`); check `engine.js` too.
