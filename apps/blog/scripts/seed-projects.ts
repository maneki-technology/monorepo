/**
 * One-time seed: populate projects table from existing portfolio data.
 * Usage: TURSO_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/seed-projects.ts
 */

import { createClient } from "@libsql/client";

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_URL env var");
  process.exit(1);
}

const db = createClient({ url, authToken: authToken || undefined });

const projects = [
  {
    slug: "maneki-design-system",
    title: "Maneki Design System",
    description: "A zero-dependency Web Component design system with 50+ components, design tokens, and full dark theme support.",
    body_md: "",
    tech: JSON.stringify(["TypeScript", "Web Components", "Figma"]),
    url: "https://kien.maneki.tech",
    repo: "https://github.com/maneki-technology/monorepo",
    image: null,
    pinned: 1,
    sort_order: 0,
    status: "published",
  },
  {
    slug: "grid-layout-engine",
    title: "Grid Layout Engine",
    description: "Drag-and-resize grid layout as a Web Component. ~8KB gzipped, keyboard accessible, responsive breakpoints.",
    body_md: "",
    tech: JSON.stringify(["TypeScript", "Algorithms", "A11y"]),
    url: null,
    repo: "https://github.com/maneki-technology/monorepo/tree/main/packages/grid-layout",
    image: null,
    pinned: 1,
    sort_order: 1,
    status: "published",
  },
];

console.log(`Seeding ${projects.length} projects...`);

for (const p of projects) {
  await db.execute({
    sql: `INSERT INTO projects (slug, title, description, body_md, tech, url, repo, image, pinned, sort_order, status, published_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT (slug) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            tech = excluded.tech,
            url = excluded.url,
            repo = excluded.repo,
            pinned = excluded.pinned,
            sort_order = excluded.sort_order,
            status = excluded.status,
            published_at = excluded.published_at`,
    args: [p.slug, p.title, p.description, p.body_md, p.tech, p.url, p.repo, p.image, p.pinned, p.sort_order, p.status],
  });
  console.log(`  ✓ ${p.slug}`);
}

console.log(`\nSeeded ${projects.length} projects.`);
