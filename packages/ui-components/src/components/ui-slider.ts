import { STYLES } from "./ui-slider.styles.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SliderSize = "s" | "m" | "l";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiSlider extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "min",
    "max",
    "value",
    "value-high",
    "step",
    "labels",
    "tooltip",
    "disabled",
    "range",
  ];

  #trackArea!: HTMLElement;
  #track!: HTMLElement;
  #fill!: HTMLElement;
  #handleLow!: HTMLElement;
  #handleHigh!: HTMLElement;
  #tooltipLow!: HTMLElement;
  #tooltipHigh!: HTMLElement;
  #labelMin!: HTMLElement;
  #labelMax!: HTMLElement;

  #dragging: "low" | "high" | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    // Track area
    this.#trackArea = document.createElement("div");
    this.#trackArea.className = "track-area";

    this.#track = document.createElement("div");
    this.#track.className = "track";

    this.#fill = document.createElement("div");
    this.#fill.className = "fill";

    // Low handle
    this.#handleLow = document.createElement("div");
    this.#handleLow.className = "handle";
    this.#handleLow.setAttribute("tabindex", "0");
    this.#handleLow.setAttribute("role", "slider");
    const innerLow = document.createElement("div");
    innerLow.className = "handle-inner";
    this.#tooltipLow = document.createElement("div");
    this.#tooltipLow.className = "tooltip";
    this.#handleLow.append(innerLow, this.#tooltipLow);

    // High handle (for range mode)
    this.#handleHigh = document.createElement("div");
    this.#handleHigh.className = "handle";
    this.#handleHigh.setAttribute("tabindex", "0");
    this.#handleHigh.setAttribute("role", "slider");
    const innerHigh = document.createElement("div");
    innerHigh.className = "handle-inner";
    this.#tooltipHigh = document.createElement("div");
    this.#tooltipHigh.className = "tooltip";
    this.#handleHigh.append(innerHigh, this.#tooltipHigh);

    this.#trackArea.append(this.#track, this.#fill, this.#handleLow, this.#handleHigh);

    // Labels
    const labels = document.createElement("div");
    labels.className = "labels";
    this.#labelMin = document.createElement("span");
    this.#labelMax = document.createElement("span");
    labels.append(this.#labelMin, this.#labelMax);

    wrapper.append(this.#trackArea, labels);
    shadow.appendChild(wrapper);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) this.setAttribute("size", "m");
    if (!this.hasAttribute("min")) this.setAttribute("min", "0");
    if (!this.hasAttribute("max")) this.setAttribute("max", "100");
    if (!this.hasAttribute("value")) this.setAttribute("value", "0");
    if (!this.hasAttribute("step")) this.setAttribute("step", "1");

    this._syncAll();

    // Pointer events on track area
    this.#trackArea.addEventListener("pointerdown", (e) => this._onPointerDown(e));

    // Keyboard on handles
    this.#handleLow.addEventListener("keydown", (e) => this._onKeyDown(e, "low"));
    this.#handleHigh.addEventListener("keydown", (e) => this._onKeyDown(e, "high"));
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this._syncAll();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): SliderSize {
    return (this.getAttribute("size") as SliderSize) ?? "m";
  }
  set size(v: SliderSize) {
    this.setAttribute("size", v);
  }

  get min(): number {
    return parseFloat(this.getAttribute("min") ?? "0");
  }
  set min(v: number) {
    this.setAttribute("min", String(v));
  }

  get max(): number {
    return parseFloat(this.getAttribute("max") ?? "100");
  }
  set max(v: number) {
    this.setAttribute("max", String(v));
  }

  get value(): number {
    return parseFloat(this.getAttribute("value") ?? "0");
  }
  set value(v: number) {
    this.setAttribute("value", String(v));
  }

  get valueHigh(): number {
    return parseFloat(this.getAttribute("value-high") ?? String(this.max));
  }
  set valueHigh(v: number) {
    this.setAttribute("value-high", String(v));
  }

  get step(): number {
    return parseFloat(this.getAttribute("step") ?? "1") || 1;
  }
  set step(v: number) {
    this.setAttribute("step", String(v));
  }

  get isRange(): boolean {
    return this.hasAttribute("range");
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(v: boolean) {
    if (v) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }

  // ── Sync ────────────────────────────────────────────────────────────────

  private _syncAll(): void {
    const min = this.min;
    const max = this.max;
    const range = max - min;
    if (range <= 0) return;

    const val = Math.max(min, Math.min(max, this.value));
    const valHigh = this.isRange ? Math.max(min, Math.min(max, this.valueHigh)) : max;

    // Percentages
    const lowPct = ((val - min) / range) * 100;
    const highPct = this.isRange ? ((valHigh - min) / range) * 100 : lowPct;

    // Fill position
    if (this.isRange) {
      this.#fill.style.left = `${lowPct}%`;
      this.#fill.style.right = `${100 - highPct}%`;
      this.#fill.style.top = this.#track.style.top || "";
    } else {
      this.#fill.style.left = "0";
      this.#fill.style.right = `${100 - lowPct}%`;
      this.#fill.style.top = this.#track.style.top || "";
    }

    // Handle positions
    this.#handleLow.style.left = `${lowPct}%`;

    if (this.isRange) {
      this.#handleHigh.style.display = "";
      this.#handleHigh.style.left = `${highPct}%`;
    } else {
      this.#handleHigh.style.display = "none";
    }

    // ARIA
    this.#handleLow.setAttribute("aria-valuemin", String(min));
    this.#handleLow.setAttribute("aria-valuemax", this.isRange ? String(valHigh) : String(max));
    this.#handleLow.setAttribute("aria-valuenow", String(val));

    if (this.isRange) {
      this.#handleHigh.setAttribute("aria-valuemin", String(val));
      this.#handleHigh.setAttribute("aria-valuemax", String(max));
      this.#handleHigh.setAttribute("aria-valuenow", String(valHigh));
    }

    // Tooltips
    this.#tooltipLow.textContent = String(val);
    this.#tooltipHigh.textContent = String(valHigh);

    // Labels
    this.#labelMin.textContent = String(min);
    this.#labelMax.textContent = String(max);
  }

  // ── Pointer interaction ─────────────────────────────────────────────────

  private _onPointerDown(e: PointerEvent): void {
    if (this.disabled) return;
    e.preventDefault();

    const rect = this.#trackArea.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const rawVal = this.min + pct * (this.max - this.min);

    // Determine which handle to drag
    if (this.isRange) {
      const distLow = Math.abs(rawVal - this.value);
      const distHigh = Math.abs(rawVal - this.valueHigh);
      this.#dragging = distLow <= distHigh ? "low" : "high";
    } else {
      this.#dragging = "low";
    }

    this._updateFromPointer(e);
    this._setActive(this.#dragging, true);

    const onMove = (ev: PointerEvent) => this._updateFromPointer(ev);
    const onUp = () => {
      this._setActive(this.#dragging!, false);
      this.#dragging = null;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }

  private _updateFromPointer(e: PointerEvent): void {
    const rect = this.#trackArea.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const rawVal = this.min + pct * (this.max - this.min);
    const stepped = this._snap(rawVal);

    if (this.#dragging === "low") {
      const clamped = this.isRange ? Math.min(stepped, this.valueHigh) : stepped;
      this.setAttribute("value", String(clamped));
      this._dispatchChange();
    } else if (this.#dragging === "high") {
      const clamped = Math.max(stepped, this.value);
      this.setAttribute("value-high", String(clamped));
      this._dispatchChange();
    }
  }

  // ── Keyboard ────────────────────────────────────────────────────────────

  private _onKeyDown(e: KeyboardEvent, handle: "low" | "high"): void {
    if (this.disabled) return;
    const step = this.step;
    let delta = 0;

    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        delta = step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        delta = -step;
        break;
      case "Home":
        delta = this.min - (handle === "low" ? this.value : this.valueHigh);
        break;
      case "End":
        delta = this.max - (handle === "low" ? this.value : this.valueHigh);
        break;
      default:
        return;
    }

    e.preventDefault();

    if (handle === "low") {
      const newVal = Math.max(this.min, Math.min(this.isRange ? this.valueHigh : this.max, this.value + delta));
      this.setAttribute("value", String(this._snap(newVal)));
    } else {
      const newVal = Math.max(this.value, Math.min(this.max, this.valueHigh + delta));
      this.setAttribute("value-high", String(this._snap(newVal)));
    }

    this._dispatchChange();
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private _snap(val: number): number {
    const step = this.step;
    const snapped = Math.round((val - this.min) / step) * step + this.min;
    // Round to avoid floating point issues
    const decimals = (String(step).split(".")[1] || "").length;
    return parseFloat(snapped.toFixed(decimals));
  }

  private _setActive(handle: "low" | "high", active: boolean): void {
    const el = handle === "low" ? this.#handleLow : this.#handleHigh;
    if (active) el.classList.add("active");
    else el.classList.remove("active");
  }

  private _dispatchChange(): void {
    this.dispatchEvent(
      new CustomEvent("slider-change", {
        detail: {
          value: this.value,
          valueHigh: this.isRange ? this.valueHigh : undefined,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define("ui-slider", UiSlider);
