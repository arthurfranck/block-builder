# BB-32: autosave everywhere, a lighter header

**Problem.** Save plan was the loudest button in the header, yet a saved plan already autosaved (1.5 s after a change, since BB-3). A new plan had to be saved by hand once, so it was easy to lose. The header held five controls (name, My plans, New plan, Save plan, gear), and Quick workout was only reachable from the plan side.

**Decisions (Arthur, 2026-11-20).**
- A new plan saves itself as soon as its setup is complete (the plan can be built), then on every change.
- The example plan that opens on a first visit is never saved automatically, even once edited. A "Keep this plan" button, shown only on the example, saves it as yours; from then on it autosaves.
- Header: plan name with a switcher (▾, opens My plans), save status, New plan, Quick workout, settings gear. Save plan and the My plans button go away.

**Details.**
- Autosave rule: not the example, and `missingSetup()` is empty. Same 1.5 s debounce and flush before New plan / Open / leaving as BB-3.
- The plan name stays an editable field (renaming is common); the switcher is a separate ▾ button right after it, named "My plans" for screen readers, keeping the `#btnPlans` id.
- Quick workout in the header reaches the quick workout from both phone tabs (BB-58 reminder) and from the Edit plan sheet's page.
- "Keep this plan" keeps `#btnSave` and the primary style, so it is the one obvious action on the example.

**Not changed.** Storage format, My plans dialog, import/export.
