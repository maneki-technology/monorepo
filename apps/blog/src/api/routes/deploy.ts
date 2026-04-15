/**
 * Deploy status route — poll latest deployment status from GitHub Actions.
 * GET /deploy/status → polls latest workflow run status
 */

import { Hono } from "hono";
import type { Env } from "../index.js";

const REPO = "maneki-technology/monorepo";
const WORKFLOW = "deploy-blog.yml";

export const deploy = new Hono<Env>()

  // Trigger deploy manually
  .post("/", async (c) => {
    const db = c.get("db");
    const ghToken = c.env.GH_DEPLOY_TOKEN;
    const email = c.get("userEmail");
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

    return c.json({ ok: true, deploymentId: deployId });
  })

  // Poll latest deployment status from GitHub Actions
  .get("/status", async (c) => {
    const db = c.get("db");
    const ghToken = c.env.GH_DEPLOY_TOKEN;

    const result = await db.execute(
      "SELECT id, status, triggered_by, created_at FROM deployments ORDER BY created_at DESC LIMIT 1",
    );

    if (!result.rows.length) {
      return c.json({ status: "none", message: "no deployments" });
    }

    const row = result.rows[0];
    const deployId = row.id as string;
    const dbStatus = row.status as string;

    if (dbStatus === "success" || dbStatus === "failure") {
      return c.json({
        deploymentId: deployId,
        status: dbStatus,
        createdAt: row.created_at as string,
      });
    }

    if (!ghToken) {
      return c.json({
        deploymentId: deployId,
        status: dbStatus,
        createdAt: row.created_at as string,
        message: "GH_DEPLOY_TOKEN not configured",
      });
    }

    const deployCreatedAt = row.created_at as string;
    try {
      const ghRes = await fetch(
        `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=5&branch=main`,
        {
          headers: {
            Authorization: `Bearer ${ghToken}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "maneki-blog",
          },
        },
      );

      if (!ghRes.ok) {
        return c.json({ deploymentId: deployId, status: dbStatus, createdAt: row.created_at as string });
      }

      const ghData = (await ghRes.json()) as {
        workflow_runs?: Array<{ status: string; conclusion: string | null; created_at: string }>;
      };

      const deployTime = new Date(deployCreatedAt + "Z").getTime();
      const run = ghData.workflow_runs?.find((r) => new Date(r.created_at).getTime() >= deployTime - 30000);
      let newStatus = dbStatus;

      if (run) {
        if (run.status === "completed") {
          newStatus = run.conclusion === "success" ? "success" : "failure";
        } else if (run.status === "in_progress") {
          newStatus = "deploying";
        } else {
          newStatus = "building";
        }
      }

      if (newStatus !== dbStatus) {
        await db.execute({ sql: "UPDATE deployments SET status = ? WHERE id = ?", args: [newStatus, deployId] });
      }

      return c.json({ deploymentId: deployId, status: newStatus, createdAt: row.created_at as string });
    } catch {
      return c.json({ deploymentId: deployId, status: dbStatus, createdAt: row.created_at as string });
    }
  });
