# Health profile: Block Builder

Read by the `codebase-health` skill. Project rules live in [CLAUDE.md](../CLAUDE.md); this file only says what the health check runs and watches.

- **Reports:** ~/Claude/health/block-builder/
- **Cadence:** weekly, Monday 14:00 (after Dependabot's Monday pull requests); also by hand before a minor or major release
- **PATH additions:** ~/.local/node/bin, ~/.local/bin
- **Backlog:** ~/Claude/backlog-block-builder.md (edited with the tool-backlog skill; ids are BB-<n>)

## Quick local tests
- `npm run test:engine`: plan engine unit tests (Node), a few seconds.
- `npx playwright test --project=desktop-chrome --reporter=line`: browser suite on desktop Chrome, about 30 s. Some tests skip by design (phone-only, run-once, offline): compare the skipped count with last run, not with zero.

## What CI covers
GitHub Actions `Tests` workflow on every push and pull request: engine tests plus Playwright in six setups (desktop Chrome and Safari, four iPhone setups), inside the Playwright container pinned to the lockfile's version. `main` is protected by those six jobs. GitHub Pages deploys `main` (`pages build and deployment`). Don't re-run the WebKit setups locally: read CI.

## Metrics to track

```metrics
index_html_kb: echo $(( $(wc -c < index.html) / 1024 ))
index_html_lines: wc -l < index.html
engine_js_lines: wc -l < engine.js
longest_line_index_html: awk '{ if (length($0)>m) m=length($0) } END { print m }' index.html
lines_over_500_chars: awk 'length($0)>500 { n++ } END { print n+0 }' index.html
html_from_strings: grep -oE "innerHTML|outerHTML|insertAdjacentHTML" index.html | wc -l
esc_calls: grep -o "esc(" index.html | wc -l
i18n_en_keys: awk '/^en:\{/{f=1;next} /^fr:\{/{f=0} f' index.html | grep -oE '^[A-Za-z0-9_]+:' | wc -l
test_skip_lines: grep -c "test.skip" tests/*.ts | awk -F: '{ s+=$2 } END { print s }'
test_fail_lines: grep -c "test.fail(" tests/*.ts | awk -F: '{ s+=$2 } END { print s }'
localstorage_keys: grep -oE "localStorage\.(getItem|setItem|removeItem)\(\"[a-z-]+" index.html | sed 's/.*"//' | sort -u | wc -l
```

Thresholds: flag `index_html_kb` above 250 and any rise in `lines_over_500_chars`, `test_fail_lines` or `localstorage_keys` (a new key must be listed in the README's Privacy and storage section).

## Project rules
From CLAUDE.md; check each:
- `const VERSION` in index.html matches the top `## [x.y.z]` entry in CHANGELOG.md.
- Docs current: README Features, `docs/features.md` and the `tests/README.md` table were touched in the same commits as index.html / engine.js changes since the last report (`git log --since=<last report date> --name-only`).
- Every user-facing string exists in both `I18N.en` and `I18N.fr` (the i18n test checks this; confirm it ran in CI).
- `tests/fixtures/plans-v1.json` still exists (import backward compatibility).
- Playwright in package-lock.json matches the container tag in `.github/workflows/tests.yml`.
- The Known issues section of `tests/README.md` agrees with `test.fail` lines and `KNOWN` in `tests/a11y.spec.ts`.

## Known risks
- Plans live only in `localStorage` (`bb-plans`): lost when site data is cleared or evicted by the browser; the only backup is manual Export (no item yet).
- `index.html` holds most of the app in one file with long lines (BB-66).
- No type checking for the tests or the page (BB-62, then BB-66).
- CSP allows inline scripts (`script-src 'unsafe-inline'`) until the split (BB-66).
- PDF export needs cdnjs (jsPDF 4.2.1, AutoTable 5.0.9) and fails offline; Google Fonts is another outside request.
- Weather refetches on every redraw after a failure (BB-11).
- ICS line folding counts characters, not octets (BB-16).
