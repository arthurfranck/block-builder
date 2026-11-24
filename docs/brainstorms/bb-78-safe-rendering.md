# BB-78: safe rendering

**Problem.** The interface builds HTML as strings in 153 template literals and writes it with `innerHTML` in 28 places. Safety depends on remembering `esc()` (73 calls) around every value that might hold user text: plan and race names, notes, imported files. One forgotten `esc()` is a script injection, and BB-1 found exactly that. Nothing checks it.

**Options.**
1. **A tagged template that escapes by default.** `` html`<b>${name}</b>` `` escapes every value unless it is already marked safe (another `html` result, or `esc()`), and returns a marked value. One sink, `setHtml(el, value)`, refuses plain strings, and a lint rule forbids `innerHTML` everywhere else. Small (one module), no dependency, and a forgotten escape becomes impossible rather than a bug.
2. **lit-html or a component library.** Real templates and DOM diffing, but ADR 0008 decided against a library for now, and it would mean rewriting every view at once.
3. **DOM building (`createElement`) everywhere.** Safe, but triples the code and rewrites every view.
4. **Only centralise the sink** (`setHtml(el, string)`) and lint `innerHTML`. Easy, but still relies on remembering `esc()`.

**Decided (2026-11-24).** Option 1, in `src/html.js`:
- `html` tag: values that are `SafeHtml` (from `html`, `esc`, `tHtml`, `htmlJoin`) go in as they are; arrays are joined; `null` and `undefined` render nothing, booleans render as text (as plain templates did, for `aria-expanded="false"`); everything else is escaped (`& < > "`, as `esc()` does today).
- `esc(s)` returns `SafeHtml` and keeps the original text, so a value escaped by habit is never escaped twice, and `t()` can use the original text when a caller pre-escaped a placeholder value.
- `t()` stays plain text. The 10 translation keys that hold markup (`<b>`, `<code>`) go through `tHtml(key, values)`: the translation is trusted, the values are escaped.
- `setHtml(el, value)` and `clearHtml(el)` are the only writers. ESLint's `no-restricted-syntax` forbids `innerHTML`, `outerHTML` and `insertAdjacentHTML` outside `src/html.js`.
- **Migration by codemod** (parser-based, run once, not committed): tag every template literal that contains markup (153, all interface code; none of the exports build markup), turn string fragments with `"`, `<`, `>` or `&` inside them into `html` templates, wrap `.map(…).join("")` over markup in `htmlJoin`, turn `h += …` accumulators into arrays, and route every sink through `setHtml`. Missed spots fail loudly: `setHtml` throws on a plain string.
- **Tests:** Node unit tests for `src/html.js`; the existing browser suite (imported files with markup, every view) plus the visual snapshots show nothing changed on screen.

**Not in scope.** Moving views into modules (BB-76), partial re-render (BB-80).
