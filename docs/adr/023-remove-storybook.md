# ADR-023: Remove Storybook

**Status:** Accepted  
**Date:** 2026-04

## Context

The monorepo previously shipped a root-level Storybook setup (aggregating foundation, ui-components, grid-layout, flex-layout, and charts), per-package Storybook configs, CSF stories, and root Vitest integration for Storybook browser tests. The **visual catalog** (`apps/catalog/`, ADR-011) is already the source of truth for Playwright visual and accessibility regression testing. Maintaining two parallel preview surfaces duplicated effort (dependencies, stories, documentation).

## Decision

Remove Storybook entirely:

- Delete all `*.stories.ts` files and `.storybook/` directories.
- Remove Storybook-related npm dependencies, Moon tasks, and root scripts.
- Remove the root `vitest.config.ts` that only existed for `@storybook/addon-vitest` browser tests.

Interactive previews and stakeholder-facing demos use **`moon run catalog:dev`** (`apps/catalog/`, port 5174). Component development continues to rely on unit tests (Vitest) and the catalog app for visual verification.

## Rationale

- **Single preview surface.** The catalog dogfoods real integration; ADR-011 already established it as the regression target.
- **Smaller install graph.** Drops Storybook, Lit (story-only), and related Vitest browser tooling from the root and packages that only used them for stories.
- **Less documentation drift.** No need to keep Storybook config, story counts, and catalog pages in sync.

## Consequences

- Developers add or update **catalog pages** in `apps/catalog/` when they need a new visual fixture (see `apps/catalog/AGENTS.md`).
- Historical ADRs (e.g. 011, 012) remain **unchanged**; they record decisions at the time they were accepted. This ADR records the later supersession of Storybook as a dev tool.
- `.prettierignore` / lint ignores no longer list `storybook-static/`; that path may still appear in older ADR text where it described the repo at acceptance time.

## Alternatives Considered

- **Keep Storybook for rapid prop tweaking** — rejected: low usage versus maintenance cost; catalog + HMR is sufficient.
- **Storybook only for specific packages** — rejected: still splits the mental model and CI story.
