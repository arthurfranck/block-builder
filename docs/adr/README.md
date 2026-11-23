# Architecture decision records

One short file per structural decision: the context, what was decided, the alternatives, the consequences, and when to revisit it. A decision is never rewritten: a new ADR supersedes it and both stay here.

ADRs 0001 to 0007 were written on 2026-11-23, after the fact, to record choices made between v1.0.0 and v1.11.1. Each one names where the decision was made.

| # | Decision | Status |
|---|---|---|
| [0001](0001-no-framework-no-build.md) | No framework and no build step | Accepted, under review in BB-75 |
| [0002](0002-classic-scripts-for-file-protocol.md) | Classic scripts, so the page opens from disk | Accepted, under review in BB-75 |
| [0003](0003-browser-storage-no-server.md) | Plans in the browser only: no server, no accounts | Accepted |
| [0004](0004-dom-free-plan-engine.md) | A plan engine with no DOM and no storage | Accepted |
| [0005](0005-csp-and-third-party-code.md) | Strict CSP, vendored or hash-pinned third-party code | Accepted |
| [0006](0006-six-setup-test-matrix.md) | Tests on six desktop and iPhone setups, required to merge | Accepted |
| [0007](0007-ai-team-working-model.md) | A team lead with an AI team, and the guardrails around it | Accepted |

Next: 0008, the target architecture for the interface code (BB-75).

## Template

```markdown
# NNNN. Title

- Status: Proposed | Accepted | Superseded by NNNN
- Decided: date or version, backlog item

## Context
## Decision
## Alternatives considered
## Consequences
## Revisit when
```
