/**
 * /photography — Public photography page.
 * Masonry grid with tag filtering and lightbox.
 */

import { photos, tags as allTags } from "virtual:photos";
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
    tags: p.tags,
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
      allTags.length > 0
        ? `
      <div id="photo-filters" class="row gap-1 mb-4" style="flex-wrap:wrap;">
        <ui-tag type="selectable" size="s" data-tag="all" state="selected">All</ui-tag>
        ${allTags.map((t) => `<ui-tag type="selectable" size="s" data-tag="${t}">${t}</ui-tag>`).join("")}
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
    const gridEl = grid;

    let currentPhotos = allPhotos;
    gridEl.setPhotos(currentPhotos);

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

    // Tag filter
    if (filters) {
      const selectedTags = new Set<string>();

      function applyFilter(): void {
        if (selectedTags.size === 0) {
          currentPhotos = allPhotos;
        } else {
          currentPhotos = allPhotos.filter((p) => p.tags.some((t) => selectedTags.has(t)));
        }
        gridEl.setPhotos(currentPhotos);

        // Sync "All" tag visual state
        const allTag = filters!.querySelector('ui-tag[data-tag="all"]') as HTMLElement | null;
        if (allTag) allTag.setAttribute("state", selectedTags.size === 0 ? "selected" : "enabled");

        // Update URL
        const url = new URL(window.location.href);
        url.searchParams.delete("tag");
        url.searchParams.delete("photo");
        for (const t of selectedTags) url.searchParams.append("tag", t);
        history.replaceState(null, "", url.toString());
      }

      filters.addEventListener("change", ((e: CustomEvent) => {
        const tag = (e.target as HTMLElement).closest("ui-tag[data-tag]") as HTMLElement | null;
        if (!tag) return;
        const tagName = tag.dataset.tag!;
        const isSelected = e.detail?.selected;

        if (tagName === "all") {
          // "All" clicked — clear all other selections
          selectedTags.clear();
          filters!.querySelectorAll('ui-tag:not([data-tag="all"])').forEach((t) => t.setAttribute("state", "enabled"));
          // Force "All" to stay selected
          tag.setAttribute("state", "selected");
        } else {
          if (isSelected) {
            selectedTags.add(tagName);
          } else {
            selectedTags.delete(tagName);
          }
        }

        applyFilter();
      }) as EventListener);

      // Restore filter from URL
      const tagParams = params.getAll("tag");
      if (tagParams.length > 0) {
        for (const t of tagParams) {
          const tagEl = filters.querySelector(`ui-tag[data-tag="${t}"]`) as HTMLElement | null;
          if (tagEl) {
            selectedTags.add(t);
            tagEl.setAttribute("state", "selected");
          }
        }
        applyFilter();
      }
    }
  },
};
