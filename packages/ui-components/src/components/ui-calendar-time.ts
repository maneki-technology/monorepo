import { STYLES } from "./ui-calendar-time.styles.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CalendarTimeSize = "s" | "m" | "l";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiCalendarTime extends HTMLElement {
  static readonly observedAttributes = ["size", "value"];

  #hour = 12;
  #minute = 0;
  #isPM = false;

  // DOM refs
  #hourInput!: HTMLInputElement;
  #minuteInput!: HTMLInputElement;
  #amLabel!: HTMLElement;
  #pmLabel!: HTMLElement;
  #switchEl!: HTMLElement;
  #switchHandle!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const container = document.createElement("div");
    container.className = "container";

    // Separator line
    const separator = document.createElement("div");
    separator.className = "separator";
    container.appendChild(separator);

    // Time inputs group
    const timeGroup = document.createElement("div");
    timeGroup.className = "time-group";

    this.#hourInput = document.createElement("input");
    this.#hourInput.className = "time-input";
    this.#hourInput.type = "text";
    this.#hourInput.inputMode = "numeric";
    this.#hourInput.maxLength = 2;
    this.#hourInput.setAttribute("aria-label", "Hour");

    const colon = document.createElement("span");
    colon.className = "colon";
    colon.textContent = ":";

    this.#minuteInput = document.createElement("input");
    this.#minuteInput.className = "time-input";
    this.#minuteInput.type = "text";
    this.#minuteInput.inputMode = "numeric";
    this.#minuteInput.maxLength = 2;
    this.#minuteInput.setAttribute("aria-label", "Minute");

    timeGroup.append(this.#hourInput, colon, this.#minuteInput);

    // AM/PM toggle group
    const toggleGroup = document.createElement("div");
    toggleGroup.className = "toggle-group";

    this.#amLabel = document.createElement("span");
    this.#amLabel.className = "toggle-label";
    this.#amLabel.textContent = "AM";

    this.#switchEl = document.createElement("div");
    this.#switchEl.className = "switch";
    this.#switchEl.setAttribute("role", "switch");
    this.#switchEl.setAttribute("tabindex", "0");
    this.#switchEl.setAttribute("aria-label", "Toggle AM/PM");

    const track = document.createElement("div");
    track.className = "switch-track";

    this.#switchHandle = document.createElement("div");
    this.#switchHandle.className = "switch-handle";

    this.#switchEl.append(track, this.#switchHandle);

    this.#pmLabel = document.createElement("span");
    this.#pmLabel.className = "toggle-label";
    this.#pmLabel.textContent = "PM";

    toggleGroup.append(this.#amLabel, this.#switchEl, this.#pmLabel);

    container.append(timeGroup, toggleGroup);
    shadow.appendChild(container);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) {
      this.setAttribute("size", "m");
    }
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "group");
    }

    // Parse initial value
    if (this.hasAttribute("value")) {
      this.#parseValue(this.getAttribute("value"));
    }

    // Event listeners
    this.#hourInput.addEventListener("change", this.#onHourChange);
    this.#minuteInput.addEventListener("change", this.#onMinuteChange);
    this.#hourInput.addEventListener("keydown", this.#onInputKeydown);
    this.#minuteInput.addEventListener("keydown", this.#onInputKeydown);
    this.#switchEl.addEventListener("click", this.#onToggle);
    this.#switchEl.addEventListener("keydown", this.#onSwitchKeydown);
    this.#amLabel.addEventListener("click", this.#onAMClick);
    this.#pmLabel.addEventListener("click", this.#onPMClick);

    this.#updateDisplay();
  }

  disconnectedCallback(): void {
    this.#hourInput.removeEventListener("change", this.#onHourChange);
    this.#minuteInput.removeEventListener("change", this.#onMinuteChange);
    this.#hourInput.removeEventListener("keydown", this.#onInputKeydown);
    this.#minuteInput.removeEventListener("keydown", this.#onInputKeydown);
    this.#switchEl.removeEventListener("click", this.#onToggle);
    this.#switchEl.removeEventListener("keydown", this.#onSwitchKeydown);
    this.#amLabel.removeEventListener("click", this.#onAMClick);
    this.#pmLabel.removeEventListener("click", this.#onPMClick);
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (!this.isConnected) return;
    if (oldValue === newValue) return;
    if (name === "value") {
      this.#parseValue(newValue);
      this.#updateDisplay();
    }
  }

  // ─── Properties ────────────────────────────────────────────────────────

  get size(): CalendarTimeSize {
    return (this.getAttribute("size") as CalendarTimeSize) || "m";
  }

  set size(value: CalendarTimeSize) {
    this.setAttribute("size", value);
  }

  /** Value in "HH:MM" 24-hour format. */
  get value(): string {
    return this.#formatValue();
  }

  set value(v: string) {
    this.setAttribute("value", v);
  }

  /** The current hour in 24-hour format (0-23). */
  get hour24(): number {
    if (this.#isPM) {
      return this.#hour === 12 ? 12 : this.#hour + 12;
    }
    return this.#hour === 12 ? 0 : this.#hour;
  }

  /** The current minute (0-59). */
  get minute(): number {
    return this.#minute;
  }

  // ─── Parsing ───────────────────────────────────────────────────────────

  #parseValue(val: string | null): void {
    if (!val) return;
    const match = val.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return;

    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (h < 0 || h > 23 || m < 0 || m > 59) return;

    this.#minute = m;

    // Convert 24h to 12h
    if (h === 0) {
      this.#hour = 12;
      this.#isPM = false;
    } else if (h === 12) {
      this.#hour = 12;
      this.#isPM = true;
    } else if (h > 12) {
      this.#hour = h - 12;
      this.#isPM = true;
    } else {
      this.#hour = h;
      this.#isPM = false;
    }
  }

  #formatValue(): string {
    const h24 = this.hour24;
    return `${String(h24).padStart(2, "0")}:${String(this.#minute).padStart(2, "0")}`;
  }

  // ─── Events ────────────────────────────────────────────────────────────

  #onHourChange = (): void => {
    let h = parseInt(this.#hourInput.value, 10);
    if (isNaN(h) || h < 1) h = 12;
    if (h > 12) h = 12;
    this.#hour = h;
    this.#updateDisplay();
    this.#emitChange();
  };

  #onMinuteChange = (): void => {
    let m = parseInt(this.#minuteInput.value, 10);
    if (isNaN(m) || m < 0) m = 0;
    if (m > 59) m = 59;
    this.#minute = m;
    this.#updateDisplay();
    this.#emitChange();
  };

  #onInputKeydown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLInputElement;
    const isHour = target === this.#hourInput;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isHour) {
        this.#hour = this.#hour >= 12 ? 1 : this.#hour + 1;
      } else {
        this.#minute = this.#minute >= 59 ? 0 : this.#minute + 1;
      }
      this.#updateDisplay();
      this.#emitChange();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (isHour) {
        this.#hour = this.#hour <= 1 ? 12 : this.#hour - 1;
      } else {
        this.#minute = this.#minute <= 0 ? 59 : this.#minute - 1;
      }
      this.#updateDisplay();
      this.#emitChange();
    }
  };

  #onToggle = (): void => {
    this.#isPM = !this.#isPM;
    this.#updateDisplay();
    this.#emitChange();
  };

  #onSwitchKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.#onToggle();
    }
  };

  #onAMClick = (): void => {
    if (this.#isPM) {
      this.#isPM = false;
      this.#updateDisplay();
      this.#emitChange();
    }
  };

  #onPMClick = (): void => {
    if (!this.#isPM) {
      this.#isPM = true;
      this.#updateDisplay();
      this.#emitChange();
    }
  };

  #emitChange(): void {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: this.#formatValue(), hour24: this.hour24, minute: this.#minute },
        bubbles: true,
      }),
    );
  }

  // ─── Display ───────────────────────────────────────────────────────────

  #updateDisplay(): void {
    this.#hourInput.value = String(this.#hour).padStart(2, "0");
    this.#minuteInput.value = String(this.#minute).padStart(2, "0");

    // AM/PM toggle state
    if (this.#isPM) {
      this.#switchEl.setAttribute("data-pm", "");
      this.#switchEl.setAttribute("aria-checked", "true");
      this.#pmLabel.setAttribute("data-active", "");
      this.#amLabel.removeAttribute("data-active");
    } else {
      this.#switchEl.removeAttribute("data-pm");
      this.#switchEl.setAttribute("aria-checked", "false");
      this.#amLabel.setAttribute("data-active", "");
      this.#pmLabel.removeAttribute("data-active");
    }
  }
}

customElements.define("ui-calendar-time", UiCalendarTime);
