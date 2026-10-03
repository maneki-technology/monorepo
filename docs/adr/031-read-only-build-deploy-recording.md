# ADR-031: Read-Only Build + Deploy Recording in CI

**Status:** Accepted
**Date:** 2026-09
**Amends:** [ADR-021](021-deploy-flow.md) (Deploy Flow — steps 4–5 and the deployments table usage)

## Context

ADR-021 tracks deploys by polling the GitHub API from `/api/deploy/status` and matching the newest workflow run by timestamp. The prerender step wrote the deploy manifest to the newest `deployments` row and stamped `deployed_at` on every rendered post/project.

This caused three problems:

- **PR builds mutated production.** The deploy workflow also runs on pull requests, so every PR build stamped `deployed_at` and overwrote the latest manifest in the production database.
- **Builds could not use a read-only token.** Isolating PR credentials (issue #516) failed at prerender's writes.
- **Wrong row, wrong time.** Pushes to `main` have no `deployments` row, so they wrote onto an older one. `deployed_at` was stamped before Cloudflare Pages had deployed anything.

## Decision

The build only reads Turso. A CI step after the Cloudflare Pages deploy is the only writer.

1. `POST /api/deploy` inserts the `deployments` row and sends its id as `client_payload.deploy_id` in the `repository_dispatch`.
2. Every build (`vite build` + prerender, PRs and production) runs with `TURSO_READ_ONLY_AUTH_TOKEN`. Fork PRs without the secret skip the blog build.
3. After the Pages deploy, `scripts/record-deploy.ts success` sets the row to `success` and stamps `deployed_at` on the posts, projects and drafts found in `dist/`. `record-deploy.ts failure` runs on failure or cancellation.
4. Pushes to `main` (no `deploy_id`) record a `gh-run-<GITHUB_RUN_ID>` row.
5. `GET /api/deploy/status` returns the latest `deployments` row. It no longer calls the GitHub API.

## Consequences

- A build that tries to write to the database fails under the read-only token.
- `TURSO_READ_ONLY_AUTH_TOKEN` must exist as a repository secret before production deploys run.
- The `deploying` status is no longer reported. The admin shows `building` until the workflow records a final state.
- The `deployments.manifest` column is no longer written.
- If the workflow fails before `npm ci` completes, the failure step cannot run, and the row stays `building`.
