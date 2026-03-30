/**
 * Run once to initialize the Turso database schema.
 * Handles both fresh installs and migrations from older schemas.
 * Usage: TURSO_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/migrate.ts
 */

import { createClient } from "@libsql/client";
import { SCHEMA } from "../src/api/db/schema.js";

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_URL env var");
  process.exit(1);
}

const db = createClient({ url, authToken: authToken || undefined });

console.log("Running migration...");

// Check if posts table exists and needs CHECK constraint update
const tableInfo = await db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='posts'");
if (tableInfo.rows.length > 0) {
  const sql = tableInfo.rows[0].sql as string;
  if (sql.includes("'publishing'")) {
    console.log("Posts table already has updated CHECK constraint.");
  } else {
    console.log("Migrating posts table — updating CHECK constraint...");
    await db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS posts_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        body_md TEXT NOT NULL,
        excerpt TEXT NOT NULL DEFAULT '',
        tags TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'publishing', 'failed')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO posts_new SELECT * FROM posts;
      DROP TABLE posts;
      ALTER TABLE posts_new RENAME TO posts;
      CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
      CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    `);
    console.log("Posts table migrated.");
  }
} else {
  console.log("Creating fresh schema...");
}

// Create any missing tables (ui_state, deployments)
await db.executeMultiple(SCHEMA);
console.log("Done.");
