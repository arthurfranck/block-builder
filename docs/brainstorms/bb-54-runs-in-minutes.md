# BB-54: runs shown in minutes

**Problem.** Every run is shown in km. Many runners, beginners first, think in time ("a 40-minute run"), and a watch workout in time is easier to follow when the pace is unknown.

**Scope (Arthur, 2026-11-25).** Minutes are a display layer: the engine keeps planning in km, so weekly volume, the +10% cap, checks and BB-48 sizing stay km-based. Walk-run for true beginners was dropped.

**Options considered.**
- Time-based engine (volume entered and planned in minutes). Rejected: reworks `generate()`, every check and warning, and BB-48.
- Display layer. Chosen: one setting, "Runs shown in km / minutes", converts what is shown and exported.

**How minutes are worked out.** The same estimate the Today card already shows ("about 50 min"): the run's watch plan (`s.watch`, else `watchPlan(kind, km)`) split into steps by `workoutSegs()`, each step at its pace from `paces()`; with no race time, the default paces (easy 6:40/km, `src/engine.js` `paces()`). Rounded and written by `estDur()` ("50 min", "1 h 05"), so the plan and the Today card never disagree.

**Where it applies.** The run in each grid cell, the week total, the Today card (minutes big, km under it), "Next up" lines, ICS event titles, PDF cells, and watch workouts (titles, and distance steps turned into time steps by `wpInUnit()`, the Quick workout's converter; recoveries and strides are already in time).

**Unchanged.** The run editor (distance in km is what the engine takes), descriptions (generated text such as "8 km relaxed at 6:40/km" stays as written; they are editable text), the stats (total, peak week, longest run are plan facts in km), CSV export (data), saved plans (the setting is a display preference in `localStorage` key `bb-run-unit`, not part of a plan).

**Reusable.** One helper pair, `sesSec()` and `sesAmt()`, used by every spot above; a new view or export calls `sesAmt()` instead of writing `km`.
