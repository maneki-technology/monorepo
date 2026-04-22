/**
 * Vite plugin that fetches published posts from Turso,
 * renders markdown to HTML, and exposes them as a virtual module.
 *
 * Usage: import { posts } from "virtual:posts";
 *
 * Requires TURSO_URL + TURSO_AUTH_TOKEN env vars at build time.
 * Falls back to empty array if DB is unavailable (dev without DB).
 */

import { type Plugin } from "vite";
import { getDb } from "./db.js";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import { createHighlighter } from "shiki";
import { fromHighlighter } from "@shikijs/markdown-it";
import { applyManekiRenderers } from "./markdown-utils.js";

const POSTS_VIRTUAL_ID = "virtual:posts";
const POSTS_RESOLVED_ID = "\0" + POSTS_VIRTUAL_ID;
const DRAFTS_VIRTUAL_ID = "virtual:drafts";
const DRAFTS_RESOLVED_ID = "\0" + DRAFTS_VIRTUAL_ID;

// Shiki highlighter (created lazily, cached)
let mdInstance: MarkdownIt | null = null;

async function getMd(): Promise<MarkdownIt> {
  if (mdInstance) return mdInstance;

  const highlighter = await createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: ["typescript", "javascript", "html", "css", "json", "bash", "markdown", "yaml", "rust", "sql"],
  });

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });

  md.use(fromHighlighter(highlighter, {
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultColor: false,
  }));

  // Add anchor IDs to headings
  md.use(anchor, {
    slugify: (s: string) => s.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, ""),
    permalink: false,
  });

  applyManekiRenderers(md);

  mdInstance = md;
  return md;
}

export function markdownPostsPlugin(): Plugin {
  async function loadFromDb(status: "published" | "draft", label: string): Promise<string> {
    const db = getDb();
    try {
      const result = await db.execute(
        `SELECT slug, title, body_md, excerpt, tags, created_at FROM posts WHERE status = '${status}' ORDER BY created_at DESC`,
      );

      const md = await getMd();

      const posts = result.rows.map((row) => {
        const bodyMd = row.body_md as string;
        const html = md.render(bodyMd);

        const words = bodyMd.split(/\s+/).length;
        const readTime = Math.max(1, Math.round(words / 200));

        // Extract headings for TOC
        const headings: { level: number; text: string; id: string }[] = [];
        const tokens = md.parse(bodyMd, {});
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          if (token.type === "heading_open") {
            const level = parseInt(token.tag.slice(1), 10);
            const inline = tokens[i + 1];
            if (inline?.type === "inline" && inline.content) {
              const text = inline.content;
              const id = text.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "");
              headings.push({ level, text, id });
            }
          }
        }

        return {
          slug: row.slug as string,
          title: row.title as string,
          date: (row.created_at as string).split("T")[0],
          readTime: `${readTime} min read`,
          excerpt: row.excerpt as string,
          // Reads from denormalized JSON tags column (kept in sync by posts API alongside post_tags junction table)
          tags: JSON.parse((row.tags as string) || "[]"),
          headings,
          content: html,
        };
      });

      console.log(`[markdown-posts] Loaded ${posts.length} ${label} posts from Turso`);
      return `export const ${label === "published" ? "posts" : "drafts"} = ${JSON.stringify(posts)};`;
    } catch (err) {
      console.error(`[markdown-posts] Failed to fetch ${label} from Turso:`, err);
      throw err;
    }
  }

  return {
    name: "markdown-posts",
    resolveId(id) {
      if (id === POSTS_VIRTUAL_ID) return POSTS_RESOLVED_ID;
      if (id === DRAFTS_VIRTUAL_ID) return DRAFTS_RESOLVED_ID;
    },
    async load(id) {
      if (id === POSTS_RESOLVED_ID) return loadFromDb("published", "published");
      if (id === DRAFTS_RESOLVED_ID) return loadFromDb("draft", "draft");
    },
  };
}
