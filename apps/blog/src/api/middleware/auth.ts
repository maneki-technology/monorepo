/**
 * Cloudflare Access JWT verification middleware.
 * Validates the Cf-Access-Jwt-Assertion header against CF's public certs.
 */

import { createMiddleware } from "hono/factory";
import type { Env } from "../index.js";

interface AccessJWK {
  keys: JsonWebKey[];
}

let cachedKeys: CryptoKey[] | null = null;

async function getPublicKeys(teamDomain: string): Promise<CryptoKey[]> {
  if (cachedKeys) return cachedKeys;

  const url = `https://${teamDomain}/cdn-cgi/access/certs`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch CF Access certs: ${res.status}`);

  const { keys } = (await res.json()) as AccessJWK;
  cachedKeys = await Promise.all(
    keys
      .filter((k) => k.kty === "RSA")
      .map((k) =>
        crypto.subtle.importKey("jwk", k, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]),
      ),
  );
  return cachedKeys;
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

async function verifyToken(
  token: string,
  keys: CryptoKey[],
  aud: string,
  teamDomain: string,
): Promise<{ email: string }> {
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

  // Verify signature against any of the public keys
  const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const signature = Uint8Array.from(decodeJWTPart(parts[2]), (c) => c.charCodeAt(0));

  for (const key of keys) {
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, data);
    if (valid) return { email: payload.email as string };
  }

  throw new Error("Invalid signature");
}

export const cfAuth = createMiddleware<Env>(async (c, next) => {
  // Dev bypass — skip auth when CF_ACCESS_AUD is empty (local dev)
  const aud = c.env.CF_ACCESS_AUD;
  if (!aud) {
    c.set("userEmail", "dev@localhost");
    await next();
    return;
  }

  const token = c.req.header("Cf-Access-Jwt-Assertion");
  if (!token) {
    return c.json({ error: "unauthorized" }, 401);
  }

  const teamDomain = c.env.CF_ACCESS_TEAM_DOMAIN;
  if (!teamDomain) {
    return c.json({ error: "auth not configured" }, 500);
  }

  try {
    const keys = await getPublicKeys(teamDomain);
    const { email } = await verifyToken(token, keys, aud, teamDomain);
    c.set("userEmail", email);
    await next();
  } catch {
    return c.json({ error: "forbidden" }, 403);
  }
});
