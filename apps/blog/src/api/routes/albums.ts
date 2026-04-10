/**
 * Albums CRUD routes.
 * All routes are protected by CF Access auth middleware (applied at app level).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../index.js";

const createAlbumSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  description: z.string().default(""),
  cover_photo_id: z.number().nullable().default(null),
  sort_order: z.number().default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

const updateAlbumSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().optional(),
  cover_photo_id: z.number().nullable().optional(),
  sort_order: z.number().optional(),
  status: z.enum(["draft", "published"]).optional(),
});

export const albums = new Hono<Env>()
  // List albums (optionally filter by status)
  .get("/", async (c) => {
    const status = c.req.query("status");
    const db = c.get("db");

    const sql = status
      ? "SELECT a.*, (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id AND p.status = 'published') AS photo_count FROM albums a WHERE a.status = ? ORDER BY a.sort_order ASC, a.created_at DESC"
      : "SELECT a.*, (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id AND p.status = 'published') AS photo_count FROM albums a WHERE a.status != 'deleted' ORDER BY a.sort_order ASC, a.created_at DESC";
    const args = status ? [status] : [];

    const result = await db.execute({ sql, args });
    return c.json({ albums: result.rows });
  })

  // Get single album by slug (includes photo count)
  .get("/:slug", async (c) => {
    const db = c.get("db");
    const result = await db.execute({
      sql: "SELECT a.*, (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id AND p.status = 'published') AS photo_count FROM albums a WHERE a.slug = ?",
      args: [c.req.param("slug")],
    });
    if (!result.rows.length) {
      return c.json({ error: "not found" }, 404);
    }
    return c.json({ album: result.rows[0] });
  })

  // Create album
  .post("/", zValidator("json", createAlbumSchema), async (c) => {
    const { title, slug, description, cover_photo_id, sort_order, status } = c.req.valid("json");
    const db = c.get("db");

    await db.execute({
      sql: `INSERT INTO albums (title, slug, description, cover_photo_id, sort_order, status, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [title, slug, description, cover_photo_id, sort_order, status],
    });
    return c.json({ ok: true, slug }, 201);
  })

  // Update album by slug
  .put("/:slug", zValidator("json", updateAlbumSchema), async (c) => {
    const slug = c.req.param("slug");
    const updates = c.req.valid("json");
    const db = c.get("db");

    const setClauses: string[] = [];
    const args: (string | number | null)[] = [];

    if (updates.title !== undefined) {
      setClauses.push("title = ?");
      args.push(updates.title);
    }
    if (updates.slug !== undefined) {
      setClauses.push("slug = ?");
      args.push(updates.slug);
    }
    if (updates.description !== undefined) {
      setClauses.push("description = ?");
      args.push(updates.description);
    }
    if (updates.cover_photo_id !== undefined) {
      setClauses.push("cover_photo_id = ?");
      args.push(updates.cover_photo_id);
    }
    if (updates.sort_order !== undefined) {
      setClauses.push("sort_order = ?");
      args.push(updates.sort_order);
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
      sql: `UPDATE albums SET ${setClauses.join(", ")} WHERE slug = ?`,
      args,
    });
    return c.json({ ok: true });
  })

  // Soft delete album by slug
  .delete("/:slug", async (c) => {
    const db = c.get("db");
    await db.execute({
      sql: "UPDATE albums SET status = 'deleted', updated_at = datetime('now') WHERE slug = ?",
      args: [c.req.param("slug")],
    });
    return c.json({ ok: true });
  });
