import { FIELD_STYLES } from "./ui-queryfield.styles.js";
import { ICON_SEARCH } from "@maneki/foundation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type QueryfieldSize = "s" | "m" | "l";

export interface QueryfieldFilter {
  name: string;
  label: string;
  operators: string[];
  values: string[];
}

export interface QueryfieldFilterAddDetail {
  filter: string;
  label: string;
  operator: string;
  values: string[];
  expression: string;
}

export interface QueryfieldFilterUpdateDetail {
  tag: HTMLElement;
  filter: string;
  label: string;
  operator: string;
  values: string[];
  expression: string;
}

export interface QueryfieldSubmitDetail {
  value: string;
}

export interface QueryfieldInputDetail {
  value: string;
}

type FlowState = "idle" | "selecting-filter" | "selecting-operator" | "selecting-value";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(FIELD_STYLES);

export class UiQueryfield extends HTMLElement {
  static readonly observedAttributes = ["size", "placeholder", "disabled", "value"];

  #input!: HTMLInputElement;
  #tags!: HTMLElement;
  #menu!: HTMLElement;
  #wrapper!: HTMLElement;

  // State machine
  #state: FlowState = "idle";
  #filters: QueryfieldFilter[] = [];
  #selectedFilter: QueryfieldFilter | null = null;
  #selectedOperator: string | null = null;
  #selectedValues: string[] = [];
  #editingTag: HTMLElement | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    this.#wrapper = document.createElement("div");
    this.#wrapper.className = "wrapper";

    // Search icon
    const searchIcon = document.createElement("span");
    searchIcon.className = "search-icon";
    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.textContent = ICON_SEARCH;
    searchIcon.appendChild(icon);

    // Tags container (slot for queryfield-tag elements)
    this.#tags = document.createElement("div");
    this.#tags.className = "tags";
    const tagSlot = document.createElement("slot");
    tagSlot.name = "tags";
    this.#tags.appendChild(tagSlot);

    // Input
    this.#input = document.createElement("input");
    this.#input.className = "input";
    this.#input.type = "text";
    this.#input.placeholder = "Search...";

    // Floating menu
    this.#menu = document.createElement("div");
    this.#menu.className = "menu";

    this.#wrapper.append(searchIcon, this.#tags, this.#input);
    shadow.append(this.#wrapper, this.#menu);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) this.setAttribute("size", "m");

    this.#input.addEventListener("input", () => {
      this.dispatchEvent(
        new CustomEvent("queryfield-input", {
          detail: { value: this.#input.value },
          bubbles: true,
          composed: true,
        }),
      );
      // If we have filters and user is typing, show filter suggestions
      if (this.#filters.length > 0 && this.#state === "idle") {
        this._transitionTo("selecting-filter");
      }
      this._filterMenuItems();
    });

    this.#input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (this.#state === "selecting-value") {
          // Add free-text value if input has text
          const freeText = this.#input.value.trim();
          if (freeText) {
            if (!this.#selectedValues.includes(freeText)) {
              this.#selectedValues.push(freeText);
            }
            this.#input.value = "";
            this._renderValueMenu();
            this._openMenu();
          }
          // Commit if we have values
          if (this.#selectedValues.length > 0) {
            this._commitFilter();
          }
        } else if (this.#state === "idle") {
          this.dispatchEvent(
            new CustomEvent("queryfield-submit", {
              detail: { value: this.#input.value },
              bubbles: true,
              composed: true,
            }),
          );
        }
      } else if (e.key === "Escape") {
        if (this.#state === "selecting-value" && this.#selectedValues.length > 0) {
          this._commitFilter();
        } else {
          this._closeMenu();
        }
      }
    });

    this.#input.addEventListener("focus", () => {
      if (this.#filters.length > 0 && this.#state === "idle") {
        this._transitionTo("selecting-filter");
      }
    });

    // Listen for tag edit events
    this.addEventListener("tag-edit", ((e: CustomEvent) => {
      e.stopPropagation();
      const { tag, filterName, operator, values } = e.detail;
      this._editTag(tag, filterName, operator, values);
    }) as EventListener);

    // Close on outside click
    this._onDocumentClick = this._onDocumentClick.bind(this);
    document.addEventListener("click", this._onDocumentClick);

    // Propagate size to slotted tags
    const slot = this.#tags.querySelector("slot") as HTMLSlotElement;
    slot.addEventListener("slotchange", () => this._propagateSize());
    this._propagateSize();
  }

  disconnectedCallback(): void {
    document.removeEventListener("click", this._onDocumentClick);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    switch (name) {
      case "placeholder":
        this.#input.placeholder = newValue ?? "Search...";
        break;
      case "disabled":
        this.#input.disabled = newValue !== null;
        break;
      case "value":
        this.#input.value = newValue ?? "";
        break;
      case "size":
        this._propagateSize();
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): QueryfieldSize {
    return (this.getAttribute("size") as QueryfieldSize) ?? "m";
  }
  set size(v: QueryfieldSize) {
    this.setAttribute("size", v);
  }

  get placeholder(): string {
    return this.getAttribute("placeholder") ?? "Search...";
  }
  set placeholder(v: string) {
    this.setAttribute("placeholder", v);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(v: boolean) {
    if (v) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }

  get value(): string {
    return this.#input.value;
  }
  set value(v: string) {
    this.#input.value = v;
  }

  get filters(): QueryfieldFilter[] {
    return this.#filters;
  }
  set filters(v: QueryfieldFilter[]) {
    this.#filters = v;
  }

  // ── State machine ───────────────────────────────────────────────────────

  private _transitionTo(state: FlowState): void {
    this.#state = state;

    switch (state) {
      case "idle":
        this._closeMenu();
        this.#selectedFilter = null;
        this.#selectedOperator = null;
        this.#selectedValues = [];
        this.#input.placeholder = this.getAttribute("placeholder") ?? "Search...";
        break;

      case "selecting-filter":
        this.#input.value = "";
        this.#input.placeholder = "Search filters";
        this._renderFilterMenu();
        this._openMenu();
        break;

      case "selecting-operator":
        this.#input.value = "";
        this.#input.placeholder = "Search operators";
        this._renderOperatorMenu();
        this._openMenu();
        break;

      case "selecting-value":
        this.#input.value = "";
        this.#input.placeholder = this.#selectedValues.length > 0 ? "or type a value..." : "Search values";
        this._renderValueMenu();
        this._openMenu();
        break;
    }
  }

  // ── Menu rendering ──────────────────────────────────────────────────────

  private _renderFilterMenu(): void {
    this.#menu.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "menu-heading";
    heading.textContent = "SUGGESTED FILTERS";
    this.#menu.appendChild(heading);

    for (const filter of this.#filters) {
      const item = document.createElement("button");
      item.className = "menu-item";
      item.type = "button";
      item.textContent = filter.label;
      item.dataset.filterName = filter.name;
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.#selectedFilter = filter;
        this._transitionTo("selecting-operator");
      });
      this.#menu.appendChild(item);
    }
  }

  private _renderOperatorMenu(): void {
    if (!this.#selectedFilter) return;
    this.#menu.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "menu-heading";
    heading.textContent = this.#selectedFilter.label.toUpperCase();
    this.#menu.appendChild(heading);

    for (const op of this.#selectedFilter.operators) {
      const item = document.createElement("button");
      item.className = "menu-item";
      item.type = "button";
      item.textContent = op;
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.#selectedOperator = op;
        this._transitionTo("selecting-value");
      });
      this.#menu.appendChild(item);
    }
  }

  private _renderValueMenu(): void {
    if (!this.#selectedFilter) return;
    this.#menu.innerHTML = "";

    const heading = document.createElement("div");
    heading.className = "menu-heading";
    heading.textContent = `${this.#selectedFilter.label.toUpperCase()} ${(this.#selectedOperator ?? "").toUpperCase()}`;
    this.#menu.appendChild(heading);

    // Show custom values first (values not in the predefined list)
    const predefined = new Set(this.#selectedFilter.values);
    const customValues = this.#selectedValues.filter((v) => !predefined.has(v));
    for (const val of customValues) {
      const item = document.createElement("button");
      item.className = "menu-item selected";
      item.type = "button";
      item.textContent = `${val} (custom)`;
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this._toggleValue(val);
      });
      this.#menu.appendChild(item);
    }

    // Show predefined values
    for (const val of this.#selectedFilter.values) {
      const item = document.createElement("button");
      item.className = "menu-item";
      item.type = "button";
      item.textContent = val;
      if (this.#selectedValues.includes(val)) {
        item.classList.add("selected");
      }
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this._toggleValue(val);
      });
      this.#menu.appendChild(item);
    }
  }

  private _toggleValue(val: string): void {
    const idx = this.#selectedValues.indexOf(val);
    if (idx >= 0) {
      this.#selectedValues.splice(idx, 1);
    } else {
      this.#selectedValues.push(val);
    }

    // Update placeholder to hint "or"
    this.#input.placeholder = this.#selectedValues.length > 0 ? "or type a value..." : "Search values";

    // Re-render to update selected state
    this._renderValueMenu();
    this._openMenu();
  }

  private _commitFilter(): void {
    if (!this.#selectedFilter || !this.#selectedOperator || this.#selectedValues.length === 0) return;

    const expression = `${this.#selectedOperator} ${this.#selectedValues.join(" or ")}`;

    if (this.#editingTag) {
      // Update existing tag
      this.#editingTag.setAttribute("category", this.#selectedFilter.name.toUpperCase());
      this.#editingTag.setAttribute("expression", expression);
      this.#editingTag.setAttribute("filter-name", this.#selectedFilter.name);
      this.#editingTag.setAttribute("operator", this.#selectedOperator);
      this.#editingTag.setAttribute("values", this.#selectedValues.join(","));

      this.dispatchEvent(
        new CustomEvent("queryfield-filter-update", {
          detail: {
            tag: this.#editingTag,
            filter: this.#selectedFilter.name,
            label: this.#selectedFilter.label,
            operator: this.#selectedOperator,
            values: [...this.#selectedValues],
            expression,
          },
          bubbles: true,
          composed: true,
        }),
      );
    } else {
      // Create new tag
      this.dispatchEvent(
        new CustomEvent("queryfield-filter-add", {
          detail: {
            filter: this.#selectedFilter.name,
            label: this.#selectedFilter.label,
            operator: this.#selectedOperator,
            values: [...this.#selectedValues],
            expression,
          },
          bubbles: true,
          composed: true,
        }),
      );
    }

    setTimeout(() => {
      if (this.#editingTag) this.#editingTag.removeAttribute("editing");
      this.#editingTag = null;
      this._transitionTo("idle");
    }, 200);
  }

  // ── Menu open/close ─────────────────────────────────────────────────────

  private _openMenu(): void {
    this.setAttribute("menu-open", "");
  }

  private _closeMenu(): void {
    this.removeAttribute("menu-open");
    if (this.#editingTag) this.#editingTag.removeAttribute("editing");
    this.#editingTag = null;
    this.#state = "idle";
  }

  private _filterMenuItems(): void {
    const query = this.#input.value.toLowerCase();
    const items = this.#menu.querySelectorAll(".menu-item");
    for (const item of items) {
      const text = (item as HTMLElement).textContent?.toLowerCase() ?? "";
      (item as HTMLElement).style.display = text.includes(query) ? "" : "none";
    }
  }

  private _onDocumentClick(e: MouseEvent): void {
    if (!this.hasAttribute("menu-open")) return;
    if (this.contains(e.target as Node)) return;
    const path = e.composedPath();
    if (path.includes(this)) return;
    // Commit if values were selected
    if (this.#state === "selecting-value" && this.#selectedValues.length > 0) {
      this._commitFilter();
    } else {
      this._closeMenu();
    }
  }

  // ── Edit existing tag ───────────────────────────────────────────────────

  private _editTag(tag: HTMLElement, filterName: string, operator: string, values: string[]): void {
    const filter = this.#filters.find((f) => f.name === filterName);
    if (!filter) return;

    // Clear previous editing state
    if (this.#editingTag) this.#editingTag.removeAttribute("editing");

    this.#editingTag = tag;
    tag.setAttribute("editing", "");
    this.#selectedFilter = filter;
    this.#selectedOperator = operator;
    this.#selectedValues = [...values];

    // Jump straight to value selection with existing values pre-selected
    this.#input.value = "";
    this.#input.placeholder = values.length > 0 ? `or type a value...` : "Search values";
    this.#state = "selecting-value";
    this._renderValueMenu();
    this._openMenu();
    this.#input.focus();
  }

  // ── Private ─────────────────────────────────────────────────────────────
  private _propagateSize(): void {
    const size = this.getAttribute("size");
    if (!size) return;
    const slot = this.#tags.querySelector("slot") as HTMLSlotElement;
    for (const node of slot.assignedElements()) {
      if (node.tagName === "UI-QUERYFIELD-TAG") {
        node.setAttribute("size", size);
      }
    }
  }
}

customElements.define("ui-queryfield", UiQueryfield);
