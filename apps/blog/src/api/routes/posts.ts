/**
 * Posts CRUD routes.
 * All routes are protected by CF Access auth middleware (applied at app level).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Client } from "@libsql/client";
import type { Env } from "../index.js";

const REPO = "maneki-technology/monorepo";

async function triggerDeploy(db: Client, email: string, ghToken: string): Promise<string> {
  const deployId = `gh-${Date.now().toString(36)}`;

  if (ghToken) {
    await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ghToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "maneki-blog",
      },
      body: JSON.stringify({ event_type: "deploy-blog" }),
    });
  }

  await db.execute({
    sql: "INSERT INTO deployments (id, triggered_by, status) VALUES (?, ?, 'building')",
    args: [deployId, email],
  });

  return deployId;
}
const createPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
  body_md: z.string(),
  excerpt: z.string().default(""),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "publishing", "failed"]).default("draft"),
  date: z.string().optional(),
});

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  body_md: z.string().optional(),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published", "publishing", "failed"]).optional(),
  date: z.string().optional(),
});

export const posts = new Hono<Env>()
  // List posts (optionally filter by status)
  .get("/", async (c) => {
    const status = c.req.query("status");
    const db = c.get("db");

    const sql = status
      ? "SELECT * FROM posts WHERE status = ? ORDER BY created_at DESC"
      : "SELECT * FROM posts ORDER BY created_at DESC";
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
    return c.json({ ok: true, slug }, 201);
  })

  // Update post by slug
  .put("/:slug", zValidator("json", updatePostSchema), async (c) => {
    const slug = c.req.param("slug");
    const updates = c.req.valid("json");
    const db = c.get("db");

    // Build dynamic SET clause
    const setClauses: string[] = [];
    const args: (string | number | null)[] = [];

    if (updates.title !== undefined) {
      setClauses.push("title = ?");
      args.push(updates.title);
    }
    if (updates.body_md !== undefined) {
      setClauses.push("body_md = ?");
      args.push(updates.body_md);
    }
    if (updates.excerpt !== undefined) {
      setClauses.push("excerpt = ?");
      args.push(updates.excerpt);
    }
    if (updates.tags !== undefined) {
      setClauses.push("tags = ?");
      args.push(JSON.stringify(updates.tags));
    }
    if (updates.status !== undefined) {
      setClauses.push("status = ?");
      args.push(updates.status);
    }
    if (updates.date !== undefined) {
      setClauses.push("created_at = ?");
      args.push(updates.date);
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
    return c.json({ ok: true });
  })

  // Delete post by slug
  .delete("/:slug", async (c) => {
    const db = c.get("db");
    await db.execute({
      sql: "DELETE FROM posts WHERE slug = ?",
      args: [c.req.param("slug")],
    });
    return c.json({ ok: true });
  })

  // Publish — save content + set publishing + trigger deploy
  .put("/:slug/publish", zValidator("json", updatePostSchema), async (c) => {
    const db = c.get("db");
    const slug = c.req.param("slug");
    const ghToken = c.env.GH_DEPLOY_TOKEN;
    const updates = c.req.valid("json");

    // Save content + set publishing in one update
    const setClauses: string[] = ["status = 'publishing'", "updated_at = datetime('now')"];
    const args: (string | number | null)[] = [];

    if (updates.title !== undefined) { setClauses.push("title = ?"); args.push(updates.title); }
    if (updates.body_md !== undefined) { setClauses.push("body_md = ?"); args.push(updates.body_md); }
    if (updates.excerpt !== undefined) { setClauses.push("excerpt = ?"); args.push(updates.excerpt); }
    if (updates.tags !== undefined) { setClauses.push("tags = ?"); args.push(JSON.stringify(updates.tags)); }
    if (updates.date !== undefined) { setClauses.push("created_at = ?"); args.push(updates.date); }

    args.push(slug);
    await db.execute({
      sql: `UPDATE posts SET ${setClauses.join(", ")} WHERE slug = ?`,
      args,
    });

    // Trigger deploy
    const deployId = await triggerDeploy(db, c.get("userEmail"), ghToken);
    return c.json({ ok: true, deploymentId: deployId });
  })

  // Unpublish — set draft + trigger deploy
  .put("/:slug/unpublish", async (c) => {
    const db = c.get("db");
    const slug = c.req.param("slug");
    const ghToken = c.env.GH_DEPLOY_TOKEN;

    await db.execute({
      sql: "UPDATE posts SET status = 'draft', updated_at = datetime('now') WHERE slug = ?",
      args: [slug],
    });

    // Trigger deploy
    const deployId = await triggerDeploy(db, c.get("userEmail"), ghToken);
    return c.json({ ok: true, deploymentId: deployId });
  });
