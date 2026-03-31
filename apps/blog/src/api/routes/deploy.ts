/**
 * Deploy status route — poll latest deployment status from GitHub Actions.
 * GET /deploy/status → polls latest workflow run status
 */

import { Hono } from "hono";
import type { Env } from "../index.js";

const REPO = "maneki-technology/monorepo";
const WORKFLOW = "deploy-blog.yml";

export const deploy = new Hono<Env>()

  // Poll latest deployment status from GitHub Actions
  .get("/status", async (c) => {
    const db = c.get("db");
    const ghToken = c.env.GH_DEPLOY_TOKEN;

    // Get latest deployment from DB
    const result = await db.execute(
      "SELECT id, status, triggered_by, created_at FROM deployments ORDER BY created_at DESC LIMIT 1",
    );

    if (!result.rows.length) {
      return c.json({ status: "none", message: "no deployments" });
    }

    const row = result.rows[0];
    const deployId = row.id as string;
    const dbStatus = row.status as string;

    // If already terminal, return cached status
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
        message: "GH_DEPLOY_TOKEN not configured — returning cached status",
      });
    }

    // Poll GitHub Actions for latest workflow run
    try {
      const ghRes = await fetch(
        `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=1&branch=main`,
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
        return c.json({
          deploymentId: deployId,
          status: dbStatus,
          createdAt: row.created_at as string,
        });
      }

      const ghData = (await ghRes.json()) as {
        workflow_runs?: Array<{
          status: string;
          conclusion: string | null;
        }>;
      };

      const run = ghData.workflow_runs?.[0];
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

      // Update DB if status changed
      if (newStatus !== dbStatus) {
        await db.execute({
          sql: "UPDATE deployments SET status = ? WHERE id = ?",
          args: [newStatus, deployId],
        });

        // Update post statuses when deploy reaches terminal state
        if (newStatus === "success") {
          await db.execute(
            "UPDATE posts SET status = 'published', updated_at = datetime('now') WHERE status = 'publishing'",
          );
        } else if (newStatus === "failure") {
          await db.execute(
            "UPDATE posts SET status = 'failed', updated_at = datetime('now') WHERE status = 'publishing'",
          );
        }
      }

      return c.json({
        deploymentId: deployId,
        status: newStatus,
        createdAt: row.created_at as string,
      });
    } catch {
      return c.json({
        deploymentId: deployId,
        status: dbStatus,
        createdAt: row.created_at as string,
      });
    }
  });
