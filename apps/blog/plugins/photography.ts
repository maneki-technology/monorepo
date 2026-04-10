/**
 * Vite plugin that fetches published photos and albums from Turso
 * and exposes them as virtual modules.
 *
 * Usage:
 *   import { photos, featuredPhotos, categories } from "virtual:photos";
 *   import { albums } from "virtual:albums";
 *
 * Requires TURSO_URL + TURSO_AUTH_TOKEN env vars at build time.
 * Falls back to empty arrays if DB is unavailable (dev without DB).
 */

import { type Plugin } from "vite";
import { createClient } from "@libsql/client";

const PHOTOS_MODULE_ID = "virtual:photos";
const PHOTOS_RESOLVED_ID = "\0" + PHOTOS_MODULE_ID;

const ALBUMS_MODULE_ID = "virtual:albums";
const ALBUMS_RESOLVED_ID = "\0" + ALBUMS_MODULE_ID;

const EMPTY_PHOTOS = "export const photos = [];\nexport const featuredPhotos = [];\nexport const categories = [];";
const EMPTY_ALBUMS = "export const albums = [];";

export function photographyPlugin(): Plugin {
  async function loadPhotos(): Promise<string> {
    const url = process.env.TURSO_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      console.warn("[photography] TURSO_URL not set — returning empty photos");
      return EMPTY_PHOTOS;
    }

    try {
      const db = createClient({ url, authToken: authToken || undefined });
      const result = await db.execute(
        "SELECT id, r2_key, url, title, caption, album_id, category, width, height, thumbhash, exif_json, sort_order, featured FROM photos WHERE status = 'published' ORDER BY sort_order ASC, created_at DESC",
      );

      const photos = result.rows.map((row) => ({
        id: row.id as number,
        r2Key: row.r2_key as string,
        url: row.url as string,
        title: row.title as string,
        caption: row.caption as string,
        albumId: (row.album_id as number) ?? null,
        category: row.category as string,
        width: row.width as number,
        height: row.height as number,
        thumbhash: row.thumbhash as string,
        exif: JSON.parse((row.exif_json as string) || "{}"),
        sortOrder: (row.sort_order as number) ?? 0,
        featured: !!row.featured,
      }));

      const featured = photos.filter((p) => p.featured);
      const categorySet = new Set(photos.map((p) => p.category).filter(Boolean));
      const categories = [...categorySet].sort();

      console.log(
        `[photography] Loaded ${photos.length} published photos (${featured.length} featured, ${categories.length} categories)`,
      );
      return `export const photos = ${JSON.stringify(photos)};\nexport const featuredPhotos = ${JSON.stringify(featured)};\nexport const categories = ${JSON.stringify(categories)};`;
    } catch (err) {
      console.error("[photography] Failed to fetch photos from Turso:", err);
      return EMPTY_PHOTOS;
    }
  }

  async function loadAlbums(): Promise<string> {
    const url = process.env.TURSO_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      console.warn("[photography] TURSO_URL not set — returning empty albums");
      return EMPTY_ALBUMS;
    }

    try {
      const db = createClient({ url, authToken: authToken || undefined });
      const result = await db.execute(
        "SELECT a.id, a.slug, a.title, a.description, a.cover_photo_id, a.sort_order, (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id AND p.status = 'published') AS photo_count FROM albums a WHERE a.status = 'published' ORDER BY a.sort_order ASC, a.created_at DESC",
      );

      const albums = result.rows.map((row) => ({
        id: row.id as number,
        slug: row.slug as string,
        title: row.title as string,
        description: row.description as string,
        coverPhotoId: (row.cover_photo_id as number) ?? null,
        sortOrder: (row.sort_order as number) ?? 0,
        photoCount: (row.photo_count as number) ?? 0,
      }));

      console.log(`[photography] Loaded ${albums.length} published albums`);
      return `export const albums = ${JSON.stringify(albums)};`;
    } catch (err) {
      console.error("[photography] Failed to fetch albums from Turso:", err);
      return EMPTY_ALBUMS;
    }
  }

  return {
    name: "photography",
    resolveId(id) {
      if (id === PHOTOS_MODULE_ID) return PHOTOS_RESOLVED_ID;
      if (id === ALBUMS_MODULE_ID) return ALBUMS_RESOLVED_ID;
    },
    async load(id) {
      if (id === PHOTOS_RESOLVED_ID) return loadPhotos();
      if (id === ALBUMS_RESOLVED_ID) return loadAlbums();
    },
  };
}
