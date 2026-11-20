# BB-74: stale scripts right after a release

**Problem.** Seen releasing v1.11.0: GitHub Pages serves every file with `Cache-Control: max-age=600`. A browser that opened the site in the 10 minutes before a deploy reused its cached `app.js` with the new `index.html`: footer v1.10.1, new header buttons with no handler. Possible since BB-66 split the script out of the page.

**Options.**
- Version in the URL (`app.js?v=1.11.1`), set by hand at release and checked by a test. Simple, no build step, works from `file://` (the query is ignored there).
- Content hashes in file names: needs a build step, which the project avoids.
- A service worker or no-cache headers: Pages doesn't let us set headers, and a service worker is far more than this needs.

**Chosen.** `?v=<VERSION>` on `theme.js`, `engine.js` and `app.js`; a test fails if any differs from `VERSION`; the release checklist and CLAUDE.md say to bump it with the version. `index.html` itself can still be cached for 10 minutes, but then it asks for the scripts of its own version, so the page and its code always match.
