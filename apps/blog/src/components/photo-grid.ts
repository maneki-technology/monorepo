import type { Photo } from "./photo-types.js";
import { thumbHashBase64ToDataURL } from "../lib/thumbhash.js";
import "@maneki/ui-components/components/ui-image.js";

const styles = new CSSStyleSheet();
styles.replaceSync(/*css*/ `
  :host {
    display: block;
  }

  .grid {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .grid-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  .grid-item {
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    background-size: cover;
    background-position: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .grid-item:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .grid-item ui-image {
    display: block;
    width: 100%;
    border-radius: 8px;
  }

  .grid-item-info {
    padding: 8px 10px;
    font-family: var(--fd-type-body-03-font-family, sans-serif);
    font-size: 11px;
    color: #fff;
    line-height: 1.4;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 10px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    border-radius: 0 0 8px 8px;
    padding: 24px 10px 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  .grid-item:hover .grid-item-info { opacity: 1; }

  .grid-item-info:empty { display: none; }

  .grid-item-info span { white-space: nowrap; }

  .grid-item-title { font-size: 13px; font-weight: 600; width: 100%; white-space: normal; }
`);

class PhotoGrid extends HTMLElement {
  private _container!: HTMLDivElement;
  private _photos: Photo[] = [];
  private _resizeObserver: ResizeObserver | null = null;
  private _lastColCount = 0;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [styles];

    this._container = document.createElement("div");
    this._container.className = "grid";
    shadow.appendChild(this._container);

    this._container.addEventListener("click", (e: Event) => {
      const target = (e.target as HTMLElement).closest(".grid-item") as HTMLElement | null;
      if (!target) return;
      const index = Number(target.dataset.index);
      if (Number.isNaN(index)) return;
      this.dispatchEvent(
        new CustomEvent("photo-select", {
          detail: { index },
          bubbles: true,
        }),
      );
    });
  }

  connectedCallback(): void {
    this._resizeObserver = new ResizeObserver(() => {
      const cols = this._getColumnCount();
      if (cols !== this._lastColCount) this._layout();
    });
    this._resizeObserver.observe(this);
  }

  disconnectedCallback(): void {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  private _getColumnCount(): number {
    const w = this.clientWidth;
    if (w >= 2200) return 6;
    if (w >= 1400) return 5;
    if (w >= 1024) return 4;
    if (w >= 640) return 3;
    return 1;
  }

  setPhotos(photos: Photo[]): void {
    this._photos = photos;
    this._layout();
  }

  private _layout(): void {
    const photos = this._photos;
    this._container.innerHTML = "";
    if (photos.length === 0) return;

    const colCount = this._getColumnCount();
    this._lastColCount = colCount;
    const columns: HTMLDivElement[] = [];
    const heights: number[] = [];

    for (let c = 0; c < colCount; c++) {
      const col = document.createElement("div");
      col.className = "grid-column";
      columns.push(col);
      heights.push(0);
      this._container.appendChild(col);
    }

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const item = document.createElement("div");
      item.className = "grid-item";
      item.dataset.index = String(i);

      if (photo.width && photo.height) {
        item.style.aspectRatio = `${photo.width} / ${photo.height}`;
      }

      let placeholder = "";
      if (photo.thumbhash) {
        try { placeholder = thumbHashBase64ToDataURL(photo.thumbhash); } catch { /* ignore */ }
      }

      const uiImage = document.createElement("ui-image");
      uiImage.setAttribute("src", photo.thumbnailUrl || photo.url);
      uiImage.setAttribute("alt", photo.title || "");
      if (placeholder) uiImage.setAttribute("placeholder", placeholder);
      uiImage.style.setProperty("--ui-image-fit", "cover");

      item.appendChild(uiImage);

      // EXIF caption
      const exif = photo.exif || {};
      const parts: string[] = [];
      if (exif.Make || exif.Model) parts.push(String(exif.Make && exif.Model ? `${exif.Make} ${exif.Model}` : exif.Make || exif.Model));
      if (exif.FocalLength) parts.push(`${String(exif.FocalLength).replace(/\s*mm$/i, '')} mm`);
      if (exif.FNumber != null) parts.push(`ƒ/${String(exif.FNumber).replace(/^f\//, "")}`);
      if (exif.ExposureTime) parts.push(`${exif.ExposureTime}s`);
      if (exif.ISO) parts.push(`ISO ${exif.ISO}`);

      if (photo.title || parts.length > 0) {
        const info = document.createElement("div");
        info.className = "grid-item-info";
        const titleHtml = photo.title ? `<span class="grid-item-title">${photo.title}</span>` : "";
        const exifHtml = parts.map((p) => `<span>${p}</span>`).join("");
        info.innerHTML = titleHtml + exifHtml;
        item.appendChild(info);
      }

      // Place in shortest column
      let shortest = 0;
      for (let c = 1; c < colCount; c++) {
        if (heights[c] < heights[shortest]) shortest = c;
      }
      columns[shortest].appendChild(item);
      heights[shortest] += photo.height && photo.width ? photo.height / photo.width : 1;
    }

    // Preload full-size images for visible grid items via IntersectionObserver
    this._observeForPreload();
  }

  private _preloadObserver: IntersectionObserver | null = null;

  private _observeForPreload(): void {
    this._preloadObserver?.disconnect();
    this._preloadObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const idx = Number((entry.target as HTMLElement).dataset.index);
        const photo = this._photos[idx];
        if (!photo || !photo.thumbnailUrl || photo.thumbnailUrl === photo.url) continue;
        // Preload full-size in background
        const img = new Image();
        img.src = photo.url;
        // Stop observing once triggered
        this._preloadObserver!.unobserve(entry.target);
      }
    }, { rootMargin: "200px" });

    this._container.querySelectorAll(".grid-item").forEach((item) => {
      this._preloadObserver!.observe(item);
    });
  }
}


customElements.define("photo-grid", PhotoGrid);

export { PhotoGrid };
