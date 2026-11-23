# 0001. No framework and no build step

- Status: Accepted, under review in BB-75
- Decided: v1.0.0 (6 Nov 2026), when the claude.ai artifact became this repo

## Context
Block Builder started as a single-file Claude artifact. Moving it to GitHub Pages, the goal was a tool anyone can open with nothing to install, that one person can change and release in minutes.

## Decision
Plain HTML, CSS and JavaScript. No framework, no bundler, no transpiler. What is in the repo is exactly what the browser runs, and GitHub Pages serves `main` as is.

## Alternatives considered
- **React, Vue or Svelte with Vite.** Components and a mature ecosystem, but a build, a deploy step and a dependency tree to keep up, for what was then one screen.
- **A light library without a build (Preact with htm, Lit from a CDN).** Components without a bundler, but a runtime from a CDN (see 0005) and a rewrite of every view.

## Consequences
- Good: nothing to build, so a release is a merge. No runtime dependencies to update or audit. Fast first load.
- Good: anyone can read the shipped code in the browser's dev tools.
- Cost: no components. Views are built from template strings, which means remembering to escape (`esc()`, about 100 calls) and re-rendering larger parts than needed.
- Cost: no module system, so `app.js` grew into one 1,500-line file (see 0002).
- Cost: no minifying, and formatting is left to discipline (BB-79).

## Revisit when
- More than one person changes the interface at the same time, or `app.js` passes about 2,000 lines.
- A feature needs shared state across several views that string templates can't keep in sync.
- BB-75 is decided: it may keep this, or add a small build that still ships plain files.
