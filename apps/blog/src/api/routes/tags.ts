/**
 * Tags CRUD routes.
 * All routes are protected by CF Access auth middleware (applied at app level).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../index.js";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const createTagSchema = z
  .object({
    name: z.string().min(1),
    slug: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    slug: data.slug || slugify(data.name),
  }));

export const tags = new Hono<Env>()
  // List all tags
  .get("/", async (c) => {
    const db = c.get("db");
    const result = await db.execute("SELECT * FROM tags ORDER BY name ASC");
    return c.json({ tags: result.rows });
  })

  // Create tag
  .post("/", zValidator("json", createTagSchema), async (c) => {
    const { name, slug } = c.req.valid("json");
    const db = c.get("db");

    await db.execute({
      sql: "INSERT INTO tags (name, slug) VALUES (?, ?)",
      args: [name, slug],
    });

    const last = await db.execute("SELECT last_insert_rowid() as id");
    const id = last.rows[0].id as number;

    return c.json({ ok: true, id }, 201);
  })

  // Delete tag (hard delete — cascades to photo_tags)
  .delete("/:id", async (c) => {
    const db = c.get("db");
    await db.execute({
      sql: "DELETE FROM tags WHERE id = ?",
      args: [Number(c.req.param("id"))],
    });
    return c.json({ ok: true });
  });
