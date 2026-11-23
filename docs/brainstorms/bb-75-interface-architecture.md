# BB-75: target architecture for the interface code

**Problem.** `app.js` is one 1,525-line, 159 KB classic script: one closure, 18 sections marked by comments, 14 `render…` functions, 136 top-level functions, HTML built from template strings in 28 places, and all English and French strings in one object (lines 15-268). It works and is well tested, but it doesn't scale to more features or more people: no imports, every function can reach every variable, and type checking can't be strict. BB-76 (split), BB-78 (safe rendering), BB-80 (state and render) and BB-81 (strict types) all wait on this choice. ADRs 0001 (no build) and 0002 (classic scripts for `file://`) are the decisions being reviewed.

**What exists already and should be kept.**
- One state object `S` (plan, inputs, types, saved plans). BB-80 starts from it, not from scattered globals.
- The engine boundary (ADR 0004): `engine.js` has no DOM, and Node tests load it with `createRequire`.
- The CSP without inline script (ADR 0005), versioned script URLs (BB-74), and the six-setup suite (ADR 0006), which is the safety net for any of the options.
- GitHub Pages currently publishes `main`, root folder, from the branch ("legacy" build type).

**Options.**

A. **Split into several classic scripts, no build.** Top-level `const` and `function` in classic scripts share the page's global scope, so `i18n.js`, `storage.js`, `plan-view.js`, … can be loaded in order by `<script>` tags. TypeScript in script mode checks the files together.
- For: smallest change; keeps ADR 0001 and 0002 as they are; `file://` keeps working with nothing to run.
- Against: dependencies are implicit (load order, globals) and nothing enforces boundaries; one `?v=` per script tag to keep in step (BB-74 test); about a dozen requests instead of one; names from every file land in the global scope.

B. **ES modules in `src/`, bundled by esbuild into one classic script.** Sources use `import`/`export`; `esbuild` (one dev dependency, a single binary) bundles them into an IIFE with a source map. The bundle is a classic script, so the built page still opens from disk and the CSP stays the same.
- B1, *bundle committed*: the built `app.js` stays in the repo, Pages keeps publishing the branch, and CI fails if the committed bundle differs from a fresh build. Least change to deploy; a generated file in git, and every PR diff shows it.
- B2, *bundle built in CI*: `dist/` is not committed; Pages deploys from a GitHub Actions build (a repo setting change). Clean repo, the standard setup; but opening the page from a checkout needs `npm run build` first, and the deploy pipeline changes.
- For (both): real modules with explicit imports, strict types module by module, unit tests for UI logic in Node, minify. `engine.js` becomes a module imported by the app and by the Node tests directly. Keeps the door open to C: esbuild compiles JSX, so components can come in one view at a time later.
- Against: a build step (replaces ADR 0001); what runs is not byte-for-byte what is in the repo (source map covers debugging); tests run against the bundle.

C. **B plus a small component library** (Preact with htm, about 4 KB, or Lit). Components, escaping by default, state then render.
- For: absorbs BB-78 (escaping) and most of BB-80 (render model); the structure most engineers expect.
- Against: rewrites all 14 render functions at once if done up front; a runtime dependency; the biggest change and the biggest risk before there is a proven need.

D. **A full framework app (React or Svelte with Vite).** Rejected: out of proportion for one page with no server, and the same rewrite cost as C with more tooling.

**Leaning.** B, starting with B1 (bundle committed) so the deploy doesn't change in the same step as the code structure; move to B2 once the split is done and stable. C is not chosen now: revisit after BB-76, view by view, if template strings still hurt.

**Effect on the backlog if B is chosen.**
- BB-76 (split) becomes: move sections into `src/` modules one at a time behind the existing tests, starting with i18n.
- BB-78 stays (a template helper is still needed without components).
- BB-80 narrows: `S` exists; the work is explicit actions and partial re-render.
- BB-81 becomes possible module by module; BB-70 (engine types) gets easier once the engine is a module.
- BB-79 (formatter, linter) configures for ES modules from the start.
- New item: B2, deploy from a CI build.

**Decided (2026-11-23, Arthur).** Option B. Opening `index.html` from a checkout without a build no longer needs to work: B1 is a transition step, and B2 (deploy from a CI build) is the end state. Recorded in [ADR 0008](../adr/0008-es-modules-bundled-with-esbuild.md).
