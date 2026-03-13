import { STYLES } from "./ui-clock.styles.js";
import "./ui-icon.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ClockSize = "s" | "m" | "l";
export type ClockMode = "analog" | "24-hour";

// ─── Constants ───────────────────────────────────────────────────────────────

const CLOCK_NUMBERS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/** Clock face radius by size (inner radius for number positioning). */
const FACE_RADIUS: Record<string, number> = { s: 94, m: 98, l: 112 };
const NUMBER_RADIUS: Record<string, number> = { s: 72, m: 76, l: 88 };
const NUMBER_SIZE: Record<string, number> = { s: 24, m: 28, l: 32 };

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiClock extends HTMLElement {
  static readonly observedAttributes = ["size", "mode", "value"];

  #hour = 12;
  #minute = 0;
  #selecting: "hour" | "minute" = "hour";

  // DOM refs
  #clockContainer!: HTMLElement;
  #clockFace!: HTMLElement;
  #clockTrack!: HTMLElement;
  #clockCenter!: HTMLElement;
  #hourLabel!: HTMLElement;
  #minuteLabel!: HTMLElement;
  #digitalContainer!: HTMLElement;
  #hourInput!: HTMLInputElement;
  #minuteInput!: HTMLInputElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const picker = document.createElement("div");
    picker.className = "clock";

    // Hour/Minute toggle header
    const toggleRow = document.createElement("div");
    toggleRow.className = "toggle-row";

    this.#hourLabel = document.createElement("span");
    this.#hourLabel.className = "toggle-label toggle-active";
    this.#hourLabel.textContent = "12";

    const toggleSep = document.createElement("span");
    toggleSep.className = "toggle-sep";
    toggleSep.textContent = ":";

    this.#minuteLabel = document.createElement("span");
    this.#minuteLabel.className = "toggle-label";
    this.#minuteLabel.textContent = "00";

    toggleRow.append(this.#hourLabel, toggleSep, this.#minuteLabel);

    // Analog clock
    this.#clockContainer = document.createElement("div");
    this.#clockContainer.className = "clock-container";

    this.#clockFace = document.createElement("div");
    this.#clockFace.className = "clock-face";

    this.#clockTrack = document.createElement("div");
    this.#clockTrack.className = "clock-track";
    this.#clockFace.appendChild(this.#clockTrack);

    this.#clockCenter = document.createElement("div");
    this.#clockCenter.className = "clock-center";
    this.#clockFace.appendChild(this.#clockCenter);

    this.#clockContainer.appendChild(this.#clockFace);

    // Digital 24-hour
    this.#digitalContainer = document.createElement("div");
    this.#digitalContainer.className = "digital-container";
    this.#digitalContainer.style.display = "none";

    picker.append(toggleRow, this.#clockContainer, this.#digitalContainer);
    picker.append(toggleRow, this.#clockContainer, this.#digitalContainer);

    shadow.appendChild(picker);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) {
      this.setAttribute("size", "m");
    }
    if (!this.hasAttribute("mode")) {
      this.setAttribute("mode", "analog");
    }

    this.#parseValue(this.getAttribute("value"));
    this.#buildDigital();
    this.#render();

    this.#clockFace.addEventListener("click", this.#onClockClick);
    this.#hourLabel.addEventListener("click", () => {
      this.#selecting = "hour";
      this.#render();
    });
    this.#minuteLabel.addEventListener("click", () => {
      this.#selecting = "minute";
      this.#render();
    });
  }

  disconnectedCallback(): void {
    this.#clockFace.removeEventListener("click", this.#onClockClick);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (!this.isConnected) return;
    if (name === "value") {
      this.#parseValue(_newValue);
    }
    if (name === "mode") {
      this.#buildDigital();
    }
    this.#render();
  }

  // ─── Properties ────────────────────────────────────────────────────────

  get size(): ClockSize {
    return (this.getAttribute("size") as ClockSize) || "m";
  }

  set size(v: ClockSize) {
    this.setAttribute("size", v);
  }

  get mode(): ClockMode {
    return (this.getAttribute("mode") as ClockMode) || "analog";
  }

  set mode(v: ClockMode) {
    this.setAttribute("mode", v);
  }

  get value(): string {
    return this.getAttribute("value") || "";
  }

  set value(v: string) {
    this.setAttribute("value", v);
  }

  /** Reset selection to hour mode. */
  resetSelection(): void {
    this.#selecting = "hour";
    this.#render();
  }

  get hour(): number {
    return this.#hour;
  }

  get minute(): number {
    return this.#minute;
  }

  // ─── Parsing ───────────────────────────────────────────────────────────

  #parseValue(val: string | null): void {
    if (!val) return;
    const parts = val.split(":");
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h)) this.#hour = Math.max(0, Math.min(23, h));
      if (!isNaN(m)) this.#minute = Math.max(0, Math.min(59, m));
    }
  }

  #formatValue(): string {
    return `${String(this.#hour).padStart(2, "0")}:${String(this.#minute).padStart(2, "0")}`;
  }

  // ─── Analog clock rendering ────────────────────────────────────────────

  #renderAnalog(): void {
    // Remove old numbers
    this.#clockFace.querySelectorAll(".clock-number").forEach((n) => n.remove());

    const size = this.size;
    const faceR = FACE_RADIUS[size] || FACE_RADIUS.m;
    const numR = NUMBER_RADIUS[size] || NUMBER_RADIUS.m;
    const numSize = NUMBER_SIZE[size] || NUMBER_SIZE.m;
    const half = numSize / 2;

    const isHourMode = this.#selecting === "hour";
    const numbers = isHourMode ? CLOCK_NUMBERS : Array.from({ length: 12 }, (_, i) => i * 5);

    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x = faceR + numR * Math.cos(angle) - half;
      const y = faceR + numR * Math.sin(angle) - half;

      const num = document.createElement("div");
      num.className = "clock-number";
      num.style.left = `${x}px`;
      num.style.top = `${y}px`;
      num.textContent = isHourMode
        ? String(numbers[i])
        : String(numbers[i]).padStart(2, "0");
      num.dataset.value = String(numbers[i]);

      const currentVal = isHourMode ? this.#hour % 12 || 12 : this.#minute;
      if (numbers[i] === currentVal || (!isHourMode && numbers[i] === Math.round(currentVal / 5) * 5)) {
        num.setAttribute("data-selected", "");
      }

      this.#clockFace.appendChild(num);
    }

    // Track line
    const selectedVal = isHourMode ? (this.#hour % 12 || 12) : this.#minute;
    const trackAngle = isHourMode
      ? (selectedVal * 30 - 90)
      : (selectedVal * 6 - 90);
    const trackLen = numR;

    this.#clockTrack.style.width = `${trackLen}px`;
    this.#clockTrack.style.transform = `rotate(${trackAngle}deg)`;
  }

  // ─── Digital 24h rendering ─────────────────────────────────────────────

  #buildDigital(): void {
    this.#digitalContainer.innerHTML = "";

    // Hour row
    const hourRow = document.createElement("div");
    hourRow.className = "digital-row";

    const hourLabel = document.createElement("div");
    hourLabel.className = "digital-label";
    hourLabel.textContent = "Hour";

    const hourDecBtn = document.createElement("button");
    hourDecBtn.className = "spin-btn";
    hourDecBtn.type = "button";
    const hourDecIcon = document.createElement("ui-icon");
    hourDecIcon.setAttribute("name", "chevron_left");
    hourDecBtn.appendChild(hourDecIcon);

    this.#hourInput = document.createElement("input");
    this.#hourInput.className = "digital-input";
    this.#hourInput.type = "text";
    this.#hourInput.setAttribute("aria-label", "Hour");

    const hourIncBtn = document.createElement("button");
    hourIncBtn.className = "spin-btn";
    hourIncBtn.type = "button";
    const hourIncIcon = document.createElement("ui-icon");
    hourIncIcon.setAttribute("name", "chevron_right");
    hourIncBtn.appendChild(hourIncIcon);

    hourRow.append(hourDecBtn, this.#hourInput, hourIncBtn);

    // Minute row
    const minRow = document.createElement("div");
    minRow.className = "digital-row";

    const minLabel = document.createElement("div");
    minLabel.className = "digital-label";
    minLabel.textContent = "Minute";

    const minDecBtn = document.createElement("button");
    minDecBtn.className = "spin-btn";
    minDecBtn.type = "button";
    const minDecIcon = document.createElement("ui-icon");
    minDecIcon.setAttribute("name", "chevron_left");
    minDecBtn.appendChild(minDecIcon);

    this.#minuteInput = document.createElement("input");
    this.#minuteInput.className = "digital-input";
    this.#minuteInput.type = "text";
    this.#minuteInput.setAttribute("aria-label", "Minute");

    const minIncBtn = document.createElement("button");
    minIncBtn.className = "spin-btn";
    minIncBtn.type = "button";
    const minIncIcon = document.createElement("ui-icon");
    minIncIcon.setAttribute("name", "chevron_right");
    minIncBtn.appendChild(minIncIcon);

    minRow.append(minDecBtn, this.#minuteInput, minIncBtn);

    this.#digitalContainer.append(hourLabel, hourRow, minLabel, minRow);

    // Spin button events
    hourDecBtn.addEventListener("click", () => {
      this.#hour = (this.#hour + 23) % 24;
      this.#render();
      this.#emitInput();
    });
    hourIncBtn.addEventListener("click", () => {
      this.#hour = (this.#hour + 1) % 24;
      this.#render();
      this.#emitInput();
    });
    minDecBtn.addEventListener("click", () => {
      this.#minute = (this.#minute + 59) % 60;
      this.#render();
      this.#emitInput();
    });
    minIncBtn.addEventListener("click", () => {
      this.#minute = (this.#minute + 1) % 60;
      this.#render();
      this.#emitInput();
    });

    // Input change events
    this.#hourInput.addEventListener("change", () => {
      const v = parseInt(this.#hourInput.value, 10);
      if (!isNaN(v)) this.#hour = Math.max(0, Math.min(23, v));
      this.#render();
      this.#emitInput();
    });
    this.#minuteInput.addEventListener("change", () => {
      const v = parseInt(this.#minuteInput.value, 10);
      if (!isNaN(v)) this.#minute = Math.max(0, Math.min(59, v));
      this.#render();
      this.#emitInput();
    });
  }

  // ─── Render ────────────────────────────────────────────────────────────

  #render(): void {
    const isAnalog = this.mode === "analog";
    this.#clockContainer.style.display = isAnalog ? "" : "none";
    this.#digitalContainer.style.display = isAnalog ? "none" : "";

    // Update toggle labels
    this.#hourLabel.textContent = String(this.#hour).padStart(2, "0");
    this.#minuteLabel.textContent = String(this.#minute).padStart(2, "0");
    this.#hourLabel.classList.toggle("toggle-active", this.#selecting === "hour");
    this.#minuteLabel.classList.toggle("toggle-active", this.#selecting === "minute");

    if (isAnalog) {
      this.#renderAnalog();
    } else {
      if (this.#hourInput) {
        this.#hourInput.value = String(this.#hour).padStart(2, "0");
      }
      if (this.#minuteInput) {
        this.#minuteInput.value = String(this.#minute).padStart(2, "0");
      }
    }
  }

  // ─── Events ────────────────────────────────────────────────────────────

  #onClockClick = (e: Event): void => {
    const target = (e.target as HTMLElement).closest(".clock-number") as HTMLElement | null;
    if (!target) return;
    const val = Number(target.dataset.value);
    if (isNaN(val)) return;

    if (this.#selecting === "hour") {
      this.#hour = val === 12 ? 0 : val; // 12 → 0 in 24h
      this.#selecting = "minute";
      this.#render();
      this.#emitInput();
    } else {
      this.#minute = val;
      // Stay on minute — don't reset to hour
      this.#render();
      this.#emitInput();
      // Signal that both hour and minute have been selected
      this.dispatchEvent(
        new CustomEvent("time-complete", {
          detail: { hour: this.#hour, minute: this.#minute, value: this.#formatValue() },
          bubbles: true,
        }),
      );
    }
  };

  #emitInput(): void {
    this.dispatchEvent(
      new CustomEvent("time-input", {
        detail: { hour: this.#hour, minute: this.#minute, value: this.#formatValue() },
        bubbles: true,
      }),
    );
  }

}

customElements.define("ui-clock", UiClock);
