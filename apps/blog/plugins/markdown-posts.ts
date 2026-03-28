/**
 * Vite plugin that reads markdown files from content/posts/,
 * parses frontmatter + body, and exposes them as a virtual module.
 *
 * Usage: import { posts } from "virtual:posts";
 */

import { type Plugin } from "vite";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import { createHighlighter } from "shiki";
import { fromHighlighter } from "@shikijs/markdown-it";

const VIRTUAL_MODULE_ID = "virtual:posts";
const RESOLVED_ID = "\0" + VIRTUAL_MODULE_ID;
const POSTS_DIR = "content/posts";

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

// ─── Custom renderers: output Maneki Web Components instead of plain HTML ───

  // <a> → <ui-link>
  const defaultLinkOpen = md.renderer.rules.link_open ||
    function (tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const href = token.attrGet("href") ?? "";
    const isExternal = /^https?:\/\//.test(href);
    token.tag = "ui-link";
    if (isExternal) {
      token.attrSet("external", "");
      token.attrSet("target", "_blank");
      token.attrSet("rel", "noopener");
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  md.renderer.rules.link_close = function () {
    return "</ui-link>";
  };

  // <img> → <ui-image>
  md.renderer.rules.image = function (tokens, idx) {
    const token = tokens[idx];
    const src = token.attrGet("src") ?? "";
    const alt = token.content ?? "";
    return `<ui-image src="${src}" alt="${alt}"></ui-image>`;
  };

  mdInstance = md;
  return md;
}

export function markdownPostsPlugin(): Plugin {
  const postsDir = path.resolve(process.cwd(), POSTS_DIR);

  async function loadPosts(): Promise<string> {
    if (!fs.existsSync(postsDir)) {
      return "export const posts = [];";
    }

    const md = await getMd();

    const files = fs.readdirSync(postsDir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .reverse();

    // Filter out drafts in production
    const posts = files.map((file) => {
      const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
      const { data, content } = matter(raw);

      // Skip drafts
      if (data.draft) return null;

      const slug = file.replace(/\.md$/, "");

      const html = md.render(content);

      const words = content.split(/\s+/).length;
      const readTime = Math.max(1, Math.round(words / 200));

      // Extract headings for TOC
      const headings: { level: number; text: string; id: string }[] = [];
      const tokens = md.parse(content, {});
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
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        readTime: `${readTime} min read`,
        excerpt: data.excerpt ?? "",
        tags: data.tags ?? [],
        headings,
        content: html,
      };
    }).filter(Boolean);

    return `export const posts = ${JSON.stringify(posts)};`;
  }

  return {
    name: "markdown-posts",
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_ID;
    },
    async load(id) {
      if (id === RESOLVED_ID) return loadPosts();
    },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(postsDir)) {
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) {
          server.moduleGraph.invalidateModule(mod);
          return [mod];
        }
      }
    },
  };
}
