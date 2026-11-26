# 0012. Feature modules that only declare, wired by `init…()` from the entry module

- Status: Accepted
- Decided: 2026-11-26, BB-76 (brainstorm: `docs/brainstorms/bb-76-split-app.md`)

## Context
ADR 0008 chose one ES module per feature, bundled by esbuild. `src/app.js` was still one 4,850-line file in which each section mixed declarations with code that ran at load: event wiring, a few calls. ES modules run in import order, not in the order the code was written, and the feature modules call each other (the plan view redraws the setup form, editing redraws the plan, and so on), so they import each other in cycles. Inside a cycle, code that runs while a module loads can reach a binding that is not set yet and throw.

## Decision
- `src/` holds one module per feature (setup, plan-view, plan-edit, today, weather, workout, quick, race, editor, modal, watch, fit, exports, storage, plan-file, intro, sheet, prefs), plus shared ones: `strings` (every text), `i18n` (language and `t()`), `state` (`S` and its defaults), `engine-api` (the engine's names), `effort`, `dom`, `html`.
- A feature module only declares (functions, constants, its own variables). Whatever it ran at load goes into an exported `init<Feature>()`. `src/app.js`, the entry, imports the modules, calls each `init…()` in the page's original order, then starts the page.
- Only the module that declares a variable assigns it; others call its setter (`useLang`, `useRunUnit`). ES modules forbid assigning an imported binding.
- `scripts/split-module.mjs` moves code between modules and recomputes every module's imports and exports from scope analysis, so a move never needs hand-written import lists. It refuses a move that would assign an imported binding or declare a name twice.

## Alternatives considered
- **Leave load-time code at module top level.** Shorter, but the order then depends on the import graph, and with cycles a module could run before what it needs.
- **Remove the cycles first.** That means one state with explicit actions and a render loop (BB-80), a larger change than moving code. Doing it after the split keeps each step small and behind the same tests.
- **Split by hand.** About 270 top-level names across 25 files; the import lists would drift and errors would only show at run time.

## Consequences
- Good: each feature reads on its own (largest UI module 503 lines, strings 1,037); `src/app.js` is 70 lines and shows the start-up order.
- Good: the strings can be imported directly (the translation test now covers the strings added at the end of the object too).
- Cost: the cycles remain. A module that starts calling another module while it loads may fail at run time; the test suite catches it, the type check does not.
- Cost: the `init…()` order in `src/app.js` matters and has no test of its own beyond the suite.

## Revisit when
- BB-80 brings one state and a render loop: most cycles go, and many `init…()` may become plain event delegation set up once.
