import type { Photo } from "./photo-types.js";

const styles = new CSSStyleSheet();
styles.replaceSync(/*css*/ `
  :host {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
  }

  :host([open]) {
    display: block;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.92);
  }

  .container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 90vw;
    max-height: 85vh;
  }

  .image-wrapper img {
    max-width: 90vw;
    max-height: 85vh;
    object-fit: contain;
    opacity: 1;
    transition: opacity 0.2s ease;
    border-radius: var(--fd-radius-sm, 4px);
  }

  .image-wrapper img.fade {
    opacity: 0;
  }

  .counter {
    position: absolute;
    top: var(--fd-space-4, 16px);
    left: var(--fd-space-4, 16px);
    color: #fff;
    font-size: 14px;
    font-family: var(--fd-font-family, sans-serif);
    user-select: none;
    z-index: 2;
  }

  .info-btn {
    position: absolute;
    top: var(--fd-space-3, 12px);
    right: 80px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-family: serif;
    font-style: italic;
    font-weight: 600;
    z-index: 4;
    opacity: 0.7;
    transition: opacity 0.15s ease, background 0.15s ease;
  }

  .info-btn:hover, .info-btn.active { opacity: 1; background: rgba(255, 255, 255, 0.2); }

  .close-btn {
    position: absolute;
    top: var(--fd-space-3, 12px);
    right: var(--fd-space-4, 16px);
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    z-index: 4;
    opacity: 0.7;
    transition: opacity 0.15s ease, background 0.15s ease;
  }

  .close-btn:hover { opacity: 1; background: rgba(255, 255, 255, 0.2); }

  .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    opacity: 0.7;
    transition: opacity 0.15s ease, background 0.15s ease;
    padding: 0;
  }

  .nav-btn svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .nav-btn:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
  }

  .nav-prev {
    left: var(--fd-space-4, 16px);
  }

  .nav-next {
    right: var(--fd-space-4, 16px);
  }

  .exif-panel {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 300px;
    background: rgba(0, 0, 0, 0.85);
    color: #fff;
    padding: var(--fd-space-6, 24px);
    font-family: var(--fd-font-family, sans-serif);
    transform: translateX(100%);
    transition: transform 0.25s ease;
    z-index: 3;
    overflow-y: auto;
    box-sizing: border-box;
  }

  .exif-panel.open {
    transform: translateX(0);
  }

  .exif-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 var(--fd-space-2, 8px) 0;
    color: #fff;
  }

  .exif-caption {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 var(--fd-space-5, 20px) 0;
    line-height: 1.5;
  }

  .exif-row {
    display: flex;
    justify-content: space-between;
    padding: var(--fd-space-2, 8px) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 13px;
  }

  .exif-label {
    color: rgba(255, 255, 255, 0.5);
  }

  .exif-value {
    color: #fff;
    text-align: right;
  }
`);

class PhotoLightbox extends HTMLElement {
  private _photos: Photo[] = [];
  private _index = 0;
  private _exifOpen = false;
  private _img!: HTMLImageElement;
  private _counter!: HTMLElement;
  private _exifPanel!: HTMLElement;
  private _pointerStartX = 0;
  private _pointerActive = false;
  private _prevOverflow = "";

  private _boundKeyHandler = this._onKeyDown.bind(this);
  private _boundPointerDown = this._onPointerDown.bind(this);
  private _boundPointerMove = this._onPointerMove.bind(this);
  private _boundPointerUp = this._onPointerUp.bind(this);

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [styles];

    shadow.innerHTML = `
      <div class="backdrop"></div>
      <div class="container">
        <span class="counter"></span>
        <button class="info-btn" aria-label="Toggle photo info">i</button>
        <button class="close-btn" aria-label="Close lightbox">&times;</button>
        <button class="nav-btn nav-prev" aria-label="Previous photo"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div class="image-wrapper">
          <img alt="" />
        </div>
        <button class="nav-btn nav-next" aria-label="Next photo"><svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg></button>
        <div class="exif-panel"></div>
      </div>
    `;

    this._img = shadow.querySelector("img")!;
    this._counter = shadow.querySelector(".counter")!;
    this._exifPanel = shadow.querySelector(".exif-panel")!;

    shadow.querySelector(".backdrop")!.addEventListener("click", () => this.close());
    shadow.querySelector(".info-btn")!.addEventListener("click", () => this._toggleExif());
    shadow.querySelector(".close-btn")!.addEventListener("click", () => this.close());
    shadow.querySelector(".nav-prev")!.addEventListener("click", () => this._navigate(-1));
    shadow.querySelector(".nav-next")!.addEventListener("click", () => this._navigate(1));

    const wrapper = shadow.querySelector(".image-wrapper") as HTMLElement;
    wrapper.addEventListener("pointerdown", this._boundPointerDown);
    wrapper.addEventListener("pointermove", this._boundPointerMove);
    wrapper.addEventListener("pointerup", this._boundPointerUp);
    wrapper.addEventListener("pointercancel", this._boundPointerUp);
  }

  open(index: number, photos: Photo[]): void {
    this._photos = photos;
    this._index = index;
    this._exifOpen = false;
    this._exifPanel.classList.remove("open");
    this.setAttribute("open", "");
    this._prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", this._boundKeyHandler);
    this._show(false);
  }

  close(): void {
    this.removeAttribute("open");
    document.body.style.overflow = this._prevOverflow;
    document.removeEventListener("keydown", this._boundKeyHandler);
    const base = window.location.search.replace(/[?&]photo=\d+/, "");
    history.replaceState(null, "", "/photography" + base);
  }

  private _navigate(dir: number): void {
    const len = this._photos.length;
    this._index = (this._index + dir + len) % len;
    this._show(true);
  }

  private _show(crossfade: boolean): void {
    const photo = this._photos[this._index];
    if (!photo) return;

    this._counter.textContent = `${this._index + 1} / ${this._photos.length}`;
    this._updateExif(photo);

    if (crossfade) {
      this._img.classList.add("fade");
      setTimeout(() => {
        this._img.src = photo.url;
        this._img.alt = photo.title || "";
        this._img.onload = () => this._img.classList.remove("fade");
      }, 200);
    } else {
      this._img.src = photo.url;
      this._img.alt = photo.title || "";
    }

    history.replaceState(null, "", `/photography?photo=${photo.id}`);
    this._preloadAdjacent();
  }

  private _preloadAdjacent(): void {
    const len = this._photos.length;
    for (const offset of [-1, 1]) {
      const adj = this._photos[(this._index + offset + len) % len];
      if (adj) {
        const img = new Image();
        img.src = adj.url;
      }
    }
  }

  private _updateExif(photo: Photo): void {
    const exif = photo.exif || {};
    const rows: [string, unknown][] = [
      ["Camera", exif.Make && exif.Model ? `${exif.Make} ${exif.Model}` : exif.Make || exif.Model],
      ["Lens", exif.LensModel],
      ["Focal Length", exif.FocalLength],
      ["Aperture", exif.FNumber != null ? `ƒ/${exif.FNumber}` : null],
      ["Shutter Speed", exif.ExposureTime],
      ["ISO", exif.ISO],
    ];

    const filtered = rows.filter(([, v]) => v != null && v !== "");

    this._exifPanel.innerHTML = `
      <p class="exif-title">${this._esc(photo.title)}</p>
      ${photo.caption ? `<p class="exif-caption">${this._esc(photo.caption)}</p>` : ""}
      ${filtered.map(([label, value]) => `<div class="exif-row"><span class="exif-label">${label}</span><span class="exif-value">${this._esc(String(value))}</span></div>`).join("")}
    `;
  }

  private _esc(s: string): string {
    const el = document.createElement("span");
    el.textContent = s;
    return el.innerHTML;
  }

  private _onKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case "Escape":
        this.close();
        break;
      case "ArrowLeft":
        this._navigate(-1);
        break;
      case "ArrowRight":
        this._navigate(1);
        break;
      case "i":
        this._toggleExif();
        break;
    }
  }

  private _toggleExif(): void {
    this._exifOpen = !this._exifOpen;
    this._exifPanel.classList.toggle("open", this._exifOpen);
    this.shadowRoot!.querySelector(".info-btn")?.classList.toggle("active", this._exifOpen);
  }

  private _onPointerDown(e: PointerEvent): void {
    this._pointerStartX = e.clientX;
    this._pointerActive = true;
  }

  private _onPointerMove(e: PointerEvent): void {
    if (!this._pointerActive) return;
    e.preventDefault();
  }

  private _onPointerUp(e: PointerEvent): void {
    if (!this._pointerActive) return;
    this._pointerActive = false;
    const dx = e.clientX - this._pointerStartX;
    if (Math.abs(dx) > 50) {
      this._navigate(dx < 0 ? 1 : -1);
    }
  }
}

customElements.define("photo-lightbox", PhotoLightbox);

export { PhotoLightbox };
