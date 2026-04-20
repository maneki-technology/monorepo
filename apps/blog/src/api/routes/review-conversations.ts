/**
 * Review conversation persistence routes.
 * GET  /:type/:slug — load conversation for a post/project
 * PUT  /:type/:slug — upsert conversation (messages + audience)
 * DELETE /:type/:slug — delete conversation
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../index.js";

const upsertSchema = z.object({
  audience: z.enum(["developers", "photographers", "lifestyle", "general"]).default("general"),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
});

export const reviewConversations = new Hono<Env>()
  .get("/:type/:slug", async (c) => {
    const db = c.get("db");
    const type = c.req.param("type");
    const slug = c.req.param("slug");

    const result = await db.execute({
      sql: "SELECT messages, audience FROM review_conversations WHERE slug = ? AND type = ?",
      args: [slug, type],
    });

    if (!result.rows.length) {
      return c.json({ messages: [], audience: "general" });
    }

    const row = result.rows[0];
    return c.json({
      messages: JSON.parse(row.messages as string),
      audience: row.audience as string,
    });
  })

  .put("/:type/:slug", zValidator("json", upsertSchema), async (c) => {
    const db = c.get("db");
    const type = c.req.param("type");
    const slug = c.req.param("slug");
    const { messages, audience } = c.req.valid("json");

    await db.execute({
      sql: `INSERT INTO review_conversations (slug, type, audience, messages, updated_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            ON CONFLICT (slug, type)
            DO UPDATE SET messages = excluded.messages, audience = excluded.audience, updated_at = excluded.updated_at`,
      args: [slug, type, audience, JSON.stringify(messages)],
    });

    return c.json({ ok: true });
  })

  .delete("/:type/:slug", async (c) => {
    const db = c.get("db");
    const type = c.req.param("type");
    const slug = c.req.param("slug");

    await db.execute({
      sql: "DELETE FROM review_conversations WHERE slug = ? AND type = ?",
      args: [slug, type],
    });

    return c.json({ ok: true });
  })

  .patch("/:type/:slug/rename", zValidator("json", z.object({ newSlug: z.string().min(1) })), async (c) => {
    const db = c.get("db");
    const type = c.req.param("type");
    const slug = c.req.param("slug");
    const { newSlug } = c.req.valid("json");

    await db.execute({
      sql: "UPDATE review_conversations SET slug = ?, updated_at = datetime('now') WHERE slug = ? AND type = ?",
      args: [newSlug, slug, type],
    });

    return c.json({ ok: true });
  });
