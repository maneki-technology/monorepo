/**
 * Deploy routes — trigger the deploy workflow and read its recorded status.
 * POST /deploy        → repository_dispatch with the new deployment id
 * GET  /deploy/status → latest deployment row (written by scripts/record-deploy.ts)
 */

import { Hono } from "hono";
import type { Env } from "../index.js";

const REPO = "maneki-technology/monorepo";

export const deploy = new Hono<Env>()

  // Trigger deploy manually
  .post("/", async (c) => {
    const db = c.get("db");
    const ghToken = c.env.GH_DEPLOY_TOKEN;
    const email = c.get("userEmail");
    const deployId = `gh-${Date.now().toString(36)}`;

    if (!ghToken) return c.json({ error: "GH_DEPLOY_TOKEN not configured" }, 500);

    try {
      const response = await fetch(`https://api.github.com/repos/${REPO}/dispatches`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ghToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "maneki-blog",
        },
        body: JSON.stringify({ event_type: "deploy-blog", client_payload: { deploy_id: deployId } }),
      });
      if (!response.ok) {
        return c.json(
          { error: "GitHub dispatch failed", status: response.status, message: await response.text() },
          502,
        );
      }
    } catch {
      return c.json({ error: "GitHub dispatch failed" }, 502);
    }

    await db.execute({
      sql: "INSERT INTO deployments (id, triggered_by, status) VALUES (?, ?, 'building')",
      args: [deployId, email],
    });

    return c.json({ ok: true, deploymentId: deployId });
  })

  // Latest deployment status — the deploy workflow records the outcome
  .get("/status", async (c) => {
    const result = await c
      .get("db")
      .execute("SELECT id, status, created_at FROM deployments ORDER BY created_at DESC LIMIT 1");
    const row = result.rows[0];
    if (!row) return c.json({ status: "none", message: "no deployments" });
    return c.json({
      deploymentId: row.id as string,
      status: row.status as string,
      createdAt: row.created_at as string,
    });
  });
