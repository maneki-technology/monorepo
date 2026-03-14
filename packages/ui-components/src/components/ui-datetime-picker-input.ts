import { STYLES } from "./ui-datetime-picker-input.styles.js";
import "./ui-icon.js";
import "./ui-label.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type DatetimePickerInputSize = "s" | "m" | "l";
export type DatetimePickerInputType = "single-date" | "range-date" | "time" | "datetime";
export type DatetimePickerInputStatus = "none" | "error" | "warning" | "success" | "loading";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiDatetimePickerInput extends HTMLElement {
  static readonly observedAttributes = [
    "size", "type", "label", "supportive", "placeholder",
    "value", "disabled", "readonly", "status", "focused",
  ];

  #container!: HTMLElement;
  #contentEl!: HTMLElement;
  #iconEl!: HTMLElement;
  #statusIconEl!: HTMLElement;
  #statusIconInner!: HTMLElement;
  #spinEl!: HTMLElement;
  #labelTextEl!: HTMLElement;
  #supportiveEl!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Label row
    const labelRow = document.createElement("div");
    labelRow.className = "label-row";

    this.#labelTextEl = document.createElement("ui-label");
    this.#labelTextEl.setAttribute("emphasis", "bold");
    labelRow.appendChild(this.#labelTextEl);

    shadow.appendChild(labelRow);

    // Input container
    this.#container = document.createElement("div");
    this.#container.className = "input-container";
    this.#container.setAttribute("role", "group");

    // Leading icon
    this.#iconEl = document.createElement("div");
    this.#iconEl.className = "icon";
    this.#container.appendChild(this.#iconEl);

    // Content area
    this.#contentEl = document.createElement("div");
    this.#contentEl.className = "content";
    this.#container.appendChild(this.#contentEl);

    // Status icon
    this.#statusIconEl = document.createElement("div");
    this.#statusIconEl.className = "status-icon";
    this.#statusIconEl.setAttribute("aria-hidden", "true");
    this.#statusIconInner = document.createElement("ui-icon");
    this.#statusIconInner.setAttribute("filled", "");
    this.#statusIconEl.appendChild(this.#statusIconInner);
    this.#container.appendChild(this.#statusIconEl);

    // Spin controls (for time type)
    this.#spinEl = document.createElement("div");
    this.#spinEl.className = "spin-controls";
    this.#container.appendChild(this.#spinEl);

    shadow.appendChild(this.#container);

    // Supportive text
    this.#supportiveEl = document.createElement("div");
    this.#supportiveEl.className = "supportive";
    shadow.appendChild(this.#supportiveEl);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) {
      this.setAttribute("size", "m");
    }
    if (!this.hasAttribute("type")) {
      this.setAttribute("type", "single-date");
    }

    this.#setupIcon();
    this.#renderContent();
    this.#setupSpinControls();
    this.#updateLabel();
    this.#updateSupportive();
    this.#updateStatusIcon();

    // Click to toggle focus / open picker
    this.#container.addEventListener("click", this.#onClick);
    this.addEventListener("keydown", this.#onKeydown);

    if (!this.hasAttribute("tabindex") && !this.hasAttribute("disabled")) {
      this.setAttribute("tabindex", "0");
    }
  }

  disconnectedCallback(): void {
    this.#container.removeEventListener("click", this.#onClick);
    this.removeEventListener("keydown", this.#onKeydown);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (!this.isConnected) return;
    if (name === "type") {
      this.#setupIcon();
      this.#renderContent();
      this.#setupSpinControls();
    }
    if (name === "value" || name === "placeholder") {
      this.#renderContent();
    }
    if (name === "label") {
      this.#updateLabel();
    }
    if (name === "supportive") {
      this.#updateSupportive();
    }
    if (name === "size") {
      this.#updateLabelSize();
    }
    if (name === "status") {
      this.#updateStatusIcon();
    }
  }

  // ─── Properties ────────────────────────────────────────────────────────

  get size(): DatetimePickerInputSize {
    return (this.getAttribute("size") as DatetimePickerInputSize) || "m";
  }

  set size(v: DatetimePickerInputSize) {
    this.setAttribute("size", v);
  }

  get type(): DatetimePickerInputType {
    return (this.getAttribute("type") as DatetimePickerInputType) || "single-date";
  }

  set type(v: DatetimePickerInputType) {
    this.setAttribute("type", v);
  }

  get value(): string {
    return this.getAttribute("value") || "";
  }

  set value(v: string) {
    this.setAttribute("value", v);
  }

  get status(): DatetimePickerInputStatus {
    return (this.getAttribute("status") as DatetimePickerInputStatus) || "none";
  }

  set status(v: DatetimePickerInputStatus) {
    this.setAttribute("status", v);
  }

  get label(): string {
    return this.getAttribute("label") || "";
  }

  set label(v: string) {
    this.setAttribute("label", v);
  }

  get supportive(): string {
    return this.getAttribute("supportive") || "";
  }

  set supportive(v: string) {
    this.setAttribute("supportive", v);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(v: boolean) {
    if (v) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }

  get readonly(): boolean {
    return this.hasAttribute("readonly");
  }

  set readonly(v: boolean) {
    if (v) this.setAttribute("readonly", "");
    else this.removeAttribute("readonly");
  }

  // ─── Icon setup ────────────────────────────────────────────────────────

  #setupIcon(): void {
    this.#iconEl.innerHTML = "";
    const icon = document.createElement("ui-icon");
    icon.setAttribute("name", this.type === "time" ? "schedule" : "calendar_today");
    this.#iconEl.appendChild(icon);
  }

  // ─── Spin controls (time type only) ─────────────────────────────────────

  #setupSpinControls(): void {
    this.#spinEl.innerHTML = "";
    if (this.type !== "time") {
      return;
    }

    const upBtn = document.createElement("button");
    upBtn.className = "spin-btn";
    upBtn.type = "button";
    upBtn.setAttribute("aria-label", "Increment");
    upBtn.setAttribute("tabindex", "-1");
    const upIcon = document.createElement("ui-icon");
    upIcon.setAttribute("name", "expand_less");
    upBtn.appendChild(upIcon);

    const divider = document.createElement("div");
    divider.className = "spin-divider";

    const downBtn = document.createElement("button");
    downBtn.className = "spin-btn";
    downBtn.type = "button";
    downBtn.setAttribute("aria-label", "Decrement");
    downBtn.setAttribute("tabindex", "-1");
    const downIcon = document.createElement("ui-icon");
    downIcon.setAttribute("name", "expand_more");
    downBtn.appendChild(downIcon);

    this.#spinEl.append(upBtn, divider, downBtn);

    upBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent("spin", { detail: { direction: "up" }, bubbles: true }));
    });
    downBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent("spin", { detail: { direction: "down" }, bubbles: true }));
    });
  }

  // ─── Content rendering ─────────────────────────────────────────────────

  #renderContent(): void {
    this.#contentEl.innerHTML = "";
    const val = this.value;

    if (this.type === "single-date") {
      this.#renderSingleDate(val);
    } else if (this.type === "range-date") {
      this.#renderRangeDate(val);
    } else if (this.type === "time") {
      this.#renderTime(val);
    } else if (this.type === "datetime") {
      this.#renderDatetime(val);
    }
  }

  #renderSingleDate(val: string): void {
    const seg = document.createElement("span");
    seg.className = "segment";
    if (val) {
      seg.textContent = this.#formatDate(val);
    } else {
      seg.textContent = this.getAttribute("placeholder") || "DD Mon, YYYY";
      seg.setAttribute("data-placeholder", "");
    }
    this.#contentEl.appendChild(seg);
  }

  #renderRangeDate(val: string): void {
    // val format: "YYYY-MM-DD/YYYY-MM-DD" or just start date
    const parts = val ? val.split("/") : [];
    const start = parts[0] || "";
    const end = parts[1] || "";

    const startSeg = document.createElement("span");
    startSeg.className = "segment";
    if (start) {
      startSeg.textContent = this.#formatDate(start);
    } else {
      startSeg.textContent = "DD Mon, YYYY";
      startSeg.setAttribute("data-placeholder", "");
    }

    const sep = document.createElement("span");
    sep.className = "separator";
    sep.textContent = "to";

    const endSeg = document.createElement("span");
    endSeg.className = "segment";
    if (end) {
      endSeg.textContent = this.#formatDate(end);
    } else {
      endSeg.textContent = "DD Mon, YYYY";
      endSeg.setAttribute("data-placeholder", "");
    }

    this.#contentEl.append(startSeg, sep, endSeg);
  }

  #renderTime(val: string): void {
    // val format: "HH:MM" or "HH:MM AM/PM"
    const parts = val ? val.split(":") : [];
    const hour = parts[0] || "";
    const minParts = (parts[1] || "").split(" ");
    const min = minParts[0] || "";
    const period = minParts[1] || "";

    const hourSeg = document.createElement("span");
    hourSeg.className = "segment";
    if (hour) {
      hourSeg.textContent = hour;
    } else {
      hourSeg.textContent = "00";
      hourSeg.setAttribute("data-placeholder", "");
    }

    const sep = document.createElement("span");
    sep.className = "separator";
    sep.textContent = ":";

    const minSeg = document.createElement("span");
    minSeg.className = "segment";
    if (min) {
      minSeg.textContent = min;
    } else {
      minSeg.textContent = "00";
      minSeg.setAttribute("data-placeholder", "");
    }

    this.#contentEl.append(hourSeg, sep, minSeg);

    if (period || !val) {
      const periodSeg = document.createElement("span");
      periodSeg.className = "segment";
      periodSeg.textContent = period || "PM";
      if (!period) periodSeg.setAttribute("data-placeholder", "");
      this.#contentEl.appendChild(periodSeg);
    }
  }

  #renderDatetime(val: string): void {
    // val format: "YYYY-MM-DD HH:MM"
    const parts = val ? val.split(" ") : [];
    const datePart = parts[0] || "";
    const timePart = parts[1] || "";

    const dateSeg = document.createElement("span");
    dateSeg.className = "segment segment-clickable";
    dateSeg.dataset.segment = "date";
    if (datePart) {
      dateSeg.textContent = this.#formatDate(datePart);
    } else {
      dateSeg.textContent = "DD Mon, YYYY";
      dateSeg.setAttribute("data-placeholder", "");
    }

    const sep = document.createElement("span");
    sep.className = "separator";
    sep.textContent = ",";

    const timeSeg = document.createElement("span");
    timeSeg.className = "segment segment-clickable";
    timeSeg.dataset.segment = "time";
    if (timePart) {
      timeSeg.textContent = timePart;
    } else {
      timeSeg.textContent = "00:00";
      timeSeg.setAttribute("data-placeholder", "");
    }

    // Click handlers to switch panels
    dateSeg.addEventListener("click", (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent("segment-click", { detail: { segment: "date" }, bubbles: true }));
    });
    timeSeg.addEventListener("click", (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent("segment-click", { detail: { segment: "time" }, bubbles: true }));
    });

    this.#contentEl.append(dateSeg, sep, timeSeg);
  }

  #formatDate(iso: string): string {
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const mon = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${mon}, ${year}`;
  }

  // ─── Label / Supportive ────────────────────────────────────────────────

  #updateLabel(): void {
    const label = this.getAttribute("label");
    if (label) {
      this.#labelTextEl.textContent = label;
    }
    this.#updateLabelSize();
  }

  #updateLabelSize(): void {
    this.#labelTextEl.setAttribute("size", this.size);
  }

  #updateSupportive(): void {
    this.#supportiveEl.textContent = this.getAttribute("supportive") || "";
  }

  // ─── Status icon ────────────────────────────────────────────────────────

  static readonly STATUS_ICON_MAP: Record<string, string> = {
    warning: "warning",
    error: "error",
    success: "check_circle",
    loading: "progress_activity",
  };

  #updateStatusIcon(): void {
    const status = this.status;
    const iconName = UiDatetimePickerInput.STATUS_ICON_MAP[status];
    if (iconName) {
      this.#statusIconInner.setAttribute("name", iconName);
      this.#statusIconEl.style.display = "";
    } else {
      this.#statusIconInner.setAttribute("name", "");
      this.#statusIconEl.style.display = "none";
    }
  }

  // ─── Events ────────────────────────────────────────────────────────────

  #onClick = (): void => {
    if (this.disabled || this.readonly) return;
    this.dispatchEvent(new CustomEvent("trigger", { bubbles: true }));
  };

  #onKeydown = (e: KeyboardEvent): void => {
    if (this.disabled || this.readonly) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent("trigger", { bubbles: true }));
    }
  };
}

customElements.define("ui-datetime-picker-input", UiDatetimePickerInput);
