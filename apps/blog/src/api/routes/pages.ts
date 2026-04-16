/**
 * Pages CRUD routes.
 * Generic static pages (about, etc.) stored in Turso.
 * All routes are protected by CF Access auth middleware (applied at app level).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../index.js";

const createPageSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  title: z.string().default(""),
  content: z.string().default(""),
  meta: z.record(z.string(), z.unknown()).default({}),
  status: z.enum(["draft", "published"]).default("published"),
});

const updatePageSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export const pages = new Hono<Env>()
  // List all pages
  .get("/", async (c) => {
    const status = c.req.query("status");
    const db = c.get("db");

    const sql = status
      ? "SELECT * FROM pages WHERE status = ? ORDER BY updated_at DESC"
      : "SELECT * FROM pages WHERE status != 'deleted' ORDER BY updated_at DESC";
    const args = status ? [status] : [];

    const result = await db.execute({ sql, args });
    const rows = result.rows.map((r) => ({
      ...r,
      meta: JSON.parse((r.meta as string) || "{}"),
    }));
    return c.json({ pages: rows });
  })

  // Get single page by slug
  .get("/:slug", async (c) => {
    const db = c.get("db");
    const result = await db.execute({
      sql: "SELECT * FROM pages WHERE slug = ?",
      args: [c.req.param("slug")],
    });
    if (!result.rows.length) {
      return c.json({ error: "not found" }, 404);
    }
    const page = {
      ...result.rows[0],
      meta: JSON.parse((result.rows[0].meta as string) || "{}"),
    };
    return c.json({ page });
  })

  // Create page
  .post("/", zValidator("json", createPageSchema), async (c) => {
    const { slug, title, content, meta, status } = c.req.valid("json");
    const db = c.get("db");

    await db.execute({
      sql: `INSERT INTO pages (slug, title, content, meta, status, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [slug, title, content, JSON.stringify(meta), status],
    });
    const result = await db.execute({
      sql: "SELECT * FROM pages WHERE slug = ?",
      args: [slug],
    });
    const page = {
      ...result.rows[0],
      meta: JSON.parse((result.rows[0].meta as string) || "{}"),
    };
    return c.json({ ok: true, slug, page }, 201);
  })

  // Update page by slug
  .put("/:slug", zValidator("json", updatePageSchema), async (c) => {
    const slug = c.req.param("slug");
    const updates = c.req.valid("json");
    const db = c.get("db");

    const setClauses: string[] = [];
    const args: (string | number | null)[] = [];

    if (updates.title !== undefined) {
      setClauses.push("title = ?");
      args.push(updates.title);
    }
    if (updates.content !== undefined) {
      setClauses.push("content = ?");
      args.push(updates.content);
    }
    if (updates.meta !== undefined) {
      setClauses.push("meta = ?");
      args.push(JSON.stringify(updates.meta));
    }
    if (updates.status !== undefined) {
      setClauses.push("status = ?");
      args.push(updates.status);
    }

    if (setClauses.length === 0) {
      return c.json({ error: "no fields to update" }, 400);
    }

    setClauses.push("updated_at = datetime('now')");
    args.push(slug);

    await db.execute({
      sql: `UPDATE pages SET ${setClauses.join(", ")} WHERE slug = ?`,
      args,
    });
    const result = await db.execute({
      sql: "SELECT * FROM pages WHERE slug = ?",
      args: [slug],
    });
    const page = {
      ...result.rows[0],
      meta: JSON.parse((result.rows[0].meta as string) || "{}"),
    };
    return c.json({ ok: true, page });
  })

  // Soft delete page by slug
  .delete("/:slug", async (c) => {
    const db = c.get("db");
    await db.execute({
      sql: "UPDATE pages SET status = 'deleted', updated_at = datetime('now') WHERE slug = ?",
      args: [c.req.param("slug")],
    });
    return c.json({ ok: true });
  });
