# ADR-030: Published Snapshot for Change Detection

## Status

Accepted

## Context

The editor needs to show when a published post/project has unpublished changes. Initial approach compared `updated_at > published_at` timestamps, but this broke on page refresh since saving always updates `updated_at`. Content comparison was needed but the DB only stored current values.

## Decision

Add `published_snapshot TEXT` column to posts and projects tables. On publish, save a JSON snapshot of the content fields:

- Posts: `{ type: "post", title, body_md, excerpt, tags, date }`
- Projects: `{ type: "project", title, body_md, description, tech }`

On unpublish, clear the snapshot to NULL.

`hasUnpublishedChanges()` parses the snapshot and compares field-by-field against current values, with normalization for format differences (JSON arrays vs comma-separated strings, datetime vs date-only).

The `type` discriminant is added client-side when reading from the API (not stored in DB, since the table already implies the type).

## Consequences

- Change detection survives page refresh (snapshot persists in DB)
- Foundation for future "revert to published" feature
- Requires migration script to add column + backfill existing published rows
- Slight storage overhead (duplicate content as JSON) — acceptable for a personal blog
