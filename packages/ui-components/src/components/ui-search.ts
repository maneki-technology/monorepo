import { STYLES } from "./ui-search.styles.js";
import { ICON_SEARCH, ICON_CANCEL, ICON_CODEPOINTS } from "@maneki/foundation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SearchSize = "s" | "m" | "l";

export interface SearchResultItem {
  type: "basic" | "with-info" | "article" | "with-icon" | "with-avatar";
  title: string;
  info?: string;
  description?: string;
  icon?: string;
  avatarText?: string;
  avatarSrc?: string;
  category?: string;
  data?: unknown;
}

export interface SearchCategory {
  label: string;
  showAll?: boolean;
  results: SearchResultItem[];
}

export interface SearchSelectDetail {
  item: SearchResultItem;
  category: string;
}

export interface SearchShowAllDetail {
  category: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiSearch extends HTMLElement {
  static readonly observedAttributes = ["size", "placeholder", "disabled", "value"];

  #input!: HTMLInputElement;
  #clearBtn!: HTMLButtonElement;
  #dropdown!: HTMLElement;
  #categories: SearchCategory[] = [];
  #query = "";

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const labelSlot = document.createElement("slot");
    labelSlot.name = "label";

    // Input wrapper
    const inputWrapper = document.createElement("div");
    inputWrapper.className = "input-wrapper";

    // Search icon
    const searchIcon = document.createElement("span");
    searchIcon.className = "search-icon";
    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.textContent = ICON_SEARCH;
    searchIcon.appendChild(icon);

    // Input
    this.#input = document.createElement("input");
    this.#input.className = "input";
    this.#input.type = "text";
    this.#input.placeholder = "Type to search...";

    // Clear button
    this.#clearBtn = document.createElement("button");
    this.#clearBtn.className = "clear-btn";
    this.#clearBtn.type = "button";
    this.#clearBtn.setAttribute("aria-label", "Clear search");
    const clearIcon = document.createElement("span");
    clearIcon.className = "material-symbols-outlined";
    clearIcon.textContent = ICON_CANCEL;
    this.#clearBtn.appendChild(clearIcon);

    inputWrapper.append(searchIcon, this.#input, this.#clearBtn);

    // Dropdown
    this.#dropdown = document.createElement("div");
    this.#dropdown.className = "dropdown";

    shadow.append(labelSlot, inputWrapper, this.#dropdown);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) this.setAttribute("size", "m");

    this.#input.addEventListener("input", () => {
      this.#query = this.#input.value;
      this._syncHasValue();
      this._renderResults();

      if (this.#query.length > 0) {
        this._open();
      } else {
        this._close();
      }

      this.dispatchEvent(
        new CustomEvent("search-input", {
          detail: { value: this.#query },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this.#input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this._close();
      } else if (e.key === "Enter") {
        this.dispatchEvent(
          new CustomEvent("search-submit", {
            detail: { value: this.#query },
            bubbles: true,
            composed: true,
          }),
        );
      }
    });

    this.#input.addEventListener("focus", () => {
      if (this.#query.length > 0 && this.#categories.length > 0) {
        this._open();
      }
    });

    this.#clearBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.#input.value = "";
      this.#query = "";
      this._syncHasValue();
      this._close();
      this.#input.focus();
      this.dispatchEvent(
        new CustomEvent("search-clear", { bubbles: true, composed: true }),
      );
    });

    // Close on outside click
    this._onDocumentClick = this._onDocumentClick.bind(this);
    document.addEventListener("click", this._onDocumentClick);
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
        this.#input.placeholder = newValue ?? "Type to search...";
        break;
      case "disabled":
        this.#input.disabled = newValue !== null;
        break;
      case "value":
        this.#input.value = newValue ?? "";
        this.#query = newValue ?? "";
        this._syncHasValue();
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): SearchSize {
    return (this.getAttribute("size") as SearchSize) ?? "m";
  }
  set size(v: SearchSize) {
    this.setAttribute("size", v);
  }

  get placeholder(): string {
    return this.getAttribute("placeholder") ?? "Type to search...";
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
    this.#query = v;
    this._syncHasValue();
  }

  get categories(): SearchCategory[] {
    return this.#categories;
  }
  set categories(v: SearchCategory[]) {
    this.#categories = v;
    this._renderResults();
  }

  // ── Rendering ───────────────────────────────────────────────────────────

  private _renderResults(): void {
    this.#dropdown.innerHTML = "";
    const query = this.#query.toLowerCase();

    for (const cat of this.#categories) {
      // Filter results by query
      const filtered = query
        ? cat.results.filter((r) => r.title.toLowerCase().includes(query))
        : cat.results;

      if (filtered.length === 0) continue;

      // Category heading
      const heading = document.createElement("div");
      heading.className = "category-heading";

      const label = document.createElement("span");
      label.textContent = cat.label;
      heading.appendChild(label);

      if (cat.showAll !== false) {
        const showAll = document.createElement("button");
        showAll.className = "show-all";
        showAll.type = "button";
        showAll.textContent = "SHOW ALL";
        showAll.addEventListener("click", (e) => {
          e.stopPropagation();
          this.dispatchEvent(
            new CustomEvent("search-show-all", {
              detail: { category: cat.label },
              bubbles: true,
              composed: true,
            }),
          );
        });
        heading.appendChild(showAll);
      }

      this.#dropdown.appendChild(heading);

      // Result items
      for (const item of filtered) {
        const el = this._createResultItem(item, cat.label);
        this.#dropdown.appendChild(el);
      }
    }
  }

  private _createResultItem(item: SearchResultItem, category: string): HTMLElement {
    const btn = document.createElement("button");
    btn.className = "result-item";
    btn.type = "button";

    const hasLeading = item.type === "with-icon" || item.type === "with-avatar";
    if (hasLeading) btn.classList.add("has-leading");

    // Leading element
    if (item.type === "with-icon" && item.icon) {
      const leading = document.createElement("span");
      leading.className = "result-leading";
      const iconEl = document.createElement("span");
      iconEl.className = "material-symbols-outlined";
      iconEl.textContent = ICON_CODEPOINTS[item.icon] ?? item.icon;
      leading.appendChild(iconEl);
      btn.appendChild(leading);
    } else if (item.type === "with-avatar") {
      const leading = document.createElement("span");
      leading.className = "result-leading avatar-leading";
      if (item.avatarSrc) {
        const img = document.createElement("img");
        img.src = item.avatarSrc;
        img.alt = "";
        img.style.cssText = "width:100%;height:100%;border-radius:999px;object-fit:cover;";
        leading.appendChild(img);
      } else {
        const circle = document.createElement("span");
        circle.className = "avatar-circle";
        circle.textContent = item.avatarText ?? "";
        leading.appendChild(circle);
      }
      btn.appendChild(leading);
    }

    // Content
    const content = document.createElement("div");
    content.className = "result-content";

    // Head row (title + info)
    const head = document.createElement("div");
    head.className = "result-head";

    const title = document.createElement("span");
    title.className = "result-title";
    title.innerHTML = this._highlightMatch(item.title);
    head.appendChild(title);

    if ((item.type === "with-info" || item.type === "article") && item.info) {
      const info = document.createElement("span");
      info.className = "result-info";
      info.textContent = item.info;
      head.appendChild(info);
    }

    content.appendChild(head);

    // Description (article type)
    if (item.type === "article" && item.description) {
      const desc = document.createElement("span");
      desc.className = "result-description";
      desc.textContent = item.description;
      content.appendChild(desc);
    }

    btn.appendChild(content);

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Populate input with selected title + close
      this.#input.value = item.title;
      this.#query = item.title;
      this._syncHasValue();
      this.dispatchEvent(
        new CustomEvent("search-select", {
          detail: { item, category },
          bubbles: true,
          composed: true,
        }),
      );
      this._close();
    });

    return btn;
  }

  private _highlightMatch(text: string): string {
    if (!this.#query) return this._escapeHtml(text);
    const query = this.#query;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return this._escapeHtml(text);

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);
    return `${this._escapeHtml(before)}<strong>${this._escapeHtml(match)}</strong>${this._escapeHtml(after)}`;
  }

  private _escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ── Open/close ──────────────────────────────────────────────────────────

  private _open(): void {
    if (this.#dropdown.children.length > 0) {
      this.setAttribute("open", "");
    }
  }

  private _close(): void {
    this.removeAttribute("open");
  }

  private _syncHasValue(): void {
    if (this.#input.value) this.setAttribute("has-value", "");
    else this.removeAttribute("has-value");
  }

  private _onDocumentClick(e: MouseEvent): void {
    if (!this.hasAttribute("open")) return;
    if (this.contains(e.target as Node)) return;
    const path = e.composedPath();
    if (path.includes(this)) return;
    this._close();
  }
}

customElements.define("ui-search", UiSearch);
