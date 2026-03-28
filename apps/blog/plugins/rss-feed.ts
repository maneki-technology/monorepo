/**
 * Vite plugin that generates an RSS feed (feed.xml) at build time.
 * Reads posts from content/posts/ and generates a valid RSS 2.0 feed.
 */

import { type Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

import { SITE_URL, SITE_TITLE } from "../src/config.js";

const POSTS_DIR = "content/posts";

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
    closeBundle() {
      const postsDir = path.resolve(process.cwd(), POSTS_DIR);
      const distDir = path.resolve(process.cwd(), "dist");

      if (!fs.existsSync(postsDir)) {
        return;
      }

      const files = fs.readdirSync(postsDir)
        .filter((f) => f.endsWith(".md"))
        .sort()
        .reverse();

      const items = files.map((file) => {
        const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
        const { data } = matter(raw);
        const slug = file.replace(/\.md$/, "");
        const title = data.title ?? slug;
        const date = data.date
          ? new Date(data.date).toUTCString()
          : new Date().toUTCString();
        const excerpt = data.excerpt ?? "";
        const link = `${SITE_URL}/post/${slug}`;

        // Skip drafts
        if (data.draft) return null;

        return [
          "    <item>",
          `      <title>${escapeXml(title)}</title>`,
          `      <link>${link}</link>`,
          `      <guid>${link}</guid>`,
          `      <pubDate>${date}</pubDate>`,
          `      <description>${escapeXml(excerpt)}</description>`,
          "    </item>",
        ].join("\n");
      }).filter(Boolean);

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
    },
  };
}
