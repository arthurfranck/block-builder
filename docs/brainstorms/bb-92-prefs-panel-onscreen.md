# BB-92: settings panel opens off-screen

**Problem.** The gear's Display and language panel is right-aligned to the gear (`.prefs-panel{right:0;width:240px}`). The header wraps (`header.top{flex-wrap:wrap}`), and at some widths the gear lands at the left of a line, so the panel hangs off the left edge. Seen 2026-11-25 at 1024×768 (left -188 px).

**Measured.** A Playwright sweep of widths 320 to 1440 px in 8 px steps (141 widths) found the open panel off-screen at 25 of them, all from 864 to 1056 px (left -46 to -188 px). Phone widths and wide desktops were fine.

**Options.**
- **CSS per breakpoint** (`left:0` from 864 to 1056 px). Rejected: the widths depend on the header's content (plan name length, button labels, language), so a fixed range breaks as soon as a label changes.
- **Place it when it opens.** Chosen: after the panel opens (and on resize while it is open), measure it and shift it so it stays 8 px inside the viewport. It works wherever the header puts the gear, whatever the labels.

**Test.** A layout test opens the panel at 864, 960 and 1024 px (the failing range) and at the setups' own sizes, and checks it is fully on screen.

**Unchanged.** Where the panel opens when it already fits (right-aligned to the gear), how it opens and closes, its content.
