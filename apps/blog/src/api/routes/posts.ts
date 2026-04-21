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
  status: z.enum(["draft", "published"]).default("draft"),
  date: z.string().optional(),
});

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  body_md: z.string().optional(),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  date: z.string().optional(),
  new_slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case").optional(),
});

export const posts = new Hono<Env>()
  // List posts (optionally filter by status)
  .get("/", async (c) => {
    const status = c.req.query("status");
    const db = c.get("db");

    const sql = status
      ? "SELECT * FROM posts WHERE status = ? ORDER BY updated_at DESC"
      : "SELECT * FROM posts WHERE status != 'deleted' ORDER BY updated_at DESC";
    const args = status ? [status] : [];

    const result = await db.execute({ sql, args });
    const rows = result.rows.map((r) => ({
      ...r,
      tags: JSON.parse((r.tags as string) || "[]"),
    }));
    return c.json({ posts: rows });
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
    return c.json({ post });
  })

  // Create post
  .post("/", zValidator("json", createPostSchema), async (c) => {
    const { title, slug, body_md, excerpt, tags, status, date } = c.req.valid("json");
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
    const post = {
      ...result.rows[0],
      tags: JSON.parse((result.rows[0].tags as string) || "[]"),
    };
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

    if (setClauses.length === 0) {
      return c.json({ error: "no fields to update" }, 400);
    }

    setClauses.push("updated_at = datetime('now')");
    args.push(slug);

    await db.execute({
      sql: `UPDATE posts SET ${setClauses.join(", ")} WHERE slug = ?`,
      args,
    });

    // Cascade slug rename to conversation tables
    if (newSlug !== slug) {
      await db.execute({ sql: "UPDATE review_conversations SET slug = ? WHERE slug = ? AND type = 'post'", args: [newSlug, slug] });
      await db.execute({ sql: "UPDATE brainstorm_conversations SET slug = ? WHERE slug = ? AND type = 'post'", args: [newSlug, slug] });
    }
    const result = await db.execute({
      sql: "SELECT * FROM posts WHERE slug = ?",
      args: [newSlug],
    });
    const post = {
      ...result.rows[0],
      tags: JSON.parse((result.rows[0].tags as string) || "[]"),
    };
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
