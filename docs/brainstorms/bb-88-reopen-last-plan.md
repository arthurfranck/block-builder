# BB-88: reopen the last plan on launch

**Problem.** Every visit starts on the example half marathon plan, even for a runner with saved plans. To see their own plan, the Today card for it, or the BB-84 reminder to save to a file, they have to open My plans and press Open each time. The page is used daily ("today's run, send to watch"), so that's two extra taps on every visit, and the BB-84 banner is rarely seen.

**Options.**
1. **Reopen the plan that was open last**, remembered by id in a new `localStorage` key (`bb-last`), set whenever a plan is opened or saved. If that plan no longer exists (deleted, or another browser's file was imported), fall back to the most recently changed plan.
2. **Reopen the most recently changed plan** (`updatedAt`), no new key. Wrong when a runner switches to look at an older plan without changing it: the next visit jumps back to the other one.
3. **A start screen listing the plans.** One more screen for the common case of a single plan.

**Chosen.** Option 1, with option 2 as the fallback. The example stays for a first visit and whenever there are no saved plans. **New plan** is unchanged: a new plan is only saved once complete (BB-32), so a reload before then reopens the last saved plan, as the leave warning says.

**Edges.**
- Opening loads the plan exactly as **My plans → Open** does (`loadPlan`): same status line, no regeneration, hand edits kept.
- Phones: a complete saved plan opens in plan mode with the Edit plan sheet, so the setup steps (BB-34) don't show.
- Deleting the open plan doesn't clear `bb-last`; the fallback handles the missing id.
- Plans saved before this version have no `bb-last`, so they get the most recently changed plan.

**Tests.** First visit shows the example. After saving, a reload opens that plan, not the example. After opening an older plan from My plans, a reload opens that one (not the most recent). If the remembered plan was deleted, the most recent one opens. With no saved plans left, the example shows. The BB-84 banner shows on launch when due. Existing tests that reload after saving and expect the example need to be read case by case, never loosened.
