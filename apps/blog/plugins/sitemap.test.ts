import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SITE_URL } from "../src/config.js";
import { sitemapPlugin } from "./sitemap.js";

type Row = Record<string, string | null>;

const tables = vi.hoisted(() => ({
  posts: [] as Row[],
  projects: [] as Row[],
  pages: [] as Row[],
  photography: null as string | null,
}));

vi.mock("./db.js", () => ({
  getDb: () => ({
    execute: async (sql: string) => {
      if (sql.includes("FROM posts")) return { rows: tables.posts };
      if (sql.includes("FROM projects")) return { rows: tables.projects };
      if (sql.includes("FROM pages")) return { rows: tables.pages };
      return { rows: [{ updated_at: tables.photography }] };
    },
  }),
}));

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "sitemap-"));
  fs.mkdirSync(path.join(dir, "dist"));
  vi.spyOn(process, "cwd").mockReturnValue(dir);
  vi.spyOn(console, "log").mockImplementation(() => {});
  Object.assign(tables, { posts: [], projects: [], pages: [], photography: null });
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(dir, { recursive: true });
});

/** Run the plugin and map each <loc> to its <lastmod> (undefined when omitted). */
async function generate(): Promise<Map<string, string | undefined>> {
  const hook = sitemapPlugin().closeBundle;
  if (typeof hook !== "function") throw new Error("closeBundle is not a function");
  await hook.call({} as never);
  const xml = fs.readFileSync(path.join(dir, "dist", "sitemap.xml"), "utf8");
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(
    ([, body]) => [body.match(/<loc>(.*)<\/loc>/)?.[1] ?? "", body.match(/<lastmod>(.*)<\/lastmod>/)?.[1]] as const,
  );
  return new Map(entries);
}

describe("sitemapPlugin", () => {
  it("dates each URL by its content instead of the build date", async () => {
    tables.posts = [
      { slug: "older", updated_at: "2026-03-01 08:00:00" },
      { slug: "newer", updated_at: "2026-04-02 09:30:00" },
    ];
    tables.projects = [{ slug: "dashboard", updated_at: "2026-05-03 10:00:00" }];
    tables.pages = [
      { slug: "about", updated_at: "2026-01-04 00:00:00" },
      { slug: "resume", updated_at: "2026-02-05 00:00:00" },
    ];
    tables.photography = "2026-06-06 12:00:00";

    const lastmod = await generate();

    expect(lastmod.get(`${SITE_URL}/post/older`)).toBe("2026-03-01");
    expect(lastmod.get(`${SITE_URL}/post/newer`)).toBe("2026-04-02");
    expect(lastmod.get(`${SITE_URL}/project/dashboard`)).toBe("2026-05-03");
    expect(lastmod.get(`${SITE_URL}/about`)).toBe("2026-01-04");
    expect(lastmod.get(`${SITE_URL}/resume`)).toBe("2026-02-05");
    expect(lastmod.get(`${SITE_URL}/blog`)).toBe("2026-04-02");
    expect(lastmod.get(`${SITE_URL}/portfolio`)).toBe("2026-05-03");
    expect(lastmod.get(`${SITE_URL}/photography`)).toBe("2026-06-06");
    expect(lastmod.get(`${SITE_URL}/`)).toBe("2026-06-06");
  });

  it("omits lastmod for URLs with no dated content", async () => {
    tables.projects = [{ slug: "dashboard", updated_at: "2026-05-03 10:00:00" }];

    const lastmod = await generate();

    expect(lastmod.has(`${SITE_URL}/blog`)).toBe(true);
    expect(lastmod.get(`${SITE_URL}/blog`)).toBeUndefined();
    expect(lastmod.get(`${SITE_URL}/photography`)).toBeUndefined();
    expect(lastmod.get(`${SITE_URL}/about`)).toBeUndefined();
    expect(lastmod.get(`${SITE_URL}/`)).toBe("2026-05-03");
  });
});
