# BB-71: suggest the weekly volume from experience and distance

**Problem.** A new plan starts with Weekly volume empty and required. Many runners don't know the number offhand, and it's one more field to type before seeing a plan.

**Asked (2026-11-20).** Suggest a volume from the experience level, and from the distance chosen (race or focus distance). The runner can overwrite it.

**Options.**
- Suggest only when Experience is clicked. Misses runners who keep the default (Regular) and never click it.
- Suggest as soon as the distance is known (step 2), from the current level, and update when the level or distance changes. Chosen.
- Pre-fill even in saved plans and the example plan. No: a number the runner typed (or a saved plan's) is never replaced.

**Rule.** Fill Weekly volume when it is empty, or still holds the last suggestion, whenever the distance, custom distance or level changes. A typed value, a loaded plan's value and the example plan's 30 km are left alone (the remembered suggestion is reset when a plan is loaded or a new one started). A hint under the field says it is a suggestion while the field still holds it.

**Numbers (km/week).** Kept at or above the engine's "low starting point" thresholds (5K 12, 10K 18, half 22, marathon 32) for Regular and Experienced, so accepting the suggestion doesn't trigger that warning. New runners at a marathon get 35, just above the threshold.

| Level | 5K | 10K | Half | Marathon |
|---|---|---|---|---|
| New to running | 15 | 20 | 25 | 35 |
| Regular | 20 | 25 | 30 | 40 |
| Experienced | 35 | 45 | 55 | 70 |

Custom distance: interpolated on km between the nearest two columns, clamped to 5K and marathon at the ends; rounded to the nearest 5 km.

**Where.** `suggestVol(inputs)` in `engine.js` (pure, Node-tested); the page decides when to apply it.

**Later.** BB-72 (longest run optional) makes step 3 need no typing at all. BB-56 (Strava) would replace the guess with real numbers.
