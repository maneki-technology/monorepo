import { semanticVar } from "@maneki/foundation";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_TERTIARY = semanticVar("surface", "tertiary");

// ─── Types ───────────────────────────────────────────────────────────────────

export type SkeletonVariant = "text" | "circle" | "rect";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  :host {
    display: block;
  }

  .bone {
    background: ${SURFACE_TERTIARY};
    animation: pulse 1.5s ease-in-out infinite;
  }

  /* ── Text variant (default) ──────────────────────────────────────────────── */

  :host,
  :host([variant="text"]) {
    --_skeleton-h: 12px;
    --_skeleton-r: 2px;
  }

  :host .bone,
  :host([variant="text"]) .bone {
    width: var(--ui-skeleton-width, 100%);
    height: var(--ui-skeleton-height, var(--_skeleton-h));
    border-radius: var(--ui-skeleton-radius, var(--_skeleton-r));
  }

  /* ── Circle variant ──────────────────────────────────────────────────────── */

  :host([variant="circle"]) {
    display: inline-block;
  }

  :host([variant="circle"]) .bone {
    width: var(--ui-skeleton-width, 48px);
    height: var(--ui-skeleton-height, 48px);
    border-radius: 999px;
  }

  /* ── Rect variant ────────────────────────────────────────────────────────── */

  :host([variant="rect"]) {
    width: 100%;
  }

  :host([variant="rect"]) .bone {
    width: var(--ui-skeleton-width, 100%);
    height: var(--ui-skeleton-height, 192px);
    border-radius: var(--ui-skeleton-radius, 2px);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9FB1BD;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .bone {
      animation: none;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiSkeleton extends HTMLElement {
  static readonly observedAttributes = ["variant", "width", "height"];

  #bone!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    this.#bone = document.createElement("div");
    this.#bone.className = "bone";
    this.#bone.setAttribute("aria-hidden", "true");
    const slot = document.createElement("slot");
    this.#bone.appendChild(slot);
    shadow.appendChild(this.#bone);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) this.setAttribute("role", "status");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "Loading");
    this._syncDimensions();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this._syncDimensions();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get variant(): SkeletonVariant {
    return (this.getAttribute("variant") as SkeletonVariant) ?? "text";
  }
  set variant(v: SkeletonVariant) {
    this.setAttribute("variant", v);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncDimensions(): void {
    const w = this.getAttribute("width");
    const h = this.getAttribute("height");
    if (w) this.#bone.style.setProperty("--ui-skeleton-width", w.includes("%") || w.includes("px") ? w : `${w}px`);
    else this.#bone.style.removeProperty("--ui-skeleton-width");
    if (h) this.#bone.style.setProperty("--ui-skeleton-height", h.includes("%") || h.includes("px") ? h : `${h}px`);
    else this.#bone.style.removeProperty("--ui-skeleton-height");
  }
}

customElements.define("ui-skeleton", UiSkeleton);
