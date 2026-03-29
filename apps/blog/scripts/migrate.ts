/**
 * Run once to initialize the Turso database schema.
 * Usage: TURSO_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/migrate.ts
 */

import { createClient } from "@libsql/client";
import { SCHEMA } from "../src/api/db/schema.js";

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_URL env var");
  process.exit(1);
}

const db = createClient({ url, authToken: authToken || undefined });

console.log("Running migration...");
await db.executeMultiple(SCHEMA);
console.log("Done — posts table created.");
