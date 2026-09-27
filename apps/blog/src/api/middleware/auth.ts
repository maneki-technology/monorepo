/**
 * Cloudflare Access JWT verification middleware.
 * Validates the Cf-Access-Jwt-Assertion header against CF's public certs.
 */

import { createMiddleware } from "hono/factory";
import type { Env } from "../index.js";

interface AccessJWK {
  keys: (JsonWebKey & { kid?: string })[];
}

const KEY_CACHE_TTL_MS = 5 * 60 * 1000;

let cachedKeys: { domain: string; expiresAt: number; keys: Map<string, CryptoKey> } | null = null;

async function getPublicKeys(teamDomain: string, refresh = false): Promise<Map<string, CryptoKey>> {
  if (!refresh && cachedKeys?.domain === teamDomain && cachedKeys.expiresAt > Date.now()) {
    return cachedKeys.keys;
  }

  const url = `https://${teamDomain}/cdn-cgi/access/certs`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch CF Access certs: ${res.status}`);

  const { keys } = (await res.json()) as AccessJWK;
  const publicKeys = new Map<string, CryptoKey>();
  for (const key of keys) {
    if (key.kty !== "RSA" || typeof key.kid !== "string") continue;
    publicKeys.set(
      key.kid,
      await crypto.subtle.importKey("jwk", key, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]),
    );
  }
  cachedKeys = { domain: teamDomain, expiresAt: Date.now() + KEY_CACHE_TTL_MS, keys: publicKeys };
  return publicKeys;
}

function decodeJWTPart(part: string): string {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  return binary;
}

function decodeJWTPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  const payload = decodeJWTPart(parts[1]);
  return JSON.parse(payload);
}

function decodeJWTKeyId(token: string): string {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  const header: unknown = JSON.parse(decodeJWTPart(parts[0]));
  if (!header || typeof header !== "object" || !("kid" in header) || typeof header.kid !== "string") {
    throw new Error("Missing JWT key ID");
  }
  return header.kid;
}

async function verifyToken(token: string, key: CryptoKey, aud: string, teamDomain: string): Promise<{ email: string }> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");

  const payload = decodeJWTPayload(token);

  // Check expiration
  if (typeof payload.exp === "number" && payload.exp < Date.now() / 1000) {
    throw new Error("Token expired");
  }

  // Check not-before
  if (typeof payload.nbf === "number" && payload.nbf > Date.now() / 1000) {
    throw new Error("Token not yet valid");
  }

  // Check issuer
  const expectedIssuer = `https://${teamDomain}`;
  if (payload.iss !== expectedIssuer) {
    throw new Error("Invalid issuer");
  }

  // Check audience
  const tokenAud = payload.aud;
  const audArray = Array.isArray(tokenAud) ? tokenAud : [tokenAud];
  if (!audArray.includes(aud)) {
    throw new Error("Invalid audience");
  }

  // Check email exists
  if (typeof payload.email !== "string" || !payload.email) {
    throw new Error("Missing email claim");
  }

  // Verify the signature with the key named by the JWT header.
  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = Uint8Array.from(decodeJWTPart(parts[2]), (c) => c.charCodeAt(0));

  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, data);
  if (!valid) throw new Error("Invalid signature");
  return { email: payload.email };
}

export const cfAuth = createMiddleware<Env>(async (c, next) => {
  // Local development must opt in explicitly; missing production config fails closed.
  if (c.env.DEV_AUTH_BYPASS === "1") {
    c.set("userEmail", "dev@localhost");
    await next();
    return;
  }

  const aud = c.env.CF_ACCESS_AUD;
  const teamDomain = c.env.CF_ACCESS_TEAM_DOMAIN;
  if (!aud || !teamDomain) {
    return c.json({ error: "auth not configured" }, 500);
  }

  const token = c.req.header("Cf-Access-Jwt-Assertion");
  if (!token) {
    return c.json({ error: "unauthorized" }, 401);
  }

  try {
    const kid = decodeJWTKeyId(token);
    let keys = await getPublicKeys(teamDomain);
    if (!keys.has(kid)) keys = await getPublicKeys(teamDomain, true);
    const key = keys.get(kid);
    if (!key) return c.json({ error: "forbidden" }, 403);
    const { email } = await verifyToken(token, key, aud, teamDomain);
    c.set("userEmail", email);
    await next();
  } catch {
    return c.json({ error: "forbidden" }, 403);
  }
});
