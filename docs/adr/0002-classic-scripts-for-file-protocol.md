# 0002. Classic scripts, so the page opens from disk

- Status: Accepted, under review in BB-75
- Decided: BB-7 (engine moved to `engine.js`) and BB-66 (v1.7.1, app moved to `app.js`)

## Context
The README promises that `index.html` works when opened straight from disk, offline, which helps people who download the repo and keeps local work simple. Browsers block ES module imports from `file://` pages. When the engine (BB-7) and then the app (BB-66) moved out of the inline script, the file format decided whether that promise held.

## Decision
`engine.js`, `app.js` and `theme.js` are classic scripts. The engine shares itself as one global, `BBEngine`; the app keeps everything in one closure. `tests/file.spec.ts` opens the page from disk and builds a plan, so the promise is tested.

## Alternatives considered
- **ES modules** (`import` between files). Clean boundaries and real imports, but the page stops working from disk.
- **Several classic files sharing globals.** Keeps `file://`, but the files would depend on each other through the global scope with no checked contract. Not worth it at the time (BB-66 brainstorm).
- **An inline script with a CSP hash.** Fragile: any edit changes the hash.

## Consequences
- Good: the page works from disk and from any static host, with no tooling.
- Good: the engine runs in Node too (see 0004).
- Cost: `app.js` is one big closure: no imports, and every function can reach every variable.
- Cost: type checking is weak. `@ts-check` runs non-strict, and `BBEngine` is typed `any`.
- Exception: the Apple Watch export loads its vendored library with a dynamic `import()`, so that export doesn't work from disk (stated in the README).

## Revisit when
- BB-75 picks the target architecture. The main option on the table: write ES modules and bundle them into one classic script with a small build step. That keeps `file://` and gives real modules, but replaces "no build step" (0001).
- Opening from disk turns out to matter to nobody but the tests.
