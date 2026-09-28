# ADR-021: Deploy Flow — GitHub Actions + Status Polling

**Status:** Accepted
**Date:** 2026-04

## Context

Publishing a post or project requires rebuilding the static site (Vite + prerender) and deploying to Cloudflare Pages. Needed a way to trigger this from the editor and track deployment status.

## Decision

Use GitHub Actions `repository_dispatch` to trigger the deploy workflow, and poll the GitHub API for status.

### Flow

1. Author clicks Publish → `PUT /api/posts/:slug/publish`
2. Backend sets `status = 'published'`, `published_at = now()`, triggers `repository_dispatch`
3. Editor polls `GET /api/deploy/status` every 5s
4. The dispatch carries `client_payload.deploy_id`; after the Cloudflare Pages deploy, the workflow runs `scripts/record-deploy.ts`, which sets the row to success/failure and stamps `deployed_at` on the deployed posts/projects. Pushes to `main` record a `gh-run-<run id>` row.
5. `/api/deploy/status` returns the latest row; it no longer polls GitHub
6. Editor shows spinner on deploying items, disables Save/Publish buttons

### Deployments Table

```sql
CREATE TABLE deployments (
  id TEXT PRIMARY KEY,
  triggered_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'building',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Key Design Choices

- Post set to `published` immediately (not `publishing`) so the build includes it
- Deploy status tracked in `deployments` table, not on the post itself
- Unpublished changes tracked via `published_at` column — `*` indicator derived from content comparison, not timestamps
- `beforeunload` warning when unpublished changes exist
- Resume polling on editor load for in-progress deployments
- The build (`vite build` + prerender) only reads Turso and runs with `TURSO_READ_ONLY_AUTH_TOKEN`, so PR builds cannot mutate production. `record-deploy.ts` is the only CI step that writes, using `TURSO_AUTH_TOKEN`.

### Env Vars

- `GH_DEPLOY_TOKEN` — GitHub PAT with `repo` scope for `repository_dispatch`

## Consequences

- Deploy takes 1-2 minutes (GitHub Actions build + CF Pages deploy)
- `repository_dispatch` requires the trigger to be on the default branch
- Single deploy per publish/unpublish — batch operations trigger one deploy
- Polling stops after terminal state (success/failure) or on error
