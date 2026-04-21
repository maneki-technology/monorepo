/**
 * Photos CRUD routes.
 * All routes are protected by CF Access auth middleware (applied at app level).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../index.js";

const createPhotoSchema = z.object({
  r2_key: z.string().min(1),
  url: z.string().min(1),
  title: z.string().default(""),
  caption: z.string().default(""),
  album_id: z.number().nullable().default(null),
  category: z.string().default(""),
  location: z.string().default(""),
  latitude: z.number().nullable().default(null),
  longitude: z.number().nullable().default(null),
  width: z.number().default(0),
  height: z.number().default(0),
  thumbhash: z.string().default(""),
  exif_json: z.string().default("{}"),
  sort_order: z.number().default(0),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
  tag_ids: z.array(z.number()).default([]),
});

const updatePhotoSchema = z.object({
  title: z.string().optional(),
  caption: z.string().optional(),
  album_id: z.number().nullable().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  thumbhash: z.string().optional(),
  exif_json: z.string().optional(),
  sort_order: z.number().optional(),
  featured: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional(),
  tag_ids: z.array(z.number()).optional(),
});

export const photos = new Hono<Env>()
  // List published photos (public-facing, supports ?album=slug and ?category=name)
  .get("/", async (c) => {
    const status = c.req.query("status");
    const albumSlug = c.req.query("album");
    const category = c.req.query("category");
    const tagSlug = c.req.query("tag");
    const db = c.get("db");

    let sql: string;
    const args: (string | number)[] = [];

    if (tagSlug) {
      sql = status
        ? "SELECT DISTINCT p.* FROM photos p JOIN photo_tags pt ON p.id = pt.photo_id JOIN tags t ON pt.tag_id = t.id WHERE t.slug = ? AND p.status = ? ORDER BY p.sort_order ASC, p.created_at DESC"
        : "SELECT DISTINCT p.* FROM photos p JOIN photo_tags pt ON p.id = pt.photo_id JOIN tags t ON pt.tag_id = t.id WHERE t.slug = ? AND p.status != 'deleted' ORDER BY p.sort_order ASC, p.created_at DESC";
      args.push(tagSlug);
      if (status) args.push(status);
    } else if (albumSlug) {
      sql = status
        ? "SELECT p.* FROM photos p JOIN albums a ON p.album_id = a.id WHERE a.slug = ? AND p.status = ? ORDER BY p.sort_order ASC, p.created_at DESC"
        : "SELECT p.* FROM photos p JOIN albums a ON p.album_id = a.id WHERE a.slug = ? AND p.status != 'deleted' ORDER BY p.sort_order ASC, p.created_at DESC";
      args.push(albumSlug);
      if (status) args.push(status);
    } else if (category) {
      sql = status
        ? "SELECT * FROM photos WHERE category = ? AND status = ? ORDER BY sort_order ASC, created_at DESC"
        : "SELECT * FROM photos WHERE category = ? AND status != 'deleted' ORDER BY sort_order ASC, created_at DESC";
      args.push(category);
      if (status) args.push(status);
    } else {
      sql = status
        ? "SELECT * FROM photos WHERE status = ? ORDER BY sort_order ASC, created_at DESC"
        : "SELECT * FROM photos WHERE status != 'deleted' ORDER BY sort_order ASC, created_at DESC";
      if (status) args.push(status);
    }

    const result = await db.execute({ sql, args });
    const rows = result.rows.map((r) => ({
      ...r,
      id: r.id as number,
      featured: !!r.featured,
      exif_json: JSON.parse((r.exif_json as string) || "{}"),
      tags: [] as Array<{ id: number; name: string; slug: string }>,
    }));
    // Attach tags to each photo
    if (rows.length > 0) {
      const ids = rows.map((r) => r.id);
      const tagResult = await db.execute({
        sql: `SELECT pt.photo_id, t.id, t.name, t.slug FROM photo_tags pt JOIN tags t ON pt.tag_id = t.id WHERE pt.photo_id IN (${ids.map(() => "?").join(",")})`,
        args: ids,
      });
      const tagMap = new Map<number, Array<{ id: number; name: string; slug: string }>>();
      for (const tr of tagResult.rows) {
        const pid = tr.photo_id as number;
        if (!tagMap.has(pid)) tagMap.set(pid, []);
        tagMap.get(pid)!.push({ id: tr.id as number, name: tr.name as string, slug: tr.slug as string });
      }
      for (const row of rows) {
        row.tags = tagMap.get(row.id) ?? [];
      }
    }
    return c.json({ photos: rows });
  })

  // Get single photo by id
  .get("/:id", async (c) => {
    const db = c.get("db");
    const result = await db.execute({
      sql: "SELECT * FROM photos WHERE id = ?",
      args: [Number(c.req.param("id"))],
    });
    if (!result.rows.length) {
      return c.json({ error: "not found" }, 404);
    }
    const photo = {
      ...result.rows[0],
      featured: !!result.rows[0].featured,
      exif_json: JSON.parse((result.rows[0].exif_json as string) || "{}"),
      tags: [] as Array<{ id: number; name: string; slug: string }>,
    };
    // Attach tags
    const tagResult = await db.execute({
      sql: "SELECT t.id, t.name, t.slug FROM photo_tags pt JOIN tags t ON pt.tag_id = t.id WHERE pt.photo_id = ?",
      args: [Number(c.req.param("id"))],
    });
    photo.tags = tagResult.rows.map((t) => ({ id: t.id as number, name: t.name as string, slug: t.slug as string }));
    return c.json({ photo });
  })

  // Create photo
  .post("/", zValidator("json", createPhotoSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    await db.execute({
      sql: `INSERT INTO photos (r2_key, url, title, caption, album_id, category, location, latitude, longitude, width, height, thumbhash, exif_json, sort_order, featured, status, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        data.r2_key,
        data.url,
        data.title,
        data.caption,
        data.album_id,
        data.category,
        data.location,
        data.latitude,
        data.longitude,
        data.width,
        data.height,
        data.thumbhash,
        data.exif_json,
        data.sort_order,
        data.featured ? 1 : 0,
        data.status,
      ],
    });
    // Insert tag associations
    if (data.tag_ids.length > 0) {
      const lastId = await db.execute("SELECT last_insert_rowid() as id");
      const photoId = lastId.rows[0].id as number;
      for (const tagId of data.tag_ids) {
        await db.execute({
          sql: "INSERT OR IGNORE INTO photo_tags (photo_id, tag_id) VALUES (?, ?)",
          args: [photoId, tagId],
        });
      }
    }
    return c.json({ ok: true }, 201);
  })

  // Update photo by id
  .put("/:id", zValidator("json", updatePhotoSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const updates = c.req.valid("json");
    const db = c.get("db");

    const setClauses: string[] = [];
    const args: (string | number | null)[] = [];

    if (updates.title !== undefined) {
      setClauses.push("title = ?");
      args.push(updates.title);
    }
    if (updates.caption !== undefined) {
      setClauses.push("caption = ?");
      args.push(updates.caption);
    }
    if (updates.album_id !== undefined) {
      setClauses.push("album_id = ?");
      args.push(updates.album_id);
    }
    if (updates.category !== undefined) {
      setClauses.push("category = ?");
      args.push(updates.category);
    }
    if (updates.location !== undefined) {
      setClauses.push("location = ?");
      args.push(updates.location);
    }
    if (updates.latitude !== undefined) {
      setClauses.push("latitude = ?");
      args.push(updates.latitude);
    }
    if (updates.longitude !== undefined) {
      setClauses.push("longitude = ?");
      args.push(updates.longitude);
    }
    if (updates.width !== undefined) {
      setClauses.push("width = ?");
      args.push(updates.width);
    }
    if (updates.height !== undefined) {
      setClauses.push("height = ?");
      args.push(updates.height);
    }
    if (updates.thumbhash !== undefined) {
      setClauses.push("thumbhash = ?");
      args.push(updates.thumbhash);
    }
    if (updates.exif_json !== undefined) {
      setClauses.push("exif_json = ?");
      args.push(updates.exif_json);
    }
    if (updates.sort_order !== undefined) {
      setClauses.push("sort_order = ?");
      args.push(updates.sort_order);
    }
    if (updates.featured !== undefined) {
      setClauses.push("featured = ?");
      args.push(updates.featured ? 1 : 0);
    }
    if (updates.status !== undefined) {
      setClauses.push("status = ?");
      args.push(updates.status);
    }

    if (setClauses.length === 0) {
      return c.json({ error: "no fields to update" }, 400);
    }

    setClauses.push("updated_at = datetime('now')");
    args.push(id);

    await db.execute({
      sql: `UPDATE photos SET ${setClauses.join(", ")} WHERE id = ?`,
      args,
    });
    // Replace tag associations if provided
    if (updates.tag_ids !== undefined) {
      await db.execute({ sql: "DELETE FROM photo_tags WHERE photo_id = ?", args: [id] });
      for (const tagId of updates.tag_ids) {
        await db.execute({
          sql: "INSERT OR IGNORE INTO photo_tags (photo_id, tag_id) VALUES (?, ?)",
          args: [id, tagId],
        });
      }
    }
    return c.json({ ok: true });
  })

  // Soft delete photo by id
  .delete("/:id", async (c) => {
    const db = c.get("db");
    await db.execute({
      sql: "UPDATE photos SET status = 'deleted', updated_at = datetime('now') WHERE id = ?",
      args: [Number(c.req.param("id"))],
    });
    return c.json({ ok: true });
  });
