import type { Photo } from "./photo-types.js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TILES = "https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png";

/** Group photos within ~500m of each other */
const PROXIMITY_THRESHOLD = 0.005;

const styles = new CSSStyleSheet();
styles.replaceSync(/*css*/ `
  :host {
    display: block;
    height: calc(100vh - 200px);
    min-height: 400px;
    border-radius: 8px;
    overflow: hidden;
  }

  .map {
    width: 100%;
    height: 100%;
  }

  :host([dark]) .map .leaflet-tile-pane {
    filter: invert(1) hue-rotate(180deg);
  }

  .marker-dot {
    position: relative;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--blog-accent, #c2785c);
    border: 2px solid var(--fd-surface-primary, #fff);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .marker-dot:hover {
    transform: scale(1.4);
  }

  .marker-dot .count {
    position: absolute;
    top: -8px;
    right: -10px;
    background: var(--fd-surface-tertiary, #d4d4d8);
    color: var(--fd-text-primary, #18181b);
    font-size: 9px;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
    line-height: 1;
    border: 1.5px solid var(--fd-surface-primary, #fff);
  }
`);

interface PhotoGroup {
  lat: number;
  lng: number;
  location: string;
  photos: Photo[];
}

class PhotoMap extends HTMLElement {
  private _map: L.Map | null = null;
  private _container!: HTMLDivElement;
  private _tileLayer: L.TileLayer | null = null;
  private _photos: Photo[] = [];
  private _observer: MutationObserver | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [styles];

    const leafletStyle = document.createElement("link");
    leafletStyle.rel = "stylesheet";
    leafletStyle.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    shadow.appendChild(leafletStyle);

    this._container = document.createElement("div");
    this._container.className = "map";
    shadow.appendChild(this._container);
  }

  connectedCallback(): void {
    this._syncTheme();
    requestAnimationFrame(() => this._initMap());
  }

  disconnectedCallback(): void {
    this._observer?.disconnect();
    this._observer = null;
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }

  private _isDark(): boolean {
    return document.documentElement.getAttribute("data-theme") === "heroui-dark";
  }

  private _syncTheme(): void {
    this.toggleAttribute("dark", this._isDark());
  }

  private _initMap(): void {
    if (this._map) return;

    // Inject global popup styles (Leaflet renders popups in main DOM)
    if (!document.getElementById("photo-map-popup-styles")) {
      const style = document.createElement("style");
      style.id = "photo-map-popup-styles";
      style.textContent = `
        [data-theme="heroui-dark"] .leaflet-popup-content-wrapper {
          background: #1e1e1e;
          color: #e4e4e7;
        }
        [data-theme="heroui-dark"] .leaflet-popup-tip {
          background: #1e1e1e;
        }
        [data-theme="heroui-dark"] .photo-popup .title {
          color: #e4e4e7;
        }
        [data-theme="heroui-dark"] .photo-popup .location {
          color: #a1a1aa;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        }
      `;
      document.head.appendChild(style);
    }

    this._map = L.map(this._container, {
      zoomControl: false,
      attributionControl: false,
    }).setView([16.05, 108.0], 7);

    this._tileLayer = L.tileLayer(TILES, {
      maxZoom: 18,
    }).addTo(this._map);

    L.control.zoom({ position: "bottomright" }).addTo(this._map);

    if (this._photos.length > 0) this._addMarkers();

    this._observer = new MutationObserver(() => this._syncTheme());
    this._observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  setPhotos(photos: Photo[]): void {
    this._photos = photos;
    if (this._map) this._addMarkers();
  }

  private _groupByLocation(): PhotoGroup[] {
    const groups: PhotoGroup[] = [];

    for (const photo of this._photos) {
      if (photo.latitude == null || photo.longitude == null) continue;

      const existing = groups.find(
        (g) =>
          Math.abs(g.lat - photo.latitude!) < PROXIMITY_THRESHOLD &&
          Math.abs(g.lng - photo.longitude!) < PROXIMITY_THRESHOLD,
      );

      if (existing) {
        existing.photos.push(photo);
      } else {
        groups.push({
          lat: photo.latitude,
          lng: photo.longitude,
          location: photo.location || "",
          photos: [photo],
        });
      }
    }

    return groups;
  }

  private _addMarkers(): void {
    if (!this._map) return;

    this._map.eachLayer((layer) => {
      if (layer instanceof L.Marker) this._map!.removeLayer(layer);
    });

    const groups = this._groupByLocation();
    const bounds: L.LatLngExpression[] = [];

    for (const group of groups) {
      const latlng: L.LatLngExpression = [group.lat, group.lng];
      bounds.push(latlng);

      const countBadge = group.photos.length > 1
        ? `<span class="count">${group.photos.length}</span>`
        : "";

      const icon = L.divIcon({
        className: "",
        html: `<div class="marker-dot">${countBadge}</div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker(latlng, { icon }).addTo(this._map);
      marker.on("click", () => {
        this._map?.setView(latlng, this._map.getZoom(), { animate: true });
        this.dispatchEvent(new CustomEvent("photo-select", {
          detail: { index: 0, photos: group.photos },
          bubbles: true,
        }));
      });
    }

    if (bounds.length > 0) {
      this._map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 12 });
    }
  }
}

customElements.define("photo-map", PhotoMap);

export { PhotoMap };
