import { STYLES } from "./calendar.styles.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CalendarSize = "s" | "m" | "l";
export type CalendarView = "days" | "months" | "years";

export interface CalendarEvent {
  date: string;
  color?: string;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const CHEVRON_LEFT = `<svg viewBox="0 0 16 16"><path d="M10 12L6 8l4-4"/></svg>`;
const CHEVRON_RIGHT = `<svg viewBox="0 0 16 16"><path d="M6 4l4 4-4 4"/></svg>`;
const CHEVRON_EXPAND = `<svg viewBox="0 0 12 12"><path d="M4.5 3l3 3-3 3"/></svg>`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(val: string | null): Date | null {
  if (!val) return null;
  const d = new Date(val + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getDOWLabels(locale: string, firstDay: number): string[] {
  const labels: string[] = [];
  // Jan 4 2015 is a Sunday (day 0)
  for (let i = 0; i < 7; i++) {
    const d = new Date(2015, 0, 4 + ((firstDay + i) % 7));
    labels.push(d.toLocaleDateString(locale, { weekday: "short" }).slice(0, 2));
  }
  return labels;
}

function getMonthName(locale: string, month: number): string {
  return new Date(2024, month, 1).toLocaleDateString(locale, { month: "long" });
}

function getShortMonthName(locale: string, month: number): string {
  return new Date(2024, month, 1).toLocaleDateString(locale, { month: "short" });
}

/** Generate the grid cells for a month. Returns 6 rows × 7 cols = 42 dates. */
function generateMonthGrid(year: number, month: number, firstDay: number): Date[] {
  const first = new Date(year, month, 1);
  const startDow = (first.getDay() - firstDay + 7) % 7;
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(year, month, 1 - startDow + i));
  }
  return cells;
}

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class ManekiCalendar extends HTMLElement {
  static readonly observedAttributes = [
    "size", "value", "min", "max", "locale", "first-day-of-week",
    "show-outside-days", "view", "range", "range-start", "range-end",
  ];

  // ─── State ──────────────────────────────────────────────────────────────

  #displayYear: number;
  #displayMonth: number;
  #selectedDate: Date | null = null;
  #rangeStart: Date | null = null;
  #rangeEnd: Date | null = null;
  #hoverDate: Date | null = null;
  #events: CalendarEvent[] = [];
  #internalUpdate = false;
  #today: Date;
  #focusedDate: Date | null = null;
  #yearPageStart: number;

  // ─── DOM refs ───────────────────────────────────────────────────────────

  #headerLabel!: HTMLElement;
  #monthSpan!: HTMLSpanElement;
  #yearSpan!: HTMLSpanElement;
  #chevronExpand!: SVGElement;
  #prevBtn!: HTMLButtonElement;
  #nextBtn!: HTMLButtonElement;
  #dowRow!: HTMLElement;
  #dayGrid!: HTMLElement;
  #monthGrid!: HTMLElement;
  #yearGrid!: HTMLElement;

  constructor() {
    super();
    const now = new Date();
    this.#today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    this.#displayYear = now.getFullYear();
    this.#displayMonth = now.getMonth();
    this.#yearPageStart = this.#displayYear - (this.#displayYear % 12);

    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const calendar = document.createElement("div");
    calendar.className = "calendar";

    // Header
    const header = document.createElement("div");
    header.className = "header";

    this.#prevBtn = document.createElement("button");
    this.#prevBtn.className = "nav-btn";
    this.#prevBtn.type = "button";
    this.#prevBtn.innerHTML = CHEVRON_LEFT;

    this.#headerLabel = document.createElement("div");
    this.#headerLabel.className = "header-label";
    this.#headerLabel.setAttribute("role", "heading");
    this.#headerLabel.setAttribute("aria-level", "2");

    // Month and year as separate spans for Figma-accurate layout
    this.#monthSpan = document.createElement("span");
    this.#yearSpan = document.createElement("span");
    this.#headerLabel.appendChild(this.#monthSpan);
    this.#headerLabel.appendChild(this.#yearSpan);

    // Chevron expand icon (inline SVG)
    const chevronWrap = document.createElement("span");
    chevronWrap.innerHTML = CHEVRON_EXPAND;
    this.#chevronExpand = chevronWrap.firstElementChild as SVGElement;
    this.#chevronExpand.classList.add("chevron-expand");
    this.#headerLabel.appendChild(this.#chevronExpand);

    this.#nextBtn = document.createElement("button");
    this.#nextBtn.className = "nav-btn";
    this.#nextBtn.type = "button";
    this.#nextBtn.innerHTML = CHEVRON_RIGHT;

    // Nav buttons grouped on the right
    const navGroup = document.createElement("div");
    navGroup.className = "nav-group";
    navGroup.append(this.#prevBtn, this.#nextBtn);

    header.append(this.#headerLabel, navGroup);

    // DOW row
    this.#dowRow = document.createElement("div");
    this.#dowRow.className = "dow-row";
    this.#dowRow.setAttribute("role", "row");

    // Day grid
    this.#dayGrid = document.createElement("div");
    this.#dayGrid.className = "day-grid";
    this.#dayGrid.setAttribute("role", "grid");
    this.#dayGrid.setAttribute("aria-label", "Calendar");
    this.#dayGrid.setAttribute("tabindex", "0");

    // Month grid
    this.#monthGrid = document.createElement("div");
    this.#monthGrid.className = "month-grid";
    this.#monthGrid.setAttribute("role", "grid");
    this.#monthGrid.setAttribute("aria-label", "Months");
    this.#monthGrid.style.display = "none";

    // Year grid
    this.#yearGrid = document.createElement("div");
    this.#yearGrid.className = "year-grid";
    this.#yearGrid.setAttribute("role", "grid");
    this.#yearGrid.setAttribute("aria-label", "Years");
    this.#yearGrid.style.display = "none";

    calendar.append(header, this.#dowRow, this.#dayGrid, this.#monthGrid, this.#yearGrid);
    shadow.appendChild(calendar);
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "group");
    }

    // Parse initial attributes
    if (this.hasAttribute("value")) {
      this.#parseValue(this.getAttribute("value"));
    }
    if (this.hasAttribute("range-start")) {
      this.#rangeStart = parseDate(this.getAttribute("range-start"));
      if (this.#rangeStart) {
        this.#displayYear = this.#rangeStart.getFullYear();
        this.#displayMonth = this.#rangeStart.getMonth();
      }
    }
    if (this.hasAttribute("range-end")) {
      this.#rangeEnd = parseDate(this.getAttribute("range-end"));
    }
    if (this.hasAttribute("view")) {
      const v = this.getAttribute("view") as CalendarView;
      if (v === "months" || v === "years") {
        this.#chevronExpand.classList.add("rotated");
      }
    }

    // Event listeners
    this.#prevBtn.addEventListener("click", this.#onPrev);
    this.#nextBtn.addEventListener("click", this.#onNext);
    this.#dayGrid.addEventListener("click", this.#onDayClick);
    this.#dayGrid.addEventListener("mouseover", this.#onDayHover);
    this.#dayGrid.addEventListener("mouseleave", this.#onDayLeave);
    this.#dayGrid.addEventListener("keydown", this.#onDayKeydown);
    this.#monthGrid.addEventListener("click", this.#onMonthClick);
    this.#monthGrid.addEventListener("keydown", this.#onMonthKeydown);
    this.#yearGrid.addEventListener("click", this.#onYearClick);
    this.#yearGrid.addEventListener("keydown", this.#onYearKeydown);
    this.#headerLabel.addEventListener("click", this.#onHeaderClick);

    this.#render();
  }

  disconnectedCallback(): void {
    this.#prevBtn.removeEventListener("click", this.#onPrev);
    this.#nextBtn.removeEventListener("click", this.#onNext);
    this.#dayGrid.removeEventListener("click", this.#onDayClick);
    this.#dayGrid.removeEventListener("mouseover", this.#onDayHover);
    this.#dayGrid.removeEventListener("mouseleave", this.#onDayLeave);
    this.#dayGrid.removeEventListener("keydown", this.#onDayKeydown);
    this.#monthGrid.removeEventListener("click", this.#onMonthClick);
    this.#monthGrid.removeEventListener("keydown", this.#onMonthKeydown);
    this.#yearGrid.removeEventListener("click", this.#onYearClick);
    this.#yearGrid.removeEventListener("keydown", this.#onYearKeydown);
    this.#headerLabel.removeEventListener("click", this.#onHeaderClick);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (!this.isConnected || this.#internalUpdate || oldValue === newValue) return;
    if (name === "value") {
      this.#parseValue(newValue);
    } else if (name === "range-start") {
      this.#rangeStart = parseDate(newValue);
      if (this.#rangeStart) {
        this.#displayYear = this.#rangeStart.getFullYear();
        this.#displayMonth = this.#rangeStart.getMonth();
      }
    } else if (name === "range-end") {
      this.#rangeEnd = parseDate(newValue);
    } else if (name === "view") {
      const isExpanded = newValue === "months" || newValue === "years";
      this.#chevronExpand.classList.toggle("rotated", isExpanded);
      if (newValue === "years") {
        this.#yearPageStart = this.#displayYear - (this.#displayYear % 12);
      }
    }
    this.#render();
  }

  // ─── Properties ────────────────────────────────────────────────────────

  get size(): CalendarSize {
    return (this.getAttribute("size") as CalendarSize) || "m";
  }

  set size(v: CalendarSize) {
    this.setAttribute("size", v);
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

  get locale(): string {
    return this.getAttribute("locale") || "en-US";
  }

  set locale(v: string) {
    this.setAttribute("locale", v);
  }

  get firstDayOfWeek(): number {
    const v = this.getAttribute("first-day-of-week");
    return v !== null ? Number(v) : 0;
  }

  set firstDayOfWeek(v: number) {
    this.setAttribute("first-day-of-week", String(v));
  }

  get showOutsideDays(): boolean {
    return this.getAttribute("show-outside-days") !== "false";
  }

  set showOutsideDays(v: boolean) {
    this.setAttribute("show-outside-days", String(v));
  }

  get view(): CalendarView {
    return (this.getAttribute("view") as CalendarView) || "days";
  }

  set view(v: CalendarView) {
    this.setAttribute("view", v);
  }

  get range(): boolean {
    return this.hasAttribute("range");
  }

  set range(v: boolean) {
    if (v) this.setAttribute("range", "");
    else this.removeAttribute("range");
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

  get selectedDate(): Date | null {
    return this.#selectedDate;
  }

  get displayYear(): number {
    return this.#displayYear;
  }

  get displayMonth(): number {
    return this.#displayMonth;
  }

  set events(v: CalendarEvent[]) {
    this.#events = v;
    if (this.isConnected) this.#render();
  }

  get events(): CalendarEvent[] {
    return this.#events;
  }

  /** Navigate to a specific month/year. */
  navigateTo(year: number, month: number): void {
    this.#displayYear = year;
    this.#displayMonth = month;
    this.#render();
  }

  // ─── Parsing ──────────────────────────────────────────────────────────

  #parseValue(val: string | null): void {
    if (!val) {
      this.#selectedDate = null;
      return;
    }
    const d = parseDate(val);
    if (d) {
      this.#selectedDate = d;
      this.#displayYear = d.getFullYear();
      this.#displayMonth = d.getMonth();
    }
  }

  #isDisabled(date: Date): boolean {
    const minDate = parseDate(this.min);
    const maxDate = parseDate(this.max);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  }

  // ─── Navigation ───────────────────────────────────────────────────────

  #onPrev = (): void => {
    const v = this.view;
    if (v === "years") {
      this.#yearPageStart -= 12;
    } else if (v === "months") {
      this.#displayYear--;
    } else {
      this.#displayMonth--;
      if (this.#displayMonth < 0) {
        this.#displayMonth = 11;
        this.#displayYear--;
      }
    }
    this.#render();
    this.#emitMonthChange();
  };

  #onNext = (): void => {
    const v = this.view;
    if (v === "years") {
      this.#yearPageStart += 12;
    } else if (v === "months") {
      this.#displayYear++;
    } else {
      this.#displayMonth++;
      if (this.#displayMonth > 11) {
        this.#displayMonth = 0;
        this.#displayYear++;
      }
    }
    this.#render();
    this.#emitMonthChange();
  };

  #onHeaderClick = (): void => {
    const v = this.view;
    if (v === "days") {
      this.view = "months";
    } else if (v === "months") {
      this.view = "years";
    } else {
      this.view = "days";
    }
    this.#emitViewChange();
  };

  // ─── Day click / range ────────────────────────────────────────────────

  #onDayClick = (e: Event): void => {
    const target = (e.target as HTMLElement).closest(".day-cell") as HTMLElement | null;
    if (!target || target.hasAttribute("data-disabled") || target.hasAttribute("data-hidden")) return;
    const dateStr = target.dataset.date;
    if (!dateStr) return;
    const date = new Date(dateStr + "T00:00:00");
    const iso = formatISO(date);

    if (this.range) {
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
    this.dispatchEvent(new CustomEvent("date-select", {
      detail: { date: iso },
      bubbles: true,
      composed: true,
    }));
    this.#internalUpdate = false;
  }

  #handleRangeClick(date: Date, iso: string): void {
    this.#internalUpdate = true;
    if (!this.#rangeStart || this.#rangeEnd) {
      // Start new range
      this.#rangeStart = date;
      this.#rangeEnd = null;
      this.#hoverDate = null;
      this.setAttribute("range-start", iso);
      this.removeAttribute("range-end");
    } else {
      // Complete range — ensure start <= end
      if (date < this.#rangeStart) {
        this.#rangeEnd = this.#rangeStart;
        this.#rangeStart = date;
        this.setAttribute("range-start", iso);
        this.setAttribute("range-end", formatISO(this.#rangeEnd));
      } else {
        this.#rangeEnd = date;
        this.setAttribute("range-end", iso);
      }
      this.dispatchEvent(new CustomEvent("range-select", {
        detail: {
          start: formatISO(this.#rangeStart),
          end: formatISO(this.#rangeEnd),
        },
        bubbles: true,
        composed: true,
      }));
    }
    this.#render();
    this.#internalUpdate = false;
  }

  // ─── Hover (range preview) ────────────────────────────────────────────

  #onDayHover = (e: Event): void => {
    if (!this.range || !this.#rangeStart || this.#rangeEnd) return;
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

  // ─── Month click ──────────────────────────────────────────────────────

  #onMonthClick = (e: Event): void => {
    const target = (e.target as HTMLElement).closest(".month-cell") as HTMLElement | null;
    if (!target) return;
    const month = Number(target.dataset.month);
    if (isNaN(month)) return;
    this.#displayMonth = month;
    this.view = "days";
    this.#render();
    this.#emitViewChange();
    this.#emitMonthChange();
  };

  // ─── Year click ───────────────────────────────────────────────────────

  #onYearClick = (e: Event): void => {
    const target = (e.target as HTMLElement).closest(".year-cell") as HTMLElement | null;
    if (!target) return;
    const year = Number(target.dataset.year);
    if (isNaN(year)) return;
    this.#displayYear = year;
    this.view = "months";
    this.#render();
    this.#emitViewChange();
  };

  // ─── Keyboard navigation ──────────────────────────────────────────────

  #onDayKeydown = (e: KeyboardEvent): void => {
    const focused = this.#focusedDate || this.#selectedDate || this.#today;
    let next: Date | null = null;

    switch (e.key) {
      case "ArrowLeft":
        next = new Date(focused.getFullYear(), focused.getMonth(), focused.getDate() - 1);
        break;
      case "ArrowRight":
        next = new Date(focused.getFullYear(), focused.getMonth(), focused.getDate() + 1);
        break;
      case "ArrowUp":
        next = new Date(focused.getFullYear(), focused.getMonth(), focused.getDate() - 7);
        break;
      case "ArrowDown":
        next = new Date(focused.getFullYear(), focused.getMonth(), focused.getDate() + 7);
        break;
      case "Enter":
      case " ": {
        e.preventDefault();
        const iso = formatISO(focused);
        if (!this.#isDisabled(focused)) {
          if (this.range) {
            this.#handleRangeClick(focused, iso);
          } else {
            this.#handleSingleClick(focused, iso);
          }
        }
        return;
      }
      case "Escape":
        if (this.view !== "days") {
          this.view = "days";
          this.#emitViewChange();
        }
        return;
      default:
        return;
    }

    e.preventDefault();
    if (next && !this.#isDisabled(next)) {
      this.#focusedDate = next;
      // Navigate month if needed
      if (next.getMonth() !== this.#displayMonth || next.getFullYear() !== this.#displayYear) {
        this.#displayMonth = next.getMonth();
        this.#displayYear = next.getFullYear();
        this.#emitMonthChange();
      }
      this.#render();
      this.#focusCellByDate(next);
    }
  };

  #onMonthKeydown = (e: KeyboardEvent): void => {
    const current = this.#displayMonth;
    let next = current;

    switch (e.key) {
      case "ArrowLeft": next = current - 1; break;
      case "ArrowRight": next = current + 1; break;
      case "ArrowUp": next = current - 3; break;
      case "ArrowDown": next = current + 3; break;
      case "Enter":
      case " ":
        e.preventDefault();
        this.#displayMonth = current;
        this.view = "days";
        this.#emitViewChange();
        this.#emitMonthChange();
        return;
      case "Escape":
        this.view = "days";
        this.#emitViewChange();
        return;
      default: return;
    }

    e.preventDefault();
    if (next >= 0 && next <= 11) {
      this.#displayMonth = next;
      this.#render();
      this.#focusMonthCell(next);
    }
  };

  #onYearKeydown = (e: KeyboardEvent): void => {
    const focused = this.shadowRoot!.querySelector(".year-cell:focus") as HTMLElement | null;
    const currentYear = focused ? Number(focused.dataset.year) : this.#displayYear;
    let next = currentYear;

    switch (e.key) {
      case "ArrowLeft": next = currentYear - 1; break;
      case "ArrowRight": next = currentYear + 1; break;
      case "ArrowUp": next = currentYear - 3; break;
      case "ArrowDown": next = currentYear + 3; break;
      case "Enter":
      case " ":
        e.preventDefault();
        this.#displayYear = currentYear;
        this.view = "months";
        this.#emitViewChange();
        return;
      case "Escape":
        this.view = "months";
        this.#emitViewChange();
        return;
      default: return;
    }

    e.preventDefault();
    if (next < this.#yearPageStart) {
      this.#yearPageStart -= 12;
      this.#render();
    } else if (next >= this.#yearPageStart + 12) {
      this.#yearPageStart += 12;
      this.#render();
    }
    this.#focusYearCell(next);
  };

  #focusCellByDate(date: Date): void {
    const iso = formatISO(date);
    const cell = this.shadowRoot!.querySelector(`.day-cell[data-date="${iso}"]`) as HTMLElement | null;
    if (cell) cell.focus();
  }

  #focusMonthCell(month: number): void {
    const cell = this.shadowRoot!.querySelector(`.month-cell[data-month="${month}"]`) as HTMLElement | null;
    if (cell) cell.focus();
  }

  #focusYearCell(year: number): void {
    const cell = this.shadowRoot!.querySelector(`.year-cell[data-year="${year}"]`) as HTMLElement | null;
    if (cell) cell.focus();
  }

  // ─── Events ───────────────────────────────────────────────────────────

  #emitMonthChange(): void {
    this.dispatchEvent(new CustomEvent("month-change", {
      detail: { year: this.#displayYear, month: this.#displayMonth },
      bubbles: true,
      composed: true,
    }));
  }

  #emitViewChange(): void {
    this.dispatchEvent(new CustomEvent("view-change", {
      detail: { view: this.view },
      bubbles: true,
      composed: true,
    }));
  }

  // ─── Render ───────────────────────────────────────────────────────────

  #render(): void {
    const v = this.view;
    const loc = this.locale;

    // Toggle grids
    this.#dowRow.style.display = v === "days" ? "" : "none";
    this.#dayGrid.style.display = v === "days" ? "" : "none";
    this.#monthGrid.style.display = v === "months" ? "" : "none";
    this.#yearGrid.style.display = v === "years" ? "" : "none";

    // Update header label
    if (v === "years") {
      const end = this.#yearPageStart + 11;
      this.#monthSpan.textContent = `${this.#yearPageStart} – ${end}`;
      this.#yearSpan.textContent = "";
      this.#prevBtn.setAttribute("aria-label", "Previous 12 years");
      this.#nextBtn.setAttribute("aria-label", "Next 12 years");
    } else if (v === "months") {
      this.#monthSpan.textContent = `${this.#displayYear}`;
      this.#yearSpan.textContent = "";
      this.#prevBtn.setAttribute("aria-label", "Previous year");
      this.#nextBtn.setAttribute("aria-label", "Next year");
    } else {
      this.#monthSpan.textContent = getMonthName(loc, this.#displayMonth);
      this.#yearSpan.textContent = `${this.#displayYear}`;
      this.#prevBtn.setAttribute("aria-label", "Previous month");
      this.#nextBtn.setAttribute("aria-label", "Next month");
      this.#prevBtn.setAttribute("aria-label", "Previous month");
      this.#nextBtn.setAttribute("aria-label", "Next month");
    }

    if (v === "days") this.#renderDays();
    else if (v === "months") this.#renderMonths();
    else this.#renderYears();
  }

  #renderDays(): void {
    const loc = this.locale;
    const fdow = this.firstDayOfWeek;
    const showOutside = this.showOutsideDays;

    // DOW labels
    this.#dowRow.innerHTML = "";
    const dowLabels = getDOWLabels(loc, fdow);
    for (const label of dowLabels) {
      const cell = document.createElement("div");
      cell.className = "dow-cell";
      cell.setAttribute("role", "columnheader");
      cell.setAttribute("aria-label", label);
      cell.textContent = label;
      this.#dowRow.appendChild(cell);
    }

    // Day grid
    this.#dayGrid.innerHTML = "";
    const dates = generateMonthGrid(this.#displayYear, this.#displayMonth, fdow);

    // Build event lookup
    const eventMap = new Map<string, CalendarEvent[]>();
    for (const ev of this.#events) {
      const existing = eventMap.get(ev.date);
      if (existing) existing.push(ev);
      else eventMap.set(ev.date, [ev]);
    }

    for (let row = 0; row < 6; row++) {
      const rowEl = document.createElement("div");
      rowEl.className = "day-row";
      rowEl.setAttribute("role", "row");

      for (let col = 0; col < 7; col++) {
        const idx = row * 7 + col;
        const date = dates[idx];
        const iso = formatISO(date);
        const isOutside = date.getMonth() !== this.#displayMonth;
        const isToday = isSameDay(date, this.#today);
        const isSelected = this.#selectedDate !== null && isSameDay(date, this.#selectedDate);
        const disabled = this.#isDisabled(date);

        const cell = document.createElement("button");
        cell.className = "day-cell";
        cell.setAttribute("role", "gridcell");
        cell.type = "button";
        cell.dataset.date = iso;
        cell.textContent = String(date.getDate());
        cell.setAttribute("aria-label", date.toLocaleDateString(loc, {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        }));

        if (isOutside) {
          if (!showOutside) {
            cell.setAttribute("data-hidden", "");
            cell.setAttribute("aria-hidden", "true");
          } else {
            cell.setAttribute("data-outside", "");
          }
        }

        if (isToday) {
          cell.setAttribute("data-today", "");
          cell.setAttribute("aria-current", "date");
        }

        if (isSelected && !this.range) {
          cell.setAttribute("data-selected", "");
          cell.setAttribute("aria-selected", "true");
        }

        if (disabled) {
          cell.setAttribute("data-disabled", "");
          cell.setAttribute("aria-disabled", "true");
          cell.disabled = true;
        }

        // Range states
        if (this.range) {
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
            if (!re && hover && isSameDay(date, hover)) {
              cell.setAttribute("data-range-hover", "");
            }
          }
        }

        // Event dots
        const events = eventMap.get(iso);
        if (events && events.length > 0) {
          const dotsContainer = document.createElement("div");
          dotsContainer.className = "event-dots";
          const maxDots = Math.min(events.length, 3);
          for (let j = 0; j < maxDots; j++) {
            const dot = document.createElement("span");
            dot.className = "event-dot";
            if (events[j].color) {
              dot.style.backgroundColor = events[j].color!;
            }
            dotsContainer.appendChild(dot);
          }
          cell.appendChild(dotsContainer);
        }

        // Tabindex: focused > selected > today
        const isFocusTarget =
          (this.#focusedDate && isSameDay(date, this.#focusedDate)) ||
          (!this.#focusedDate && isSelected) ||
          (!this.#focusedDate && !this.#selectedDate && isToday);
        cell.setAttribute("tabindex", isFocusTarget ? "0" : "-1");

        rowEl.appendChild(cell);
      }

      this.#dayGrid.appendChild(rowEl);
    }
  }

  #renderMonths(): void {
    const loc = this.locale;
    this.#monthGrid.innerHTML = "";

    for (let row = 0; row < 4; row++) {
      const rowEl = document.createElement("div");
      rowEl.className = "month-row";
      rowEl.setAttribute("role", "row");

      for (let col = 0; col < 3; col++) {
        const m = row * 3 + col;
        const cell = document.createElement("button");
        cell.className = "month-cell";
        cell.setAttribute("role", "gridcell");
        cell.type = "button";
        cell.textContent = getShortMonthName(loc, m);
        cell.dataset.month = String(m);
        cell.setAttribute("aria-label", getMonthName(loc, m));

        if (m === this.#displayMonth) {
          cell.setAttribute("data-selected", "");
          cell.setAttribute("aria-selected", "true");
        }

        if (m === this.#today.getMonth() && this.#displayYear === this.#today.getFullYear()) {
          cell.setAttribute("data-today", "");
        }

        cell.setAttribute("tabindex", m === this.#displayMonth ? "0" : "-1");
        rowEl.appendChild(cell);
      }

      this.#monthGrid.appendChild(rowEl);
    }
  }

  #renderYears(): void {
    this.#yearGrid.innerHTML = "";

    for (let row = 0; row < 4; row++) {
      const rowEl = document.createElement("div");
      rowEl.className = "year-row";
      rowEl.setAttribute("role", "row");

      for (let col = 0; col < 3; col++) {
        const y = this.#yearPageStart + row * 3 + col;
        const cell = document.createElement("button");
        cell.className = "year-cell";
        cell.setAttribute("role", "gridcell");
        cell.type = "button";
        cell.textContent = String(y);
        cell.dataset.year = String(y);
        cell.setAttribute("aria-label", String(y));

        if (y === this.#displayYear) {
          cell.setAttribute("data-selected", "");
          cell.setAttribute("aria-selected", "true");
        }

        if (y === this.#today.getFullYear()) {
          cell.setAttribute("data-today", "");
        }

        cell.setAttribute("tabindex", y === this.#displayYear ? "0" : "-1");
        rowEl.appendChild(cell);
      }

      this.#yearGrid.appendChild(rowEl);
    }
  }
}

customElements.define("maneki-calendar", ManekiCalendar);
