/**
 * Image upload routes — store images in Cloudflare R2.
 * POST   /images       → upload image, returns URL
 * GET    /images       → list all images
 * GET    /images/:name → serve image
 * DELETE /images/:name → delete image
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

    // Generate unique filename: timestamp-originalname
    const ext = file.name.split(".").pop() ?? "bin";
    const name = `${Date.now().toString(36)}-${file.name.replace(/[^\w.-]/g, "_")}`;

    await bucket.put(name, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
      customMetadata: {
        originalName: file.name,
        uploadedBy: c.get("userEmail"),
      },
    });

    const baseUrl = c.env.IMAGES_BASE_URL || "/api/images";
    const url = `${baseUrl}/${name}`;
    return c.json({ ok: true, name, url }, 201);
    return c.json({ ok: true, name, url }, 201);
  })

  // List all images
  .get("/", async (c) => {
    const bucket = c.env.IMAGES_BUCKET;
    const listed = await bucket.list({ limit: 500 });

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

  // Serve image
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

  // Delete image
  .delete("/:name", async (c) => {
    const bucket = c.env.IMAGES_BUCKET;
    const name = c.req.param("name");
    await bucket.delete(name);
    return c.json({ ok: true });
  });
