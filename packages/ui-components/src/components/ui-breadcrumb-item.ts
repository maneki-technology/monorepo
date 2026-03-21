
import {
  FONT_PRIMARY,
  ICON_PRIMARY,
  SP_0_25,
  SP_0_5,
  TEXT_LINK,
  TEXT_LINK_ACTIVE,
  TEXT_LINK_HOVER,
  TEXT_PRIMARY,
  TEXT_TERTIARY,
  TEXT_VISITED,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
} from "@maneki/foundation";
import "./ui-icon.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type BreadcrumbSize = "s" | "m" | "l";
// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
    align-items: center;
    font-family: ${FONT_PRIMARY};
  }

  .base {
    display: inline-flex;
    align-items: center;
  }

  /* ── Link ──────────────────────────────────────────────────────────────── */

  .link {
    color: var(--ui-bc-link-color, ${TEXT_LINK});
    text-decoration: none;
    cursor: pointer;
    font-family: inherit;
    font-weight: 400;
  }

  .link:hover {
    color: var(--ui-bc-link-hover, ${TEXT_LINK_HOVER});
  }

  .link:active {
    color: var(--ui-bc-link-active, ${TEXT_LINK_ACTIVE});
  }

  .link:focus-visible {
    color: var(--ui-bc-link-focus, ${TEXT_LINK});
    text-decoration: underline;
    outline: none;
  }

  .link:visited {
    color: var(--ui-bc-link-visited, ${TEXT_VISITED});
  }

  /* ── Disabled ──────────────────────────────────────────────────────────── */

  :host([disabled]) .link {
    color: var(--ui-bc-link-disabled, ${TEXT_TERTIARY});
    pointer-events: none;
    cursor: default;
  }

  /* ── Current (no href) ─────────────────────────────────────────────────── */

  .link.current {
    color: var(--ui-bc-current-color, ${TEXT_PRIMARY});
    cursor: default;
  }

  /* ── Separator ─────────────────────────────────────────────────────────── */

  .separator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-bc-separator-color, ${ICON_PRIMARY});
    line-height: 0;
  }

  .separator.hidden {
    display: none;
  }

  /* ── Size: m (default) ─────────────────────────────────────────────────── */

  :host .link,
  :host([size="m"]) .link {
    ${TYPE_BODY_02}
    padding-left: ${SP_0_25};
    padding-right: ${SP_0_25};
  }

  :host .separator,
  :host([size="m"]) .separator {
    width: 16px;
    height: 16px;
    --ui-icon-size: 16px;
  }

  :host .base,
  :host([size="m"]) .base {
    gap: ${SP_0_5};
  }

  /* ── Size: s ────────────────────────────────────────────────────────────── */

  :host([size="s"]) .link {
    ${TYPE_BODY_03}
    padding-left: ${SP_0_25};
    padding-right: ${SP_0_25};
  }

  :host([size="s"]) .separator {
    width: 16px;
    height: 16px;
    --ui-icon-size: 16px;
  }

  :host([size="s"]) .base {
    gap: ${SP_0_25};
  }

  /* ── Size: l ────────────────────────────────────────────────────────────── */

  :host([size="l"]) .link {
    ${TYPE_BODY_01}
    padding-left: ${SP_0_25};
    padding-right: ${SP_0_25};
  }

  :host([size="l"]) .separator {
    width: 18px;
    height: 18px;
    --ui-icon-size: 18px;
  }

  :host([size="l"]) .base {
    gap: 4px;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiBreadcrumbItem extends HTMLElement {
  static readonly observedAttributes = ["size", "href", "disabled"];

  private _base: HTMLSpanElement;
  private _linkEl: HTMLAnchorElement | HTMLSpanElement;
  private _separator: HTMLSpanElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    // role="listitem" only when inside a breadcrumb-group (role="list" parent)
    shadow.adoptedStyleSheets = [sheet];

    // .base
    this._base = document.createElement("span");
    this._base.className = "base";

    // Initial link element (default: span for current page)
    this._linkEl = document.createElement("span");
    this._linkEl.className = "link current";
    const slot = document.createElement("slot");
    this._linkEl.appendChild(slot);
    this._base.appendChild(this._linkEl);

    // Separator
    this._separator = document.createElement("span");
    this._separator.className = "separator hidden";
    this._separator.setAttribute("aria-hidden", "true");
    const sepIcon = document.createElement("ui-icon") as HTMLElement;
    sepIcon.setAttribute("name", "chevron_right");
    this._separator.appendChild(sepIcon);
    this._base.appendChild(this._separator);

    shadow.appendChild(this._base);
  }

  connectedCallback(): void {
    this._syncLink();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (name === "href") {
      this._syncLink();
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): BreadcrumbSize {
    return (this.getAttribute("size") as BreadcrumbSize) ?? "m";
  }

  set size(value: BreadcrumbSize) {
    this.setAttribute("size", value);
  }

  get href(): string | null {
    return this.getAttribute("href");
  }

  set href(value: string | null) {
    if (value) {
      this.setAttribute("href", value);
    } else {
      this.removeAttribute("href");
    }
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncLink(): void {
    const hrefValue = this.getAttribute("href");
    const hasHref = hrefValue !== null;

    // Swap between <a> and <span> based on href presence
    const needsAnchor = hasHref;
    const isCurrentlyAnchor = this._linkEl.tagName === "A";

    if (needsAnchor !== isCurrentlyAnchor) {
      const newEl = needsAnchor
        ? document.createElement("a")
        : document.createElement("span");

      newEl.className = needsAnchor ? "link" : "link current";
      if (needsAnchor) {
        (newEl as HTMLAnchorElement).setAttribute("href", hrefValue!);
        newEl.setAttribute("part", "link");
      }

      // Move slot to new element
      const slot = this._linkEl.querySelector("slot");
      if (slot) {
        newEl.appendChild(slot);
      }

      this._base.replaceChild(newEl, this._linkEl);
      this._linkEl = newEl;
    } else if (needsAnchor) {
      // Just update href value
      (this._linkEl as HTMLAnchorElement).setAttribute("href", hrefValue!);
    }

    // Toggle separator visibility
    if (hasHref) {
      this._separator.classList.remove("hidden");
    } else {
      this._separator.classList.add("hidden");
    }

    // Toggle aria-current
    if (hasHref) {
      this.removeAttribute("aria-current");
    } else {
      this.setAttribute("aria-current", "page");
    }
  }
}

customElements.define("ui-breadcrumb-item", UiBreadcrumbItem);
