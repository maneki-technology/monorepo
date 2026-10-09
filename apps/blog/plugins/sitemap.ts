/**
 * Vite plugin that generates a sitemap.xml at build time.
 * Fetches published content from Turso and dates each URL by its content's updated_at.
 */

import { type Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import { getDb } from "./db.js";

import { SITE_URL } from "../src/config.js";

export function sitemapPlugin(): Plugin {
  return {
    name: "sitemap",
    async closeBundle() {
      const distDir = path.resolve(process.cwd(), "dist");

      // Post, project and page timestamps from Turso
      const db = getDb();
      const posts: { slug: string; lastmod: string }[] = [];
      const projects: { slug: string; lastmod: string }[] = [];
      const pages = new Map<string, string>();
      let photography: string | undefined;
      try {
        const postRows = await db.execute(
          "SELECT slug, updated_at FROM posts WHERE status = 'published' ORDER BY created_at DESC",
        );
        for (const row of postRows.rows) {
          posts.push({ slug: row.slug as string, lastmod: toDate(row.updated_at) });
        }

        const projectRows = await db.execute(
          "SELECT slug, updated_at FROM projects WHERE status = 'published' ORDER BY sort_order ASC, created_at DESC",
        );
        for (const row of projectRows.rows) {
          projects.push({ slug: row.slug as string, lastmod: toDate(row.updated_at) });
        }

        const pageRows = await db.execute("SELECT slug, updated_at FROM pages WHERE status = 'published'");
        for (const row of pageRows.rows) {
          pages.set(row.slug as string, toDate(row.updated_at));
        }

        const photoRows = await db.execute(
          "SELECT MAX(updated_at) AS updated_at FROM (SELECT updated_at FROM photos WHERE status = 'published' UNION ALL SELECT updated_at FROM albums WHERE status = 'published')",
        );
        const photoUpdatedAt = photoRows.rows[0]?.updated_at;
        if (photoUpdatedAt) photography = toDate(photoUpdatedAt);
      } catch (err) {
        console.error("[sitemap] Failed to fetch posts/projects from Turso:", err);
        throw err;
      }

      // Listing pages change when their newest item does; the home page lists posts, projects and photos
      const blog = latest(posts.map((p) => p.lastmod));
      const portfolio = latest(projects.map((p) => p.lastmod));
      const urls: { loc: string; priority: string; lastmod?: string }[] = [
        { loc: `${SITE_URL}/`, priority: "1.0", lastmod: latest([blog, portfolio, photography]) },
        { loc: `${SITE_URL}/blog`, priority: "0.9", lastmod: blog },
        { loc: `${SITE_URL}/portfolio`, priority: "0.7", lastmod: portfolio },
        { loc: `${SITE_URL}/photography`, priority: "0.7", lastmod: photography },
        { loc: `${SITE_URL}/resume`, priority: "0.6", lastmod: pages.get("resume") },
        { loc: `${SITE_URL}/about`, priority: "0.5", lastmod: pages.get("about") },
        ...posts.map((p) => ({ loc: `${SITE_URL}/post/${p.slug}`, priority: "0.8", lastmod: p.lastmod })),
        ...projects.map((p) => ({ loc: `${SITE_URL}/project/${p.slug}`, priority: "0.7", lastmod: p.lastmod })),
      ];

      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map((u) =>
          [
            "  <url>",
            `    <loc>${u.loc}</loc>`,
            ...(u.lastmod ? [`    <lastmod>${u.lastmod}</lastmod>`] : []),
            `    <priority>${u.priority}</priority>`,
            "  </url>",
          ].join("\n"),
        ),
        "</urlset>",
      ].join("\n");

      fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml);
      console.log(`[sitemap] Generated sitemap.xml with ${urls.length} URLs`);
    },
  };
}

/** SQLite `datetime('now')` text ("YYYY-MM-DD HH:MM:SS") → W3C date. */
function toDate(value: unknown): string {
  return String(value).slice(0, 10);
}

function latest(dates: (string | undefined)[]): string | undefined {
  return dates
    .filter((d) => d !== undefined)
    .sort()
    .at(-1);
}
