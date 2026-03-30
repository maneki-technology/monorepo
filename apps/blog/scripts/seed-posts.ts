/**
 * One-time migration: seed existing markdown posts from content/posts/ into Turso.
 * Usage: TURSO_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/seed-posts.ts
 */

import { createClient } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };
  const content = match[2];
  const data: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (!m) continue;
    const [, key, val] = m;
    if (val.startsWith("[") && val.endsWith("]")) {
      data[key] = val.slice(1, -1).split(",").map((s) => s.trim());
    } else if (val.startsWith('"') && val.endsWith('"')) {
      data[key] = val.slice(1, -1);
    } else {
      data[key] = val;
    }
  }
  return { data, content };
}

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_URL env var");
  process.exit(1);
}

const db = createClient({ url, authToken: authToken || undefined });
const postsDir = path.resolve(import.meta.dirname, "../content/posts");

const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md")).sort();

console.log(`Seeding ${files.length} posts from content/posts/...`);

for (const file of files) {
  const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
  const { data, content } = parseFrontmatter(raw);
  const slug = file.replace(/\.md$/, "");

  await db.execute({
    sql: `INSERT INTO posts (slug, title, body_md, excerpt, tags, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 'published', ?, datetime('now'))
          ON CONFLICT (slug) DO UPDATE SET
            title = excluded.title,
            body_md = excluded.body_md,
            excerpt = excluded.excerpt,
            tags = excluded.tags,
            status = excluded.status,
            created_at = excluded.created_at,
            updated_at = excluded.updated_at`,
    args: [
      slug,
      data.title ?? slug,
      content.trim(),
      data.excerpt ?? "",
      JSON.stringify(data.tags ?? []),
      data.date ?? new Date().toISOString().split("T")[0],
    ],
  });

  console.log(`  ✓ ${slug}`);
}

console.log(`\nSeeded ${files.length} posts.`);
