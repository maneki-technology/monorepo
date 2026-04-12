/**
 * Hono API app — blog backend.
 * Mounts auth middleware + posts routes. Exports AppType for RPC client.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Client } from "@libsql/client";
import { createDb, type DbEnv } from "./db/client.js";
import { cfAuth } from "./middleware/auth.js";
import { posts } from "./routes/posts.js";
import { uiState } from "./routes/ui-state.js";
import { deploy } from "./routes/deploy.js";
import { images } from "./routes/images.js";
import { projects } from "./routes/projects.js";
import { photos } from "./routes/photos.js";
import { albums } from "./routes/albums.js";
import { tags } from "./routes/tags.js";

/** Env bindings available in CF Pages Functions. */
export type Env = {
  Bindings: DbEnv & {
    CF_ACCESS_TEAM_DOMAIN: string;
    CF_ACCESS_AUD: string;
    GH_DEPLOY_TOKEN: string;
    IMAGES_BUCKET: R2Bucket;
    IMAGES_BASE_URL: string;
  };
  Variables: {
    db: Client;
    userEmail: string;
  };
};

const app = new Hono<Env>()
  .basePath("/api")
  .use("/*", cors())
  // Inject DB client per request
  .use("/*", async (c, next) => {
    const db = createDb({
      TURSO_URL: c.env.TURSO_URL,
      TURSO_AUTH_TOKEN: c.env.TURSO_AUTH_TOKEN,
    });
    c.set("db", db);
    await next();
  })
  // Auth — all API routes require CF Access
  .use("/*", cfAuth)
  .route("/posts", posts)
  .route("/ui-state", uiState)
  .route("/deploy", deploy)
  .route("/images", images)
  .route("/projects", projects)
  .route("/photos", photos)
  .route("/albums", albums)
  .route("/tags", tags);

export type AppType = typeof app;
export default app;
