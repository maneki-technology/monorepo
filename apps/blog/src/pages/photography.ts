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
    location: p.location,
    latitude: p.latitude,
    longitude: p.longitude,
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
  render: () => {
    const isMapView = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("view") === "map";
    return `
    <div class="row gap-1 mb-3" style="justify-content:space-between;align-items:center;flex-wrap:wrap;">
      <h1 class="heading-02" style="margin:0;">Photography</h1>
      <div id="view-toggle" class="row gap-1">
        <ui-button data-view="grid" action="secondary" emphasis="${isMapView ? "minimal" : "subtle"}" size="s">🖼️ Grid</ui-button>
        <ui-button data-view="map" action="secondary" emphasis="${isMapView ? "subtle" : "minimal"}" size="s">🗺️ Map</ui-button>
      </div>
    </div>
    <p class="body-02 text-secondary mb-3">Moments to remember.</p>
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
    <div id="photo-map-container" style="display:none;"></div>
    <script>if(location.search.includes('view=map')){document.getElementById('photo-grid').style.display='none';document.getElementById('photo-map-container').style.display='block';var b=document.querySelectorAll('#view-toggle ui-button');b[0]&&b[0].setAttribute('emphasis','minimal');b[1]&&b[1].setAttribute('emphasis','subtle');}</script>
    <photo-lightbox id="photo-lightbox"></photo-lightbox>
    ${allPhotos.length === 0 ? `<p class="body-01 text-secondary mt-4">No photos yet.</p>` : ""}
    <noscript>
      <div style="columns:3;column-gap:16px;">
        ${allPhotos.map((p) => `<img src="${p.url}" alt="${p.title}" width="${p.width}" height="${p.height}" style="width:100%;height:auto;margin-bottom:16px;border-radius:8px;" loading="lazy">`).join("")}
      </div>
    </noscript>
  `;
  },
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
        if (mapEl) mapEl.setPhotos(currentPhotos);

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
    // View toggle (Grid / Map)
    const viewToggle = document.getElementById("view-toggle");
    const mapContainer = document.getElementById("photo-map-container");
    let mapLoaded = false;
    let mapEl: (HTMLElement & { setPhotos(p: Photo[]): void }) | null = null;

    if (viewToggle && mapContainer) {
      viewToggle.addEventListener("click", (async (e: Event) => {
        const btn = (e.target as HTMLElement).closest("ui-button[data-view]") as HTMLElement | null;
        if (!btn) return;
        const view = btn.dataset.view!;

        // Toggle emphasis: subtle = active, minimal = inactive
        viewToggle.querySelectorAll("ui-button").forEach((b) => {
          b.setAttribute("emphasis", b === btn ? "subtle" : "minimal");
        });

        if (view === "map") {
          gridEl.style.display = "none";
          mapContainer.style.display = "block";

          if (!mapLoaded) {
            mapLoaded = true;
            const { PhotoMap: _PM } = await import("../components/photo-map.js");
            void _PM;
            mapEl = document.createElement("photo-map") as HTMLElement & { setPhotos(p: Photo[]): void };
            mapContainer.appendChild(mapEl);
            mapEl.setPhotos(currentPhotos);

            // Open lightbox when clicking a photo in the map popup
            mapEl.addEventListener("photo-select", ((ev: CustomEvent) => {
              const index = ev.detail?.index ?? 0;
              const photos = ev.detail?.photos ?? currentPhotos;
              lightbox?.open(index, photos);
            }) as EventListener);
          }
        } else {
          gridEl.style.display = "block";
          mapContainer.style.display = "none";
        }

        // Update URL with view param
        const url = new URL(window.location.href);
        if (view === "map") {
          url.searchParams.set("view", "map");
        } else {
          url.searchParams.delete("view");
        }
        history.replaceState(null, "", url.toString());
      }) as EventListener);

      // Restore view from URL
      if (params.get("view") === "map") {
        const mapBtn = viewToggle.querySelector('ui-button[data-view="map"]') as HTMLElement | null;
        if (mapBtn) {
          mapBtn.setAttribute("emphasis", "subtle");
          viewToggle.querySelector('ui-button[data-view="grid"]')?.setAttribute("emphasis", "minimal");
          mapBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }
      }
    }
  },
};
