import { STYLES } from "./ui-metric.styles.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MetricSize = "xs" | "s" | "m" | "l";
export type MetricOrientation = "vertical" | "horizontal";
export type MetricDelta = "none" | "up" | "down";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiMetric extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "orientation",
    "label",
    "value",
    "delta",
    "delta-text",
    "secondary-label",
    "legend-color",
    "clickable",
  ];

  #label!: HTMLElement;
  #value!: HTMLElement;
  #deltaArrow!: HTMLElement;
  #deltaText!: HTMLElement;
  #secondaryLabel!: HTMLElement;
  #legend!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Legend bar
    this.#legend = document.createElement("div");
    this.#legend.className = "legend";

    // Content wrapper
    const content = document.createElement("div");
    content.className = "content";

    // Label
    this.#label = document.createElement("div");
    this.#label.className = "label";

    // Value container
    const valueContainer = document.createElement("div");
    valueContainer.className = "value-container";

    this.#value = document.createElement("span");
    this.#value.className = "value";

    // Delta arrow
    this.#deltaArrow = document.createElement("span");
    this.#deltaArrow.className = "delta-arrow";
    const arrow = document.createElement("span");
    arrow.className = "arrow";
    this.#deltaArrow.appendChild(arrow);

    valueContainer.appendChild(this.#value);
    valueContainer.appendChild(this.#deltaArrow);

    // Delta content row
    const deltaContent = document.createElement("div");
    deltaContent.className = "delta-content";

    this.#deltaText = document.createElement("span");
    this.#deltaText.className = "delta-text";

    this.#secondaryLabel = document.createElement("span");
    this.#secondaryLabel.className = "secondary-label";

    deltaContent.appendChild(this.#deltaText);
    deltaContent.appendChild(this.#secondaryLabel);

    content.appendChild(this.#label);
    content.appendChild(valueContainer);
    content.appendChild(deltaContent);

    // Base wrapper
    const base = document.createElement("div");
    base.className = "base";
    base.appendChild(this.#legend);
    base.appendChild(content);

    shadow.appendChild(base);
  }

  connectedCallback(): void {
    this._syncLegendColor();
    if (this.hasAttribute("clickable")) {
      this._setupClickable();
    }
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    switch (name) {
      case "label":
        this.#label.textContent = newValue ?? "";
        break;
      case "value":
        this.#value.textContent = newValue ?? "";
        break;
      case "delta-text":
        this.#deltaText.textContent = newValue ?? "";
        break;
      case "secondary-label":
        this.#secondaryLabel.textContent = newValue ?? "";
        break;
      case "legend-color":
        this._syncLegendColor();
        break;
      case "clickable":
        this._setupClickable();
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): MetricSize {
    return (this.getAttribute("size") as MetricSize) ?? "s";
  }
  set size(v: MetricSize) {
    this.setAttribute("size", v);
  }

  get orientation(): MetricOrientation {
    return (this.getAttribute("orientation") as MetricOrientation) ?? "vertical";
  }
  set orientation(v: MetricOrientation) {
    this.setAttribute("orientation", v);
  }

  get label(): string {
    return this.getAttribute("label") ?? "";
  }
  set label(v: string) {
    this.setAttribute("label", v);
  }

  get value(): string {
    return this.getAttribute("value") ?? "";
  }
  set value(v: string) {
    this.setAttribute("value", v);
  }

  get delta(): MetricDelta {
    return (this.getAttribute("delta") as MetricDelta) ?? "none";
  }
  set delta(v: MetricDelta) {
    this.setAttribute("delta", v);
  }

  get deltaText(): string {
    return this.getAttribute("delta-text") ?? "";
  }
  set deltaText(v: string) {
    this.setAttribute("delta-text", v);
  }

  get secondaryLabel(): string {
    return this.getAttribute("secondary-label") ?? "";
  }
  set secondaryLabel(v: string) {
    this.setAttribute("secondary-label", v);
  }

  get legendColor(): string | null {
    return this.getAttribute("legend-color");
  }
  set legendColor(v: string | null) {
    if (v) this.setAttribute("legend-color", v);
    else this.removeAttribute("legend-color");
  }

  get clickable(): boolean {
    return this.hasAttribute("clickable");
  }
  set clickable(v: boolean) {
    if (v) this.setAttribute("clickable", "");
    else this.removeAttribute("clickable");
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncLegendColor(): void {
    const color = this.getAttribute("legend-color");
    this.#legend.style.backgroundColor = color ?? "";
  }

  private _setupClickable(): void {
    if (this.hasAttribute("clickable")) {
      this.style.cursor = "pointer";
      this.setAttribute("role", "button");
      this.setAttribute("tabindex", "0");
    } else {
      this.style.cursor = "";
      this.removeAttribute("role");
      this.removeAttribute("tabindex");
    }
  }
}

customElements.define("ui-metric", UiMetric);
