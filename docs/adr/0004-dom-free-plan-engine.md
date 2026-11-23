# 0004. A plan engine with no DOM and no storage

- Status: Accepted
- Decided: BB-7 (engine moved out of the page into `engine.js`)

## Context
The plan rules are the product: paces from a race time (Daniels/Gilbert), phases, weekly increase caps, cutback weeks, long-run limits, hard-run spacing, warnings. Mixed with rendering, they could only be tested through the browser, and checking the five athlete profiles from the 9 Nov audit meant exposing them from a scratch copy of the page.

## Decision
`engine.js` holds every training rule and touches neither the DOM nor storage. It takes inputs, returns a plan and warnings, and gets its text through `BBEngine.setLocale({t, days, fmtDate})`. Without a locale it returns keys, so tests don't depend on wording. The same file runs in the page and in Node (`tests/engine/engine.unit.mjs`).

## Alternatives considered
- **Keep the rules in the page and test through Playwright only.** No refactor, but slow tests, and a rule failure looks like a UI failure.
- **A separate npm package for the engine.** Clean, but versioning and publishing for one consumer.

## Consequences
- Good: about 200 Node unit tests run in seconds, including the five athlete profiles at each experience level. Any change to plan building re-checks them.
- Good: the rules could later run in a worker, a server (BB-56) or another front end without changes.
- Good: the boundary is easy to explain and to keep. No `document` or `localStorage` in `engine.js`.
- Cost: the engine and the app share data shapes (plan, week, session) with no checked types yet (BB-70, BB-81).
- Cost: some display rules (the heat note on paces, the Today card) live in the app, and the line has to be judged case by case.

## Revisit when
- Rules need data the engine can't get through its inputs, such as Strava history.
- Typing (BB-70) shows the data shapes should be redesigned.
