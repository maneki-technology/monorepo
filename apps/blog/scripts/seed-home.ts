/**
 * Seed homepage tagline into Turso (pages row, slug "home").
 * Usage: TURSO_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/seed-home.ts
 */

import { createClient } from "@libsql/client";

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_URL env var");
  process.exit(1);
}

const db = createClient({ url, authToken: authToken || undefined });

const title = "Home";
const description = "Homepage hero tagline. Only the content is rendered.";
const content =
  "Lead Software Engineer. 14+ years in fintech: payments, FX and authorization. Writing about distributed systems, micro-frontends and design systems. Amateur photographer.";

console.log("Seeding home page...");

await db.execute({
  sql: `INSERT INTO pages (slug, title, content, description, styles, status, updated_at)
        VALUES (?, ?, ?, ?, '', 'published', datetime('now'))
        ON CONFLICT (slug) DO UPDATE SET
          title = excluded.title,
          content = excluded.content,
          description = excluded.description,
          status = excluded.status,
          updated_at = excluded.updated_at`,
  args: ["home", title, content, description],
});

console.log("Done — home page seeded.");
