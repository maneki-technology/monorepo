/**
 * Vite plugin that generates an RSS feed (feed.xml) at build time.
 * Fetches published posts from Turso and generates a valid RSS 2.0 feed.
 */

import { type Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

import { SITE_URL, SITE_TITLE } from "../src/config.js";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function rssFeedPlugin(): Plugin {
  return {
    name: "rss-feed",
    async closeBundle() {
      const url = process.env.TURSO_URL;
      const authToken = process.env.TURSO_AUTH_TOKEN;
      const distDir = path.resolve(process.cwd(), "dist");

      if (!url) {
        console.warn("[rss-feed] TURSO_URL not set — skipping feed.xml");
        return;
      }

      try {
        const db = createClient({ url, authToken: authToken || undefined });
        const result = await db.execute(
          "SELECT slug, title, excerpt, created_at FROM posts WHERE status = 'published' ORDER BY created_at DESC",
        );

        const items = result.rows.map((row) => {
          const slug = row.slug as string;
          const title = row.title as string;
          const date = new Date(row.created_at as string).toUTCString();
          const excerpt = row.excerpt as string;
          const link = `${SITE_URL}/post/${slug}`;

          return [
            "    <item>",
            `      <title>${escapeXml(title)}</title>`,
            `      <link>${link}</link>`,
            `      <guid>${link}</guid>`,
            `      <pubDate>${date}</pubDate>`,
            `      <description>${escapeXml(excerpt)}</description>`,
            "    </item>",
          ].join("\n");
        });

        const rss = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
          "  <channel>",
          `    <title>${escapeXml(SITE_TITLE)}</title>`,
          `    <link>${SITE_URL}</link>`,
          `    <description>Personal blog — fullstack development, design systems, and more.</description>`,
          `    <language>en</language>`,
          `    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />`,
          ...items,
          "  </channel>",
          "</rss>",
        ].join("\n");

        fs.writeFileSync(path.join(distDir, "feed.xml"), rss);
        console.log(`[rss-feed] Generated feed.xml with ${items.length} items`);
      } catch (err) {
        console.error("[rss-feed] Failed to generate feed:", err);
      }
    },
  };
}
