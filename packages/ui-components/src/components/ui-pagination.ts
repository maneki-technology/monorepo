import { STYLES } from "./ui-pagination.styles.js";
import { ICON_CODEPOINTS } from "@maneki/foundation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PaginationSize = "xs" | "s" | "m";
export type PaginationType = "minimal" | "basic" | "data-grid";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiPagination extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "type",
    "current-page",
    "total-pages",
    "page-size",
    "total-items",
    "page-size-options",
  ];

  #wrapper!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    this.#wrapper = document.createElement("div");
    this.#wrapper.className = "wrapper";
    shadow.appendChild(this.#wrapper);
  }

  connectedCallback(): void {
    this._render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this._render();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): PaginationSize {
    return (this.getAttribute("size") as PaginationSize) ?? "m";
  }
  set size(v: PaginationSize) {
    this.setAttribute("size", v);
  }

  get type(): PaginationType {
    return (this.getAttribute("type") as PaginationType) ?? "data-grid";
  }
  set type(v: PaginationType) {
    this.setAttribute("type", v);
  }

  get currentPage(): number {
    return Math.max(1, parseInt(this.getAttribute("current-page") ?? "1", 10) || 1);
  }
  set currentPage(v: number) {
    this.setAttribute("current-page", String(v));
  }

  get totalPages(): number {
    return Math.max(1, parseInt(this.getAttribute("total-pages") ?? "1", 10) || 1);
  }
  set totalPages(v: number) {
    this.setAttribute("total-pages", String(v));
  }

  get pageSize(): number {
    return parseInt(this.getAttribute("page-size") ?? "10", 10) || 10;
  }
  set pageSize(v: number) {
    this.setAttribute("page-size", String(v));
  }

  get totalItems(): number {
    return parseInt(this.getAttribute("total-items") ?? "0", 10) || 0;
  }
  set totalItems(v: number) {
    this.setAttribute("total-items", String(v));
  }

  get pageSizeOptions(): number[] {
    const raw = this.getAttribute("page-size-options");
    if (!raw) return [10, 25, 50, 100];
    return raw.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
  }
  set pageSizeOptions(v: number[]) {
    this.setAttribute("page-size-options", v.join(","));
  }

  // ── Navigation ──────────────────────────────────────────────────────────

  private _goToPage(page: number): void {
    const clamped = Math.max(1, Math.min(page, this.totalPages));
    if (clamped === this.currentPage) return;
    this.setAttribute("current-page", String(clamped));
    this.dispatchEvent(
      new CustomEvent("page-change", { detail: { page: clamped }, bubbles: true, composed: true }),
    );
  }

  private _changePageSize(size: number): void {
    if (size === this.pageSize) return;
    this.setAttribute("page-size", String(size));
    // Reset to page 1 on page size change
    this.setAttribute("current-page", "1");
    this.dispatchEvent(
      new CustomEvent("page-size-change", { detail: { pageSize: size }, bubbles: true, composed: true }),
    );
    this.dispatchEvent(
      new CustomEvent("page-change", { detail: { page: 1 }, bubbles: true, composed: true }),
    );
  }

  // ── Rendering ───────────────────────────────────────────────────────────

  private _render(): void {
    const type = this.type;
    this.#wrapper.innerHTML = "";

    switch (type) {
      case "minimal":
        this._renderMinimal();
        break;
      case "basic":
        this._renderBasic();
        break;
      case "data-grid":
        this._renderDataGrid();
        break;
    }
  }

  private _renderMinimal(): void {
    const prevBtn = this._createNavIcon("chevron_left", () => this._goToPage(this.currentPage - 1));
    if (this.currentPage <= 1) prevBtn.disabled = true;

    const goto = this._createGoto();

    const nextBtn = this._createNavIcon("chevron_right", () => this._goToPage(this.currentPage + 1));
    if (this.currentPage >= this.totalPages) nextBtn.disabled = true;

    this.#wrapper.append(prevBtn, goto, nextBtn);
  }

  private _renderBasic(): void {
    // Page status: "Show [select] of N items"
    const pageStatus = document.createElement("div");
    pageStatus.className = "page-status";

    const showLabel = document.createElement("span");
    showLabel.textContent = "Show";

    const sizeSelect = this._createPageSizeSelect();

    const ofLabel = document.createElement("span");
    ofLabel.textContent = `of ${this.totalItems} items`;

    pageStatus.append(showLabel, sizeSelect, ofLabel);

    // Right side: goto + prev/next
    const addon = document.createElement("div");
    addon.className = "addon";

    const goto = this._createGoto();

    const nav = document.createElement("div");
    nav.className = "nav";

    const prevBtn = this._createNavIcon("chevron_left", () => this._goToPage(this.currentPage - 1));
    if (this.currentPage <= 1) prevBtn.disabled = true;

    const nextBtn = this._createNavIcon("chevron_right", () => this._goToPage(this.currentPage + 1));
    if (this.currentPage >= this.totalPages) nextBtn.disabled = true;

    nav.append(prevBtn, nextBtn);
    addon.append(goto, nav);

    this.#wrapper.append(pageStatus, addon);
  }

  private _renderDataGrid(): void {
    // Navigation: First / Prev / [pages] / Next / Last
    const nav = document.createElement("div");
    nav.className = "nav";

    const firstBtn = this._createNavBtn("keyboard_double_arrow_left", "First", "nav-first", () => this._goToPage(1));
    if (this.currentPage <= 1) firstBtn.disabled = true;

    const prevBtn = this._createNavBtn("chevron_left", "Prev", "nav-prev", () => this._goToPage(this.currentPage - 1));
    if (this.currentPage <= 1) prevBtn.disabled = true;

    nav.append(firstBtn, prevBtn);

    // Page number buttons
    const pageRange = this._getPageRange();
    for (const page of pageRange) {
      const btn = document.createElement("button");
      btn.className = "item";
      btn.type = "button";
      btn.textContent = String(page);
      if (page === this.currentPage) {
        btn.setAttribute("aria-current", "page");
      }
      btn.addEventListener("click", () => this._goToPage(page));
      nav.appendChild(btn);
    }

    const nextBtn = this._createNavBtn("chevron_right", "Next", "nav-next", () => this._goToPage(this.currentPage + 1));
    if (this.currentPage >= this.totalPages) nextBtn.disabled = true;

    const lastBtn = this._createNavBtn("keyboard_double_arrow_right", "Last", "nav-last", () => this._goToPage(this.totalPages));
    if (this.currentPage >= this.totalPages) lastBtn.disabled = true;

    nav.append(nextBtn, lastBtn);

    // Addon: page size select + goto
    const addon = document.createElement("div");
    addon.className = "addon";

    const sizeSelect = this._createPageSizeSelect();
    const goto = this._createGoto();

    addon.append(sizeSelect, goto);

    this.#wrapper.append(nav, addon);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private _createNavBtn(icon: string | null, label: string, extraClass: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.className = `item nav-btn ${extraClass}`;
    btn.type = "button";

    const labelEl = document.createElement("span");
    labelEl.textContent = label;

    // Icon before label for first/prev, after for next/last
    if (extraClass === "nav-next" || extraClass === "nav-last") {
      if (icon) btn.append(labelEl, this._createIcon(icon));
      else btn.append(labelEl);
    } else {
      if (icon) btn.append(this._createIcon(icon), labelEl);
      else btn.append(labelEl);
    }

    btn.addEventListener("click", onClick);
    return btn;
  }

  private _createNavIcon(icon: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.className = "item nav-icon";
    btn.type = "button";
    btn.appendChild(this._createIcon(icon));
    btn.addEventListener("click", onClick);
    return btn;
  }

  private _createIcon(name: string): HTMLElement {
    const wrapper = document.createElement("span");
    wrapper.className = "icon";
    const i = document.createElement("span");
    i.className = "material-symbols-outlined";
    i.textContent = ICON_CODEPOINTS[name] ?? name;
    wrapper.appendChild(i);
    return wrapper;
  }

  private _createGoto(): HTMLElement {
    const goto = document.createElement("div");
    goto.className = "goto";

    const pageLabel = document.createElement("span");
    pageLabel.textContent = "Page";

    const input = document.createElement("input");
    input.className = "goto-input";
    input.type = "text";
    input.inputMode = "numeric";
    input.value = String(this.currentPage);
    input.setAttribute("aria-label", "Go to page");

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const val = parseInt(input.value, 10);
        if (!isNaN(val)) this._goToPage(val);
      }
    });

    input.addEventListener("blur", () => {
      const val = parseInt(input.value, 10);
      if (!isNaN(val)) this._goToPage(val);
      else input.value = String(this.currentPage);
    });

    const ofLabel = document.createElement("span");
    ofLabel.textContent = `of ${this.totalPages}`;

    goto.append(pageLabel, input, ofLabel);
    return goto;
  }

  private _createPageSizeSelect(): HTMLSelectElement {
    const select = document.createElement("select");
    select.className = "page-size-select";
    select.setAttribute("aria-label", "Items per page");

    for (const opt of this.pageSizeOptions) {
      const option = document.createElement("option");
      option.value = String(opt);
      option.textContent = String(opt);
      if (opt === this.pageSize) option.selected = true;
      select.appendChild(option);
    }

    select.addEventListener("change", () => {
      this._changePageSize(parseInt(select.value, 10));
    });

    return select;
  }

  private _getPageRange(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    const end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}

customElements.define("ui-pagination", UiPagination);
