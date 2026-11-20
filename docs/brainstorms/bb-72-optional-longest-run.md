# BB-72: longest recent run optional

**Problem.** "Longest recent run" is required before a plan builds. It's one more number to look up, and with BB-71 it's the only field left to type in step 3.

**Asked (2026-11-20).** Make it optional.

**What uses it today.** `generate()` starts the long-run progression from it (`L0`, falling back to 10 km); `genInputs()` (preview of an incomplete setup) falls back to 12 km; the marathon warning fires when it is under 14 km.

**Options for an empty field.**
- Keep the fixed fallback (10 km). Wrong at both ends: too long for a 15 km/week beginner, too short for 80 km/week.
- Estimate from weekly volume. Chosen: 35% of the weekly volume, rounded to 0.5 km, clamped 3 to 45 km. Against the five athlete profiles (typed value → estimate): A 6 → 5.5, B 10 → 9, C 12 → 12.5, D 14 → 10.5, E 28 → 28. Slightly conservative, which is the safe side for a starting long run.

**Marathon warning ("longest recent run under 14 km").** Only when a value was typed. On an estimate, the text would talk about a run the runner never entered, and low volume for a marathon already has its own warning (`wa_lowVol`, under 32 km/week).

**UI.** Label "Longest recent run (km, optional)"; when empty, the placeholder shows the estimate ("≈ 10.5") so the runner sees what the plan uses.

**Unchanged.** A typed value is used as before, so saved plans and the five profiles build the same plans (checked by comparing `generate()` output before and after).
