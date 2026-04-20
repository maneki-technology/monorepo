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
import { getDb } from "./db.js";

const PHOTOS_MODULE_ID = "virtual:photos";
const PHOTOS_RESOLVED_ID = "\0" + PHOTOS_MODULE_ID;

const ALBUMS_MODULE_ID = "virtual:albums";
const ALBUMS_RESOLVED_ID = "\0" + ALBUMS_MODULE_ID;

const EMPTY_PHOTOS = "export const photos = [];\nexport const featuredPhotos = [];\nexport const tags = [];";
const EMPTY_ALBUMS = "export const albums = [];";

export function photographyPlugin(): Plugin {
  async function loadPhotos(): Promise<string> {
    const db = getDb();
    try {
      const result = await db.execute(
        "SELECT id, r2_key, url, thumbnail_url, title, caption, album_id, category, location, latitude, longitude, width, height, thumbhash, exif_json, sort_order, featured FROM photos WHERE status = 'published' ORDER BY sort_order ASC, created_at DESC",
      );

      // Fetch tags per photo
      const tagResult = await db.execute(
        "SELECT pt.photo_id, t.name FROM photo_tags pt JOIN tags t ON t.id = pt.tag_id",
      );
      const photoTags = new Map<number, string[]>();
      for (const row of tagResult.rows) {
        const pid = row.photo_id as number;
        if (!photoTags.has(pid)) photoTags.set(pid, []);
        photoTags.get(pid)!.push(row.name as string);
      }

      const photos = result.rows.map((row) => ({
        id: row.id as number,
        r2Key: row.r2_key as string,
        url: row.url as string,
        thumbnailUrl: (row.thumbnail_url as string) || "",
        title: row.title as string,
        caption: row.caption as string,
        albumId: (row.album_id as number) ?? null,
        category: row.category as string,
        tags: [...new Set(photoTags.get(row.id as number) ?? [])],
        location: (row.location as string) || "",
        latitude: (row.latitude as number) ?? null,
        longitude: (row.longitude as number) ?? null,
        width: row.width as number,
        height: row.height as number,
        thumbhash: row.thumbhash as string,
        exif: JSON.parse((row.exif_json as string) || "{}"),
        sortOrder: (row.sort_order as number) ?? 0,
        featured: !!row.featured,
      }));

      const featured = photos.filter((p) => p.featured);
      const tagSet = new Set(photos.flatMap((p) => p.tags));
      const tags = [...tagSet].sort();

      console.log(
        `[photography] Loaded ${photos.length} published photos (${featured.length} featured, ${tags.length} tags)`,
      );
      return `export const photos = ${JSON.stringify(photos)};\nexport const featuredPhotos = ${JSON.stringify(featured)};\nexport const tags = ${JSON.stringify(tags)};`;
    } catch (err) {
      console.error("[photography] Failed to fetch photos from Turso:", err);
      throw err;
    }
  }

  async function loadAlbums(): Promise<string> {
    const db = getDb();
    try {
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
