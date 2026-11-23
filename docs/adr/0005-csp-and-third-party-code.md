# 0005. Strict CSP, vendored or hash-pinned third-party code

- Status: Accepted
- Decided: CSP in v1.1.9; `'unsafe-inline'` for scripts removed in BB-66 (v1.7.1); script URLs versioned in BB-74 (v1.11.1)

## Context
The page renders text people type and plans imported from files that may come from someone else. It also loads third-party code for two exports. A static page has no server headers to lean on, so protection has to live in the page.

## Decision
- A Content Security Policy in a `<meta>` tag: `default-src 'none'`; scripts only from the page and cdnjs; network requests only to Open-Meteo; no plugins, forms or `<base>`. No inline script or `on…=` handler is allowed, so an injected script doesn't run.
- jsPDF and AutoTable load from cdnjs only when exporting a PDF, with Subresource Integrity hashes: a changed file is refused.
- WorkoutKit (Apple Watch export) is vendored in `vendor/`, so a CDN can't change it.
- Script URLs carry the version (`app.js?v=1.11.1`), so a release never runs with a stale cached file.
- `tests/security.spec.ts` checks all of this, including that a tampered jsPDF is refused.

## Alternatives considered
- **No CSP and rely on escaping.** One missed `esc()` would become an XSS hole.
- **Vendor everything.** Simplest to trust, but the PDF libraries are large and rarely used, so they would weigh on the repo for little gain.
- **Load everything from CDNs without integrity hashes.** Easiest, but whatever the CDN serves runs.

## Consequences
- Good: defence in depth. Escaping is the first line, the CSP the second, and both are tested.
- Good: third-party code is pinned to an exact version and checked.
- Cost: styles still allow `'unsafe-inline'`, since many views set inline styles. Lower risk than scripts, but not zero.
- Cost: no inline scripts, so the theme must be set by a separate `theme.js` in `<head>` to avoid a flash of the wrong theme.
- Cost: upgrading a library means a new hash or a new vendor folder, by hand.

## Revisit when
- A build step arrives (BB-75): it could inline and hash scripts, or vendor the PDF libraries too.
- Views stop setting inline styles (BB-78, BB-82), so `style-src 'unsafe-inline'` can go.
