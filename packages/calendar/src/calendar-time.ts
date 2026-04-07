import { TIME_STYLES } from "./calendar-time.styles.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type TimePeriod = "AM" | "PM";

export interface TimeChangeDetail {
  value: string;
  hours: number;
  minutes: number;
  seconds: number;
  period: TimePeriod | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(TIME_STYLES);

// ─── Segment indices ─────────────────────────────────────────────────────────

const SEG_HOUR = 0;
const SEG_MIN = 1;
const SEG_SEC = 2;
const SEG_PERIOD = 3;

// ─── Component ───────────────────────────────────────────────────────────────

export class ManekiCalendarTime extends HTMLElement {
  static readonly observedAttributes = ["value", "use12hour", "timezone"];

  // ─── State ───────────────────────────────────────────────────────────────

  #hours = 0;
  #minutes = 0;
  #seconds = 0;
  #period: TimePeriod = "AM";
  #filled = false;
  #internalUpdate = false;

  // ─── DOM refs ────────────────────────────────────────────────────────────

  #segments: HTMLButtonElement[] = [];
  #periodEl: HTMLButtonElement | null = null;
  #tzEl: HTMLSpanElement | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const row = document.createElement("div");
    row.className = "time-row";

    // Label
    const label = document.createElement("span");
    label.className = "time-label";
    label.textContent = "Time";

    // Input wrapper
    const input = document.createElement("div");
    input.className = "time-input";
    input.setAttribute("role", "group");
    input.setAttribute("aria-label", "Time input");

    // Hour segment
    const hourSeg = this.#createSegment("hours", "00");
    this.#segments.push(hourSeg);
    input.appendChild(hourSeg);

    // Separator
    input.appendChild(this.#createSeparator());

    // Minute segment
    const minSeg = this.#createSegment("minutes", "00");
    this.#segments.push(minSeg);
    input.appendChild(minSeg);

    // Separator
    input.appendChild(this.#createSeparator());

    // Second segment
    const secSeg = this.#createSegment("seconds", "00");
    this.#segments.push(secSeg);
    input.appendChild(secSeg);

    // Period (AM/PM) — created but hidden by default
    this.#periodEl = document.createElement("button");
    this.#periodEl.className = "period";
    this.#periodEl.type = "button";
    this.#periodEl.setAttribute("role", "spinbutton");
    this.#periodEl.setAttribute("aria-label", "Period");
    this.#periodEl.setAttribute("aria-valuemin", "0");
    this.#periodEl.setAttribute("aria-valuemax", "1");
    this.#periodEl.setAttribute("tabindex", "0");
    this.#periodEl.textContent = "AM";
    this.#periodEl.style.display = "none";
    input.appendChild(this.#periodEl);

    // Timezone label
    this.#tzEl = document.createElement("span");
    this.#tzEl.className = "timezone";
    this.#tzEl.style.display = "none";
    input.appendChild(this.#tzEl);

    row.append(label, input);
    shadow.appendChild(row);
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  connectedCallback(): void {
    if (this.hasAttribute("value")) {
      this.#parseValue(this.getAttribute("value"));
    }
    this.#syncUse12Hour();
    this.#syncTimezone();
    this.#render();

    // Event listeners
    for (const seg of this.#segments) {
      seg.addEventListener("keydown", this.#onSegmentKeydown);
    }
    if (this.#periodEl) {
      this.#periodEl.addEventListener("keydown", this.#onPeriodKeydown);
      this.#periodEl.addEventListener("click", this.#onPeriodClick);
    }
  }

  disconnectedCallback(): void {
    for (const seg of this.#segments) {
      seg.removeEventListener("keydown", this.#onSegmentKeydown);
    }
    if (this.#periodEl) {
      this.#periodEl.removeEventListener("keydown", this.#onPeriodKeydown);
      this.#periodEl.removeEventListener("click", this.#onPeriodClick);
    }
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (!this.isConnected || this.#internalUpdate || oldValue === newValue) return;
    if (name === "value") {
      this.#parseValue(newValue);
      this.#render();
    } else if (name === "use12hour") {
      this.#syncUse12Hour();
      this.#render();
    } else if (name === "timezone") {
      this.#syncTimezone();
    }
  }

  // ─── Properties ──────────────────────────────────────────────────────────

  get value(): string {
    return `${pad2(this.#hours)}:${pad2(this.#minutes)}:${pad2(this.#seconds)}`;
  }

  set value(v: string) {
    this.setAttribute("value", v);
  }

  get use12Hour(): boolean {
    return this.hasAttribute("use12hour");
  }

  set use12Hour(v: boolean) {
    if (v) this.setAttribute("use12hour", "");
    else this.removeAttribute("use12hour");
  }

  get timezone(): string {
    return this.getAttribute("timezone") || "";
  }

  set timezone(v: string) {
    if (v) this.setAttribute("timezone", v);
    else this.removeAttribute("timezone");
  }

  get hours(): number {
    return this.#hours;
  }

  get minutes(): number {
    return this.#minutes;
  }

  get seconds(): number {
    return this.#seconds;
  }

  get period(): TimePeriod | null {
    return this.use12Hour ? this.#period : null;
  }

  // ─── Parsing ─────────────────────────────────────────────────────────────

  #parseValue(val: string | null): void {
    if (!val) {
      this.#hours = 0;
      this.#minutes = 0;
      this.#seconds = 0;
      this.#period = "AM";
      this.#filled = false;
      return;
    }

    const parts = val.split(":");
    const h = parseInt(parts[0], 10);
    const m = parts.length > 1 ? parseInt(parts[1], 10) : 0;
    const s = parts.length > 2 ? parseInt(parts[2], 10) : 0;

    if (isNaN(h)) return;

    this.#hours = clamp(h, 0, 23);
    this.#minutes = clamp(isNaN(m) ? 0 : m, 0, 59);
    this.#seconds = clamp(isNaN(s) ? 0 : s, 0, 59);
    this.#period = this.#hours >= 12 ? "PM" : "AM";
    this.#filled = true;
  }

  // ─── Sync ────────────────────────────────────────────────────────────────

  #syncUse12Hour(): void {
    if (this.#periodEl) {
      this.#periodEl.style.display = this.use12Hour ? "" : "none";
    }
  }

  #syncTimezone(): void {
    if (this.#tzEl) {
      const tz = this.timezone;
      this.#tzEl.textContent = tz;
      this.#tzEl.style.display = tz ? "" : "none";
    }
  }

  // ─── DOM helpers ─────────────────────────────────────────────────────────

  #createSegment(ariaLabel: string, text: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.className = "segment";
    btn.type = "button";
    btn.setAttribute("role", "spinbutton");
    btn.setAttribute("aria-label", ariaLabel);
    btn.setAttribute("tabindex", "0");
    btn.textContent = text;
    return btn;
  }

  #createSeparator(): HTMLSpanElement {
    const sep = document.createElement("span");
    sep.className = "separator";
    sep.textContent = ":";
    sep.setAttribute("aria-hidden", "true");
    return sep;
  }

  // ─── Keyboard ────────────────────────────────────────────────────────────

  #onSegmentKeydown = (e: KeyboardEvent): void => {
    const target = e.currentTarget as HTMLButtonElement;
    const idx = this.#segments.indexOf(target);
    if (idx === -1) return;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        this.#adjustSegment(idx, 1);
        break;
      case "ArrowDown":
        e.preventDefault();
        this.#adjustSegment(idx, -1);
        break;
      case "ArrowRight":
      case "Tab":
        if (e.key === "Tab" && e.shiftKey) return; // let natural tab work
        if (e.key === "ArrowRight") e.preventDefault();
        this.#focusNext(idx);
        if (e.key === "ArrowRight") return;
        break;
      case "ArrowLeft":
        e.preventDefault();
        this.#focusPrev(idx);
        break;
      default:
        // Numeric input
        if (e.key >= "0" && e.key <= "9") {
          e.preventDefault();
          this.#handleNumericInput(idx, parseInt(e.key, 10));
        }
        break;
    }
  };

  #onPeriodKeydown = (e: KeyboardEvent): void => {
    switch (e.key) {
      case "ArrowUp":
      case "ArrowDown":
      case "Enter":
      case " ":
        e.preventDefault();
        this.#togglePeriod();
        break;
      case "ArrowLeft":
        e.preventDefault();
        this.#segments[SEG_SEC]?.focus();
        break;
      case "a":
      case "A":
        e.preventDefault();
        if (this.#period !== "AM") this.#togglePeriod();
        break;
      case "p":
      case "P":
        e.preventDefault();
        if (this.#period !== "PM") this.#togglePeriod();
        break;
    }
  };

  #onPeriodClick = (): void => {
    this.#togglePeriod();
  };

  // ─── Segment manipulation ────────────────────────────────────────────────

  #adjustSegment(idx: number, delta: number): void {
    this.#filled = true;
    if (idx === SEG_HOUR) {
      this.#hours = (this.#hours + delta + 24) % 24;
      this.#period = this.#hours >= 12 ? "PM" : "AM";
    } else if (idx === SEG_MIN) {
      this.#minutes = (this.#minutes + delta + 60) % 60;
    } else if (idx === SEG_SEC) {
      this.#seconds = (this.#seconds + delta + 60) % 60;
    }
    this.#render();
    this.#emitChange();
  }

  #pendingDigit: number | null = null;
  #pendingSegment: number | null = null;

  #handleNumericInput(idx: number, digit: number): void {
    this.#filled = true;

    if (this.#pendingSegment === idx && this.#pendingDigit !== null) {
      // Second digit — combine
      const combined = this.#pendingDigit * 10 + digit;
      this.#pendingDigit = null;
      this.#pendingSegment = null;

      if (idx === SEG_HOUR) {
        this.#hours = clamp(combined, 0, 23);
        this.#period = this.#hours >= 12 ? "PM" : "AM";
      } else if (idx === SEG_MIN) {
        this.#minutes = clamp(combined, 0, 59);
      } else if (idx === SEG_SEC) {
        this.#seconds = clamp(combined, 0, 59);
      }

      this.#render();
      this.#emitChange();
      this.#focusNext(idx);
    } else {
      // First digit — check if it can be a tens digit
      const maxFirst = idx === SEG_HOUR ? 2 : 5;
      if (digit > maxFirst) {
        // Single digit value, apply immediately
        if (idx === SEG_HOUR) {
          this.#hours = digit;
          this.#period = this.#hours >= 12 ? "PM" : "AM";
        } else if (idx === SEG_MIN) {
          this.#minutes = digit;
        } else if (idx === SEG_SEC) {
          this.#seconds = digit;
        }
        this.#pendingDigit = null;
        this.#pendingSegment = null;
        this.#render();
        this.#emitChange();
        this.#focusNext(idx);
      } else {
        // Wait for second digit
        this.#pendingDigit = digit;
        this.#pendingSegment = idx;
        // Show partial
        if (idx === SEG_HOUR) this.#hours = digit;
        else if (idx === SEG_MIN) this.#minutes = digit;
        else if (idx === SEG_SEC) this.#seconds = digit;
        this.#render();
      }
    }
  }

  #togglePeriod(): void {
    this.#filled = true;
    // Convert hours when toggling
    if (this.#period === "AM") {
      this.#period = "PM";
      if (this.#hours < 12) this.#hours += 12;
    } else {
      this.#period = "AM";
      if (this.#hours >= 12) this.#hours -= 12;
    }
    this.#render();
    this.#emitChange();
  }

  #focusNext(idx: number): void {
    if (idx < SEG_SEC) {
      this.#segments[idx + 1]?.focus();
    } else if (this.use12Hour && this.#periodEl) {
      this.#periodEl.focus();
    }
  }

  #focusPrev(idx: number): void {
    if (idx > SEG_HOUR) {
      this.#segments[idx - 1]?.focus();
    }
  }

  // ─── Events ──────────────────────────────────────────────────────────────

  #emitChange(): void {
    this.#internalUpdate = true;
    const val = this.value;
    this.setAttribute("value", val);
    this.dispatchEvent(
      new CustomEvent("time-change", {
        detail: {
          value: val,
          hours: this.#hours,
          minutes: this.#minutes,
          seconds: this.#seconds,
          period: this.use12Hour ? this.#period : null,
        } satisfies TimeChangeDetail,
        bubbles: true,
        composed: true,
      }),
    );
    this.#internalUpdate = false;
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  #render(): void {
    const is12 = this.use12Hour;
    let displayHours = this.#hours;

    if (is12) {
      displayHours = this.#hours % 12;
      if (displayHours === 0) displayHours = 12;
    }

    // Update segment text
    this.#segments[SEG_HOUR].textContent = pad2(displayHours);
    this.#segments[SEG_MIN].textContent = pad2(this.#minutes);
    this.#segments[SEG_SEC].textContent = pad2(this.#seconds);

    // Update aria values
    this.#segments[SEG_HOUR].setAttribute("aria-valuenow", String(displayHours));
    this.#segments[SEG_HOUR].setAttribute("aria-valuemin", is12 ? "1" : "0");
    this.#segments[SEG_HOUR].setAttribute("aria-valuemax", is12 ? "12" : "23");
    this.#segments[SEG_MIN].setAttribute("aria-valuenow", String(this.#minutes));
    this.#segments[SEG_MIN].setAttribute("aria-valuemin", "0");
    this.#segments[SEG_MIN].setAttribute("aria-valuemax", "59");
    this.#segments[SEG_SEC].setAttribute("aria-valuenow", String(this.#seconds));
    this.#segments[SEG_SEC].setAttribute("aria-valuemin", "0");
    this.#segments[SEG_SEC].setAttribute("aria-valuemax", "59");

    // Filled state
    const filledAttr = this.#filled ? "" : null;
    for (const seg of this.#segments) {
      if (filledAttr !== null) seg.setAttribute("data-filled", "");
      else seg.removeAttribute("data-filled");
    }

    // Period
    if (this.#periodEl) {
      this.#periodEl.textContent = this.#period;
      this.#periodEl.setAttribute("aria-valuenow", this.#period === "AM" ? "0" : "1");
      this.#periodEl.setAttribute("aria-valuetext", this.#period);
      if (this.#filled) this.#periodEl.setAttribute("data-filled", "");
      else this.#periodEl.removeAttribute("data-filled");
    }
  }
}

customElements.define("maneki-calendar-time", ManekiCalendarTime);
