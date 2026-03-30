/**
 * Vite plugin that generates a sitemap.xml at build time.
 * Fetches published post slugs from Turso and generates URLs for all routes.
 */

import { type Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

import { SITE_URL } from "../src/config.js";

export function sitemapPlugin(): Plugin {
  return {
    name: "sitemap",
    async closeBundle() {
      const url = process.env.TURSO_URL;
      const authToken = process.env.TURSO_AUTH_TOKEN;
      const distDir = path.resolve(process.cwd(), "dist");

      // Static routes
      const urls: { loc: string; priority: string }[] = [
        { loc: `${SITE_URL}/`, priority: "1.0" },
        { loc: `${SITE_URL}/blog`, priority: "0.9" },
        { loc: `${SITE_URL}/portfolio`, priority: "0.7" },
        { loc: `${SITE_URL}/resume`, priority: "0.6" },
        { loc: `${SITE_URL}/about`, priority: "0.5" },
      ];

      // Post routes from Turso
      if (url) {
        try {
          const db = createClient({ url, authToken: authToken || undefined });
          const result = await db.execute(
            "SELECT slug FROM posts WHERE status = 'published' ORDER BY created_at DESC",
          );
          for (const row of result.rows) {
            urls.push({ loc: `${SITE_URL}/post/${row.slug as string}`, priority: "0.8" });
          }
        } catch (err) {
          console.error("[sitemap] Failed to fetch posts from Turso:", err);
        }
      } else {
        console.warn("[sitemap] TURSO_URL not set — sitemap will only have static routes");
      }

      const today = new Date().toISOString().split("T")[0];
      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map((u) => [
          "  <url>",
          `    <loc>${u.loc}</loc>`,
          `    <lastmod>${today}</lastmod>`,
          `    <priority>${u.priority}</priority>`,
          "  </url>",
        ].join("\n")),
        "</urlset>",
      ].join("\n");

      fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml);
      console.log(`[sitemap] Generated sitemap.xml with ${urls.length} URLs`);
    },
  };
}
