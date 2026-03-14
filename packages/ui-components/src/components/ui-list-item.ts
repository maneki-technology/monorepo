import { STYLES } from "./ui-list-item.styles.js";
import "./ui-icon.js";
import "./ui-icon.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ListItemSize = "s" | "m" | "l";
export type ListItemPadding = "none" | "s" | "m";
export type ListItemLeading = "none" | "icon" | "avatar" | "radio" | "checkbox";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiListItem extends HTMLElement {
  static readonly observedAttributes = [
    "size", "padding", "leading", "top-border", "trailing-icon",
    "selected", "disabled", "description", "secondary-text",
  ];

  #topBorder!: HTMLElement;
  #content!: HTMLElement;
  #leadingSlot!: HTMLElement;
  #primaryText!: HTMLElement;
  #descriptionEl!: HTMLElement;
  #tick!: HTMLElement;
  #trailingIconEl!: HTMLElement;
  #bottomBorder!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Top border
    this.#topBorder = document.createElement("div");
    this.#topBorder.className = "top-border";

    // Content row
    this.#content = document.createElement("div");
    this.#content.className = "content";

    // Leading element (slot)
    this.#leadingSlot = document.createElement("div");
    this.#leadingSlot.className = "leading";
    const leadingSlotEl = document.createElement("slot");
    leadingSlotEl.name = "leading";
    this.#leadingSlot.appendChild(leadingSlotEl);

    // Text area
    const textArea = document.createElement("div");
    textArea.className = "text-area";

    const topRow = document.createElement("div");
    topRow.className = "top-row";

    this.#primaryText = document.createElement("span");
    this.#primaryText.className = "primary-text";
    const defaultSlot = document.createElement("slot");
    this.#primaryText.appendChild(defaultSlot);

    // Trailing group (tick + trailing icon)
    const trailing = document.createElement("div");
    trailing.className = "trailing";

    this.#tick = document.createElement("div");
    this.#tick.className = "tick";

    this.#trailingIconEl = document.createElement("div");
    this.#trailingIconEl.className = "trailing-icon";
    const trailingSlot = document.createElement("slot");
    trailingSlot.name = "trailing";
    this.#trailingIconEl.appendChild(trailingSlot);

    trailing.append(this.#tick, this.#trailingIconEl);
    topRow.append(this.#primaryText, trailing);

    // Description
    this.#descriptionEl = document.createElement("span");
    this.#descriptionEl.className = "description";

    textArea.append(topRow, this.#descriptionEl);

    this.#content.append(this.#leadingSlot, textArea);

    // Bottom border
    this.#bottomBorder = document.createElement("div");
    this.#bottomBorder.className = "bottom-border";

    shadow.append(this.#topBorder, this.#content, this.#bottomBorder);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) {
      this.setAttribute("size", "m");
    }
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "option");
    }
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }

    // Create tick icon (must be in connectedCallback, not constructor)
    if (!this.#tick.querySelector("ui-icon")) {
      const tickIcon = document.createElement("ui-icon");
      tickIcon.setAttribute("name", "check");
      tickIcon.setAttribute("size", "xs");
      this.#tick.appendChild(tickIcon);
    }

    this.#syncDescription();
    this.addEventListener("click", this.#onClick);
    this.addEventListener("keydown", this.#onKeydown);
    this.addEventListener("mousedown", this.#onMouseDown);
    this.addEventListener("mouseup", this.#onMouseUp);
    this.addEventListener("mouseleave", this.#onMouseUp);
  }

  disconnectedCallback(): void {
    this.removeEventListener("click", this.#onClick);
    this.removeEventListener("keydown", this.#onKeydown);
    this.removeEventListener("mousedown", this.#onMouseDown);
    this.removeEventListener("mouseup", this.#onMouseUp);
    this.removeEventListener("mouseleave", this.#onMouseUp);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (!this.isConnected) return;
    if (name === "description" || name === "secondary-text") {
      this.#syncDescription();
    }
  }

  // ─── Properties ────────────────────────────────────────────────────────

  get size(): ListItemSize {
    return (this.getAttribute("size") as ListItemSize) || "m";
  }

  set size(v: ListItemSize) {
    this.setAttribute("size", v);
  }

  get padding(): ListItemPadding {
    return (this.getAttribute("padding") as ListItemPadding) || "none";
  }

  set padding(v: ListItemPadding) {
    this.setAttribute("padding", v);
  }

  get leading(): ListItemLeading {
    return (this.getAttribute("leading") as ListItemLeading) || "none";
  }

  set leading(v: ListItemLeading) {
    this.setAttribute("leading", v);
  }

  get selected(): boolean {
    return this.hasAttribute("selected");
  }

  set selected(v: boolean) {
    if (v) this.setAttribute("selected", "");
    else this.removeAttribute("selected");
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(v: boolean) {
    if (v) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }

  get value(): string {
    return this.getAttribute("value") || "";
  }

  set value(v: string) {
    this.setAttribute("value", v);
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  #syncDescription(): void {
    const desc = this.getAttribute("description") || this.getAttribute("secondary-text") || "";
    this.#descriptionEl.textContent = desc;
  }

  #onClick = (): void => {
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent("item-select", {
        detail: { value: this.value },
        bubbles: true,
      }),
    );
  };

  #onKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.#onClick();
    }
  };
  #onMouseDown = (): void => {
    this.#content.setAttribute("data-active", "");
  };

  #onMouseUp = (): void => {
    this.#content.removeAttribute("data-active");
  };
}

customElements.define("ui-list-item", UiListItem);
