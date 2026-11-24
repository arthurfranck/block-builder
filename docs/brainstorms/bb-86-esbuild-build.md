# BB-86: add the esbuild build (ADR 0008 step 1)

Input: `bb-75-interface-architecture.md` and ADR 0008 (option B, bundle committed first). This note records the implementation choices.

- **Layout.** `app.js` → `src/app.js`, `engine.js` → `src/engine.js`, in a first commit that only moves them (still classic scripts loaded from `src/`), so `git log --follow` keeps their history: the module conversion re-indents the whole engine, and git would no longer match it. `theme.js` stays a classic script at the root: it must run in `<head>` before the page paints, and it is three lines.
- **The bundle includes the engine.** `src/app.js` imports `./engine.js`; esbuild writes one IIFE to `app.js` with `app.js.map`. `index.html` now loads two scripts (theme, app) instead of three.
- **ES modules for Node too.** `src/package.json` has `"type": "module"`, so the engine tests `import * as E from '../../src/engine.js'` directly. Setting it in the root `package.json` instead would turn the Playwright tests into ES modules (`__dirname` breaks), for no gain.
- **Not minified yet.** ADR 0008 expects a minified bundle. While the bundle is committed, every PR shows its diff, so step 1 keeps it readable; minify when Pages deploys from CI (BB-87).
- **Vendor stays out.** The Apple Watch export imports `./vendor/workoutkit-0.2.0/*` on demand; `--external:./vendor/*` keeps that a runtime import resolved from the page folder. esbuild then adds a few unused interop helpers; minifying removes them.
- **Same output everywhere.** The lockfile pins esbuild 0.28.2 and records its binary for every platform; two builds give identical bytes, and the map's paths are relative (`src/app.js`).
- **Checks.** CI static checks: build, then `git diff --exit-code -- app.js app.js.map`. The pre-commit hook rebuilds and blocks the commit if that changed the bundle. ESLint lints `src/` as modules and ignores the bundle; Prettier formats `src/*.js`.
- **Types.** `tsconfig.app.json` checks `src/app.js`, which now imports the engine. The engine's inferred (untyped) shapes would surface as errors in the app, so the app keeps seeing it as `any`, as it did through `declare const BBEngine: any`; BB-70 types the engine.
