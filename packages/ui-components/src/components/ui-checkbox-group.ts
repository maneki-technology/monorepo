import { spaceVar } from "@maneki/foundation";
import type { CheckboxSize } from "./ui-checkbox-item.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type CheckboxGroupSize = CheckboxSize;
export type CheckboxGroupOrientation = "vertical" | "horizontal";

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
    gap: var(--ui-cbg-gap, ${SP_1_5});
  }

  :host([size="s"]) .group {
    gap: var(--ui-cbg-gap, ${SP_1});
  }

  :host([size="l"]) .group {
    gap: var(--ui-cbg-gap, ${SP_2_5});
  }

  /* ── Gaps: horizontal override (same for all sizes) ────────────────────── */

  :host([orientation="horizontal"]) .group {
    gap: var(--ui-cbg-gap, ${SP_3});
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const PROPAGATED_ATTRS = ["size"] as const;

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiCheckboxGroup extends HTMLElement {
  static readonly observedAttributes = ["size", "orientation", "aria-labelledby"];

  private _group!: HTMLElement;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    const group = document.createElement("div");
    group.className = "group";
    group.setAttribute("role", "group");
    group.setAttribute("part", "group");

    const slot = document.createElement("slot");
    group.appendChild(slot);

    shadow.appendChild(group);
    this._group = group;

    // Listen for slotchange to propagate attributes to new children
    slot.addEventListener("slotchange", () => this._propagateAttributes());
  }

  connectedCallback(): void {
    this._propagateAttributes();
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

  get size(): CheckboxGroupSize {
    return (this.getAttribute("size") as CheckboxGroupSize) ?? "m";
  }

  set size(value: CheckboxGroupSize) {
    this.setAttribute("size", value);
  }

  get orientation(): CheckboxGroupOrientation {
    return (this.getAttribute("orientation") as CheckboxGroupOrientation) ?? "vertical";
  }

  set orientation(value: CheckboxGroupOrientation) {
    this.setAttribute("orientation", value);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _getChildItems(): Element[] {
    const slot = this.shadowRoot!.querySelector("slot")!;
    return slot
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === "UI-CHECKBOX-ITEM");
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
}

customElements.define("ui-checkbox-group", UiCheckboxGroup);
