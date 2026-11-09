# Vendored code

Third-party code served from this repo instead of a CDN, so a change on the CDN can't change what runs on the page.

| Package | Version | Files | Source | License |
|---|---|---|---|---|
| `@bibixx/workoutkit` | 0.2.0 | `dist/index.js`, `dist/encode.js` (source map comments removed) | https://www.npmjs.com/package/@bibixx/workoutkit | MIT, see `workoutkit-0.2.0/LICENSE` |

To upgrade: download the new `dist/index.js` and `dist/encode.js` into a new `workoutkit-<version>/` folder, remove the `//# sourceMappingURL` lines, update the import paths in `loadWK()` in `index.html`, and run the Apple Watch export tests.
