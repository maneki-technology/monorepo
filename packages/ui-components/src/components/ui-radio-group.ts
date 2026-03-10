import { spaceVar } from "@maneki/foundation";
import type { RadioSize } from "./ui-radio-item.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type RadioGroupSize = RadioSize;
export type RadioGroupOrientation = "vertical" | "horizontal";

// ─── Token constants ─────────────────────────────────────────────────────────

const SP_1 = spaceVar("1");     // 8px
const SP_1_5 = spaceVar("1.5"); // 12px
const SP_2_5 = spaceVar("2.5"); // 20px
const SP_3 = spaceVar("3");     // 24px

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: flex;
  }

  /* ── Vertical (default) ──────────────────────────────────────────────────── */

  :host .group,
  :host([orientation="vertical"]) .group {
    display: flex;
    flex-direction: column;
  }

  /* ── Horizontal ──────────────────────────────────────────────────────────── */

  :host([orientation="horizontal"]) .group {
    display: flex;
    flex-direction: row;
  }

  /* ── Gaps: vertical by size ──────────────────────────────────────────────── */

  :host .group,
  :host([size="m"]) .group {
    gap: var(--ui-rg-gap, ${SP_1_5});
  }

  :host([size="s"]) .group {
    gap: var(--ui-rg-gap, ${SP_1});
  }

  :host([size="l"]) .group {
    gap: var(--ui-rg-gap, ${SP_2_5});
  }

  /* ── Gaps: horizontal override (same for all sizes) ────────────────────── */

  :host([orientation="horizontal"]) .group {
    gap: var(--ui-rg-gap, ${SP_3});
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const PROPAGATED_ATTRS = ["size"] as const;

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiRadioGroup extends HTMLElement {
  static readonly observedAttributes = ["size", "orientation", "aria-labelledby"];

  private _group!: HTMLElement;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    const group = document.createElement("div");
    group.className = "group";
    group.setAttribute("role", "radiogroup");
    group.setAttribute("part", "group");

    const slot = document.createElement("slot");
    group.appendChild(slot);

    shadow.appendChild(group);
    this._group = group;

    // Listen for slotchange to propagate attributes to new children
    slot.addEventListener("slotchange", () => {
      this._propagateAttributes();
      this._syncTabindex();
    });

    // Listen for change events from radio items for mutual exclusion
    this.addEventListener("change", this._handleChange.bind(this));
  }

  connectedCallback(): void {
    this._propagateAttributes();
    this._syncTabindex();
    this.addEventListener("keydown", this._handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener("keydown", this._handleKeydown);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    if (name === "aria-labelledby" && this._group) {
      if (newValue) {
        this._group.setAttribute("aria-labelledby", newValue);
      } else {
        this._group.removeAttribute("aria-labelledby");
      }
    }
    this._propagateAttributes();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): RadioGroupSize {
    return (this.getAttribute("size") as RadioGroupSize) ?? "m";
  }

  set size(value: RadioGroupSize) {
    this.setAttribute("size", value);
  }

  get orientation(): RadioGroupOrientation {
    return (this.getAttribute("orientation") as RadioGroupOrientation) ?? "vertical";
  }

  set orientation(value: RadioGroupOrientation) {
    this.setAttribute("orientation", value);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _getChildItems(): Element[] {
    const slot = this.shadowRoot!.querySelector("slot")!;
    return slot
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === "UI-RADIO-ITEM");
  }

  private _propagateAttributes(): void {
    const items = this._getChildItems();
    for (const attr of PROPAGATED_ATTRS) {
      const value = this.getAttribute(attr);
      for (const item of items) {
        if (value) {
          item.setAttribute(attr, value);
        } else {
          item.removeAttribute(attr);
        }
      }
    }
  }

  /** Enforce single selection: uncheck siblings when one is checked. */
  private _handleChange(e: Event): void {
    const target = e.target as HTMLElement;
    if (target.tagName !== "UI-RADIO-ITEM") return;
    const items = this._getChildItems();
    for (const item of items) {
      if (item !== target && item.hasAttribute("checked")) {
        item.removeAttribute("checked");
      }
    }
    this._syncTabindex();
  }

  /** WAI-ARIA roving tabindex: only the checked (or first) item is tabbable. */
  private _syncTabindex(): void {
    const items = this._getChildItems();
    if (items.length === 0) return;
    const checked = items.find((el) => el.hasAttribute("checked"));
    const focusable = checked ?? items[0];
    for (const item of items) {
      item.setAttribute("tabindex", item === focusable ? "0" : "-1");
    }
  }

  /** WAI-ARIA: Arrow keys move focus + selection between radio items, Home/End jump to first/last. */
  private _handleKeydown = (e: KeyboardEvent): void => {
    const items = this._getChildItems().filter((el) => !el.hasAttribute("disabled"));
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement as Element);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;

    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const next = items[nextIndex] as HTMLElement;
    // Select + focus the target radio
    next.setAttribute("checked", "");
    next.focus();
    next.dispatchEvent(new Event("change", { bubbles: true }));
  };
}

customElements.define("ui-radio-group", UiRadioGroup);
