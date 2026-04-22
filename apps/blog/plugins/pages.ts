/**
 * Vite plugin that fetches published pages from Turso,
 * renders markdown content to HTML, and exposes them as a virtual module.
 *
 * Usage:
 *   import { pages, getPage } from "virtual:pages";
 *
 * Requires TURSO_URL + TURSO_AUTH_TOKEN env vars at build time.
 * Falls back to empty array if DB is unavailable (dev without DB).
 */

import { type Plugin } from "vite";
import { getDb } from "./db.js";
import MarkdownIt from "markdown-it";
import { applyManekiRenderers } from "./markdown-utils.js";

const VIRTUAL_MODULE_ID = "virtual:pages";
const RESOLVED_ID = "\0" + VIRTUAL_MODULE_ID;

const EMPTY = "export const pages = [];\nexport function getPage(_slug) { return undefined; }";

function createMd(): MarkdownIt {
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
  applyManekiRenderers(md);
  return md;
}

export function pagesPlugin(): Plugin {
  async function loadPages(): Promise<string> {
    const db = getDb();
    try {
      const result = await db.execute(
        "SELECT slug, title, content, description, updated_at FROM pages WHERE status = 'published' ORDER BY updated_at DESC",
      );

      const md = createMd();

      const pages = result.rows.map((row) => ({
        slug: row.slug as string,
        title: row.title as string,
        content: md.render(row.content as string),
        description: row.description as string,
        styles: row.styles as string,
        updatedAt: row.updated_at as string,
      }));

      console.log(`[pages] Loaded ${pages.length} published pages from Turso`);
      return `export const pages = ${JSON.stringify(pages)};\nexport function getPage(slug) { return pages.find((p) => p.slug === slug); }`;
    } catch (err) {
      console.error("[pages] Failed to fetch pages from Turso:", err);
      throw err;
    }
  }

  return {
    name: "pages",
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_ID;
    },
    async load(id) {
      if (id === RESOLVED_ID) return loadPages();
    },
  };
}
