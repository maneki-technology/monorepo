import { afterEach, describe, expect, it, vi } from "vitest";
import { Hono } from "hono";
import type { Env } from "../index.js";
import { cfAuth } from "./auth.js";

const app = new Hono<Env>();
app.use("/*", cfAuth);
app.get("/", (c) => c.text(c.get("userEmail")));

afterEach(() => vi.unstubAllGlobals());

function base64url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signingKey(kid: string): Promise<{ jwk: JsonWebKey & { kid: string }; privateKey: CryptoKey }> {
  const pair = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );
  const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  return { jwk: { ...jwk, kid }, privateKey: pair.privateKey };
}

async function token(kid: string, privateKey: CryptoKey, domain: string): Promise<string> {
  const header = base64url(JSON.stringify({ alg: "RS256", kid }));
  const payload = base64url(
    JSON.stringify({
      aud: "test-audience",
      iss: `https://${domain}`,
      email: "editor@example.com",
      exp: Math.floor(Date.now() / 1000) + 60,
    }),
  );
  const data = `${header}.${payload}`;
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, new TextEncoder().encode(data));
  return `${data}.${base64url(String.fromCharCode(...new Uint8Array(signature)))}`;
}

describe("Cloudflare Access auth", () => {
  it("fails closed when Access configuration is missing", async () => {
    const response = await app.request("/", {}, {});
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "auth not configured" });
  });

  it("allows an explicit local-development bypass", async () => {
    const response = await app.request("/", {}, { DEV_AUTH_BYPASS: "1" });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("dev@localhost");
  });

  it("refreshes cached keys when a token uses a newly rotated key", async () => {
    const domain = "rotation-test.cloudflareaccess.com";
    const first = await signingKey("first");
    const second = await signingKey("second");
    const fetchKeys = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ keys: [first.jwk] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ keys: [second.jwk] })));
    vi.stubGlobal("fetch", fetchKeys);

    const env = { CF_ACCESS_AUD: "test-audience", CF_ACCESS_TEAM_DOMAIN: domain };
    const initial = await app.request(
      "/",
      { headers: { "Cf-Access-Jwt-Assertion": await token("first", first.privateKey, domain) } },
      env,
    );
    const rotated = await app.request(
      "/",
      { headers: { "Cf-Access-Jwt-Assertion": await token("second", second.privateKey, domain) } },
      env,
    );

    expect(initial.status).toBe(200);
    expect(rotated.status).toBe(200);
    expect(await rotated.text()).toBe("editor@example.com");
    expect(fetchKeys).toHaveBeenCalledTimes(2);
  });
});
