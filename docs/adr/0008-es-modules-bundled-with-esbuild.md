# 0008. ES modules bundled with esbuild, deployed from a CI build

- Status: Accepted
- Decided: 2026-11-23, BB-75 (options in [the BB-75 brainstorm](../brainstorms/bb-75-interface-architecture.md))
- Supersedes: [0001](0001-no-framework-no-build.md) (no build step) and [0002](0002-classic-scripts-for-file-protocol.md) (classic scripts for `file://`)

## Context
`app.js` is one 1,525-line, 159 KB classic script in a single closure: 18 sections, 14 `render…` functions, 136 top-level functions, and every English and French string in one object. It is well tested, but it can't grow cleanly. There are no imports, every function can reach every variable, and type checking can't be strict. Four backlog items wait on a structure (BB-76 split, BB-78 safe rendering, BB-80 state and render, BB-81 strict types). ADRs 0001 and 0002 traded structure for zero tooling and opening from disk. That trade no longer pays.

## Decision
- **Source** moves to `src/` as ES modules with explicit `import`/`export`, one module per feature (i18n, storage and import, setup form, plan view, Today and weather, editing, each export, quick workout). `engine.js` becomes a module too, imported by the app and directly by the Node tests.
- **esbuild** (one dev dependency) bundles `src/` into a single classic script (IIFE) with a source map. Because the bundle is a classic script, the built page still opens from disk, and the CSP stays as it is (no inline script).
- **Deploy, end state:** the bundle is not committed. GitHub Pages deploys from a GitHub Actions build of `main` after the tests pass. The tests run against the built output.
- **Transition, in this order:**
  1. Add the build with the bundle committed at its current path (`app.js`), so Pages keeps publishing the branch unchanged, and CI fails if the committed bundle differs from a fresh build.
  2. Move the code into modules section by section, behind the existing tests (BB-76).
  3. Switch Pages to deploy from the CI build and stop committing the bundle.

  The deploy and the code structure never change in the same step.
- **No component library now.** esbuild compiles JSX, so a small library (Preact or Lit) can come in later one view at a time, if template strings still hurt after the split.

## Alternatives considered
- **Several classic scripts, no build.** Smallest change, and `file://` works from a checkout. But dependencies stay implicit (load order and shared globals), nothing enforces boundaries, and each script tag needs its own `?v=`.
- **Modules plus Preact or Lit now.** Escaping by default and a cleaner render model, but all 14 render functions get rewritten up front, plus a runtime dependency, before there is a proven need.
- **A framework app (React or Svelte with Vite).** Out of proportion for one page with no server.
- **Keep the bundle committed for good.** Keeps "open `index.html` from a checkout", but puts a generated file in git and in every PR diff. Opening the *built* page from disk is enough.

## Consequences
- Good: real module boundaries with explicit imports. Strict type checking becomes possible module by module (BB-81, and BB-70 for the engine). UI logic can get Node unit tests.
- Good: the engine boundary (0004), the CSP (0005) and the test suite (0006) carry over unchanged. The suite is the safety net for the move.
- Good: one script request, minified, still versioned in its URL (BB-74).
- Cost: a build step. Opening the page from a checkout needs `npm run build` first. The code that runs is not byte-for-byte the code in the repo (the source map covers debugging).
- Cost: GitHub Pages switches from "publish a branch" to "deploy from Actions", a repo setting.
- Cost: README, CLAUDE.md ("no build step", "classic scripts") and `tests/file.spec.ts` change when the build lands, not before.
- Still needed: a template helper that escapes by default (BB-78). BB-80 narrows: one state object `S` already exists, so the work is explicit actions and partial re-render.

## Revisit when
- After BB-76, if template strings and manual re-rendering still cause bugs: consider Preact or Lit for the views that hurt most.
- If the build or deploy breaks more than once a month, or CI time doubles.
