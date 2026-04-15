import type { Photo } from "./photo-types.js";
import { thumbHashBase64ToDataURL } from "../lib/thumbhash.js";

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
    background-size: cover;
    background-position: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .grid-item:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .grid-item img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 8px;
  }

  @media (max-width: 1024px) {
    .grid {
      columns: 2;
    }
  }

  @media (max-width: 600px) {
    .grid {
      columns: 1;
    }
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

      if (photo.thumbhash) {
        try {
          const dataUrl = thumbHashBase64ToDataURL(photo.thumbhash);
          item.style.backgroundImage = `url(${dataUrl})`;
        } catch {
        }
      }

      const img = document.createElement("img");
      img.src = photo.url;
      img.alt = photo.title || "";
      img.loading = "lazy";
      img.decoding = "async";
      img.width = photo.width;
      img.height = photo.height;

      img.onload = () => {
        item.style.backgroundImage = "";
        item.style.aspectRatio = "";
      };

      item.appendChild(img);
      this._container.appendChild(item);
    }
  }
}

customElements.define("photo-grid", PhotoGrid);

export { PhotoGrid };
