# BB-84: protect plans against browser data loss

**Problem.** Plans live only in `localStorage` (`bb-plans`, ADR 0003). Since autosave (BB-32), a runner can use the app for weeks without ever pressing **My plans → Export**. Clearing site data or private browsing wipes every plan, and so can the browser on its own: Safari deletes storage that pages wrote for a site that hasn't been opened in 7 days of Safari use (unless the site was added to the Home Screen), and any browser may evict it under storage pressure. Nothing in the page says when a backup was last made. The health checks of 19 and 23 Nov flagged this twice.

**What can't work.** A static page can't write a file silently. Automatic downloads would be blocked or annoying, and the File System Access API only exists in desktop Chromium. Keeping copies inside `localStorage` doesn't help, because the same clear wipes them.

**Options.**
1. **Ask the browser to keep the storage** (`navigator.storage.persist()`), once a plan is saved. It is silent in Chromium and Safari (granted or not by their own rules), and Firefox may show a prompt. It lowers the eviction risk but doesn't stop someone from clearing data. Cheap.
2. **Show when the last backup was made** in My plans ("Last backup: never" / "3 days ago"), with **Export** renamed to make the purpose clear ("Back up (.json)"). Passive, no nagging.
3. **A reminder in the plan view** when saved plans have changes that were never backed up and the last backup (or the first unbacked save) is more than 7 days old: one info banner, "Your plans are only in this browser. Back up a copy." with **Back up** (downloads the same JSON as Export) and **Later** (hides it for 7 days). It never shows for the example plan or with no saved plans.
4. **A reminder after big changes** (new plan saved, import, many edits). More precise, but harder to define, and noisier in the first session, when the runner is still setting up.

**Leaning.** 1 + 2 + 3: the browser is asked to keep the data, My plans shows when the last backup happened, and one banner at most once a week while there are changes that were never backed up. Two new `localStorage` keys: `bb-backup-at` (time of the last export) and `bb-backup-snooze` (until when Later hides the banner). Both go in the README's storage table.

**Tests.** Banner absent with no saved plans and for the example; shown after a saved change older than 7 days with no backup (clock moved with the frozen date); Back up downloads the JSON and hides the banner; Later hides it for 7 days; My plans shows "never", then the date after export; `persist()` called once a plan is saved (stubbed); French strings.
