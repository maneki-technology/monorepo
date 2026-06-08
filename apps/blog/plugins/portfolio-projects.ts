/**
 * Vite plugin that fetches published projects from Turso
 * and exposes them as a virtual module.
 *
 * Usage: import { projects, pinnedProjects } from "virtual:projects";
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

const VIRTUAL_MODULE_ID = "virtual:projects";
const RESOLVED_ID = "\0" + VIRTUAL_MODULE_ID;

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

  md.use(anchor, {
    slugify: (s: string) => s.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, ""),
    permalink: false,
  });

  applyManekiRenderers(md);

  mdInstance = md;
  return md;
}

export function portfolioProjectsPlugin(): Plugin {
  async function loadProjects(): Promise<string> {
    const db = getDb();
    try {
      const result = await db.execute(
        "SELECT slug, title, description, body_md, tech, url, repo, image, pinned, sort_order FROM projects WHERE status = 'published' ORDER BY sort_order ASC, created_at DESC",
      );

      const md = await getMd();
      const projects = result.rows.map((row) => ({
        slug: row.slug as string,
        title: row.title as string,
        description: row.description as string,
        content: md.render(row.body_md as string),
        tech: JSON.parse((row.tech as string) || "[]"),
        url: (row.url as string) ?? null,
        repo: (row.repo as string) ?? null,
        image: (row.image as string) ?? null,
        pinned: !!row.pinned,
        sortOrder: (row.sort_order as number) ?? 0,
      }));

      const pinned = projects.filter((p) => p.pinned);

      console.log(`[portfolio-projects] Loaded ${projects.length} published projects (${pinned.length} pinned)`);
      return `export const projects = ${JSON.stringify(projects)};\nexport const pinnedProjects = ${JSON.stringify(pinned)};`;
    } catch (err) {
      console.error("[portfolio-projects] Failed to fetch from Turso:", err);
      throw err;
    }
  }

  return {
    name: "portfolio-projects",
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_ID;
    },
    async load(id) {
      if (id === RESOLVED_ID) return loadProjects();
    },
  };
}
