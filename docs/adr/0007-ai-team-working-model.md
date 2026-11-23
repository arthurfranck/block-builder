# 0007. A team lead with an AI team, and the guardrails around it

- Status: Accepted
- Decided: from v1.0.0; written down in CLAUDE.md and refined with each release

## Context
One person builds Block Builder in their spare time but wants it to be good enough to open to anyone. AI coding agents (Claude Code) can do the work of a product manager, a designer, engineers and ops, but they need direction, and they need limits that hold without someone watching every step.

## Decision
- **The lead (Arthur)** decides what to build and in what order (a scored backlog, ranked so nothing goes ahead of an item that would rework it). He makes every product and design choice, sets the technical rules, and merges.
- **The AI team** writes a brainstorm before planning each item (`docs/brainstorms/`), mocks up design options, then does the code, tests, docs and changelog for one backlog item per branch and pull request (`BB-<n>`). It also runs the weekly codebase health check (`.claude/health.md`).
- **The handbook is [CLAUDE.md](../../CLAUDE.md):** the agents act on anything it settles, and ask only for real product or design choices.
- **Guardrails are automatic rather than trusted:** `main` is protected by CI (0006), a pre-commit hook runs tests, a behaviour change needs a test change, and a failing test is never deleted or loosened without asking. Each release bumps the version, the changelog and the docs in the same commit.

## Never delegated
- Choosing what to build next, and dropping items.
- Product and design choices with more than one reasonable answer.
- Loosening or deleting a test.
- Merging to `main`.

## Alternatives considered
- **AI as autocomplete only, the lead writes the code.** More hands-on, but delivery is limited by one person's evenings.
- **Agents with no written rules, reviewed after the fact.** Faster at first. Quality drifts, and review becomes the bottleneck.

## Consequences
- Good: delivery speed: v1.0 to v1.11 in about two and a half weeks, in small PRs that each trace back to a backlog item and a brainstorm.
- Good: process is code. The rules, tests and health checks are in the repo, so anyone can see how decisions are made and enforced.
- Cost: the AI's work has little visible review on pull requests. The lead's judgement shows in the backlog, the brainstorms and the rules more than in PR comments. Leaving short review notes on PRs would make it visible.
- Cost: the rules file grows with each lesson learned and needs pruning, as it was on 20 Nov.
- Risk: the agents know only what is written. A rule that lives only in the lead's head is not applied.

## Revisit when
- Another human joins. Code review between people, ownership of areas and pairing replace parts of this model.
- The rules file passes about one page again, or two rules contradict each other.
