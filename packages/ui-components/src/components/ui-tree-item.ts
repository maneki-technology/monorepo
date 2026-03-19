import { TREE_ITEM_STYLES } from "./ui-tree-item.styles.js";
import { ICON_CHEVRON_RIGHT, ICON_EXPAND_MORE, ICON_CODEPOINTS } from "@maneki/foundation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type { TreeItemSize, TreeItemLevel, TreeItemArrow, TreeItemState } from "./ui-tree-item.styles.js";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(TREE_ITEM_STYLES);

export class UiTreeItem extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "level",
    "arrow",
    "selected",
    "label",
    "secondary-label",
    "leading-icon",
    "icon-name",
    "checkbox",
  ];

  #chevron!: HTMLElement;
  #chevronIcon!: HTMLElement;
  #leadingIcon!: HTMLElement;
  #leadingIconEl!: HTMLElement;
  #checkboxSlot!: HTMLElement;
  #label!: HTMLElement;
  #secondaryLabel!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const base = document.createElement("div");
    base.className = "base";

    // Chevron
    this.#chevron = document.createElement("span");
    this.#chevron.className = "chevron";
    this.#chevronIcon = document.createElement("span");
    this.#chevronIcon.className = "material-symbols-outlined";
    this.#chevronIcon.textContent = ICON_CHEVRON_RIGHT;
    this.#chevron.appendChild(this.#chevronIcon);

    // Content
    const content = document.createElement("div");
    content.className = "content";

    // Leading icon
    this.#leadingIcon = document.createElement("span");
    this.#leadingIcon.className = "leading-icon";
    this.#leadingIconEl = document.createElement("span");
    this.#leadingIconEl.className = "material-symbols-outlined";
    this.#leadingIcon.appendChild(this.#leadingIconEl);

    // Checkbox slot
    this.#checkboxSlot = document.createElement("span");
    this.#checkboxSlot.className = "checkbox-slot";
    const cbSlot = document.createElement("slot");
    cbSlot.name = "checkbox";
    this.#checkboxSlot.appendChild(cbSlot);

    // Label
    this.#label = document.createElement("span");
    this.#label.className = "label";

    // Secondary label
    this.#secondaryLabel = document.createElement("span");
    this.#secondaryLabel.className = "secondary-label";

    content.append(this.#leadingIcon, this.#checkboxSlot, this.#label, this.#secondaryLabel);
    base.append(this.#chevron, content);
    shadow.appendChild(base);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) this.setAttribute("size", "m");
    if (!this.hasAttribute("level")) this.setAttribute("level", "parent");
    if (!this.hasAttribute("arrow")) this.setAttribute("arrow", "none");
    this.setAttribute("role", "treeitem");
    this.setAttribute("tabindex", "0");
    this._syncAll();

    this.addEventListener("click", (e) => {
      // Don't toggle if click originated from checkbox slot
      const path = e.composedPath();
      const fromCheckbox = path.some((el) =>
        (el as Element).classList?.contains("checkbox-slot") ||
        (el as Element).tagName === "UI-CHECKBOX-ITEM"
      );
      if (fromCheckbox) return;

      const arrow = this.getAttribute("arrow");
      if (arrow === "open" || arrow === "closed") {
        const next = arrow === "open" ? "closed" : "open";
        this.setAttribute("arrow", next);
        this.dispatchEvent(
          new CustomEvent("tree-toggle", {
            detail: { expanded: next === "open" },
            bubbles: true,
            composed: true,
          }),
        );
      }
      this.dispatchEvent(
        new CustomEvent("tree-select", {
          detail: { label: this.label },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.click();
      }
    });
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this._syncAll();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): string {
    return this.getAttribute("size") ?? "m";
  }
  set size(v: string) {
    this.setAttribute("size", v);
  }

  get level(): string {
    return this.getAttribute("level") ?? "parent";
  }
  set level(v: string) {
    this.setAttribute("level", v);
  }

  get arrow(): string {
    return this.getAttribute("arrow") ?? "none";
  }
  set arrow(v: string) {
    this.setAttribute("arrow", v);
  }

  get selected(): boolean {
    return this.hasAttribute("selected");
  }
  set selected(v: boolean) {
    if (v) this.setAttribute("selected", "");
    else this.removeAttribute("selected");
  }

  get label(): string {
    return this.getAttribute("label") ?? "";
  }
  set label(v: string) {
    this.setAttribute("label", v);
  }

  get secondaryLabelText(): string {
    return this.getAttribute("secondary-label") ?? "";
  }
  set secondaryLabelText(v: string) {
    this.setAttribute("secondary-label", v);
  }

  get iconName(): string {
    return this.getAttribute("icon-name") ?? "";
  }
  set iconName(v: string) {
    this.setAttribute("icon-name", v);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncAll(): void {
    // Label
    this.#label.textContent = this.getAttribute("label") ?? "";

    // Secondary label
    this.#secondaryLabel.textContent = this.getAttribute("secondary-label") ?? "";

    // Chevron icon — always expand_more, CSS rotation handles closed state
    this.#chevronIcon.textContent = ICON_EXPAND_MORE;

    // Leading icon
    const iconName = this.getAttribute("icon-name");
    if (iconName) {
      this.#leadingIconEl.textContent = ICON_CODEPOINTS[iconName] ?? iconName;
    }

    // ARIA
    if (this.getAttribute("arrow") === "open") {
      this.setAttribute("aria-expanded", "true");
    } else if (this.getAttribute("arrow") === "closed") {
      this.setAttribute("aria-expanded", "false");
    } else {
      this.removeAttribute("aria-expanded");
    }
  }
}

customElements.define("ui-tree-item", UiTreeItem);
