import { STYLES } from "./ui-datetime-picker.styles.js";
import "./ui-datetime-picker-input.js";
import "./ui-calendar.js";
import "./ui-clock.js";
import "./ui-calendar-time.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type DatetimePickerSize = "s" | "m" | "l";
export type DatetimePickerType = "single-date" | "range-date" | "time" | "datetime";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiDatetimePicker extends HTMLElement {
  static readonly observedAttributes = [
    "size", "type", "value", "min", "max", "label", "supportive",
    "status", "disabled", "readonly", "open", "show-actions", "time-mode",
  ];

  #inputEl!: HTMLElement;
  #panel!: HTMLElement;
  #calendarEl!: HTMLElement;
  #clockEl!: HTMLElement;
  #inlineTimeEl!: HTMLElement;
  #cancelBtn!: HTMLButtonElement;
  #okBtn!: HTMLButtonElement;
  #pendingValue: string | null = null;
  #datetimeStep: "date" | "time" = "date";
  #datetimeDate = ""; // stored date part for datetime type

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Input trigger
    this.#inputEl = document.createElement("ui-datetime-picker-input");
    shadow.appendChild(this.#inputEl);

    // Dropdown panel
    this.#panel = document.createElement("div");
    this.#panel.className = "panel";

    // Calendar
    this.#calendarEl = document.createElement("ui-calendar");
    this.#panel.appendChild(this.#calendarEl);

    // Inline time (for time-mode="inline")
    this.#inlineTimeEl = document.createElement("ui-calendar-time");
    this.#inlineTimeEl.style.display = "none";
    this.#panel.appendChild(this.#inlineTimeEl);

    // Clock (for time type / datetime with clock mode)
    this.#clockEl = document.createElement("ui-clock");
    this.#clockEl.style.display = "none";
    this.#panel.appendChild(this.#clockEl);

    // Actions bar
    const actions = document.createElement("div");
    actions.className = "actions";

    this.#cancelBtn = document.createElement("button");
    this.#cancelBtn.className = "action-btn cancel-btn";
    this.#cancelBtn.type = "button";
    this.#cancelBtn.textContent = "Cancel";

    this.#okBtn = document.createElement("button");
    this.#okBtn.className = "action-btn ok-btn";
    this.#okBtn.type = "button";
    this.#okBtn.textContent = "OK";

    actions.append(this.#cancelBtn, this.#okBtn);
    this.#panel.appendChild(actions);

    shadow.appendChild(this.#panel);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) {
      this.setAttribute("size", "m");
    }
    if (!this.hasAttribute("type")) {
      this.setAttribute("type", "single-date");
    }

    this.#syncInputProps();
    this.#syncCalendarProps();
    this.#syncClockProps();
    this.#syncInlineTimeProps();
    this.#syncPanelVisibility();

    // Events
    this.#inputEl.addEventListener("trigger", this.#onTrigger);
    this.#inputEl.addEventListener("spin", this.#onSpin);
    this.#inputEl.addEventListener("segment-click", this.#onSegmentClick);
    this.#calendarEl.addEventListener("change", this.#onCalendarChange);
    this.#calendarEl.addEventListener("range-change", this.#onRangeChange);
    this.#clockEl.addEventListener("time-complete", this.#onTimeComplete);
    this.#clockEl.addEventListener("time-input", this.#onTimeInput);
    this.#inlineTimeEl.addEventListener("change", this.#onInlineTimeChange);
    this.#cancelBtn.addEventListener("click", this.#onCancel);
    this.#okBtn.addEventListener("click", this.#onOk);
    document.addEventListener("click", this.#onOutsideClick);
    this.addEventListener("keydown", this.#onKeydown);
  }

  disconnectedCallback(): void {
    this.#inputEl.removeEventListener("trigger", this.#onTrigger);
    this.#inputEl.removeEventListener("spin", this.#onSpin);
    this.#inputEl.removeEventListener("segment-click", this.#onSegmentClick);
    this.#calendarEl.removeEventListener("change", this.#onCalendarChange);
    this.#calendarEl.removeEventListener("range-change", this.#onRangeChange);
    this.#clockEl.removeEventListener("time-complete", this.#onTimeComplete);
    this.#clockEl.removeEventListener("time-input", this.#onTimeInput);
    this.#inlineTimeEl.removeEventListener("change", this.#onInlineTimeChange);
    this.#cancelBtn.removeEventListener("click", this.#onCancel);
    this.#okBtn.removeEventListener("click", this.#onOk);
    document.removeEventListener("click", this.#onOutsideClick);
    this.removeEventListener("keydown", this.#onKeydown);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (!this.isConnected) return;
    if (name === "size" || name === "label" || name === "supportive" || name === "status" || name === "disabled" || name === "readonly") {
      this.#syncInputProps();
    }
    if (name === "size" || name === "min" || name === "max") {
      this.#syncCalendarProps();
      this.#syncClockProps();
      this.#syncInlineTimeProps();
    }
    if (name === "type" || name === "time-mode") {
      this.#syncInputProps();
      this.#syncCalendarProps();
      this.#syncClockProps();
      this.#syncInlineTimeProps();
      this.#syncPanelVisibility();
    }
    if (name === "value") {
      this.#syncInputProps();
      this.#syncCalendarProps();
      this.#syncClockProps();
      this.#syncInlineTimeProps();
    }
  }

  // ─── Properties ────────────────────────────────────────────────────────

  get size(): DatetimePickerSize {
    return (this.getAttribute("size") as DatetimePickerSize) || "m";
  }

  set size(v: DatetimePickerSize) {
    this.setAttribute("size", v);
  }

  get type(): DatetimePickerType {
    return (this.getAttribute("type") as DatetimePickerType) || "single-date";
  }

  set type(v: DatetimePickerType) {
    this.setAttribute("type", v);
  }

  get value(): string {
    return this.getAttribute("value") || "";
  }

  set value(v: string) {
    this.setAttribute("value", v);
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(v: boolean) {
    if (v) this.setAttribute("open", "");
    else this.removeAttribute("open");
  }

  get label(): string {
    return this.getAttribute("label") || "";
  }

  set label(v: string) {
    this.setAttribute("label", v);
  }

  get min(): string {
    return this.getAttribute("min") || "";
  }

  set min(v: string) {
    this.setAttribute("min", v);
  }

  get max(): string {
    return this.getAttribute("max") || "";
  }

  set max(v: string) {
    this.setAttribute("max", v);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(v: boolean) {
    if (v) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }

  /** Time mode: "clock" (default) shows analog/digital clock, "inline" shows hour/minute inputs + AM/PM toggle. */
  get timeMode(): "clock" | "inline" {
    return this.getAttribute("time-mode") === "inline" ? "inline" : "clock";
  }

  set timeMode(v: "clock" | "inline") {
    this.setAttribute("time-mode", v);
  }

  // ─── Sync props to children ────────────────────────────────────────────

  #syncInputProps(): void {
    const input = this.#inputEl;
    input.setAttribute("size", this.size);
    input.setAttribute("type", this.type);

    const val = this.getAttribute("value");
    if (val) input.setAttribute("value", val);
    else input.removeAttribute("value");

    const label = this.getAttribute("label");
    if (label) input.setAttribute("label", label);
    else input.removeAttribute("label");

    const supportive = this.getAttribute("supportive");
    if (supportive) input.setAttribute("supportive", supportive);
    else input.removeAttribute("supportive");

    const status = this.getAttribute("status");
    if (status) input.setAttribute("status", status);
    else input.removeAttribute("status");

    if (this.hasAttribute("disabled")) input.setAttribute("disabled", "");
    else input.removeAttribute("disabled");

    if (this.hasAttribute("readonly")) input.setAttribute("readonly", "");
    else input.removeAttribute("readonly");
  }

  #syncCalendarProps(): void {
    const cal = this.#calendarEl;
    cal.setAttribute("size", this.size);

    const min = this.getAttribute("min");
    if (min) cal.setAttribute("min", min);
    else cal.removeAttribute("min");

    const max = this.getAttribute("max");
    if (max) cal.setAttribute("max", max);
    else cal.removeAttribute("max");

    if (this.type === "range-date") {
      cal.setAttribute("mode", "range");
      // Parse range value "start/end"
      const val = this.value;
      if (val) {
        const parts = val.split("/");
        if (parts[0]) cal.setAttribute("range-start", parts[0]);
        if (parts[1]) cal.setAttribute("range-end", parts[1]);
      }
    } else {
      cal.setAttribute("mode", "single");
      const val = this.value;
      if (val) {
        // For datetime, extract date part ("YYYY-MM-DD HH:MM" → "YYYY-MM-DD")
        const datePart = this.type === "datetime" ? val.split(" ")[0] : val;
        cal.setAttribute("value", datePart);
      } else {
        cal.removeAttribute("value");
      }
    }
  }

  #syncClockProps(): void {
    if (this.type !== "time" && this.type !== "datetime") return;
    if (this.timeMode === "inline" && this.type === "datetime") return; // inline mode uses calendar-time instead
    this.#clockEl.setAttribute("size", this.size);
    const val = this.value;
    // For datetime, value is "YYYY-MM-DD HH:MM" — extract time part
    if (this.type === "datetime" && val) {
      const timePart = val.split(" ")[1] || "";
      if (timePart) this.#clockEl.setAttribute("value", timePart);
    } else if (val) {
      this.#clockEl.setAttribute("value", val);
    } else {
      this.#clockEl.removeAttribute("value");
    }
  }

  #syncInlineTimeProps(): void {
    if (this.timeMode !== "inline" || this.type !== "datetime") return;
    this.#inlineTimeEl.setAttribute("size", this.size);
    const val = this.value;
    if (val) {
      const timePart = val.split(" ")[1] || "";
      if (timePart) this.#inlineTimeEl.setAttribute("value", timePart);
    } else {
      this.#inlineTimeEl.removeAttribute("value");
    }
  }

  #syncPanelVisibility(): void {
    const isTime = this.type === "time";
    const isDatetime = this.type === "datetime";
    const isInlineMode = this.timeMode === "inline";

    if (isDatetime && isInlineMode) {
      // Inline mode: calendar always visible + inline time always visible, no clock
      this.#calendarEl.style.display = "";
      this.#inlineTimeEl.style.display = "";
      this.#clockEl.style.display = "none";
    } else if (isDatetime) {
      // Clock mode: show calendar or clock based on current step
      this.#calendarEl.style.display = this.#datetimeStep === "date" ? "" : "none";
      this.#clockEl.style.display = this.#datetimeStep === "time" ? "" : "none";
      this.#inlineTimeEl.style.display = "none";
    } else {
      this.#calendarEl.style.display = isTime ? "none" : "";
      this.#clockEl.style.display = isTime ? "" : "none";
      this.#inlineTimeEl.style.display = "none";
    }
  }

  // ─── Open / Close ──────────────────────────────────────────────────────

  #onTrigger = (): void => {
    if (!this.open) {
      if (this.type === "datetime" && this.timeMode !== "inline") {
        this.#datetimeStep = "date";
        this.#syncPanelVisibility();
      }
      (this.#clockEl as any).resetSelection?.();
    }
    this.open = !this.open;
  };

  #onSegmentClick = (e: Event): void => {
    const detail = (e as CustomEvent).detail;
    const segment = detail.segment as "date" | "time";
    if (this.type === "datetime" && this.timeMode !== "inline") {
      this.#datetimeStep = segment;
      this.#syncPanelVisibility();
      if (!this.open) {
        this.open = true;
      }
    } else if (this.type === "datetime" && this.timeMode === "inline") {
      // In inline mode, just open the panel — both calendar and time are always visible
      if (!this.open) {
        this.open = true;
      }
    }
  };

  #close(): void {
    this.open = false;
  }

  #onOutsideClick = (e: Event): void => {
    if (!this.open) return;
    if (!this.contains(e.target as Node)) {
      this.#close();
    }
  };

  #onKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Escape" && this.open) {
      e.preventDefault();
      this.#close();
    }
  };

  // ─── Calendar events ───────────────────────────────────────────────────

  #onCalendarChange = (e: Event): void => {
    const detail = (e as CustomEvent).detail;

    // For datetime type, store the date
    if (this.type === "datetime") {
      this.#datetimeDate = detail.value;
      const timePart = this.value ? this.value.split(" ")[1] || "" : "";
      const combined = `${detail.value}${timePart ? " " + timePart : ""}`;
      this.#inputEl.setAttribute("value", combined);
      if (this.hasAttribute("show-actions")) {
        this.#pendingValue = combined;
      } else if (this.timeMode === "inline") {
        // In inline mode, don't close on date select — user still needs to set time
        this.value = combined;
        this.dispatchEvent(
          new CustomEvent("change", { detail: { value: combined }, bubbles: true }),
        );
      } else {
        this.value = combined;
        this.#close();
        this.dispatchEvent(
          new CustomEvent("change", { detail: { value: combined }, bubbles: true }),
        );
      }
      return;
    }

    if (this.hasAttribute("show-actions")) {
      this.#pendingValue = detail.value;
    } else {
      this.value = detail.value;
      this.#close();
      this.dispatchEvent(
        new CustomEvent("change", { detail: { value: detail.value }, bubbles: true }),
      );
    }
  };

  #onRangeChange = (e: Event): void => {
    const detail = (e as CustomEvent).detail;
    const rangeVal = detail.end
      ? `${detail.start}/${detail.end}`
      : detail.start || "";

    if (this.hasAttribute("show-actions")) {
      this.#pendingValue = rangeVal;
    } else {
      // Auto-close when both endpoints selected
      if (detail.end) {
        this.value = rangeVal;
        this.#close();
        this.dispatchEvent(
          new CustomEvent("change", { detail: { value: rangeVal }, bubbles: true }),
        );
      }
    }
  };

  #onTimeComplete = (e: Event): void => {
    const detail = (e as CustomEvent).detail;
    const timeVal = detail.value;

    // For datetime, combine stored date + selected time
    if (this.type === "datetime") {
      const combined = `${this.#datetimeDate} ${timeVal}`;
      if (this.hasAttribute("show-actions")) {
        this.#pendingValue = combined;
      } else {
        this.value = combined;
        this.#close();
        this.dispatchEvent(
          new CustomEvent("change", { detail: { value: combined }, bubbles: true }),
        );
      }
      return;
    }

    if (this.hasAttribute("show-actions")) {
      this.#pendingValue = timeVal;
    } else {
      this.value = timeVal;
      this.#close();
      this.dispatchEvent(
        new CustomEvent("change", { detail: { value: timeVal }, bubbles: true }),
      );
    }
  };

  #onTimeInput = (e: Event): void => {
    const detail = (e as CustomEvent).detail;
    const timeVal = detail.value;

    if (this.type === "datetime") {
      const combined = `${this.#datetimeDate} ${timeVal}`;
      if (this.hasAttribute("show-actions")) {
        this.#pendingValue = combined;
      }
      this.#inputEl.setAttribute("value", combined);
    } else {
      if (this.hasAttribute("show-actions")) {
        this.#pendingValue = timeVal;
      }
      this.#inputEl.setAttribute("value", timeVal);
    }
  };

  // ─── Inline time events ────────────────────────────────────────────────

  #onInlineTimeChange = (e: Event): void => {
    const detail = (e as CustomEvent).detail;
    const timeVal = detail.value; // "HH:MM" 24h format

    const datePart = this.#datetimeDate || (this.value ? this.value.split(" ")[0] : "");
    const combined = datePart ? `${datePart} ${timeVal}` : timeVal;

    this.#inputEl.setAttribute("value", combined);

    if (this.hasAttribute("show-actions")) {
      this.#pendingValue = combined;
    } else {
      this.value = combined;
      this.dispatchEvent(
        new CustomEvent("change", { detail: { value: combined }, bubbles: true }),
      );
    }
  };

  // ─── Spin controls (from input) ─────────────────────────────────────────

  #onSpin = (e: Event): void => {
    const detail = (e as CustomEvent).detail;
    const direction = detail.direction as "up" | "down";
    // Parse current time value
    const val = this.value || "12:00";
    const parts = val.split(":");
    let hour = parseInt(parts[0], 10) || 0;
    let minute = parseInt(parts[1], 10) || 0;

    if (direction === "up") {
      minute = (minute + 1) % 60;
      if (minute === 0) hour = (hour + 1) % 24;
    } else {
      minute = (minute + 59) % 60;
      if (minute === 59) hour = (hour + 23) % 24;
    }

    const newVal = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    this.value = newVal;
    this.dispatchEvent(
      new CustomEvent("change", { detail: { value: newVal }, bubbles: true }),
    );
  };

  // ─── Actions ───────────────────────────────────────────────────────────

  #onCancel = (): void => {
    this.#pendingValue = null;
    this.#close();
  };

  #onOk = (): void => {
    if (this.#pendingValue !== null) {
      this.value = this.#pendingValue;
      this.dispatchEvent(
        new CustomEvent("change", { detail: { value: this.#pendingValue }, bubbles: true }),
      );
      this.#pendingValue = null;
    }
    this.#close();
  };
}

customElements.define("ui-datetime-picker", UiDatetimePicker);
