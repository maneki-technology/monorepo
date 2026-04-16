/**
 * Pages CRUD routes — generic editable pages (about, resume, home, etc.).
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
  title: z.string().min(1),
  content: z.string().default(""),
  description: z.string().default(""),
  status: z.enum(["draft", "published"]).default("draft"),
});

const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  description: z.string().optional(),
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
    return c.json({ pages: result.rows });
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
    return c.json({ page: result.rows[0] });
  })

  // Create page
  .post("/", zValidator("json", createPageSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    await db.execute({
      sql: `INSERT INTO pages (slug, title, content, description, status, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [data.slug, data.title, data.content, data.description, data.status],
    });
    const result = await db.execute({
      sql: "SELECT * FROM pages WHERE slug = ?",
      args: [data.slug],
    });
    return c.json({ ok: true, page: result.rows[0] }, 201);
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
    if (updates.description !== undefined) {
      setClauses.push("description = ?");
      args.push(updates.description);
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
    return c.json({ ok: true, page: result.rows[0] });
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
