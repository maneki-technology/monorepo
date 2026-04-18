import type { Photo } from "./photo-types.js";
import worldMapSvg from "./world-map.svg?raw";

interface PhotoGroup {
  lat: number;
  lng: number;
  location: string;
  photos: Photo[];
}

/** Group photos within ~500m of each other */
const PROXIMITY_THRESHOLD = 0.005;

/**
 * Convert lat/lng to SVG coordinates.
 * Calibrated from known SVG bbox centers:
 *   VN:  geographic ~16°N, 106°E  → SVG (661.18, 485.20)
 *   JP:  geographic ~36°N, 138°E  → SVG (723.08, 403.67)
 */

function latToMillerY(lat: number): number {
  const latRad = (lat * Math.PI) / 180;
  return 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * latRad));
}

// X calibration: piecewise — different scale west vs east of VN center (106°)
// West: SG (103.82, 660) to VN (106, 661.18)
// East: VN (106, 661.18) to Bali (115.27, 692)
const LNG_WEST_SCALE = (661.18 - 660) / (106 - 103.82);
const LNG_EAST_SCALE = (692 - 661.18) / (115.27 - 106);

// Y calibration: VN (lat=16, y=485.20) and ID (lat=-1.8, y=537.92)
const MILLER_VN = latToMillerY(16);
const MILLER_ID = latToMillerY(-1.8);
const Y_SCALE = (537.92 - 485.20) / (MILLER_ID - MILLER_VN);
const Y_OFFSET = 485.20 - Y_SCALE * MILLER_VN;

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = lng <= 106
    ? 661.18 + LNG_WEST_SCALE * (lng - 106)
    : 661.18 + LNG_EAST_SCALE * (lng - 106);
  const y = Y_SCALE * latToMillerY(lat) + Y_OFFSET;
  return { x, y };
}

const SVG_NS = "http://www.w3.org/2000/svg";

const styles = new CSSStyleSheet();
styles.replaceSync(/*css*/ `
  :host {
    display: block;
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    background: #f5f0e8;
  }

  :host([dark]) {
    background: #1a1814;
  }

  .map-container {
    width: 100%;
    height: calc(100vh - 200px);
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .map-container svg {
    width: 100%;
    height: 100%;
  }

  /* Country paths — parchment style */
  .map-container svg path:not(.x-mark) {
    fill: #e8dfd0;
    stroke: #c2a882;
    stroke-width: 0.3px;
    stroke-linejoin: round;
    stroke-linecap: round;
    paint-order: stroke fill;
    transition: fill 0.3s ease, opacity 0.3s ease;
  }

  :host([dark]) .map-container svg path:not(.x-mark) {
    fill: #2a2520;
    stroke: #5a4d3e;
  }

  .map-container svg path.explored:not(.x-mark),
  .map-container svg g.explored path {
    fill: #ddd3be;
    stroke: #8b7355;
    stroke-width: 0.5px;
  }

  :host([dark]) .map-container svg path.explored:not(.x-mark),
  :host([dark]) .map-container svg g.explored path {
    fill: #3a3228;
    stroke: #7a6a52;
  }

  .map-container svg path:not(.explored):not(.x-mark) {
    opacity: 0.3;
  }

  .map-container svg g.explored path {
    opacity: 1;
  }

  /* X marks — bright red, thin, hand-drawn */
  .x-mark {
    stroke: #d62828;
    stroke-width: 0.4;
    stroke-linecap: round;
    fill: none;
    cursor: pointer;
    transition: stroke-width 0.15s ease;
  }

  :host([dark]) .x-mark {
    stroke: #ef233c;
  }

  .dot-group:hover .x-mark {
    stroke-width: 0.7;
  }

  /* Location label — always visible, italic serif */
  .location-label {
    fill: #8b7355;
    font-size: 1.2px;
    font-family: "Georgia", "Times New Roman", serif;
    font-style: italic;
    text-anchor: middle;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .dot-group:hover .location-label {
    opacity: 1;
  }

  :host([dark]) .location-label {
    fill: #a89070;
  }

  /* Compass rose */
  .compass {
    position: absolute;
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
    opacity: 0.3;
    z-index: 1;
  }

  .compass svg {
    width: 100%;
    height: 100%;
  }
`);

class PhotoWorldMap extends HTMLElement {
  private _container!: HTMLDivElement;
  private _svg: SVGSVGElement | null = null;
  private _photos: Photo[] = [];
  private _observer: MutationObserver | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [styles];

    this._container = document.createElement("div");
    this._container.className = "map-container";

    // Parse the world map SVG and insert it
    const parser = new DOMParser();
    const doc = parser.parseFromString(worldMapSvg, "image/svg+xml");
    this._svg = doc.querySelector("svg");
    if (this._svg) {
      // Remove the title tooltip from the SVG
      this._svg.querySelector("title")?.remove();
      this._svg.querySelector("desc")?.remove();
      this._container.appendChild(this._svg);
    }

    // Compass rose
    const compass = document.createElement("div");
    compass.className = "compass";
    compass.innerHTML = `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5">
      <line x1="50" y1="5" x2="50" y2="95" />
      <line x1="5" y1="50" x2="95" y2="50" />
      <polygon points="50,5 45,20 55,20" fill="currentColor" />
      <text x="50" y="3" text-anchor="middle" font-size="10" fill="currentColor" stroke="none" font-family="serif" font-style="italic">N</text>
    </svg>`;

    shadow.appendChild(this._container);
    shadow.appendChild(compass);
  }

  connectedCallback(): void {
    this._syncTheme();
    this._observer = new MutationObserver(() => this._syncTheme());
    this._observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  disconnectedCallback(): void {
    this._observer?.disconnect();
    this._observer = null;
  }

  private _isDark(): boolean {
    return document.documentElement.getAttribute("data-theme") === "heroui-dark";
  }

  private _syncTheme(): void {
    this.toggleAttribute("dark", this._isDark());
  }

  setPhotos(photos: Photo[]): void {
    this._photos = photos;
    this._render();
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

  /** Common country names → SVG path IDs */
  private static COUNTRY_IDS: Record<string, string> = {
    "vietnam": "vn", "indonesia": "idn", "japan": "jp", "thailand": "th",
    "singapore": "sg", "malaysia": "my", "cambodia": "kh", "laos": "la",
    "myanmar": "mm", "philippines": "ph", "south korea": "kr", "taiwan": "tw",
    "australia": "au", "india": "in", "china": "cn", "united states": "us",
    "united kingdom": "gb", "france": "fr", "germany": "de", "italy": "it",
    "spain": "es", "brazil": "br", "mexico": "mx", "canada": "ca",
  };

  private _markExploredCountries(): void {
    if (!this._svg) return;

    const groups = this._groupByLocation();
    const exploredIds = new Set<string>();

    for (const group of groups) {
      // Extract country from location string (last part after comma)
      const parts = group.location.split(",");
      const country = parts[parts.length - 1]?.trim().toLowerCase();
      if (country) {
        const id = PhotoWorldMap.COUNTRY_IDS[country];
        if (id) exploredIds.add(id);
      }
    }

    // First pass: mark groups and collect their child paths
    const groupChildPaths = new Set<Element>();
    this._svg.querySelectorAll("g[id]").forEach((g) => {
      const isExplored = exploredIds.has(g.id);
      g.classList.toggle("explored", isExplored);
      if (isExplored) {
        g.querySelectorAll("path").forEach((p) => {
          p.classList.add("explored");
          groupChildPaths.add(p);
        });
      }
    });

    // Second pass: mark standalone paths (skip ones inside groups)
    this._svg.querySelectorAll("path:not(.x-mark)").forEach((path) => {
      if (!groupChildPaths.has(path)) {
        path.classList.toggle("explored", exploredIds.has(path.id));
      }
    });
  }

  private _render(): void {
    if (!this._svg) return;

    // Remove old dot groups
    this._svg.querySelectorAll(".dot-group").forEach((el) => el.remove());

    this._markExploredCountries();

    const groups = this._groupByLocation();
    if (groups.length === 0) return;

    // Calculate bounds for viewBox zoom
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const g of groups) {
      const { x, y } = latLngToSvg(g.lat, g.lng);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }

    // Pad the bounds
    const pad = 15;
    minX -= pad; minY -= pad; maxX += pad; maxY += pad;

    // Set viewBox to zoom into photo region
    this._svg.setAttribute("viewBox", `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);

    // Add markers as SVG elements
    for (const group of groups) {
      const { x, y } = latLngToSvg(group.lat, group.lng);

      const g = document.createElementNS(SVG_NS, "g");
      g.classList.add("dot-group");
      g.style.cursor = "pointer";

      // Hand-drawn X mark — small, thin, slightly wobbly
      const s = 0.8;
      const xMark = document.createElementNS(SVG_NS, "path");
      xMark.classList.add("x-mark");
      const w1 = 0.2 + Math.random() * 0.2;
      const w2 = -0.15 - Math.random() * 0.2;
      xMark.setAttribute("d",
        `M${x - s},${y - s} Q${x + w1},${y + w2} ${x + s},${y + s}` +
        ` M${x + s},${y - s} Q${x + w2},${y + w1} ${x - s},${y + s}`
      );
      g.appendChild(xMark);

      // Location label — below the X, always visible, italic serif like old maps
      if (group.location) {
        const label = document.createElementNS(SVG_NS, "text");
        label.classList.add("location-label");
        label.setAttribute("x", String(x));
        label.setAttribute("y", String(y + s + 2));
        // Short name only — take first part before comma
        const shortName = group.location.split(",")[0].trim();
        label.textContent = shortName;
        g.appendChild(label);
      }

      // Click handler
      g.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("photo-select", {
          detail: { index: 0, photos: group.photos },
          bubbles: true,
        }));
      });

      this._svg!.appendChild(g);
    }
  }
}

customElements.define("photo-world-map", PhotoWorldMap);

export { PhotoWorldMap };
