import { semanticVar, spaceVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type LinkSize = "s" | "m" | "l";
export type LinkEmphasis = "bold" | "subtle";

// ─── Token constants ─────────────────────────────────────────────────────────

const TEXT_LINK = semanticVar("text", "link");
const TEXT_LINK_HOVER = semanticVar("text", "linkHover");
const TEXT_LINK_ACTIVE = semanticVar("text", "linkActive");
const TEXT_VISITED = semanticVar("text", "visited");
const ICON_ACTION = semanticVar("icon", "action");
const SP_025 = spaceVar("0.25");
const SP_05 = spaceVar("0.5");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  @font-face {
    font-family: "Material Symbols Outlined";
    font-style: normal;
    src: local("Material Symbols Outlined");
  }

  .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: inherit;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
    align-items: center;
    font-family: "Inter", sans-serif;
  }

  /* ── Link element ─────────────────────────────────────────────────────────── */

  .link {
    display: inline-flex;
    align-items: center;
    gap: var(--_gap);
    color: var(--ui-link-color, ${TEXT_LINK});
    text-decoration: none;
    cursor: pointer;
    font-family: inherit;
    font-weight: 400;
    font-size: var(--_font-size);
    line-height: var(--_line-height);
    border: none;
    background: none;
    padding: 0;
    margin: 0;
  }

  a.link {
    text-decoration: none;
  }

  .link:hover {
    color: var(--ui-link-hover-color, ${TEXT_LINK_HOVER});
  }

  .link:active {
    color: var(--ui-link-active-color, ${TEXT_LINK_ACTIVE});
  }

  .link:focus-visible {
    color: var(--ui-link-color, ${TEXT_LINK});
    text-decoration: underline;
    outline: none;
  }

  a.link:visited {
    color: var(--ui-link-visited-color, ${TEXT_VISITED});
  }

  /* ── Disabled ──────────────────────────────────────────────────────────────── */

  :host([disabled]) .link {
    opacity: 0.4;
    cursor: default;
    pointer-events: none;
  }
  /* ── Emphasis ─────────────────────────────────────────────────────────────── */

  :host([emphasis="bold"]) .text-content {
    text-decoration: underline;
    text-decoration-skip-ink: none;
  }

  /* ── Icon slots ───────────────────────────────────────────────────────────── */

  .leading-icon,
  .trailing-icon {
    display: none;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: inherit;
    font-size: var(--_icon-size);
    line-height: 1;
  }

  .leading-icon.has-content,
  .trailing-icon.has-content {
    display: flex;
  }

  .leading-icon ::slotted(*),
  .trailing-icon ::slotted(*) {
    display: flex;
    align-items: center;
    font-size: var(--_icon-size) !important;
    line-height: 1;
  }

  /* ── Size: m (default) ───────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    --_font-size: 14px;
    --_line-height: 20px;
    --_gap: ${SP_05};
    --_icon-size: 16px;
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) {
    --_font-size: 12px;
    --_line-height: 16px;
    --_gap: ${SP_025};
    --_icon-size: 12px;
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    --_font-size: 16px;
    --_line-height: 24px;
    --_gap: ${SP_05};
    --_icon-size: 20px;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const OBSERVED = [
  "size",
  "emphasis",
  "href",
  "target",
  "rel",
  "disabled",
] as const;

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

class UiLink extends HTMLElement {
  static observedAttributes = [...OBSERVED];

  private _linkEl: HTMLAnchorElement | HTMLSpanElement;
  private _textSlot: HTMLSlotElement;
  private _leadingIconWrapper: HTMLSpanElement;
  private _trailingIconWrapper: HTMLSpanElement;
  private _leadingSlot: HTMLSlotElement;
  private _trailingSlot: HTMLSlotElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    // Start with <span> — will swap to <a> when href is set
    this._linkEl = document.createElement("span");
    this._linkEl.className = "link";
    this._linkEl.setAttribute("part", "link");

    // Leading icon
    this._leadingIconWrapper = document.createElement("span");
    this._leadingIconWrapper.className = "leading-icon";
    this._leadingSlot = document.createElement("slot");
    this._leadingSlot.name = "leading";
    this._leadingIconWrapper.appendChild(this._leadingSlot);
    this._linkEl.appendChild(this._leadingIconWrapper);

    // Text slot wrapped in span for underline isolation
    const textWrapper = document.createElement("span");
    textWrapper.className = "text-content";
    this._textSlot = document.createElement("slot");
    textWrapper.appendChild(this._textSlot);
    this._linkEl.appendChild(textWrapper);

    // Trailing icon
    this._trailingIconWrapper = document.createElement("span");
    this._trailingIconWrapper.className = "trailing-icon";
    this._trailingSlot = document.createElement("slot");
    this._trailingSlot.name = "trailing";
    this._trailingIconWrapper.appendChild(this._trailingSlot);
    this._linkEl.appendChild(this._trailingIconWrapper);

    shadow.appendChild(this._linkEl);

    // Listen for slot changes to toggle icon visibility
    this._leadingSlot.addEventListener("slotchange", () => {
      const hasContent = this._leadingSlot.assignedNodes().length > 0;
      this._leadingIconWrapper.classList.toggle("has-content", hasContent);
    });

    this._trailingSlot.addEventListener("slotchange", () => {
      const hasContent = this._trailingSlot.assignedNodes().length > 0;
      this._trailingIconWrapper.classList.toggle("has-content", hasContent);
    });
  }

  // ── Attribute accessors ──────────────────────────────────────────────────

  get size(): LinkSize {
    return (this.getAttribute("size") as LinkSize) ?? "m";
  }
  set size(v: LinkSize) {
    this.setAttribute("size", v);
  }

  get emphasis(): LinkEmphasis {
    return (this.getAttribute("emphasis") as LinkEmphasis) ?? "subtle";
  }
  set emphasis(v: LinkEmphasis) {
    this.setAttribute("emphasis", v);
  }

  get href(): string {
    return this.getAttribute("href") ?? "";
  }
  set href(v: string) {
    if (v) {
      this.setAttribute("href", v);
    } else {
      this.removeAttribute("href");
    }
  }

  get target(): string {
    return this.getAttribute("target") ?? "";
  }
  set target(v: string) {
    if (v) {
      this.setAttribute("target", v);
    } else {
      this.removeAttribute("target");
    }
  }

  get rel(): string {
    return this.getAttribute("rel") ?? "";
  }
  set rel(v: string) {
    if (v) {
      this.setAttribute("rel", v);
    } else {
      this.removeAttribute("rel");
    }
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(v: boolean) {
    if (v) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback(): void {
    this._syncLink();
    this._syncDisabled();
    this.addEventListener("keydown", this._handleKeydown);
  }
  disconnectedCallback(): void {
    this.removeEventListener("keydown", this._handleKeydown);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    switch (name) {
      case "href":
      case "target":
      case "rel":
        this._syncLink();
        break;
      case "disabled":
        this._syncDisabled();
        break;
    }
  }

  // ── Private sync methods ─────────────────────────────────────────────────

  private _syncLink(): void {
    const href = this.href;
    const needsAnchor = !!href;
    const isAnchor = this._linkEl.tagName === "A";

    if (needsAnchor && !isAnchor) {
      // Swap span → a
      const anchor = document.createElement("a");
      anchor.className = "link";
      anchor.setAttribute("part", "link");
      anchor.href = href;
      if (this.target) anchor.target = this.target;
      if (this.rel) anchor.rel = this.rel;

      // Move children
      while (this._linkEl.firstChild) {
        anchor.appendChild(this._linkEl.firstChild);
      }
      this.shadowRoot!.replaceChild(anchor, this._linkEl);
      this._linkEl = anchor;
      anchor.removeAttribute("tabindex");
    } else if (!needsAnchor && isAnchor) {
      // Swap a → span
      const span = document.createElement("span");
      span.className = "link";
      span.setAttribute("part", "link");

      while (this._linkEl.firstChild) {
        span.appendChild(this._linkEl.firstChild);
      }
      this.shadowRoot!.replaceChild(span, this._linkEl);
      this._linkEl = span;
      if (!this.disabled) span.setAttribute("tabindex", "0");
    } else if (needsAnchor && isAnchor) {
      // Update existing anchor
      (this._linkEl as HTMLAnchorElement).href = href;
      if (this.target) {
        (this._linkEl as HTMLAnchorElement).target = this.target;
      } else {
        this._linkEl.removeAttribute("target");
      }
      if (this.rel) {
        (this._linkEl as HTMLAnchorElement).rel = this.rel;
      } else {
        this._linkEl.removeAttribute("rel");
      }
    }
  }
  /** When rendered as <span> (no href), make it keyboard-activatable with Enter. */
  private _handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Enter" && this._linkEl.tagName === "SPAN" && !this.disabled) {
      this.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    }
  };
  private _syncDisabled(): void {
    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
      this._linkEl.removeAttribute("tabindex");
      this._linkEl.style.pointerEvents = "none";
    } else {
      this.removeAttribute("aria-disabled");
      this._linkEl.style.pointerEvents = "";
      // Ensure span mode is focusable
      if (this._linkEl.tagName === "SPAN") {
        this._linkEl.setAttribute("tabindex", "0");
      }
    }
  }
}

customElements.define("ui-link", UiLink);

export { UiLink };
