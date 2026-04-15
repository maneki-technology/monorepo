/**
 * /photography — Public photography page.
 * Masonry grid with album filtering and lightbox.
 */

import { photos } from "virtual:photos";
import { albums } from "virtual:albums";
import type { Route } from "../router.js";
import type { Photo } from "../components/photo-types.js";
import "../components/photo-grid.js";
import "../components/photo-lightbox.js";

function toPhoto(p: (typeof photos)[number]): Photo {
  return {
    id: p.id,
    url: p.url,
    title: p.title,
    caption: p.caption,
    albumId: p.albumId,
    category: p.category,
    width: p.width,
    height: p.height,
    thumbhash: p.thumbhash,
    exif: p.exif,
    sortOrder: p.sortOrder,
    featured: p.featured,
  };
}

const allPhotos: Photo[] = photos.map(toPhoto);

export const photographyRoute: Route = {
  id: "photography",
  meta: {
    title: "Photography",
    description: "Photos from travels and daily life.",
  },
  render: () => `
    <h1 class="heading-02 mb-2">Photography</h1>
    ${
      albums.length > 0
        ? `
      <div id="photo-filters" class="row gap-1 mb-4" style="flex-wrap:wrap;">
        <ui-tag type="selectable" size="s" selected data-album="all">All</ui-tag>
        ${albums.map((a) => `<ui-tag type="selectable" size="s" data-album="${a.slug}" data-album-id="${a.id}">${a.title}</ui-tag>`).join("")}
      </div>
    `
        : ""
    }
    <photo-grid id="photo-grid"></photo-grid>
    <photo-lightbox id="photo-lightbox"></photo-lightbox>
    ${allPhotos.length === 0 ? `<p class="body-01 text-secondary mt-4">No photos yet.</p>` : ""}
    <noscript>
      <div style="columns:3;column-gap:16px;">
        ${allPhotos.map((p) => `<img src="${p.url}" alt="${p.title}" width="${p.width}" height="${p.height}" style="width:100%;height:auto;margin-bottom:16px;border-radius:8px;" loading="lazy">`).join("")}
      </div>
    </noscript>
  `,
  setup: () => {
    const grid = document.getElementById("photo-grid") as (HTMLElement & { setPhotos(p: Photo[]): void }) | null;
    const lightbox = document.getElementById("photo-lightbox") as
      | (HTMLElement & { open(i: number, p: Photo[]): void })
      | null;
    const filters = document.getElementById("photo-filters");

    if (!grid) return;

    let currentPhotos = allPhotos;
    grid.setPhotos(currentPhotos);

    // Open lightbox on photo click
    grid.addEventListener("photo-select", ((e: CustomEvent) => {
      const index = e.detail?.index ?? 0;
      lightbox?.open(index, currentPhotos);
    }) as EventListener);

    // Check URL for ?photo=id on load
    const params = new URLSearchParams(window.location.search);
    const photoId = params.get("photo");
    if (photoId) {
      const idx = currentPhotos.findIndex((p) => p.id === Number(photoId));
      if (idx >= 0) lightbox?.open(idx, currentPhotos);
    }

    // Album filter
    if (filters) {
      filters.addEventListener("click", (e) => {
        const tag = (e.target as Element).closest("ui-tag[data-album]") as HTMLElement | null;
        if (!tag) return;

        // Update selected state
        filters.querySelectorAll("ui-tag").forEach((t) => t.removeAttribute("selected"));
        tag.setAttribute("selected", "");

        const albumSlug = tag.dataset.album;
        const albumId = tag.dataset.albumId ? Number(tag.dataset.albumId) : null;

        if (albumSlug === "all" || !albumId) {
          currentPhotos = allPhotos;
        } else {
          currentPhotos = allPhotos.filter((p) => p.albumId === albumId);
        }

        grid.setPhotos(currentPhotos);

        // Update URL
        const url = new URL(window.location.href);
        if (albumSlug === "all") {
          url.searchParams.delete("album");
        } else {
          url.searchParams.set("album", albumSlug!);
        }
        url.searchParams.delete("photo");
        history.replaceState(null, "", url.toString());
      });

      // Restore filter from URL
      const albumParam = params.get("album");
      if (albumParam) {
        const tag = filters.querySelector(`ui-tag[data-album="${albumParam}"]`) as HTMLElement | null;
        if (tag) {
          filters.querySelectorAll("ui-tag").forEach((t) => t.removeAttribute("selected"));
          tag.setAttribute("selected", "");
          const albumId = tag.dataset.albumId ? Number(tag.dataset.albumId) : null;
          if (albumId) {
            currentPhotos = allPhotos.filter((p) => p.albumId === albumId);
            grid.setPhotos(currentPhotos);
          }
        }
      }
    }
  },
};
