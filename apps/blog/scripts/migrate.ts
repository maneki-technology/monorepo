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
  if (sql.includes("published_at") && sql.includes("'deleted'")) {
    console.log("Posts table already up to date.");
  } else {
    console.log("Migrating posts table...");
    await db.executeMultiple(`
      CREATE TABLE IF NOT EXISTS posts_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        body_md TEXT NOT NULL,
        excerpt TEXT NOT NULL DEFAULT '',
        tags TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deleted')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        published_at TEXT
      );
      INSERT INTO posts_new (id, slug, title, body_md, excerpt, tags, status, created_at, updated_at, published_at)
        SELECT id, slug, title, body_md, excerpt, tags,
          CASE WHEN status IN ('publishing', 'failed') THEN 'draft' ELSE status END,
          created_at, updated_at,
          CASE WHEN status = 'published' THEN updated_at ELSE published_at END
        FROM posts;
        SELECT id, slug, title, body_md, excerpt, tags, status, created_at, updated_at,
          CASE WHEN status = 'published' THEN updated_at ELSE NULL END
        FROM posts;
      DROP TABLE posts;
      ALTER TABLE posts_new RENAME TO posts;
      CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
      CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
    `);
    console.log("Posts table migrated.");
  }
  console.log("Creating fresh schema...");
}

// Add location column to photos and albums if missing
try {
  await db.execute("ALTER TABLE photos ADD COLUMN location TEXT NOT NULL DEFAULT ''");
  console.log("Added location column to photos.");
} catch { console.log("photos.location already exists."); }

try {
  await db.execute("ALTER TABLE albums ADD COLUMN location TEXT NOT NULL DEFAULT ''");
  console.log("Added location column to albums.");
} catch { console.log("albums.location already exists."); }

// Add latitude/longitude columns
for (const table of ["photos", "albums"]) {
  try {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN latitude REAL`);
    console.log(`Added latitude column to ${table}.`);
  } catch { console.log(`${table}.latitude already exists.`); }
  try {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN longitude REAL`);
    console.log(`Added longitude column to ${table}.`);
  } catch { console.log(`${table}.longitude already exists.`); }
}

// Create pages table if missing
await db.executeMultiple(`
  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    styles TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deleted')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
  CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
`);
console.log("Pages table ready.");

// Add styles column to pages if missing
try {
  await db.execute("ALTER TABLE pages ADD COLUMN styles TEXT NOT NULL DEFAULT ''");
  console.log("Added styles column to pages.");
} catch { console.log("pages.styles already exists."); }

// Add published_snapshot column to posts and projects if missing
for (const table of ["posts", "projects"]) {
  try {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN published_snapshot TEXT`);
    console.log(`Added published_snapshot column to ${table}.`);
    // Backfill existing published rows
    if (table === "posts") {
      await db.execute(`UPDATE posts SET published_snapshot = json_object('title', title, 'body_md', body_md, 'excerpt', excerpt, 'tags', tags, 'date', created_at) WHERE status = 'published' AND published_snapshot IS NULL`);
    } else {
      await db.execute(`UPDATE projects SET published_snapshot = json_object('title', title, 'body_md', body_md, 'description', description, 'tech', tech) WHERE status = 'published' AND published_snapshot IS NULL`);
    }
    console.log(`Backfilled published_snapshot for ${table}.`);
  } catch { console.log(`${table}.published_snapshot already exists.`); }
}

// Create review_conversations table if missing
await db.executeMultiple(`
  CREATE TABLE IF NOT EXISTS review_conversations (
    slug TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'post' CHECK (type IN ('post', 'project')),
    audience TEXT NOT NULL DEFAULT 'general',
    messages TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (slug, type)
  );
`);
console.log("Review conversations table ready.");

// Create brainstorm_conversations table if missing
await db.executeMultiple(`
  CREATE TABLE IF NOT EXISTS brainstorm_conversations (
    slug TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'post' CHECK (type IN ('post', 'project')),
    focus TEXT NOT NULL DEFAULT 'open',
    audience TEXT NOT NULL DEFAULT 'general',
    messages TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (slug, type)
  );
`);
console.log("Brainstorm conversations table ready.");

// Add audience column to brainstorm_conversations if missing
try {
  await db.execute("ALTER TABLE brainstorm_conversations ADD COLUMN audience TEXT NOT NULL DEFAULT 'general'");
  console.log("Added audience column to brainstorm_conversations.");
} catch { console.log("brainstorm_conversations.audience already exists."); }

// Add thumbnail_url column to photos if missing
try {
  await db.execute("ALTER TABLE photos ADD COLUMN thumbnail_url TEXT NOT NULL DEFAULT ''");
  console.log("Added thumbnail_url column to photos.");
} catch { console.log("photos.thumbnail_url already exists."); }

// Add deployed_at column to posts and projects if missing
for (const table of ["posts", "projects"]) {
  try {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN deployed_at TEXT`);
    console.log(`Added deployed_at column to ${table}.`);
  } catch { console.log(`${table}.deployed_at already exists.`); }
}

// Add manifest column to deployments if missing
try {
  await db.execute("ALTER TABLE deployments ADD COLUMN manifest TEXT");
  console.log("Added manifest column to deployments.");
} catch { console.log("deployments.manifest already exists."); }

// Create any missing tables
await db.executeMultiple(SCHEMA);

// TTL cleanup: delete stale conversations older than 30 days
await db.executeMultiple(`
  DELETE FROM review_conversations WHERE updated_at < datetime('now', '-30 days');
  DELETE FROM brainstorm_conversations WHERE updated_at < datetime('now', '-30 days');
`);
console.log("Cleaned up conversations older than 30 days.");

console.log("Schema up to date.");

// ─── Migrate posts JSON tags → post_tags junction table ───────────────────
console.log("Migrating post tags to junction table...");
const postsWithTags = await db.execute("SELECT id, tags FROM posts WHERE tags IS NOT NULL AND tags != '[]'");
let migratedCount = 0;
for (const row of postsWithTags.rows) {
  const postId = row.id as number;
  let tagNames: string[];
  try {
    tagNames = JSON.parse((row.tags as string) || "[]");
  } catch {
    continue;
  }
  for (const name of tagNames) {
    if (!name.trim()) continue;
    const slug = name.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "");
    await db.execute({
      sql: "INSERT OR IGNORE INTO tags (name, slug) VALUES (?, ?)",
      args: [name, slug],
    });
    const tagRow = await db.execute({ sql: "SELECT id FROM tags WHERE slug = ?", args: [slug] });
    if (!tagRow.rows.length) continue;
    const tagId = tagRow.rows[0].id as number;
    await db.execute({
      sql: "INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)",
      args: [postId, tagId],
    });
    migratedCount++;
  }
}
console.log(`Migrated ${migratedCount} post↔tag associations.`);
console.log("Done.");
