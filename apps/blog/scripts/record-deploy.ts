/**
 * Record a finished blog deploy. Runs in CI after the Cloudflare Pages deploy —
 * the only step that writes to Turso, so the build itself stays read-only.
 *
 * Sets the deployment's final status and, on success, stamps deployed_at on
 * every post/project/draft page in dist/.
 *
 * Run: DEPLOY_ID=gh-xxx tsx scripts/record-deploy.ts success|failure
 * DEPLOY_ID comes from the admin dispatch; pushes to main fall back to the run id.
 */

import { existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../plugins/db.js";

const status = process.argv[2];
if (status !== "success" && status !== "failure") throw new Error("usage: record-deploy.ts success|failure");

const runId = process.env.GITHUB_RUN_ID;
const deployId = process.env.DEPLOY_ID || (runId && `gh-run-${runId}`);
if (!deployId) throw new Error("DEPLOY_ID or GITHUB_RUN_ID must be set");

const dist = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const slugsIn = (dir: string): string[] =>
  existsSync(resolve(dist, dir))
    ? readdirSync(resolve(dist, dir))
        .filter((f) => f.endsWith(".html"))
        .map((f) => f.slice(0, -5))
    : [];
const stamp = (table: string, slugs: string[]) => ({
  sql: `UPDATE ${table} SET deployed_at = datetime('now') WHERE slug IN (${slugs.map(() => "?").join(",")})`,
  args: slugs,
});

const postSlugs = [...slugsIn("post"), ...slugsIn("draft")];
const projectSlugs = slugsIn("project");

await getDb().batch(
  [
    {
      sql: "INSERT INTO deployments (id, triggered_by, status) VALUES (?, 'github', ?) ON CONFLICT(id) DO UPDATE SET status = excluded.status",
      args: [deployId, status],
    },
    ...(status === "success" && postSlugs.length ? [stamp("posts", postSlugs)] : []),
    ...(status === "success" && projectSlugs.length ? [stamp("projects", projectSlugs)] : []),
  ],
  "write",
);

console.log(`Deployment ${deployId}: ${status}, stamped ${postSlugs.length} posts + ${projectSlugs.length} projects.`);
