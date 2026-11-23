# BB-83: ADRs for the existing structural choices

**Problem.** The big structural choices (no framework, classic scripts, localStorage only, a DOM-free engine, the CSP, the test matrix, the AI team) are spread across the README, CLAUDE.md, the changelog and brainstorms. Nobody can see in one place why each was made, what it costs, or when to revisit it. BB-75 (interface architecture) needs that baseline before it can change anything.

**Options.**
- One long `docs/architecture.md`. Easy to write, but decisions get edited in place and their history is lost.
- One short ADR file per decision in `docs/adr/` (context, decision, alternatives, consequences, revisit when). The usual format; a later decision supersedes an earlier one instead of rewriting it.
- Expand the brainstorms. They are per backlog item and record the options of one change, not a standing decision.

**Chosen.** One ADR per decision in `docs/adr/`, numbered, with an index in `docs/adr/README.md`. These are written after the fact (recorded 2026-11-23), so each one names the version or backlog item where the decision was made. BB-75 becomes ADR 0008.

**Scope.** Docs only: no page file changes, no version bump. README's repository map and CLAUDE.md point to the folder.
