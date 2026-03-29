/**
 * Turso (libSQL) client — initialized per-request from CF Pages env bindings.
 * In local dev, reads TURSO_URL + TURSO_AUTH_TOKEN from env vars.
 */

import { createClient, type Client } from "@libsql/client";

export interface DbEnv {
  TURSO_URL: string;
  TURSO_AUTH_TOKEN: string;
}

export function createDb(env: DbEnv): Client {
  return createClient({
    url: env.TURSO_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });
}
