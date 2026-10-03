import { afterEach, describe, expect, it, vi } from "vitest";
import app from "../index.js";

const dbExecute = vi.hoisted(() => vi.fn());
vi.mock("../db/client.js", () => ({ createDb: () => ({ execute: dbExecute }) }));

const env = {
  DEV_AUTH_BYPASS: "1",
  GH_DEPLOY_TOKEN: "test-token",
  TURSO_URL: "file:unused",
  TURSO_AUTH_TOKEN: "unused",
};

afterEach(() => {
  vi.unstubAllGlobals();
  dbExecute.mockReset();
});

describe("POST /api/deploy", () => {
  it("does not create a deployment without a GitHub token", async () => {
    const response = await app.request("/api/deploy", { method: "POST" }, { ...env, GH_DEPLOY_TOKEN: "" });
    expect(response.status).toBe(500);
    expect(dbExecute).not.toHaveBeenCalled();
  });

  it("returns the GitHub error without creating a deployment", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Bad credentials", { status: 401 })));
    const response = await app.request("/api/deploy", { method: "POST" }, env);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "GitHub dispatch failed", status: 401, message: "Bad credentials" });
    expect(dbExecute).not.toHaveBeenCalled();
  });

  it("creates a building deployment only after GitHub accepts the dispatch", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await app.request("/api/deploy", { method: "POST" }, env);

    expect(response.status).toBe(200);
    const { deploymentId } = (await response.json()) as { deploymentId: string };
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).client_payload).toEqual({ deploy_id: deploymentId });
    expect(dbExecute).toHaveBeenCalledOnce();
    expect(dbExecute.mock.calls[0][0].sql).toContain("INSERT INTO deployments");
    expect(dbExecute.mock.calls[0][0].args[0]).toBe(deploymentId);
  });
});
