# Architecture decision records

One short file per structural decision: the context, what was decided, the alternatives, the consequences, and when to revisit it. A decision is never rewritten: a new ADR supersedes it and both stay here.

ADRs 0001 to 0007 were written on 2026-11-23, after the fact, to record choices made between v1.0.0 and v1.11.1. Each one names where the decision was made.

| # | Decision | Status |
|---|---|---|
| [0001](0001-no-framework-no-build.md) | No framework and no build step | Superseded by 0008 |
| [0002](0002-classic-scripts-for-file-protocol.md) | Classic scripts, so the page opens from disk | Superseded by 0008 |
| [0003](0003-browser-storage-no-server.md) | Plans in the browser only: no server, no accounts | Accepted |
| [0004](0004-dom-free-plan-engine.md) | A plan engine with no DOM and no storage | Accepted |
| [0005](0005-csp-and-third-party-code.md) | Strict CSP, vendored or hash-pinned third-party code | Accepted |
| [0006](0006-six-setup-test-matrix.md) | Tests on six desktop and iPhone setups, required to merge | Accepted |
| [0007](0007-ai-team-working-model.md) | A team lead with an AI team, and the guardrails around it | Accepted |
| [0008](0008-es-modules-bundled-with-esbuild.md) | ES modules bundled with esbuild, deployed from a CI build | Accepted |
| [0009](0009-visual-snapshots-linux-baselines.md) | Visual snapshots on two setups, with Linux baselines made in CI | Accepted |
| [0010](0010-git-pre-commit-hook.md) | Commit checks in a git pre-commit hook, not a Claude hook | Accepted |
| [0011](0011-fonts-served-from-the-repo.md) | Fonts served from the repo, not Google Fonts | Accepted |
| [0012](0012-feature-modules-wired-by-init.md) | Feature modules that only declare, wired by `init…()` from the entry module | Accepted |


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
