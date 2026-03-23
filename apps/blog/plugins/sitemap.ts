/**
 * Vite plugin that generates a sitemap.xml at build time.
 * Reads posts from content/posts/ and generates URLs for all routes.
 */

import { type Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://blog.maneki.tech";
const POSTS_DIR = "content/posts";

export function sitemapPlugin(): Plugin {
  return {
    name: "sitemap",
    closeBundle() {
      const postsDir = path.resolve(process.cwd(), POSTS_DIR);
      const distDir = path.resolve(process.cwd(), "dist");

      // Static routes
      const urls: { loc: string; priority: string }[] = [
        { loc: `${SITE_URL}/`, priority: "1.0" },
        { loc: `${SITE_URL}/blog`, priority: "0.9" },
        { loc: `${SITE_URL}/portfolio`, priority: "0.7" },
        { loc: `${SITE_URL}/resume`, priority: "0.6" },
        { loc: `${SITE_URL}/about`, priority: "0.5" },
      ];

      // Post routes
      if (fs.existsSync(postsDir)) {
        const files = fs.readdirSync(postsDir)
          .filter((f) => f.endsWith(".md"))
          .sort()
          .reverse();

        for (const file of files) {
          const slug = file.replace(/\.md$/, "");
          urls.push({ loc: `${SITE_URL}/post/${slug}`, priority: "0.8" });
        }
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
    },
  };
}
