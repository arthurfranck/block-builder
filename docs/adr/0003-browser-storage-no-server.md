# 0003. Plans in the browser only: no server, no accounts

- Status: Accepted
- Decided: v1.0.0; reinforced by BB-32 (v1.11.0, autosave)

## Context
The claude.ai version saved plans to the artifact runtime's per-user cloud storage. That runtime doesn't exist on GitHub Pages. A training plan holds health-adjacent data (volume, race times), and a static host has no server.

## Decision
Everything stays in the browser's `localStorage` (keys listed in the README). No accounts, no backend, no analytics or tracking. **My plans → Export / Import** moves plans between devices as one JSON file `{app:"block-builder", version:1, plans:{…}}`. Imports are checked field by field and cleaned before they are stored. Import stays backward compatible, and `tests/fixtures/plans-v1.json` proves it.

## Alternatives considered
- **A backend with accounts** (Supabase, Firebase or a small API). Sync across devices and no data loss, but hosting, auth, personal data to protect, and a privacy policy.
- **Sync through the user's own cloud storage** (Google Drive or iCloud file). No server of our own, but OAuth and a more complex flow.
- **IndexedDB.** More room and structured queries, but plans are small and `localStorage` is simpler. Same risk of being cleared.

## Consequences
- Good: privacy by design, nothing to host or secure, works offline, zero running cost.
- Risk: clearing site data, private browsing or browser eviction deletes every plan. Since autosave (BB-32), people may never export, so the risk is higher. BB-84 covers it.
- Cost: no sync between phone and laptop except by exporting a file.
- Cost: no usage data, so product decisions rely on audits and feedback, not measurement.
- Rule: any change to the saved format adds a fixture and keeps older files importable.

## Revisit when
- Sync across devices becomes a top request, or Strava pre-fill (BB-56) needs a server for OAuth anyway.
- Lost plans are reported, even after BB-84.
- The tool needs usage metrics to set priorities.
