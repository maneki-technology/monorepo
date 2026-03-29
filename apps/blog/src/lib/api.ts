/**
 * Typed RPC client for the blog API.
 * Import this from editor or any client-side code to get full type safety.
 */

import { hc } from "hono/client";
import type { AppType } from "../api/index.js";

export const api = hc<AppType>("/");
