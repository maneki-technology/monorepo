/**
 * Image upload routes — store images in Cloudflare R2.
 * Editor images use "editor/" prefix, photography photos use "photos/" prefix.
 * POST   /images       → upload image (prefix via ?prefix=editor|photos, default: editor)
 * GET    /images       → list editor images only
 * GET    /images/:prefix/:name → serve image
 * DELETE /images/:prefix/:name → delete image
 */

import { Hono } from "hono";
import type { Env } from "../index.js";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const VALID_PREFIXES = new Set(["editor", "photos", "thumb"]);

export const images = new Hono<Env>()
  // Upload image
  .post("/", async (c) => {
    const bucket = c.env.IMAGES_BUCKET;
    const body = await c.req.parseBody();
    const file = body.file;

    if (!(file instanceof File)) {
      return c.json({ error: "no file provided" }, 400);
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return c.json({ error: `unsupported type: ${file.type}` }, 400);
    }

    const prefix = (c.req.query("prefix") || "editor") as string;
    if (!VALID_PREFIXES.has(prefix)) {
      return c.json({ error: `invalid prefix: ${prefix}` }, 400);
    }

    const filename = `${Date.now().toString(36)}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const key = `${prefix}/${filename}`;
    await bucket.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
      customMetadata: {
        originalName: file.name,
        uploadedBy: c.get("userEmail"),
      },
    });

    const baseUrl = c.env.IMAGES_BASE_URL || "/api/images";
    const url = `${baseUrl}/${key}`;
    return c.json({ ok: true, name: key, url, r2_key: key }, 201);
  })

  // List editor images only
  .get("/", async (c) => {
    const bucket = c.env.IMAGES_BUCKET;
    const listed = await bucket.list({ prefix: "editor/", limit: 500 });

    const baseUrl = c.env.IMAGES_BASE_URL || "/api/images";
    const items = listed.objects.map((obj) => ({
      name: obj.key,
      url: `${baseUrl}/${obj.key}`,
      size: obj.size,
      uploaded: obj.uploaded.toISOString(),
      contentType: obj.httpMetadata?.contentType ?? "unknown",
    }));

    return c.json({ images: items });
  })

  // Serve image (supports prefixed keys: /images/editor/foo.jpg or /images/photos/foo.jpg)
  .get("/:prefix/:name", async (c) => {
    const bucket = c.env.IMAGES_BUCKET;
    const key = `${c.req.param("prefix")}/${c.req.param("name")}`;
    const object = await bucket.get(key);

    if (!object) {
      return c.json({ error: "not found" }, 404);
    }

    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType ?? "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("ETag", object.httpEtag);

    return new Response(object.body, { headers });
  })

  // Serve legacy unprefixed images (backward compat)
  .get("/:name", async (c) => {
    const bucket = c.env.IMAGES_BUCKET;
    const name = c.req.param("name");
    const object = await bucket.get(name);

    if (!object) {
      return c.json({ error: "not found" }, 404);
    }

    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType ?? "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("ETag", object.httpEtag);

    return new Response(object.body, { headers });
  })

  // Delete image (prefixed)
  .delete("/:prefix/:name", async (c) => {
    const bucket = c.env.IMAGES_BUCKET;
    const key = `${c.req.param("prefix")}/${c.req.param("name")}`;
    await bucket.delete(key);
    return c.json({ ok: true });
  })

  // Delete legacy unprefixed image (backward compat)
  .delete("/:name", async (c) => {
    const bucket = c.env.IMAGES_BUCKET;
    const name = c.req.param("name");
    await bucket.delete(name);
    return c.json({ ok: true });
  });
