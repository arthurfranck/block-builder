# 0006. Tests on six desktop and iPhone setups, required to merge

- Status: Accepted
- Decided: v1.x test suite; CI moved into Playwright's Docker image in BB-60; static checks added in BB-62

## Context
Runners mostly use the plan on their phone: today's run, send to watch. Every iOS browser, Chrome included, runs on WebKit, which behaves differently from Chromium (dates, file downloads, sheets, scrolling). The work is delegated to AI agents (0007), so the tests are the spec and the main guard against regressions. They have to be strict and run on their own.

## Decision
- Playwright runs every browser test on six setups: desktop Chrome and Safari, and four iPhone setups (16 and 16 Pro Max Safari, 16 with the Chrome for iOS user agent, 17 Pro Max Safari). axe-core checks WCAG 2.1 A/AA on each view in both themes.
- Every test starts on a frozen date (6 Nov 2026, Paris) with empty storage, so plans are the same on every run.
- `main` is protected: a static checks job (type checks, `npm audit`) and all six setups must pass before a merge.
- Locally, a pre-commit hook runs the engine and desktop Chrome tests. Small copy or CSS changes may run only the affected specs on Chrome; CI runs the rest.

## Alternatives considered
- **Chrome only.** Fast, but misses WebKit, which is what every iPhone user runs.
- **Desktop Chrome and Safari plus one iPhone.** Covers both engines and a phone screen at a third of the cost. Probably enough for most changes.
- **Real devices (BrowserStack or similar).** Closer to reality, but paid, slower, and harder to keep deterministic.

## Consequences
- Good: layout and touch regressions on small and large iPhones are caught before merge. The suite doubles as living documentation (`tests/README.md`, "What each file covers").
- Good: CI is reproducible. Playwright and axe versions are pinned, and a step checks that the lockfile and the Docker image agree.
- Cost: about 250 browser tests × 6 setups per push. Fine on GitHub's free runners, but slower feedback.
- Cost: the iPhone setups emulate screen size, touch and user agent. They are not real devices, so things like the share sheet (BB-69) still need a phone.
- Known overlap: the 17 Pro Max and 16 Pro Max setups have the same viewport today, so one of them adds little.

## Revisit when
- CI time starts slowing delivery. First, drop the duplicate Pro Max setup or run iPhone setups only on page changes.
- Visual snapshot tests (BB-85) arrive. Decide which setups they run on so the snapshot count stays reasonable.
