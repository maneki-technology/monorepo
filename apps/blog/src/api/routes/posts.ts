/**
 * Posts CRUD routes.
 * All routes are protected by CF Access auth middleware (applied at app level).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Client } from "@libsql/client";
import type { Env } from "../index.js";
import { buildSetClauses, toJson } from "../db/helpers.js";

const createPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  body_md: z.string(),
  excerpt: z.string().default(""),
  tags: z.array(z.string()).default([]),
  tag_ids: z.array(z.number()).optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  date: z.string().optional(),
});

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  body_md: z.string().optional(),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  tag_ids: z.array(z.number()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  date: z.string().optional(),
  new_slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case").optional(),
});

/** Attach tags from post_tags junction table to an array of post rows. */
async function attachTags(db: Client, rows: Record<string, unknown>[]): Promise<void> {
  if (!rows.length) return;
  const ids = rows.map((r) => r.id as number);
  const tagResult = await db.execute({
    sql: `SELECT pt.post_id, t.id, t.name, t.slug FROM post_tags pt JOIN tags t ON pt.tag_id = t.id WHERE pt.post_id IN (${ids.map(() => "?").join(",")})`,
    args: ids,
  });
  const tagMap = new Map<number, Array<{ id: number; name: string; slug: string }>>();
  for (const tr of tagResult.rows) {
    const pid = tr.post_id as number;
    if (!tagMap.has(pid)) tagMap.set(pid, []);
    tagMap.get(pid)!.push({ id: tr.id as number, name: tr.name as string, slug: tr.slug as string });
  }
  for (const row of rows) {
    (row as Record<string, unknown>).tag_objects = tagMap.get(row.id as number) ?? [];
  }
}

/** Replace all post_tags associations for a post (delete + insert pattern). */
async function replacePostTags(db: Client, postId: number, tagIds: number[]): Promise<void> {
  await db.execute({ sql: "DELETE FROM post_tags WHERE post_id = ?", args: [postId] });
  for (const tagId of tagIds) {
    await db.execute({
      sql: "INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)",
      args: [postId, tagId],
    });
  }
}

export const posts = new Hono<Env>()
  // List posts (optionally filter by status)
  .get("/", async (c) => {
    const status = c.req.query("status");
    const limit = c.req.query("limit") ? Math.min(Number(c.req.query("limit")), 200) : undefined;
    const offset = c.req.query("offset") ? Number(c.req.query("offset")) : 0;
    const db = c.get("db");

    const where = status ? "WHERE status = ?" : "WHERE status != 'deleted'";
    const args: (string | number)[] = status ? [status] : [];

    // Get total count
    const countResult = await db.execute({ sql: `SELECT COUNT(*) as count FROM posts ${where}`, args });
    const total = countResult.rows[0].count as number;

    let sql = `SELECT * FROM posts ${where} ORDER BY updated_at DESC`;
    if (limit !== undefined) {
      sql += " LIMIT ? OFFSET ?";
      args.push(limit, offset);
    }

    const result = await db.execute({ sql, args });
    const rows = result.rows.map((r) => ({
      ...r,
      tags: JSON.parse((r.tags as string) || "[]"),
    }));
    // Attach structured tags from junction table
    await attachTags(db, rows as Record<string, unknown>[]);
    const response: Record<string, unknown> = { posts: rows, total };
    if (limit !== undefined) {
      response.hasMore = offset + rows.length < total;
    }
    return c.json(response);
  })

  // Get single post by slug
  .get("/:slug", async (c) => {
    const db = c.get("db");
    const result = await db.execute({
      sql: "SELECT * FROM posts WHERE slug = ?",
      args: [c.req.param("slug")],
    });
    if (!result.rows.length) {
      return c.json({ error: "not found" }, 404);
    }
    const post = {
      ...result.rows[0],
      tags: JSON.parse((result.rows[0].tags as string) || "[]"),
    };
    // Attach structured tags from junction table
    await attachTags(db, [post as Record<string, unknown>]);
    return c.json({ post });
  })

  // Create post
  .post("/", zValidator("json", createPostSchema), async (c) => {
    const { title, slug, body_md, excerpt, tags, tag_ids, status, date } = c.req.valid("json");
    const db = c.get("db");

    const createdAt = date || new Date().toISOString();
    await db.execute({
      sql: `INSERT INTO posts (title, slug, body_md, excerpt, tags, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [title, slug, body_md, excerpt, JSON.stringify(tags), status, createdAt],
    });
    const result = await db.execute({
      sql: "SELECT * FROM posts WHERE slug = ?",
      args: [slug],
    });
    const postId = result.rows[0].id as number;

    // Insert post_tags associations
    if (tag_ids && tag_ids.length > 0) {
      for (const tagId of tag_ids) {
        await db.execute({
          sql: "INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)",
          args: [postId, tagId],
        });
      }
    }

    const post = {
      ...result.rows[0],
      tags: JSON.parse((result.rows[0].tags as string) || "[]"),
    };
    await attachTags(db, [post as Record<string, unknown>]);
    return c.json({ ok: true, slug, post }, 201);
  })

  // Update post by slug
  .put("/:slug", zValidator("json", updatePostSchema), async (c) => {
    const slug = c.req.param("slug");
    const updates = c.req.valid("json");
    const db = c.get("db");

    // Build dynamic SET clause
    const { clauses: setClauses, args } = buildSetClauses(updates, {
      title: "title",
      body_md: "body_md",
      excerpt: "excerpt",
      tags: { column: "tags", transform: toJson },
      status: "status",
      date: { column: "created_at" },
    });
    // Atomic slug rename — single UPDATE instead of DELETE + CREATE
    let newSlug = slug;
    if (updates.new_slug !== undefined && updates.new_slug !== slug) {
      setClauses.push("slug = ?");
      args.push(updates.new_slug);
      newSlug = updates.new_slug;
    }

    if (setClauses.length === 0 && updates.tag_ids === undefined) {
      return c.json({ error: "no fields to update" }, 400);
    }

    if (setClauses.length > 0) {
      setClauses.push("updated_at = datetime('now')");
      args.push(slug);

      await db.execute({
        sql: `UPDATE posts SET ${setClauses.join(", ")} WHERE slug = ?`,
        args,
      });
    }

    // Cascade slug rename to conversation tables
    if (newSlug !== slug) {
      await db.execute({ sql: "UPDATE review_conversations SET slug = ? WHERE slug = ? AND type = 'post'", args: [newSlug, slug] });
      await db.execute({ sql: "UPDATE brainstorm_conversations SET slug = ? WHERE slug = ? AND type = 'post'", args: [newSlug, slug] });
    }

    // Replace post_tags associations if tag_ids provided
    if (updates.tag_ids !== undefined) {
      const idResult = await db.execute({ sql: "SELECT id FROM posts WHERE slug = ?", args: [newSlug] });
      if (idResult.rows.length) {
        await replacePostTags(db, idResult.rows[0].id as number, updates.tag_ids);
      }
    }
    const result = await db.execute({
      sql: "SELECT * FROM posts WHERE slug = ?",
      args: [newSlug],
    });
    const post = {
      ...result.rows[0],
      tags: JSON.parse((result.rows[0].tags as string) || "[]"),
    };
    await attachTags(db, [post as Record<string, unknown>]);
    return c.json({ ok: true, slug: newSlug, post });
  })

  // Soft delete post by slug
  .delete("/:slug", async (c) => {
    const db = c.get("db");
    await db.execute({
      sql: "UPDATE posts SET status = 'deleted', updated_at = datetime('now') WHERE slug = ?",
      args: [c.req.param("slug")],
    });
    return c.json({ ok: true });
  })

  // Publish — save content + set publishing + trigger deploy
  .put("/:slug/publish", zValidator("json", updatePostSchema), async (c) => {
    const db = c.get("db");
    const slug = c.req.param("slug");
    const updates = c.req.valid("json");

    const { clauses: extraClauses, args } = buildSetClauses(updates, {
      title: "title",
      body_md: "body_md",
      excerpt: "excerpt",
      tags: { column: "tags", transform: toJson },
      date: { column: "created_at" },
    });
    const setClauses: string[] = ["status = 'published'", "updated_at = datetime('now')", "published_at = datetime('now')", ...extraClauses];

    // Regenerate slug if it's a temp slug
    let newSlug = slug;
    if (slug.startsWith("draft-") && updates.title) {
      const base = updates.title.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "");
      newSlug = updates.date ? `${updates.date}-${base}` : base;
      setClauses.push("slug = ?");
      args.push(newSlug);
    }

    args.push(slug);
    await db.execute({
      sql: `UPDATE posts SET ${setClauses.join(", ")} WHERE slug = ?`,
      args,
    });

    // Replace post_tags associations if tag_ids provided
    if (updates.tag_ids !== undefined) {
      const idResult = await db.execute({ sql: "SELECT id FROM posts WHERE slug = ?", args: [newSlug] });
      if (idResult.rows.length) {
        await replacePostTags(db, idResult.rows[0].id as number, updates.tag_ids);
      }
    }

    // Save published snapshot for change detection
    const snapResult = await db.execute({ sql: "SELECT title, body_md, excerpt, tags, created_at FROM posts WHERE slug = ?", args: [newSlug] });
    if (snapResult.rows.length) {
      const r = snapResult.rows[0];
      const snapshot = JSON.stringify({ title: r.title, body_md: r.body_md, excerpt: r.excerpt, tags: r.tags, date: r.created_at });
      await db.execute({ sql: "UPDATE posts SET published_snapshot = ? WHERE slug = ?", args: [snapshot, newSlug] });
    }

    return c.json({ ok: true, slug: newSlug });
  })

  // Unpublish — set draft + trigger deploy
  .put("/:slug/unpublish", async (c) => {
    const db = c.get("db");
    const slug = c.req.param("slug");

    await db.execute({
      sql: "UPDATE posts SET status = 'draft', updated_at = datetime('now'), published_snapshot = NULL WHERE slug = ?",
      args: [slug],
    });

    return c.json({ ok: true });
  })

  // ─── Batch operations ────────────────────────────────────────────────────

  // Batch delete
  .post("/batch/delete", zValidator("json", z.object({ slugs: z.array(z.string()) })), async (c) => {
    const db = c.get("db");
    const { slugs } = c.req.valid("json");
    if (!slugs.length) return c.json({ ok: true, count: 0 });

    const placeholders = slugs.map(() => "?").join(", ");
    await db.execute({
      sql: `UPDATE posts SET status = 'deleted', updated_at = datetime('now') WHERE slug IN (${placeholders})`,
      args: slugs,
    });
    return c.json({ ok: true, count: slugs.length });
  })

  // Batch publish — set all to published + ONE deploy
  .post("/batch/publish", zValidator("json", z.object({ slugs: z.array(z.string()) })), async (c) => {
    const db = c.get("db");
    const { slugs } = c.req.valid("json");
    if (!slugs.length) return c.json({ ok: true, count: 0 });

    const placeholders = slugs.map(() => "?").join(", ");
    await db.execute({
      sql: `UPDATE posts SET status = 'published', updated_at = datetime('now'), published_at = datetime('now') WHERE slug IN (${placeholders})`,
      args: slugs,
    });

    return c.json({ ok: true, count: slugs.length });
  })

  // Batch unpublish — set all to draft + ONE deploy
  .post("/batch/unpublish", zValidator("json", z.object({ slugs: z.array(z.string()) })), async (c) => {
    const db = c.get("db");
    const { slugs } = c.req.valid("json");
    if (!slugs.length) return c.json({ ok: true, count: 0 });

    const placeholders = slugs.map(() => "?").join(", ");
    await db.execute({
      sql: `UPDATE posts SET status = 'draft', updated_at = datetime('now') WHERE slug IN (${placeholders})`,
      args: slugs,
    });

    return c.json({ ok: true, count: slugs.length });
  });
