import { semanticVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type ImageRatio = "16:9" | "3:2" | "1:1" | "3:1" | "21:9";
export type ImageFit = "cover" | "contain" | "fill" | "none";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_SECONDARY = semanticVar("surface", "secondary");

// ─── Aspect ratio map ────────────────────────────────────────────────────────

const RATIO_MAP: Record<ImageRatio, string> = {
  "16:9": "56.25%",
  "3:2": "66.6667%",
  "1:1": "100%",
  "3:1": "33.3333%",
  "21:9": "42.8571%",
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    overflow: hidden;
  }

  .container {
    position: relative;
    width: 100%;
    background-color: var(--ui-image-bg, ${SURFACE_SECONDARY});
  }

  .container.has-ratio {
    height: 0;
  }

  .container:not(.has-ratio) {
    height: var(--ui-image-height, auto);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: var(--ui-image-fit, cover);
  }

  .container.has-ratio img {
    position: absolute;
    top: 0;
    left: 0;
  }

  /* ── Fallback slot (shown when no src) ──────────────────────────────────── */

  .fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .container.has-ratio .fallback {
    position: absolute;
    top: 0;
    left: 0;
  }

  :host([src]) .fallback {
    display: none;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiImage extends HTMLElement {
  static readonly observedAttributes = ["src", "alt", "ratio", "fit"];

  private _container: HTMLDivElement;
  private _img: HTMLImageElement;
  private _fallback: HTMLDivElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    // .container
    const container = document.createElement("div");
    container.className = "container";
    container.setAttribute("part", "container");

    // img
    const img = document.createElement("img");
    img.alt = "";
    container.appendChild(img);

    // fallback slot
    const fallback = document.createElement("div");
    fallback.className = "fallback";
    const slot = document.createElement("slot");
    fallback.appendChild(slot);
    container.appendChild(fallback);

    shadow.appendChild(container);

    this._container = container;
    this._img = img;
    this._fallback = fallback;

    this._syncRatio();
    this._syncSrc();
  }

  // ── Attribute accessors ──────────────────────────────────────────────────

  get src(): string {
    return this.getAttribute("src") ?? "";
  }
  set src(v: string) {
    if (v) this.setAttribute("src", v);
    else this.removeAttribute("src");
  }

  get alt(): string {
    return this.getAttribute("alt") ?? "";
  }
  set alt(v: string) {
    this.setAttribute("alt", v);
  }

  get ratio(): ImageRatio | "" {
    return (this.getAttribute("ratio") as ImageRatio) ?? "";
  }
  set ratio(v: ImageRatio | "") {
    if (v) this.setAttribute("ratio", v);
    else this.removeAttribute("ratio");
  }

  get fit(): ImageFit {
    return (this.getAttribute("fit") as ImageFit) ?? "cover";
  }
  set fit(v: ImageFit) {
    this.setAttribute("fit", v);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  attributeChangedCallback(name: string, _old: string | null, _new: string | null): void {
    switch (name) {
      case "src":
        this._syncSrc();
        break;
      case "alt":
        this._img.alt = this.alt;
        break;
      case "ratio":
        this._syncRatio();
        break;
      case "fit":
        this._syncFit();
        break;
    }
  }

  // ── Sync helpers ─────────────────────────────────────────────────────────

  private _syncSrc(): void {
    const src = this.src;
    if (src) {
      this._img.src = src;
      this._img.style.display = "";
    } else {
      this._img.removeAttribute("src");
      this._img.style.display = "none";
    }
  }

  private _syncRatio(): void {
    const ratio = this.ratio;
    const padding = ratio ? RATIO_MAP[ratio] : undefined;
    if (padding) {
      this._container.classList.add("has-ratio");
      this._container.style.paddingBottom = padding;
    } else {
      this._container.classList.remove("has-ratio");
      this._container.style.paddingBottom = "";
    }
  }

  private _syncFit(): void {
    const fit = this.fit;
    this._container.style.setProperty("--ui-image-fit", fit);
  }
}

customElements.define("ui-image", UiImage);
