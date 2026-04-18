import type { Route } from "../router.js";
import type { Photo } from "../components/photo-types.js";
import { photos } from "virtual:photos";
import "../components/photo-lightbox.js";

const allPhotos: Photo[] = photos.map((p) => ({
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
}));

export const mapRoute: Route = {
  id: "map",
  meta: {
    title: "Photo Map",
    description: "Explore photos on a treasure hunt map.",
  },
  render: () => `
    <h1 class="heading-02 mb-2">Photo Map</h1>
    <p class="body-02 text-secondary mb-3">Places I've been, moments I've captured.</p>
    <photo-world-map id="photo-world-map"></photo-world-map>
    <photo-lightbox id="photo-lightbox"></photo-lightbox>
  `,
  setup: () => {
    const mapEl = document.getElementById("photo-world-map") as HTMLElement & { setPhotos(p: Photo[]): void } | null;
    const lightbox = document.getElementById("photo-lightbox") as HTMLElement & { open(i: number, p: Photo[]): void } | null;

    if (mapEl) {
      import("../components/photo-world-map.js").then(() => {
        mapEl.setPhotos(allPhotos);
      });

      mapEl.addEventListener("photo-select", ((ev: CustomEvent) => {
        const index = ev.detail?.index ?? 0;
        const photos = ev.detail?.photos ?? allPhotos;
        lightbox?.open(index, photos);
      }) as EventListener);
    }
  },
};
