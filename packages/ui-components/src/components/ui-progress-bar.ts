import {
  BAR_STYLES,
  STATUS_FILL,
  STATUS_TRACK,
  STATUS_INNER_FILL,
  STATUS_INNER_TRACK,
} from "./ui-progress-bar.styles.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ProgressBarSize = "s" | "m" | "l";
export type ProgressBarLabel = "none" | "top-label" | "inner-label";
export type ProgressStatus =
  | "none"
  | "information"
  | "success"
  | "warning"
  | "error"
  | "open"
  | "complete"
  | "suspended"
  | "cancelled";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(BAR_STYLES);

export class UiProgressBar extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "label",
    "status",
    "value",
    "label-text",
  ];

  #topLabel!: HTMLElement;
  #topLabelText!: HTMLElement;
  #topValueText!: HTMLElement;
  #bar!: HTMLElement;
  #track!: HTMLElement;
  #fill!: HTMLElement;
  #innerLabel!: HTMLElement;
  #innerLabelText!: HTMLElement;
  #innerValueText!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    // Top label
    this.#topLabel = document.createElement("div");
    this.#topLabel.className = "top-label";

    this.#topLabelText = document.createElement("span");
    this.#topLabelText.className = "label-text";

    this.#topValueText = document.createElement("span");
    this.#topValueText.className = "value-text";

    this.#topLabel.append(this.#topLabelText, this.#topValueText);

    // Bar
    this.#bar = document.createElement("div");
    this.#bar.className = "bar";
    this.#bar.setAttribute("role", "progressbar");
    this.#bar.setAttribute("aria-valuemin", "0");
    this.#bar.setAttribute("aria-valuemax", "100");

    this.#track = document.createElement("div");
    this.#track.className = "track";

    this.#fill = document.createElement("div");
    this.#fill.className = "fill";

    // Inner label
    this.#innerLabel = document.createElement("div");
    this.#innerLabel.className = "inner-label";

    this.#innerLabelText = document.createElement("span");
    this.#innerLabelText.className = "label-text";

    this.#innerValueText = document.createElement("span");
    this.#innerValueText.className = "value-text";

    this.#innerLabel.append(this.#innerLabelText, this.#innerValueText);

    this.#bar.append(this.#track, this.#fill, this.#innerLabel);
    wrapper.append(this.#topLabel, this.#bar);
    shadow.appendChild(wrapper);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) this.setAttribute("size", "m");
    if (!this.hasAttribute("label")) this.setAttribute("label", "top-label");
    if (!this.hasAttribute("status")) this.setAttribute("status", "information");
    if (!this.hasAttribute("value")) this.setAttribute("value", "0");
    this._syncAll();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this._syncAll();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): ProgressBarSize {
    return (this.getAttribute("size") as ProgressBarSize) ?? "m";
  }
  set size(v: ProgressBarSize) {
    this.setAttribute("size", v);
  }

  get label(): ProgressBarLabel {
    return (this.getAttribute("label") as ProgressBarLabel) ?? "top-label";
  }
  set label(v: ProgressBarLabel) {
    this.setAttribute("label", v);
  }

  get status(): ProgressStatus {
    return (this.getAttribute("status") as ProgressStatus) ?? "information";
  }
  set status(v: ProgressStatus) {
    this.setAttribute("status", v);
  }

  get value(): number {
    return Math.max(0, Math.min(100, parseInt(this.getAttribute("value") ?? "0", 10) || 0));
  }
  set value(v: number) {
    this.setAttribute("value", String(Math.max(0, Math.min(100, v))));
  }

  get labelText(): string {
    return this.getAttribute("label-text") ?? "";
  }
  set labelText(v: string) {
    this.setAttribute("label-text", v);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncAll(): void {
    const val = this.value;
    const status = this.status;
    const labelMode = this.label;
    const text = this.labelText;

    // Value text
    const valueStr = `${val}%`;
    this.#topValueText.textContent = valueStr;
    this.#innerValueText.textContent = valueStr;

    // Label text
    this.#topLabelText.textContent = text;
    this.#innerLabelText.textContent = text;

    // Fill width
    this.#fill.style.width = `${val}%`;

    // ARIA
    this.#bar.setAttribute("aria-valuenow", String(val));
    if (text) this.#bar.setAttribute("aria-label", text);

    // Colors
    if (labelMode === "inner-label") {
      this.#track.style.backgroundColor = STATUS_INNER_TRACK[status] ?? STATUS_INNER_TRACK.none;
      this.#fill.style.backgroundColor = STATUS_INNER_FILL[status] ?? STATUS_INNER_FILL.none;
    } else {
      this.#track.style.backgroundColor = STATUS_TRACK[status] ?? STATUS_TRACK.none;
      this.#fill.style.backgroundColor = STATUS_FILL[status] ?? STATUS_FILL.none;
    }
  }
}

customElements.define("ui-progress-bar", UiProgressBar);
