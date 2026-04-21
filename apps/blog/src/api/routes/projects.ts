/**
 * Projects CRUD routes.
 * All routes are protected by CF Access auth middleware (applied at app level).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../index.js";
import { buildSetClauses, toJson, toBool } from "../db/helpers.js";


const createProjectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  description: z.string().default(""),
  body_md: z.string().default(""),
  tech: z.array(z.string()).default([]),
  url: z.string().nullable().default(null),
  repo: z.string().nullable().default(null),
  image: z.string().nullable().default(null),
  pinned: z.boolean().default(false),
  sort_order: z.number().default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  body_md: z.string().optional(),
  tech: z.array(z.string()).optional(),
  url: z.string().nullable().optional(),
  repo: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  pinned: z.boolean().optional(),
  sort_order: z.number().optional(),
  status: z.enum(["draft", "published"]).optional(),
  new_slug: z.string().optional(),
});

export const projects = new Hono<Env>()
  // List projects (optionally filter by status)
  .get("/", async (c) => {
    const status = c.req.query("status");
    const db = c.get("db");

    const sql = status
      ? "SELECT * FROM projects WHERE status = ? ORDER BY sort_order ASC, created_at DESC"
      : "SELECT * FROM projects WHERE status != 'deleted' ORDER BY sort_order ASC, created_at DESC";
    const args = status ? [status] : [];

    const result = await db.execute({ sql, args });
    const rows = result.rows.map((r) => ({
      ...r,
      tech: JSON.parse((r.tech as string) || "[]"),
      pinned: !!r.pinned,
    }));
    return c.json({ projects: rows });
  })

  // Get single project by slug
  .get("/:slug", async (c) => {
    const db = c.get("db");
    const result = await db.execute({
      sql: "SELECT * FROM projects WHERE slug = ?",
      args: [c.req.param("slug")],
    });
    if (!result.rows.length) {
      return c.json({ error: "not found" }, 404);
    }
    const project = {
      ...result.rows[0],
      tech: JSON.parse((result.rows[0].tech as string) || "[]"),
      pinned: !!result.rows[0].pinned,
    };
    return c.json({ project });
  })

  // Create project
  .post("/", zValidator("json", createProjectSchema), async (c) => {
    const { title, slug, description, body_md, tech, url, repo, image, pinned, sort_order, status } = c.req.valid("json");
    const db = c.get("db");

    await db.execute({
      sql: `INSERT INTO projects (title, slug, description, body_md, tech, url, repo, image, pinned, sort_order, status, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [title, slug, description, body_md, JSON.stringify(tech), url, repo, image, pinned ? 1 : 0, sort_order, status],
    });
    const result = await db.execute({
      sql: "SELECT * FROM projects WHERE slug = ?",
      args: [slug],
    });
    const project = {
      ...result.rows[0],
      tech: JSON.parse((result.rows[0].tech as string) || "[]"),
      pinned: !!result.rows[0].pinned,
    };
    return c.json({ ok: true, slug, project }, 201);
  })


  // Reorder projects (must be before /:slug to avoid wildcard match)
  .put("/reorder", zValidator("json", z.object({ slugs: z.array(z.string()) })), async (c) => {
    const db = c.get("db");
    const { slugs } = c.req.valid("json");
    for (let i = 0; i < slugs.length; i++) {
      await db.execute({
        sql: "UPDATE projects SET sort_order = ?, updated_at = datetime('now') WHERE slug = ?",
        args: [i, slugs[i]],
      });
    }
    return c.json({ ok: true });
  })

  // Update project by slug
  .put("/:slug", zValidator("json", updateProjectSchema), async (c) => {
    const slug = c.req.param("slug");
    const updates = c.req.valid("json");
    const db = c.get("db");

    const { clauses: setClauses, args } = buildSetClauses(updates, {
      title: "title",
      description: "description",
      body_md: "body_md",
      tech: { column: "tech", transform: toJson },
      url: "url",
      repo: "repo",
      image: "image",
      pinned: { column: "pinned", transform: toBool },
      sort_order: "sort_order",
      status: "status",
    });
    // Atomic slug rename
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
      sql: `UPDATE projects SET ${setClauses.join(", ")} WHERE slug = ?`,
      args,
    });

    // Cascade slug rename to conversation tables
    if (newSlug !== slug) {
      await db.execute({ sql: "UPDATE review_conversations SET slug = ? WHERE slug = ? AND type = 'project'", args: [newSlug, slug] });
      await db.execute({ sql: "UPDATE brainstorm_conversations SET slug = ? WHERE slug = ? AND type = 'project'", args: [newSlug, slug] });
    }
    const result = await db.execute({
      sql: "SELECT * FROM projects WHERE slug = ?",
      args: [slug],
    });
    const project = {
      ...result.rows[0],
      tech: JSON.parse((result.rows[0].tech as string) || "[]"),
      pinned: !!result.rows[0].pinned,
    };
    return c.json({ ok: true, project });
  })

  // Soft delete project by slug
  .delete("/:slug", async (c) => {
    const db = c.get("db");
    await db.execute({
      sql: "UPDATE projects SET status = 'deleted', updated_at = datetime('now') WHERE slug = ?",
      args: [c.req.param("slug")],
    });
    return c.json({ ok: true });
  })

  // Publish — set published + trigger deploy
  .put("/:slug/publish", zValidator("json", updateProjectSchema), async (c) => {
    const db = c.get("db");
    const slug = c.req.param("slug");
    const updates = c.req.valid("json");

    const { clauses: extraClauses, args } = buildSetClauses(updates, {
      title: "title",
      description: "description",
      body_md: "body_md",
      tech: { column: "tech", transform: toJson },
      url: "url",
      repo: "repo",
      image: "image",
      pinned: { column: "pinned", transform: toBool },
      sort_order: "sort_order",
    });
    const setClauses: string[] = ["status = 'published'", "updated_at = datetime('now')", "published_at = datetime('now')", ...extraClauses];

    // Regenerate slug if it's a temp slug
    let newSlug = slug;
    if (slug.startsWith("project-") && updates.title) {
      const base = updates.title.toLowerCase().replace(/[^\w]+/g, "-").replace(/(^-|-$)/g, "");
      newSlug = base;
      setClauses.push("slug = ?");
      args.push(newSlug);
    }

    args.push(slug);
    await db.execute({
      sql: `UPDATE projects SET ${setClauses.join(", ")} WHERE slug = ?`,
      args,
    });

    // Save published snapshot for change detection
    const snapResult = await db.execute({ sql: "SELECT title, body_md, description, tech FROM projects WHERE slug = ?", args: [newSlug] });
    if (snapResult.rows.length) {
      const r = snapResult.rows[0];
      const snapshot = JSON.stringify({ title: r.title, body_md: r.body_md, description: r.description, tech: r.tech });
      await db.execute({ sql: "UPDATE projects SET published_snapshot = ? WHERE slug = ?", args: [snapshot, newSlug] });
    }

    return c.json({ ok: true, slug: newSlug });
  })

  // Unpublish — set draft
  .put("/:slug/unpublish", async (c) => {
    const db = c.get("db");
    const slug = c.req.param("slug");

    await db.execute({
      sql: "UPDATE projects SET status = 'draft', updated_at = datetime('now'), published_snapshot = NULL WHERE slug = ?",
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
      sql: `UPDATE projects SET status = 'deleted', updated_at = datetime('now') WHERE slug IN (${placeholders})`,
      args: slugs,
    });
    return c.json({ ok: true, count: slugs.length });
  })

  // Batch publish — set all to published
  .post("/batch/publish", zValidator("json", z.object({ slugs: z.array(z.string()) })), async (c) => {
    const db = c.get("db");
    const { slugs } = c.req.valid("json");
    if (!slugs.length) return c.json({ ok: true, count: 0 });

    const placeholders = slugs.map(() => "?").join(", ");
    await db.execute({
      sql: `UPDATE projects SET status = 'published', updated_at = datetime('now'), published_at = datetime('now') WHERE slug IN (${placeholders})`,
      args: slugs,
    });

    return c.json({ ok: true, count: slugs.length });
  })

  // Batch unpublish — set all to draft
  .post("/batch/unpublish", zValidator("json", z.object({ slugs: z.array(z.string()) })), async (c) => {
    const db = c.get("db");
    const { slugs } = c.req.valid("json");
    if (!slugs.length) return c.json({ ok: true, count: 0 });

    const placeholders = slugs.map(() => "?").join(", ");
    await db.execute({
      sql: `UPDATE projects SET status = 'draft', updated_at = datetime('now') WHERE slug IN (${placeholders})`,
      args: slugs,
    });

    return c.json({ ok: true, count: slugs.length });
  });
