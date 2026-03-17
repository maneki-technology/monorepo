import { TAG_STYLES } from "./ui-queryfield-tag.styles.js";
import { ICON_CANCEL } from "@maneki/foundation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type QueryfieldTagSize = "s" | "m" | "l";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(TAG_STYLES);

export class UiQueryfieldTag extends HTMLElement {
  static readonly observedAttributes = ["size", "category", "expression", "filter-name", "operator", "values"];

  #categoryEl!: HTMLElement;
  #valueText!: HTMLElement;
  #dismissBtn!: HTMLButtonElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Category (left pill)
    this.#categoryEl = document.createElement("span");
    this.#categoryEl.className = "category";

    // Value (right pill)
    const value = document.createElement("span");
    value.className = "value";

    this.#valueText = document.createElement("span");
    this.#valueText.className = "value-text";

    // Dismiss button
    this.#dismissBtn = document.createElement("button");
    this.#dismissBtn.className = "dismiss";
    this.#dismissBtn.type = "button";
    this.#dismissBtn.setAttribute("aria-label", "Remove filter");
    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.textContent = ICON_CANCEL;
    this.#dismissBtn.appendChild(icon);

    value.append(this.#valueText, this.#dismissBtn);
    shadow.append(this.#categoryEl, value);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) this.setAttribute("size", "m");
    this.#dismissBtn.addEventListener("click", (e) => { e.stopPropagation(); this._dismiss(); });
    this.addEventListener("click", () => this._edit());
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    switch (name) {
      case "category":
        this.#categoryEl.textContent = newValue ?? "";
        break;
      case "expression":
        this._renderExpression(newValue ?? "");
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): QueryfieldTagSize {
    return (this.getAttribute("size") as QueryfieldTagSize) ?? "m";
  }
  set size(v: QueryfieldTagSize) {
    this.setAttribute("size", v);
  }

  get category(): string {
    return this.getAttribute("category") ?? "";
  }
  set category(v: string) {
    this.setAttribute("category", v);
  }

  get expression(): string {
    return this.getAttribute("expression") ?? "";
  }
  set expression(v: string) {
    this.setAttribute("expression", v);
  }

  get filterName(): string {
    return this.getAttribute("filter-name") ?? "";
  }
  set filterName(v: string) {
    this.setAttribute("filter-name", v);
  }

  get operator(): string {
    return this.getAttribute("operator") ?? "";
  }
  set operator(v: string) {
    this.setAttribute("operator", v);
  }

  get values(): string[] {
    const raw = this.getAttribute("values");
    if (!raw) return [];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  set values(v: string[]) {
    this.setAttribute("values", v.join(","));
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _renderExpression(expr: string): void {
    this.#valueText.innerHTML = "";

    // Parse expression: "equals London or Bengaluru"
    // Operators: equals, contains, starts with, ends with, not, and, or
    const operators = ["equals", "contains", "starts with", "ends with", "not"];
    const conjunctions = ["or", "and"];
    const words = expr.split(/\s+/);
    let i = 0;

    while (i < words.length) {
      // Check for multi-word operators
      const twoWord = words.slice(i, i + 2).join(" ").toLowerCase();
      const oneWord = words[i].toLowerCase();

      if (operators.includes(twoWord)) {
        const span = document.createElement("span");
        span.className = "operator";
        span.textContent = words.slice(i, i + 2).join(" ") + " ";
        this.#valueText.appendChild(span);
        i += 2;
      } else if (operators.includes(oneWord)) {
        const span = document.createElement("span");
        span.className = "operator";
        span.textContent = words[i] + " ";
        this.#valueText.appendChild(span);
        i++;
      } else if (conjunctions.includes(oneWord)) {
        const span = document.createElement("span");
        span.className = "conjunction";
        span.textContent = words[i] + " ";
        this.#valueText.appendChild(span);
        i++;
      } else {
        const span = document.createElement("span");
        span.className = "filter-value";
        span.textContent = words[i] + " ";
        this.#valueText.appendChild(span);
        i++;
      }
    }
  }

  private _dismiss(): void {
    this.dispatchEvent(
      new CustomEvent("dismiss", { bubbles: true, composed: true }),
    );
  }

  private _edit(): void {
    this.dispatchEvent(
      new CustomEvent("tag-edit", {
        detail: {
          tag: this,
          filterName: this.filterName,
          operator: this.operator,
          values: this.values,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }
}


customElements.define("ui-queryfield-tag", UiQueryfieldTag);
