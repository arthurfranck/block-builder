# BB-92: settings panel opens off-screen

**Problem.** The gear's Display and language panel is right-aligned to the gear (`.prefs-panel{right:0;width:240px}`). The header wraps (`header.top{flex-wrap:wrap}`), and at some widths the gear lands at the left of a line, so the panel hangs off the left edge. Seen 2026-11-25 at 1024×768 (left -188 px).

**Measured.** A Playwright sweep of widths 320 to 1440 px in 8 px steps (141 widths) found the open panel off-screen at 25 of them, all from 864 to 1056 px (left -46 to -188 px). Phone widths and wide desktops were fine.

**Options.**
- **CSS per breakpoint** (`left:0` from 864 to 1056 px). Rejected: the widths depend on the header's content (plan name length, button labels, language), so a fixed range breaks as soon as a label changes.
- **Place it when it opens.** Chosen: after the panel opens (and on resize while it is open), measure it and shift it so it stays 8 px inside the viewport. It works wherever the header puts the gear, whatever the labels.

**Language and other header changes (review, 2026-11-26).** The bad widths move with the labels: English wraps the gear left at 864-1056 px, French at 928-1104 px (sweep in 16 px steps). Switching language with the panel open re-wraps the header without a resize event, so the panel is also placed again whenever any item in the header changes size (a ResizeObserver on the header's items).

**Test.** Layout tests open the panel at the failing widths in English and in French and at the setups' own sizes, resize the window while it is open, and switch language while it is open at 1088 and 880 px; each checks the 8 px margin.

**Unchanged.** Where the panel opens when it already fits (right-aligned to the gear), how it opens and closes, its content.
