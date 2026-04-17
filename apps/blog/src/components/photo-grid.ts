import type { Photo } from "./photo-types.js";
import { thumbHashBase64ToDataURL } from "../lib/thumbhash.js";
import "@maneki/ui-components/components/ui-image.js";

const styles = new CSSStyleSheet();
styles.replaceSync(/*css*/ `
  :host {
    display: block;
  }

  .grid {
    columns: 3;
    column-gap: 16px;
  }

  .grid-item {
    break-inside: avoid;
    margin-bottom: 16px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    background-size: cover;
    background-position: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
    break-inside: avoid;
    margin-bottom: 16px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
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

  @media (max-width: 1024px) {
    .grid { columns: 2; }
  }

  @media (max-width: 600px) {
    .grid { columns: 1; }
  }
`);

class PhotoGrid extends HTMLElement {
  private _container!: HTMLDivElement;

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

  setPhotos(photos: Photo[]): void {
    this._container.innerHTML = "";

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
      uiImage.setAttribute("src", photo.url);
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

      this._container.appendChild(item);
    }
  }
}

customElements.define("photo-grid", PhotoGrid);

export { PhotoGrid };
