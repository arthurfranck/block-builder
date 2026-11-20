# BB-71: suggest the weekly volume from experience and distance

**Problem.** A new plan starts with Weekly volume empty and required. Many runners don't know the number offhand, and it's one more field to type before seeing a plan.

**Asked (2026-11-20).** Suggest a volume from the experience level, and from the distance chosen (race or focus distance). The runner can overwrite it.

**Options.**
- Suggest only when Experience is clicked. Misses runners who keep the default (Regular) and never click it.
- Suggest as soon as the distance is known (step 2), from the current level, and update when the level or distance changes. Chosen.
- Pre-fill even in saved plans and the example plan. No: a number the runner typed (or a saved plan's) is never replaced.

**Rule.** Fill Weekly volume when it is empty, or still holds the last suggestion, whenever the distance, custom distance or level changes. A typed value, a loaded plan's value and the example plan's 30 km are left alone (the remembered suggestion is reset when a plan is loaded or a new one started). A hint under the field says it is a suggestion while the field still holds it.

**Numbers (km/week).** First draft (15-35 new, 20-40 regular, 35-70 experienced) reviewed with Arthur on 2026-11-20: levels too close together, experienced too low. His anchors: new runners preparing a 5K run 10-15 km a week, a marathon 40; experienced marathon runners 100. Regular sits halfway at marathon; the other columns step up evenly. All values are at or above the low-volume warning thresholds (5K 12, 10K 18, half 22, marathon 32).

| Level | 5K | 10K | Half | Marathon |
|---|---|---|---|---|
| New to running | 12 | 20 | 30 | 40 |
| Regular | 30 | 40 | 55 | 70 |
| Experienced | 50 | 65 | 80 | 100 |

Custom distance: interpolated on km between the nearest two columns, clamped to 5K and marathon at the ends; rounded to the whole km (rounding to 5 would turn New's 12 into 10).

**Known trade-off.** The field is the runner's current volume and becomes week 1. A runner who accepts a suggestion above what they run starts too high; the hint asks them to change it. Runs per week (step 4) is not known yet, so 100 km with few runs gives long easy runs.

**Where.** `suggestVol(inputs)` in `engine.js` (pure, Node-tested); the page decides when to apply it.

**Later.** BB-72 (longest run optional) makes step 3 need no typing at all. BB-56 (Strava) would replace the guess with real numbers.
