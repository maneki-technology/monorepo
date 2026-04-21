/**
 * UI state routes — generic per-page state persistence.
 * GET  /:page → returns state JSON for current user + page
 * PUT  /:page → upserts state JSON
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../index.js";
import { safeJsonParse } from "../db/utils.js";

const stateSchema = z.record(z.string(), z.unknown());

export const uiState = new Hono<Env>()
  .get("/:page", async (c) => {
    const db = c.get("db");
    const email = c.get("userEmail");
    const page = c.req.param("page");

    const result = await db.execute({
      sql: "SELECT state FROM ui_state WHERE user_email = ? AND page = ?",
      args: [email, page],
    });

    if (!result.rows.length) {
      return c.json({ state: {} });
    }

    return c.json({ state: safeJsonParse<Record<string, unknown>>(result.rows[0].state as string, {}) });
  })

  .put("/:page", zValidator("json", stateSchema), async (c) => {
    const db = c.get("db");
    const email = c.get("userEmail");
    const page = c.req.param("page");
    const state = c.req.valid("json");

    await db.execute({
      sql: `INSERT INTO ui_state (user_email, page, state, updated_at)
            VALUES (?, ?, ?, datetime('now'))
            ON CONFLICT (user_email, page)
            DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at`,
      args: [email, page, JSON.stringify(state)],
    });

    return c.json({ ok: true });
  });
