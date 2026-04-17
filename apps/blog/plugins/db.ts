/**
 * Shared Turso client for Vite plugins.
 * All plugins share a single connection to avoid rate limiting / connection exhaustion.
 */

import { createClient, type Client } from "@libsql/client";

let _client: Client | null = null;

export function getDb(): Client {
  if (_client) return _client;

  const url = process.env.TURSO_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error("[db] TURSO_URL not set — cannot connect to Turso");
  }

  _client = createClient({ url, authToken: authToken || undefined });
  return _client;
}
