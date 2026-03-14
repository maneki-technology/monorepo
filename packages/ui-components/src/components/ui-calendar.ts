import { STYLES } from "./ui-calendar.styles.js";
import "./ui-icon.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CalendarSize = "s" | "m" | "l";
export type CalendarMode = "single" | "range";
export type CalendarView = "daily" | "monthly";

/** Event data for a specific date. */
export interface CalendarEvent {
  color: string;
  label?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_SHORT_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Get the day-of-week index (0=Mon, 6=Sun) for a Date. */
function mondayBasedDay(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Check if two dates are the same calendar day. */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Generate the 42-cell grid (6 weeks) for a given month. */
function generateMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = mondayBasedDay(firstDay);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(year, month, 1 - startOffset + i));
  }
  return cells;
}

// ─── Component ───────────────────────────────────────────────────────────────

export class UiCalendar extends HTMLElement {
  static readonly observedAttributes = ["size", "value", "min", "max", "mode", "range-start", "range-end", "view"];

  #displayYear: number;
  #displayMonth: number; // 0-indexed
  #selectedDate: Date | null = null;
  #rangeStart: Date | null = null;
  #rangeEnd: Date | null = null;
  #hoverDate: Date | null = null;
  #events: Map<string, CalendarEvent[]> = new Map();
  #internalUpdate = false;
  #today: Date;

  // DOM refs
  #headerLabel!: HTMLElement;
  #dayGrid!: HTMLElement;
  #dayCells: HTMLElement[] = [];
  #monthGrid!: HTMLElement;
  #dowRow!: HTMLElement;
  #legendContainer!: HTMLElement;
  #prevBtn!: HTMLButtonElement;
  #nextBtn!: HTMLButtonElement;

  constructor() {
    super();
    const now = new Date();
    this.#today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    this.#displayYear = now.getFullYear();
    this.#displayMonth = now.getMonth();

    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

    const calendar = document.createElement("div");
    calendar.className = "calendar";

    // Header
    const header = document.createElement("div");
    header.className = "header";

    this.#prevBtn = document.createElement("button");
    this.#prevBtn.className = "nav-btn";
    this.#prevBtn.setAttribute("aria-label", "Previous month");
    this.#prevBtn.type = "button";

    this.#headerLabel = document.createElement("div");
    this.#headerLabel.className = "header-label";
    this.#headerLabel.setAttribute("role", "heading");
    this.#headerLabel.setAttribute("aria-level", "2");

    this.#nextBtn = document.createElement("button");
    this.#nextBtn.className = "nav-btn";
    this.#nextBtn.setAttribute("aria-label", "Next month");
    this.#nextBtn.type = "button";

    header.append(this.#prevBtn, this.#headerLabel, this.#nextBtn);

    // DOW row
    this.#dowRow = document.createElement("div");
    this.#dowRow.className = "dow-row";
    this.#dowRow.setAttribute("role", "row");
    for (const label of DOW_LABELS) {
      const cell = document.createElement("div");
      cell.className = "dow-cell";
      cell.setAttribute("role", "columnheader");
      cell.setAttribute("aria-label", label);
      cell.textContent = label;
      this.#dowRow.appendChild(cell);
    }

    // Day grid
    this.#dayGrid = document.createElement("div");
    this.#dayGrid.className = "day-grid";
    this.#dayGrid.setAttribute("role", "grid");
    this.#dayGrid.setAttribute("aria-label", "Calendar");

    // Pre-create 42 day cells (6 weeks × 7 days)
    for (let i = 0; i < 42; i++) {
      const cell = document.createElement("div");
      cell.className = "day-cell";
      cell.setAttribute("role", "gridcell");
      this.#dayCells.push(cell);
      this.#dayGrid.appendChild(cell);
    }

    // Month grid (for monthly view)
    this.#monthGrid = document.createElement("div");
    this.#monthGrid.className = "month-grid";
    this.#monthGrid.setAttribute("role", "grid");
    this.#monthGrid.setAttribute("aria-label", "Months");
    this.#monthGrid.style.display = "none";

    // Legend container (for events)
    this.#legendContainer = document.createElement("div");
    this.#legendContainer.className = "legend";
    this.#legendContainer.style.display = "none";
    calendar.append(header, this.#dowRow, this.#dayGrid, this.#monthGrid, this.#legendContainer);
    shadow.appendChild(calendar);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) {
      this.setAttribute("size", "m");
    }
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "group");
    }

    // Add icons in connectedCallback (not constructor)
    this.#setupIcons();

    // Parse initial value
    if (this.hasAttribute("value")) {
      this.#parseValue(this.getAttribute("value"));
    }
    // Parse initial range
    if (this.hasAttribute("range-start")) {
      this.#rangeStart = this.#parseDate(this.getAttribute("range-start"));
      if (this.#rangeStart) {
        this.#displayYear = this.#rangeStart.getFullYear();
        this.#displayMonth = this.#rangeStart.getMonth();
      }
    }
    if (this.hasAttribute("range-end")) {
      this.#rangeEnd = this.#parseDate(this.getAttribute("range-end"));
    }

    // Event listeners
    this.#prevBtn.addEventListener("click", this.#onPrev);
    this.#nextBtn.addEventListener("click", this.#onNext);
    this.#dayGrid.addEventListener("click", this.#onDayClick);
    this.#dayGrid.addEventListener("mouseover", this.#onDayHover);
    this.#dayGrid.addEventListener("mouseleave", this.#onDayLeave);
    this.#monthGrid.addEventListener("click", this.#onMonthClick);
    this.#headerLabel.addEventListener("click", this.#onHeaderClick);

    this.#render();
  }

  disconnectedCallback(): void {
    this.#prevBtn.removeEventListener("click", this.#onPrev);
    this.#nextBtn.removeEventListener("click", this.#onNext);
    this.#dayGrid.removeEventListener("click", this.#onDayClick);
    this.#dayGrid.removeEventListener("mouseover", this.#onDayHover);
    this.#dayGrid.removeEventListener("mouseleave", this.#onDayLeave);
    this.#monthGrid.removeEventListener("click", this.#onMonthClick);
    this.#headerLabel.removeEventListener("click", this.#onHeaderClick);
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (!this.isConnected) return;
    if (this.#internalUpdate) return;
    if (oldValue === newValue) return;
    if (name === "value") {
      this.#parseValue(newValue);
      this.#render();
    }
    if (name === "range-start") {
      this.#rangeStart = this.#parseDate(newValue);
      if (this.#rangeStart) {
        this.#displayYear = this.#rangeStart.getFullYear();
        this.#displayMonth = this.#rangeStart.getMonth();
      }
      this.#render();
    }
    if (name === "range-end") {
      this.#rangeEnd = this.#parseDate(newValue);
      this.#render();
    }
    if (name === "min" || name === "max" || name === "mode" || name === "view") {
      this.#render();
    }
  }

  // ─── Properties ────────────────────────────────────────────────────────

  get size(): CalendarSize {
    return (this.getAttribute("size") as CalendarSize) || "m";
  }

  set size(value: CalendarSize) {
    this.setAttribute("size", value);
  }

  get value(): string {
    return this.getAttribute("value") || "";
  }

  set value(v: string) {
    this.setAttribute("value", v);
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

  /** The currently displayed year. */
  get displayYear(): number {
    return this.#displayYear;
  }

  /** The currently displayed month (0-indexed). */
  get displayMonth(): number {
    return this.#displayMonth;
  }

  /** The selected Date object, or null. */
  get selectedDate(): Date | null {
    return this.#selectedDate;
  }

  get mode(): CalendarMode {
    return (this.getAttribute("mode") as CalendarMode) || "single";
  }

  set mode(v: CalendarMode) {
    this.setAttribute("mode", v);
  }

  get rangeStart(): string {
    return this.getAttribute("range-start") || "";
  }

  set rangeStart(v: string) {
    this.setAttribute("range-start", v);
  }

  get rangeEnd(): string {
    return this.getAttribute("range-end") || "";
  }

  set rangeEnd(v: string) {
    this.setAttribute("range-end", v);
  }

  /** The range start Date, or null. */
  get rangeStartDate(): Date | null {
    return this.#rangeStart;
  }

  /** The range end Date, or null. */
  get rangeEndDate(): Date | null {
    return this.#rangeEnd;
  }

  get view(): CalendarView {
    return (this.getAttribute("view") as CalendarView) || "daily";
  }

  set view(v: CalendarView) {
    this.setAttribute("view", v);
  }

  /** Set events for specific dates. Key = "YYYY-MM-DD", value = array of CalendarEvent. */
  setEvents(events: Map<string, CalendarEvent[]>): void {
    this.#events = events;
    this.#render();
  }

  /** Clear all events. */
  clearEvents(): void {
    this.#events.clear();
    this.#render();
  }

  // ─── Navigation ────────────────────────────────────────────────────────

  #onPrev = (): void => {
    if (this.view === "monthly") {
      this.#displayYear--;
    } else {
      this.#displayMonth--;
      if (this.#displayMonth < 0) {
        this.#displayMonth = 11;
        this.#displayYear--;
      }
    }
    this.#render();
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { year: this.#displayYear, month: this.#displayMonth },
        bubbles: true,
      }),
    );
  };

  #onNext = (): void => {
    if (this.view === "monthly") {
      this.#displayYear++;
    } else {
      this.#displayMonth++;
      if (this.#displayMonth > 11) {
        this.#displayMonth = 0;
        this.#displayYear++;
      }
    }
    this.#render();
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { year: this.#displayYear, month: this.#displayMonth },
        bubbles: true,
      }),
    );
  };

  /** Navigate to a specific month/year programmatically. */
  navigateTo(year: number, month: number): void {
    this.#displayYear = year;
    this.#displayMonth = month;
    this.#render();
  }

  // ─── Header click (toggle daily/monthly) ───────────────────────────────

  #onHeaderClick = (): void => {
    if (this.view === "daily") {
      this.view = "monthly";
    } else {
      this.view = "daily";
    }
    this.#render();
  };

  // ─── Month click (monthly view) ───────────────────────────────────────

  #onMonthClick = (e: Event): void => {
    const target = (e.target as HTMLElement).closest(".month-cell") as HTMLElement | null;
    if (!target) return;
    const month = Number(target.dataset.month);
    if (isNaN(month)) return;
    this.#displayMonth = month;
    this.view = "daily";
    this.#render();
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: { year: this.#displayYear, month: this.#displayMonth },
        bubbles: true,
      }),
    );
  };

  // ─── Day click ─────────────────────────────────────────────────────────

  #onDayClick = (e: Event): void => {
    const target = (e.target as HTMLElement).closest(
      ".day-cell",
    ) as HTMLElement | null;
    if (!target || target.hasAttribute("data-disabled")) return;

    const dateStr = target.dataset.date;
    if (!dateStr) return;

    const date = new Date(dateStr + "T00:00:00");
    const iso = this.#formatISO(date);

    if (this.mode === "range") {
      this.#handleRangeClick(date, iso);
    } else {
      this.#handleSingleClick(date, iso);
    }
  };

  #handleSingleClick(date: Date, iso: string): void {
    this.#internalUpdate = true;
    this.#selectedDate = date;
    this.#displayYear = date.getFullYear();
    this.#displayMonth = date.getMonth();
    this.setAttribute("value", iso);
    this.#render();
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: iso, date },
        bubbles: true,
      }),
    );
    this.#internalUpdate = false;
  }

  #handleRangeClick(date: Date, iso: string): void {
    this.#internalUpdate = true;
    // If no start, or both start+end already set, begin new range
    if (!this.#rangeStart || this.#rangeEnd) {
      this.#rangeStart = date;
      this.#rangeEnd = null;
      this.setAttribute("range-start", iso);
      this.removeAttribute("range-end");
    } else {
      // Set end — ensure start <= end
      if (date < this.#rangeStart) {
        this.#rangeEnd = this.#rangeStart;
        this.#rangeStart = date;
        this.setAttribute("range-start", iso);
        this.setAttribute("range-end", this.#formatISO(this.#rangeEnd));
      } else {
        this.#rangeEnd = date;
        this.setAttribute("range-end", iso);
      }
    }
    this.#displayYear = date.getFullYear();
    this.#displayMonth = date.getMonth();
    this.#render();
    this.dispatchEvent(
      new CustomEvent("range-change", {
        detail: {
          start: this.#rangeStart ? this.#formatISO(this.#rangeStart) : null,
          end: this.#rangeEnd ? this.#formatISO(this.#rangeEnd) : null,
          startDate: this.#rangeStart,
          endDate: this.#rangeEnd,
        },
        bubbles: true,
      }),
    );
    this.#internalUpdate = false;
  }

  // ─── Hover (range preview) ─────────────────────────────────────────────

  #onDayHover = (e: Event): void => {
    if (this.mode !== "range" || !this.#rangeStart || this.#rangeEnd) return;
    const target = (e.target as HTMLElement).closest(".day-cell") as HTMLElement | null;
    if (!target || target.hasAttribute("data-disabled")) return;
    const dateStr = target.dataset.date;
    if (!dateStr) return;
    this.#hoverDate = new Date(dateStr + "T00:00:00");
    this.#render();
  };

  #onDayLeave = (): void => {
    if (this.#hoverDate) {
      this.#hoverDate = null;
      this.#render();
    }
  };

  // ─── Parsing ───────────────────────────────────────────────────────────

  #parseValue(val: string | null): void {
    if (!val) {
      this.#selectedDate = null;
      return;
    }
    const d = new Date(val + "T00:00:00");
    if (!isNaN(d.getTime())) {
      this.#selectedDate = d;
      this.#displayYear = d.getFullYear();
      this.#displayMonth = d.getMonth();
    }
  }

  #parseDate(val: string | null): Date | null {
    if (!val) return null;
    const d = new Date(val + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }

  #formatISO(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // ─── Icons ─────────────────────────────────────────────────────────────

  #setupIcons(): void {
    if (this.#prevBtn.querySelector("ui-icon")) return;

    const prevIcon = document.createElement("ui-icon");
    prevIcon.setAttribute("name", "arrow_back_ios");
    this.#prevBtn.appendChild(prevIcon);

    const nextIcon = document.createElement("ui-icon");
    nextIcon.setAttribute("name", "arrow_forward_ios");
    this.#nextBtn.appendChild(nextIcon);
  }

  // ─── Render ────────────────────────────────────────────────────────────

  #render(): void {
    const isMonthly = this.view === "monthly";

    // Update header
    if (isMonthly) {
      this.#headerLabel.textContent = `${this.#displayYear}`;
      this.#prevBtn.setAttribute("aria-label", "Previous year");
      this.#nextBtn.setAttribute("aria-label", "Next year");
    } else {
      this.#headerLabel.textContent = `${MONTH_NAMES[this.#displayMonth]} ${this.#displayYear}`;
      this.#prevBtn.setAttribute("aria-label", "Previous month");
      this.#nextBtn.setAttribute("aria-label", "Next month");
    }

    // Toggle grids
    this.#dowRow.style.display = isMonthly ? "none" : "";
    this.#dayGrid.style.display = isMonthly ? "none" : "";
    this.#monthGrid.style.display = isMonthly ? "" : "none";

    if (isMonthly) {
      this.#renderMonthly();
    } else {
      this.#renderDaily();
    }
    this.#renderLegend();
  }

  #renderDaily(): void {
    const minDate = this.#parseDate(this.min);
    const maxDate = this.#parseDate(this.max);
    const dates = generateMonthGrid(this.#displayYear, this.#displayMonth);

    for (let i = 0; i < 42; i++) {
      const cell = this.#dayCells[i];
      const date = dates[i];
      const iso = this.#formatISO(date);

      // Reset all data attributes
      cell.removeAttribute("data-outside");
      cell.removeAttribute("data-today");
      cell.removeAttribute("data-selected");
      cell.removeAttribute("data-disabled");
      cell.removeAttribute("data-range-start");
      cell.removeAttribute("data-range-end");
      cell.removeAttribute("data-in-range");
      cell.removeAttribute("data-range-hover");
      cell.removeAttribute("aria-selected");
      cell.removeAttribute("aria-disabled");
      cell.removeAttribute("aria-current");

      // Update content and basic attrs
      cell.textContent = String(date.getDate());
      cell.dataset.date = iso;
      cell.setAttribute("aria-label", date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }));

      // Outside current month
      if (date.getMonth() !== this.#displayMonth) {
        cell.setAttribute("data-outside", "");
      }

      // Today
      if (isSameDay(date, this.#today)) {
        cell.setAttribute("data-today", "");
        cell.setAttribute("aria-current", "date");
      }

      // Selected
      if (this.#selectedDate && isSameDay(date, this.#selectedDate)) {
        cell.setAttribute("data-selected", "");
        cell.setAttribute("aria-selected", "true");
      }

      // Disabled (min/max)
      const isDisabled =
        (minDate && date < minDate) || (maxDate && date > maxDate);
      if (isDisabled) {
        cell.setAttribute("data-disabled", "");
        cell.setAttribute("aria-disabled", "true");
      }

      // Range selection states
      if (this.mode === "range") {
        const rs = this.#rangeStart;
        const re = this.#rangeEnd;
        const hover = this.#hoverDate;

        if (rs && isSameDay(date, rs)) {
          cell.setAttribute("data-range-start", "");
          cell.setAttribute("aria-selected", "true");
        }
        if (re && isSameDay(date, re)) {
          cell.setAttribute("data-range-end", "");
          cell.setAttribute("aria-selected", "true");
        }

        const effectiveEnd = re || hover;
        if (rs && effectiveEnd) {
          const lo = rs < effectiveEnd ? rs : effectiveEnd;
          const hi = rs < effectiveEnd ? effectiveEnd : rs;
          if (date > lo && date < hi) {
            cell.setAttribute("data-in-range", "");
          }
          if (!re && hover) {
            if (isSameDay(date, hover)) {
              cell.setAttribute("data-range-hover", "");
            }
          }
        }
      }

      // Event dots — clear old, add new
      const oldDots = cell.querySelector(".event-dots");
      if (oldDots) oldDots.remove();
      const events = this.#events.get(iso);
      if (events && events.length > 0) {
        const dotsContainer = document.createElement("div");
        dotsContainer.className = "event-dots";
        const maxDots = Math.min(events.length, 3);
        for (let j = 0; j < maxDots; j++) {
          const dot = document.createElement("span");
          dot.className = "event-dot";
          dot.style.backgroundColor = events[j].color;
          dotsContainer.appendChild(dot);
        }
        cell.appendChild(dotsContainer);
      }

      // Tabindex
      const isFocusable =
        (this.#selectedDate && isSameDay(date, this.#selectedDate)) ||
        (!this.#selectedDate && isSameDay(date, this.#today));
      cell.setAttribute("tabindex", isFocusable ? "0" : "-1");
    }
  }

  #renderMonthly(): void {
    this.#monthGrid.innerHTML = "";

    for (let m = 0; m < 12; m++) {
      const cell = document.createElement("div");
      cell.className = "month-cell";
      cell.setAttribute("role", "gridcell");
      cell.textContent = MONTH_SHORT_NAMES[m];
      cell.dataset.month = String(m);
      cell.setAttribute("aria-label", MONTH_NAMES[m]);

      if (m === this.#displayMonth) {
        cell.setAttribute("data-selected", "");
        cell.setAttribute("aria-selected", "true");
      }

      // Highlight current month of current year
      if (m === this.#today.getMonth() && this.#displayYear === this.#today.getFullYear()) {
        cell.setAttribute("data-today", "");
      }

      cell.setAttribute("tabindex", m === this.#displayMonth ? "0" : "-1");
      this.#monthGrid.appendChild(cell);
    }
  }

  #renderLegend(): void {
    // Collect unique event labels
    const legendItems: { color: string; label: string }[] = [];
    const seen = new Set<string>();
    for (const events of this.#events.values()) {
      for (const ev of events) {
        if (ev.label && !seen.has(ev.label)) {
          seen.add(ev.label);
          legendItems.push({ color: ev.color, label: ev.label });
        }
      }
    }

    if (legendItems.length === 0) {
      this.#legendContainer.style.display = "none";
      this.#legendContainer.innerHTML = "";
      return;
    }

    this.#legendContainer.style.display = "";
    this.#legendContainer.innerHTML = "";

    for (const item of legendItems) {
      const row = document.createElement("div");
      row.className = "legend-item";

      const dot = document.createElement("span");
      dot.className = "legend-dot";
      dot.style.backgroundColor = item.color;

      const label = document.createElement("span");
      label.className = "legend-label";
      label.textContent = item.label;

      row.append(dot, label);
      this.#legendContainer.appendChild(row);
    }
  }
}

customElements.define("ui-calendar", UiCalendar);
