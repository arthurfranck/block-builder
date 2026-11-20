# BB-27: setup warnings at their field

**Problem.** Every warning sat in one stacked banner above the plan, so "8 weeks is short for a marathon" and "week 3 jumps more than 10%" looked the same, and the runner had to work out which setting each one was about.

**Earlier decisions.** 2026-11-12: plan problems go on the week (warning row) plus one banner line naming the weeks (done in BB-57); setup problems move to their field. 2026-11-19 (BB-68): at the field in the phone steps (BB-34) and in the Edit plan sheet (BB-29); desktop keeps the side panel.

**Split.**

| Warning | Field |
|---|---|
| Block too short / over 24 weeks | Weeks of training |
| Week 1 already in the past | under the race/start date row |
| Low starting volume | Weekly volume |
| Marathon with longest run under 14 km | Longest recent run |
| Days picked ≠ runs per week; 3+ days in a row | Running days |
| 7 runs, no rest day | Runs per week |
| Long run boxed in, no gap for a hard run | Long run day |
| Too many / no quality types | Run types |
| No race time / unreadable race time | already the pace hint under the recent race; not repeated |

Plan problems stay in the banner: goal readiness, 10% jumps, week 1 above volume, week checks.

**Plan side.** One banner line names the settings that need a look ("Some settings need a look: Weeks of training, Running days."), with Edit settings on phones (opens the steps or the Edit plan sheet). On desktop the fields are beside the plan.

**Engine.** `warningItems()` returns `{f, m}`: the setup field, or null for a plan problem. `warnings()` still returns the plain messages in the same order, so the engine tests and the five profiles are unchanged.
