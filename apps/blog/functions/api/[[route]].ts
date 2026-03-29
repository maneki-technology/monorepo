/**
 * CF Pages Functions adapter — routes all /api/* requests to the Hono app.
 */

import { handle } from "hono/cloudflare-pages";
import app from "../../src/api/index.js";

export const onRequest = handle(app);
