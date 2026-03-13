import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-calendar.js";
import type { UiCalendar } from "./ui-calendar.js";

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("ui-calendar", () => {
  let el: UiCalendar;

  beforeEach(async () => {
    el = document.createElement("ui-calendar") as UiCalendar;
    document.body.appendChild(el);
    await tick();
  });

  afterEach(() => {
    el.remove();
  });

  const shadow = () => el.shadowRoot!;
  const grid = () => shadow().querySelector(".day-grid")!;
  const cells = () => grid().querySelectorAll(".day-cell");
  const headerLabel = () => shadow().querySelector(".header-label") as HTMLElement;
  const prevBtn = () => shadow().querySelector(".nav-btn:first-of-type") as HTMLButtonElement;
  const nextBtn = () => shadow().querySelector(".nav-btn:last-of-type") as HTMLButtonElement;
  const dowCells = () => shadow().querySelectorAll(".dow-cell");

  // ─── Default rendering ───────────────────────────────────────────────

  describe("default rendering", () => {
    it("creates shadow DOM with style element", () => {
      expect(shadow().querySelector("style")).toBeTruthy();
    });

    it("renders .calendar container", () => {
      expect(shadow().querySelector(".calendar")).toBeTruthy();
    });

    it("renders .header with nav buttons and label", () => {
      expect(shadow().querySelector(".header")).toBeTruthy();
      expect(prevBtn()).toBeTruthy();
      expect(nextBtn()).toBeTruthy();
      expect(headerLabel()).toBeTruthy();
    });

    it("renders 7 DOW cells (Mo-Su)", () => {
      const dows = dowCells();
      expect(dows.length).toBe(7);
      expect(dows[0].textContent).toBe("Mon");
      expect(dows[6].textContent).toBe("Sun");
    });

    it("renders 42 day cells", () => {
      expect(cells().length).toBe(42);
    });

    it("renders prev/next icons as ui-icon elements", () => {
      expect(prevBtn().querySelector("ui-icon")).toBeTruthy();
      expect(nextBtn().querySelector("ui-icon")).toBeTruthy();
    });
  });

  // ─── Default attributes ──────────────────────────────────────────────

  describe("default attributes", () => {
    it("sets size='m' by default", () => {
      expect(el.getAttribute("size")).toBe("m");
    });

    it("sets role='group' by default", () => {
      expect(el.getAttribute("role")).toBe("group");
    });

    it("preserves custom role if set before connect", async () => {
      const el2 = document.createElement("ui-calendar") as UiCalendar;
      el2.setAttribute("role", "application");
      document.body.appendChild(el2);
      await tick();
      expect(el2.getAttribute("role")).toBe("application");
      el2.remove();
    });
  });

  // ─── Size attribute ──────────────────────────────────────────────────

  describe("size attribute", () => {
    it("reflects size='s'", () => {
      el.size = "s";
      expect(el.getAttribute("size")).toBe("s");
    });

    it("reflects size='m'", () => {
      el.size = "m";
      expect(el.getAttribute("size")).toBe("m");
    });

    it("reflects size='l'", () => {
      el.size = "l";
      expect(el.getAttribute("size")).toBe("l");
    });
  });

  // ─── Property accessors ──────────────────────────────────────────────

  describe("property accessors", () => {
    it("get/set size", () => {
      el.size = "l";
      expect(el.size).toBe("l");
    });

    it("get/set value", () => {
      el.value = "2024-06-15";
      expect(el.value).toBe("2024-06-15");
      expect(el.getAttribute("value")).toBe("2024-06-15");
    });

    it("get/set min", () => {
      el.min = "2024-01-01";
      expect(el.min).toBe("2024-01-01");
    });

    it("get/set max", () => {
      el.max = "2024-12-31";
      expect(el.max).toBe("2024-12-31");
    });

    it("displayYear returns current display year", () => {
      expect(el.displayYear).toBe(new Date().getFullYear());
    });

    it("displayMonth returns current display month", () => {
      expect(el.displayMonth).toBe(new Date().getMonth());
    });

    it("selectedDate is null by default", () => {
      expect(el.selectedDate).toBeNull();
    });

    it("selectedDate returns Date when value is set", async () => {
      el.value = "2024-06-15";
      await tick();
      expect(el.selectedDate).toBeInstanceOf(Date);
      expect(el.selectedDate!.getFullYear()).toBe(2024);
      expect(el.selectedDate!.getMonth()).toBe(5); // June = 5
      expect(el.selectedDate!.getDate()).toBe(15);
    });
  });

  // ─── Header label ────────────────────────────────────────────────────

  describe("header label", () => {
    it("shows current month and year", () => {
      const now = new Date();
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      expect(headerLabel().textContent).toBe(
        `${months[now.getMonth()]} ${now.getFullYear()}`,
      );
    });

    it("updates when value changes", async () => {
      el.value = "2024-03-15";
      await tick();
      expect(headerLabel().textContent).toBe("March 2024");
    });
  });

  // ─── Navigation ──────────────────────────────────────────────────────

  describe("navigation", () => {
    it("prev button decrements month", async () => {
      el.value = "2024-06-15";
      await tick();
      prevBtn().click();
      expect(headerLabel().textContent).toBe("May 2024");
    });

    it("next button increments month", async () => {
      el.value = "2024-06-15";
      await tick();
      nextBtn().click();
      expect(headerLabel().textContent).toBe("July 2024");
    });

    it("wraps from January to December of previous year", async () => {
      el.value = "2024-01-15";
      await tick();
      prevBtn().click();
      expect(headerLabel().textContent).toBe("December 2023");
      expect(el.displayYear).toBe(2023);
      expect(el.displayMonth).toBe(11);
    });

    it("wraps from December to January of next year", async () => {
      el.value = "2024-12-15";
      await tick();
      nextBtn().click();
      expect(headerLabel().textContent).toBe("January 2025");
      expect(el.displayYear).toBe(2025);
      expect(el.displayMonth).toBe(0);
    });
  });

  // ─── navigateTo() ────────────────────────────────────────────────────

  describe("navigateTo()", () => {
    it("navigates to specific month/year", () => {
      el.navigateTo(2023, 8); // September 2023
      expect(headerLabel().textContent).toBe("September 2023");
      expect(el.displayYear).toBe(2023);
      expect(el.displayMonth).toBe(8);
    });

    it("updates the grid cells", () => {
      el.navigateTo(2024, 1); // February 2024
      const firstInMonth = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent === "1",
      );
      expect(firstInMonth).toBeTruthy();
    });
  });

  // ─── Day grid content ────────────────────────────────────────────────

  describe("day grid content", () => {
    it("renders 42 cells for any month", () => {
      el.navigateTo(2024, 5); // June 2024
      expect(cells().length).toBe(42);
    });

    it("marks outside-month cells with data-outside", async () => {
      el.value = "2024-06-15";
      await tick();
      // June 2024 starts on Saturday (index 5 in Mon-based)
      // So cells 0-4 are May days (outside)
      const outsideCells = Array.from(cells()).filter((c) =>
        c.hasAttribute("data-outside"),
      );
      expect(outsideCells.length).toBeGreaterThan(0);
    });

    it("in-month cells do not have data-outside", async () => {
      el.value = "2024-06-15";
      await tick();
      const inMonthCells = Array.from(cells()).filter(
        (c) => !c.hasAttribute("data-outside"),
      );
      // June has 30 days
      expect(inMonthCells.length).toBe(30);
    });

    it("each cell has data-date attribute in YYYY-MM-DD format", () => {
      el.navigateTo(2024, 5);
      const firstCell = cells()[0];
      expect(firstCell.getAttribute("data-date")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("each cell has aria-label", () => {
      el.navigateTo(2024, 5);
      const firstCell = cells()[0];
      expect(firstCell.getAttribute("aria-label")).toBeTruthy();
    });

    it("each cell has role='gridcell'", () => {
      const firstCell = cells()[0];
      expect(firstCell.getAttribute("role")).toBe("gridcell");
    });
  });

  // ─── Today highlight ─────────────────────────────────────────────────

  describe("today highlight", () => {
    it("marks today's cell with data-today", () => {
      const todayCell = Array.from(cells()).find((c) =>
        c.hasAttribute("data-today"),
      );
      expect(todayCell).toBeTruthy();
    });

    it("today cell has aria-current='date'", () => {
      const todayCell = Array.from(cells()).find((c) =>
        c.hasAttribute("data-today"),
      );
      expect(todayCell!.getAttribute("aria-current")).toBe("date");
    });

    it("today cell shows correct day number", () => {
      const today = new Date();
      const todayCell = Array.from(cells()).find((c) =>
        c.hasAttribute("data-today"),
      );
      expect(todayCell!.textContent).toBe(String(today.getDate()));
    });
  });

  // ─── Selection ───────────────────────────────────────────────────────

  describe("selection", () => {
    it("clicking a day cell sets data-selected", async () => {
      el.navigateTo(2024, 5); // June 2024
      const cell15 = Array.from(cells()).find(
        (c) =>
          !c.hasAttribute("data-outside") && c.textContent === "15",
      ) as HTMLElement;
      cell15.click();
      await tick();
      // Re-query since grid re-renders
      const selected = Array.from(cells()).find((c) =>
        c.hasAttribute("data-selected"),
      );
      expect(selected).toBeTruthy();
      expect(selected!.textContent).toBe("15");
    });

    it("clicking a day cell sets aria-selected='true'", async () => {
      el.navigateTo(2024, 5);
      const cell10 = Array.from(cells()).find(
        (c) =>
          !c.hasAttribute("data-outside") && c.textContent === "10",
      ) as HTMLElement;
      cell10.click();
      await tick();
      // Re-query since grid re-renders
      const selected = Array.from(cells()).find((c) =>
        c.hasAttribute("data-selected"),
      );
      expect(selected!.getAttribute("aria-selected")).toBe("true");
    });

    it("clicking a day cell updates value attribute", async () => {
      el.navigateTo(2024, 5);
      const cell15 = Array.from(cells()).find(
        (c) =>
          !c.hasAttribute("data-outside") && c.textContent === "15",
      ) as HTMLElement;
      cell15.click();
      await tick();
      expect(el.getAttribute("value")).toBe("2024-06-15");
    });

    it("dispatches 'change' event with detail", async () => {
      el.navigateTo(2024, 5);
      const handler = vi.fn();
      el.addEventListener("change", handler);
      const cell15 = Array.from(cells()).find(
        (c) =>
          !c.hasAttribute("data-outside") && c.textContent === "15",
      ) as HTMLElement;
      cell15.click();
      expect(handler).toHaveBeenCalledTimes(1);
      const detail = handler.mock.calls[0][0].detail;
      expect(detail.value).toBe("2024-06-15");
      expect(detail.date).toBeInstanceOf(Date);
    });

    it("only one cell is selected at a time", async () => {
      el.navigateTo(2024, 5);
      const cell10 = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent === "10",
      ) as HTMLElement;
      cell10.click();
      await tick();
      const cell20 = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent === "20",
      ) as HTMLElement;
      cell20.click();
      await tick();
      const selectedCells = Array.from(cells()).filter((c) =>
        c.hasAttribute("data-selected"),
      );
      expect(selectedCells.length).toBe(1);
      expect(selectedCells[0].textContent).toBe("20");
    });
  });

  // ─── Value attribute ─────────────────────────────────────────────────

  describe("value attribute", () => {
    it("setting value selects that date", async () => {
      el.value = "2024-03-15";
      await tick();
      const selected = Array.from(cells()).find((c) =>
        c.hasAttribute("data-selected"),
      );
      expect(selected).toBeTruthy();
      expect(selected!.textContent).toBe("15");
    });

    it("setting value navigates to that month", async () => {
      el.value = "2024-03-15";
      await tick();
      expect(headerLabel().textContent).toBe("March 2024");
    });

    it("clearing value removes selection", async () => {
      el.value = "2024-03-15";
      await tick();
      el.removeAttribute("value");
      await tick();
      const selected = Array.from(cells()).find((c) =>
        c.hasAttribute("data-selected"),
      );
      expect(selected).toBeUndefined();
    });
  });

  // ─── Min/Max ─────────────────────────────────────────────────────────

  describe("min/max", () => {
    it("cells before min have data-disabled", async () => {
      el.value = "2024-06-15";
      el.min = "2024-06-10";
      await tick();
      const cell5 = Array.from(cells()).find(
        (c) =>
          !c.hasAttribute("data-outside") && c.textContent === "5",
      );
      expect(cell5!.hasAttribute("data-disabled")).toBe(true);
    });

    it("cells after max have data-disabled", async () => {
      el.value = "2024-06-15";
      el.max = "2024-06-20";
      await tick();
      const cell25 = Array.from(cells()).find(
        (c) =>
          !c.hasAttribute("data-outside") && c.textContent === "25",
      );
      expect(cell25!.hasAttribute("data-disabled")).toBe(true);
    });

    it("disabled cells have aria-disabled='true'", async () => {
      el.value = "2024-06-15";
      el.min = "2024-06-10";
      await tick();
      const cell5 = Array.from(cells()).find(
        (c) =>
          !c.hasAttribute("data-outside") && c.textContent === "5",
      );
      expect(cell5!.getAttribute("aria-disabled")).toBe("true");
    });

    it("clicking disabled cell does not select it", async () => {
      el.value = "2024-06-15";
      el.min = "2024-06-10";
      await tick();
      const handler = vi.fn();
      el.addEventListener("change", handler);
      const cell5 = Array.from(cells()).find(
        (c) =>
          !c.hasAttribute("data-outside") && c.textContent === "5",
      ) as HTMLElement;
      cell5.click();
      expect(handler).not.toHaveBeenCalled();
      expect(el.value).toBe("2024-06-15");
    });

    it("cells within range are not disabled", async () => {
      el.value = "2024-06-15";
      el.min = "2024-06-10";
      el.max = "2024-06-20";
      await tick();
      const cell15 = Array.from(cells()).find(
        (c) =>
          !c.hasAttribute("data-outside") && c.textContent === "15",
      );
      expect(cell15!.hasAttribute("data-disabled")).toBe(false);
    });
  });

  // ─── Outside month click ─────────────────────────────────────────────

  describe("outside month click", () => {
    it("clicking outside-month cell selects it and navigates", async () => {
      el.navigateTo(2024, 5); // June 2024
      // First cell should be a May day (outside)
      const outsideCell = Array.from(cells()).find((c) =>
        c.hasAttribute("data-outside"),
      ) as HTMLElement;
      expect(outsideCell).toBeTruthy();
      outsideCell.click();
      await tick();
      // Should have navigated to May
      expect(headerLabel().textContent).toBe("May 2024");
    });
  });

  // ─── Navigate event ──────────────────────────────────────────────────

  describe("navigate event", () => {
    it("prev button dispatches navigate event", async () => {
      el.navigateTo(2024, 5);
      const handler = vi.fn();
      el.addEventListener("navigate", handler);
      prevBtn().click();
      expect(handler).toHaveBeenCalledTimes(1);
      const detail = handler.mock.calls[0][0].detail;
      expect(detail.year).toBe(2024);
      expect(detail.month).toBe(4); // May
    });

    it("next button dispatches navigate event", async () => {
      el.navigateTo(2024, 5);
      const handler = vi.fn();
      el.addEventListener("navigate", handler);
      nextBtn().click();
      expect(handler).toHaveBeenCalledTimes(1);
      const detail = handler.mock.calls[0][0].detail;
      expect(detail.year).toBe(2024);
      expect(detail.month).toBe(6); // July
    });
  });

  // ─── Tabindex ────────────────────────────────────────────────────────

  describe("tabindex", () => {
    it("today gets tabindex='0' when no selection", () => {
      const todayCell = Array.from(cells()).find((c) =>
        c.hasAttribute("data-today"),
      );
      expect(todayCell!.getAttribute("tabindex")).toBe("0");
    });

    it("non-today cells get tabindex='-1' when no selection", () => {
      const nonTodayCells = Array.from(cells()).filter(
        (c) => !c.hasAttribute("data-today"),
      );
      for (const cell of nonTodayCells) {
        expect(cell.getAttribute("tabindex")).toBe("-1");
      }
    });

    it("selected cell gets tabindex='0'", async () => {
      el.value = "2024-06-15";
      await tick();
      const selected = Array.from(cells()).find((c) =>
        c.hasAttribute("data-selected"),
      );
      expect(selected!.getAttribute("tabindex")).toBe("0");
    });
  });

  // ─── Edge cases ──────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("February 2024 leap year has 29 days", async () => {
      el.value = "2024-02-15";
      await tick();
      const inMonthCells = Array.from(cells()).filter(
        (c) => !c.hasAttribute("data-outside"),
      );
      expect(inMonthCells.length).toBe(29);
      const cell29 = inMonthCells.find((c) => c.textContent === "29");
      expect(cell29).toBeTruthy();
    });

    it("February 2023 non-leap year has 28 days", async () => {
      el.value = "2023-02-15";
      await tick();
      const inMonthCells = Array.from(cells()).filter(
        (c) => !c.hasAttribute("data-outside"),
      );
      expect(inMonthCells.length).toBe(28);
    });

    it("always renders exactly 42 cells regardless of month", () => {
      for (let m = 0; m < 12; m++) {
        el.navigateTo(2024, m);
        expect(cells().length).toBe(42);
      }
    });

    it("DOW header has correct labels", () => {
      const labels = Array.from(dowCells()).map((c) => c.textContent);
      expect(labels).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    });

    it("DOW cells have role='columnheader'", () => {
      const dows = dowCells();
      for (const dow of dows) {
        expect(dow.getAttribute("role")).toBe("columnheader");
      }
    });

    it("day grid has role='grid'", () => {
      expect(grid().getAttribute("role")).toBe("grid");
    });

    it("header label has role='heading' with aria-level='2'", () => {
      expect(headerLabel().getAttribute("role")).toBe("heading");
      expect(headerLabel().getAttribute("aria-level")).toBe("2");
    });

    it("invalid value attribute is ignored", async () => {
      el.setAttribute("value", "not-a-date");
      await tick();
      expect(el.selectedDate).toBeNull();
    });

    it("multiple rapid navigations work correctly", () => {
      el.navigateTo(2024, 0); // Jan
      nextBtn().click(); // Feb
      nextBtn().click(); // Mar
      nextBtn().click(); // Apr
      expect(headerLabel().textContent).toBe("April 2024");
    });
  });

  // ─── Range selection ────────────────────────────────────────────────

  describe("range selection", () => {
    beforeEach(async () => {
      el.setAttribute("mode", "range");
      el.navigateTo(2024, 5); // June 2024
      await tick();
    });

    it("mode property defaults to 'single'", async () => {
      const el2 = document.createElement("ui-calendar") as UiCalendar;
      document.body.appendChild(el2);
      await tick();
      expect(el2.mode).toBe("single");
      el2.remove();
    });

    it("mode property reflects attribute", () => {
      expect(el.mode).toBe("range");
    });

    it("first click sets range-start", () => {
      const cell10 = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent === "10",
      ) as HTMLElement;
      cell10.click();
      expect(el.getAttribute("range-start")).toBe("2024-06-10");
      expect(el.getAttribute("range-end")).toBeNull();
    });

    it("second click sets range-end", async () => {
      const cell10 = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent === "10",
      ) as HTMLElement;
      cell10.click();
      await tick();
      const cell20 = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent === "20",
      ) as HTMLElement;
      cell20.click();
      expect(el.getAttribute("range-start")).toBe("2024-06-10");
      expect(el.getAttribute("range-end")).toBe("2024-06-20");
    });

    it("swaps start/end if second click is before first", async () => {
      const cell20 = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent === "20",
      ) as HTMLElement;
      cell20.click();
      await tick();
      const cell10 = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent === "10",
      ) as HTMLElement;
      cell10.click();
      expect(el.getAttribute("range-start")).toBe("2024-06-10");
      expect(el.getAttribute("range-end")).toBe("2024-06-20");
    });

    it("third click resets range (starts new)", async () => {
      const cell10 = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent === "10",
      ) as HTMLElement;
      cell10.click();
      await tick();
      const cell20 = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent === "20",
      ) as HTMLElement;
      cell20.click();
      await tick();
      const cell15 = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent === "15",
      ) as HTMLElement;
      cell15.click();
      expect(el.getAttribute("range-start")).toBe("2024-06-15");
      expect(el.getAttribute("range-end")).toBeNull();
    });

    it("marks start cell with data-range-start", async () => {
      el.setAttribute("range-start", "2024-06-10");
      el.setAttribute("range-end", "2024-06-20");
      await tick();
      const startCell = Array.from(cells()).find((c) =>
        c.hasAttribute("data-range-start"),
      );
      expect(startCell).toBeTruthy();
      expect(startCell!.textContent).toBe("10");
    });

    it("marks end cell with data-range-end", async () => {
      el.setAttribute("range-start", "2024-06-10");
      el.setAttribute("range-end", "2024-06-20");
      await tick();
      const endCell = Array.from(cells()).find((c) =>
        c.hasAttribute("data-range-end"),
      );
      expect(endCell).toBeTruthy();
      expect(endCell!.textContent).toBe("20");
    });

    it("marks in-range cells with data-in-range", async () => {
      el.setAttribute("range-start", "2024-06-10");
      el.setAttribute("range-end", "2024-06-20");
      await tick();
      const inRange = Array.from(cells()).filter((c) =>
        c.hasAttribute("data-in-range"),
      );
      // Days 11-19 = 9 cells
      expect(inRange.length).toBe(9);
    });

    it("range endpoints have aria-selected='true'", async () => {
      el.setAttribute("range-start", "2024-06-10");
      el.setAttribute("range-end", "2024-06-20");
      await tick();
      const startCell = Array.from(cells()).find((c) =>
        c.hasAttribute("data-range-start"),
      );
      const endCell = Array.from(cells()).find((c) =>
        c.hasAttribute("data-range-end"),
      );
      expect(startCell!.getAttribute("aria-selected")).toBe("true");
      expect(endCell!.getAttribute("aria-selected")).toBe("true");
    });

    it("dispatches range-change event", () => {
      const handler = vi.fn();
      el.addEventListener("range-change", handler);
      const cell10 = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent === "10",
      ) as HTMLElement;
      cell10.click();
      expect(handler).toHaveBeenCalledTimes(1);
      const detail = handler.mock.calls[0][0].detail;
      expect(detail.start).toBe("2024-06-10");
      expect(detail.end).toBeNull();
    });

    it("rangeStart/rangeEnd properties reflect attributes", async () => {
      el.rangeStart = "2024-06-10";
      el.rangeEnd = "2024-06-20";
      await tick();
      expect(el.rangeStart).toBe("2024-06-10");
      expect(el.rangeEnd).toBe("2024-06-20");
      expect(el.rangeStartDate).toBeInstanceOf(Date);
      expect(el.rangeEndDate).toBeInstanceOf(Date);
    });

    it("rangeStartDate/rangeEndDate are null by default", async () => {
      const el2 = document.createElement("ui-calendar") as UiCalendar;
      document.body.appendChild(el2);
      await tick();
      expect(el2.rangeStartDate).toBeNull();
      expect(el2.rangeEndDate).toBeNull();
      el2.remove();
    });
  });

  // ─── Monthly view ─────────────────────────────────────────────────

  describe("monthly view", () => {
    it("view defaults to 'daily'", () => {
      expect(el.view).toBe("daily");
    });

    it("setting view='monthly' shows month grid", async () => {
      el.view = "monthly";
      await tick();
      const monthGrid = shadow().querySelector(".month-grid") as HTMLElement;
      const dayGrid = shadow().querySelector(".day-grid") as HTMLElement;
      const dowRow = shadow().querySelector(".dow-row") as HTMLElement;
      expect(monthGrid.style.display).not.toBe("none");
      expect(dayGrid.style.display).toBe("none");
      expect(dowRow.style.display).toBe("none");
    });

    it("monthly view renders 12 month cells", async () => {
      el.view = "monthly";
      await tick();
      const monthCells = shadow().querySelectorAll(".month-cell");
      expect(monthCells.length).toBe(12);
    });

    it("month cells have short names (Jan-Dec)", async () => {
      el.view = "monthly";
      await tick();
      const monthCells = shadow().querySelectorAll(".month-cell");
      expect(monthCells[0].textContent).toBe("Jan");
      expect(monthCells[11].textContent).toBe("Dec");
    });

    it("header shows year only in monthly view", async () => {
      el.view = "monthly";
      await tick();
      expect(headerLabel().textContent).toBe(String(new Date().getFullYear()));
    });

    it("current month has data-today in current year", async () => {
      el.view = "monthly";
      await tick();
      const todayMonth = shadow().querySelector(".month-cell[data-today]");
      expect(todayMonth).toBeTruthy();
      expect(todayMonth!.textContent).toBe(
        ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][new Date().getMonth()]
      );
    });

    it("clicking a month cell switches to daily view for that month", async () => {
      el.view = "monthly";
      el.navigateTo(2024, 5);
      await tick();
      const marchCell = shadow().querySelectorAll(".month-cell")[2] as HTMLElement; // Mar = index 2
      marchCell.click();
      await tick();
      expect(el.view).toBe("daily");
      expect(el.displayMonth).toBe(2); // March
      expect(headerLabel().textContent).toBe("March 2024");
    });

    it("clicking header label toggles to monthly view", async () => {
      headerLabel().click();
      await tick();
      expect(el.view).toBe("monthly");
    });

    it("clicking header label in monthly view toggles back to daily", async () => {
      el.view = "monthly";
      await tick();
      headerLabel().click();
      await tick();
      expect(el.view).toBe("daily");
    });

    it("prev/next in monthly view changes year", async () => {
      el.view = "monthly";
      el.navigateTo(2024, 5);
      await tick();
      prevBtn().click();
      expect(headerLabel().textContent).toBe("2023");
      nextBtn().click();
      nextBtn().click();
      expect(headerLabel().textContent).toBe("2025");
    });

    it("month cells have data-month attribute", async () => {
      el.view = "monthly";
      await tick();
      const monthCells = shadow().querySelectorAll(".month-cell");
      expect(monthCells[0].getAttribute("data-month")).toBe("0");
      expect(monthCells[11].getAttribute("data-month")).toBe("11");
    });
  });

  // ─── Events ─────────────────────────────────────────────────────

  describe("events", () => {
    it("setEvents renders event dots on cells", async () => {
      el.navigateTo(2024, 5); // June 2024
      const events = new Map<string, Array<{ color: string; label?: string }>>();
      events.set("2024-06-15", [{ color: "#FC9162", label: "Meeting" }]);
      (el as any).setEvents(events);
      await tick();
      const cell15 = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent?.startsWith("15"),
      );
      expect(cell15).toBeTruthy();
      const dots = cell15!.querySelector(".event-dots");
      expect(dots).toBeTruthy();
      expect(dots!.querySelectorAll(".event-dot").length).toBe(1);
    });

    it("renders max 3 dots per cell", async () => {
      el.navigateTo(2024, 5);
      const events = new Map<string, Array<{ color: string; label?: string }>>();
      events.set("2024-06-15", [
        { color: "#FC9162" },
        { color: "#4EBFB9" },
        { color: "#C89AFC" },
        { color: "#F5C518" },
      ]);
      (el as any).setEvents(events);
      await tick();
      const cell15 = Array.from(cells()).find(
        (c) => !c.hasAttribute("data-outside") && c.textContent?.startsWith("15"),
      );
      const dots = cell15!.querySelectorAll(".event-dot");
      expect(dots.length).toBe(3);
    });

    it("clearEvents removes all dots", async () => {
      el.navigateTo(2024, 5);
      const events = new Map<string, Array<{ color: string; label?: string }>>();
      events.set("2024-06-15", [{ color: "#FC9162" }]);
      (el as any).setEvents(events);
      await tick();
      (el as any).clearEvents();
      await tick();
      const allDots = shadow().querySelectorAll(".event-dot");
      expect(allDots.length).toBe(0);
    });

    it("renders legend when events have labels", async () => {
      el.navigateTo(2024, 5);
      const events = new Map<string, Array<{ color: string; label?: string }>>();
      events.set("2024-06-15", [{ color: "#FC9162", label: "Meeting" }]);
      events.set("2024-06-20", [{ color: "#4EBFB9", label: "Holiday" }]);
      (el as any).setEvents(events);
      await tick();
      const legend = shadow().querySelector(".legend") as HTMLElement;
      expect(legend.style.display).not.toBe("none");
      const items = legend.querySelectorAll(".legend-item");
      expect(items.length).toBe(2);
    });

    it("legend deduplicates labels", async () => {
      el.navigateTo(2024, 5);
      const events = new Map<string, Array<{ color: string; label?: string }>>();
      events.set("2024-06-15", [{ color: "#FC9162", label: "Meeting" }]);
      events.set("2024-06-20", [{ color: "#FC9162", label: "Meeting" }]);
      (el as any).setEvents(events);
      await tick();
      const items = shadow().querySelectorAll(".legend-item");
      expect(items.length).toBe(1);
    });

    it("legend hidden when no labeled events", async () => {
      el.navigateTo(2024, 5);
      const events = new Map<string, Array<{ color: string; label?: string }>>();
      events.set("2024-06-15", [{ color: "#FC9162" }]); // no label
      (el as any).setEvents(events);
      await tick();
      const legend = shadow().querySelector(".legend") as HTMLElement;
      expect(legend.style.display).toBe("none");
    });
  });
});
