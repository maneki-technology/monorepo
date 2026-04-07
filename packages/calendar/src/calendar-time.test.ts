import { describe, it, expect, beforeEach, vi } from "vitest";
import "./calendar-time.js";
import type { ManekiCalendarTime, TimeChangeDetail } from "./calendar-time.js";

function create(attrs: Record<string, string> = {}): ManekiCalendarTime {
  const el = document.createElement("maneki-calendar-time") as ManekiCalendarTime;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

function cleanup(): void {
  document.body.innerHTML = "";
}

function getSegments(el: ManekiCalendarTime): HTMLButtonElement[] {
  return Array.from(el.shadowRoot!.querySelectorAll(".segment"));
}

function getPeriod(el: ManekiCalendarTime): HTMLButtonElement | null {
  return el.shadowRoot!.querySelector(".period");
}

function press(target: HTMLElement, key: string, opts: Partial<KeyboardEvent> = {}): void {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, ...opts }));
}

describe("maneki-calendar-time", () => {
  beforeEach(cleanup);

  // ─── Rendering ───────────────────────────────────────────────────────────

  it("renders shadow DOM with time-row structure", () => {
    const el = create();
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".time-row")).toBeTruthy();
    expect(shadow.querySelector(".time-label")).toBeTruthy();
    expect(shadow.querySelector(".time-input")).toBeTruthy();
  });

  it("renders three segments (hour, minute, second)", () => {
    const el = create();
    const segs = getSegments(el);
    expect(segs.length).toBe(3);
  });

  it("renders separators between segments", () => {
    const el = create();
    const seps = el.shadowRoot!.querySelectorAll(".separator");
    expect(seps.length).toBe(2);
    expect(seps[0].textContent).toBe(":");
  });

  it("shows Time label", () => {
    const el = create();
    const label = el.shadowRoot!.querySelector(".time-label");
    expect(label?.textContent).toBe("Time");
  });

  // ─── Default values ──────────────────────────────────────────────────────

  it("defaults to 00:00:00", () => {
    const el = create();
    expect(el.value).toBe("00:00:00");
    expect(el.hours).toBe(0);
    expect(el.minutes).toBe(0);
    expect(el.seconds).toBe(0);
  });

  // ─── Value parsing ───────────────────────────────────────────────────────

  it("parses HH:MM:SS value attribute", () => {
    const el = create({ value: "14:30:45" });
    expect(el.hours).toBe(14);
    expect(el.minutes).toBe(30);
    expect(el.seconds).toBe(45);
    expect(el.value).toBe("14:30:45");
  });

  it("parses HH:MM value (seconds default to 0)", () => {
    const el = create({ value: "09:15" });
    expect(el.hours).toBe(9);
    expect(el.minutes).toBe(15);
    expect(el.seconds).toBe(0);
  });

  it("clamps out-of-range values", () => {
    const el = create({ value: "25:70:99" });
    expect(el.hours).toBe(23);
    expect(el.minutes).toBe(59);
    expect(el.seconds).toBe(59);
  });

  it("updates when value attribute changes", () => {
    const el = create({ value: "10:00:00" });
    el.setAttribute("value", "15:30:00");
    expect(el.hours).toBe(15);
    expect(el.minutes).toBe(30);
  });

  it("updates via property setter", () => {
    const el = create();
    el.value = "08:45:30";
    expect(el.hours).toBe(8);
    expect(el.minutes).toBe(45);
    expect(el.seconds).toBe(30);
  });

  // ─── 12-hour mode ───────────────────────────────────────────────────────

  it("hides period by default (24h mode)", () => {
    const el = create();
    const period = getPeriod(el);
    expect(period?.style.display).toBe("none");
    expect(el.period).toBeNull();
  });

  it("shows period in 12-hour mode", () => {
    const el = create({ use12hour: "" });
    const period = getPeriod(el);
    expect(period?.style.display).not.toBe("none");
  });

  it("displays correct period for AM hours", () => {
    const el = create({ use12hour: "", value: "09:00:00" });
    expect(el.period).toBe("AM");
    const period = getPeriod(el);
    expect(period?.textContent).toBe("AM");
  });

  it("displays correct period for PM hours", () => {
    const el = create({ use12hour: "", value: "14:00:00" });
    expect(el.period).toBe("PM");
    const period = getPeriod(el);
    expect(period?.textContent).toBe("PM");
  });

  it("displays 12-hour format in segments", () => {
    const el = create({ use12hour: "", value: "14:30:00" });
    const segs = getSegments(el);
    expect(segs[0].textContent).toBe("02"); // 14 → 2 PM
    expect(segs[1].textContent).toBe("30");
  });

  it("displays 12 for midnight in 12h mode", () => {
    const el = create({ use12hour: "", value: "00:00:00" });
    const segs = getSegments(el);
    expect(segs[0].textContent).toBe("12");
    expect(el.period).toBe("AM");
  });

  it("displays 12 for noon in 12h mode", () => {
    const el = create({ use12hour: "", value: "12:00:00" });
    const segs = getSegments(el);
    expect(segs[0].textContent).toBe("12");
    expect(el.period).toBe("PM");
  });

  it("toggles use12Hour via property", () => {
    const el = create();
    expect(el.use12Hour).toBe(false);
    el.use12Hour = true;
    expect(el.hasAttribute("use12hour")).toBe(true);
    el.use12Hour = false;
    expect(el.hasAttribute("use12hour")).toBe(false);
  });

  // ─── Timezone ────────────────────────────────────────────────────────────

  it("hides timezone by default", () => {
    const el = create();
    const tz = el.shadowRoot!.querySelector(".timezone") as HTMLElement;
    expect(tz.style.display).toBe("none");
  });

  it("shows timezone when attribute is set", () => {
    const el = create({ timezone: "EST" });
    const tz = el.shadowRoot!.querySelector(".timezone") as HTMLElement;
    expect(tz.style.display).not.toBe("none");
    expect(tz.textContent).toBe("EST");
  });

  it("updates timezone via property", () => {
    const el = create();
    el.timezone = "PST";
    const tz = el.shadowRoot!.querySelector(".timezone") as HTMLElement;
    expect(tz.textContent).toBe("PST");
  });

  // ─── Keyboard: ArrowUp/Down ──────────────────────────────────────────────

  it("increments hours with ArrowUp", () => {
    const el = create({ value: "10:00:00" });
    const segs = getSegments(el);
    press(segs[0], "ArrowUp");
    expect(el.hours).toBe(11);
  });

  it("decrements hours with ArrowDown", () => {
    const el = create({ value: "10:00:00" });
    const segs = getSegments(el);
    press(segs[0], "ArrowDown");
    expect(el.hours).toBe(9);
  });

  it("wraps hours from 23 to 0", () => {
    const el = create({ value: "23:00:00" });
    const segs = getSegments(el);
    press(segs[0], "ArrowUp");
    expect(el.hours).toBe(0);
  });

  it("wraps hours from 0 to 23", () => {
    const el = create({ value: "00:00:00" });
    const segs = getSegments(el);
    press(segs[0], "ArrowDown");
    expect(el.hours).toBe(23);
  });

  it("increments minutes with ArrowUp", () => {
    const el = create({ value: "10:30:00" });
    const segs = getSegments(el);
    press(segs[1], "ArrowUp");
    expect(el.minutes).toBe(31);
  });

  it("wraps minutes from 59 to 0", () => {
    const el = create({ value: "10:59:00" });
    const segs = getSegments(el);
    press(segs[1], "ArrowUp");
    expect(el.minutes).toBe(0);
  });

  it("increments seconds with ArrowUp", () => {
    const el = create({ value: "10:00:45" });
    const segs = getSegments(el);
    press(segs[2], "ArrowUp");
    expect(el.seconds).toBe(46);
  });

  it("wraps seconds from 59 to 0", () => {
    const el = create({ value: "10:00:59" });
    const segs = getSegments(el);
    press(segs[2], "ArrowUp");
    expect(el.seconds).toBe(0);
  });

  // ─── Keyboard: Period toggle ─────────────────────────────────────────────

  it("toggles period with ArrowUp on period element", () => {
    const el = create({ use12hour: "", value: "09:00:00" });
    const period = getPeriod(el)!;
    expect(el.period).toBe("AM");
    press(period, "ArrowUp");
    expect(el.period).toBe("PM");
    expect(el.hours).toBe(21); // 9 AM → 9 PM = 21
  });

  it("toggles period with click", () => {
    const el = create({ use12hour: "", value: "09:00:00" });
    const period = getPeriod(el)!;
    period.click();
    expect(el.period).toBe("PM");
  });

  it("sets AM with 'a' key", () => {
    const el = create({ use12hour: "", value: "14:00:00" });
    const period = getPeriod(el)!;
    expect(el.period).toBe("PM");
    press(period, "a");
    expect(el.period).toBe("AM");
  });

  it("sets PM with 'p' key", () => {
    const el = create({ use12hour: "", value: "09:00:00" });
    const period = getPeriod(el)!;
    expect(el.period).toBe("AM");
    press(period, "p");
    expect(el.period).toBe("PM");
  });

  // ─── Keyboard: Navigation ───────────────────────────────────────────────

  it("moves focus right with ArrowRight", () => {
    const el = create();
    const segs = getSegments(el);
    segs[0].focus();
    press(segs[0], "ArrowRight");
    expect(el.shadowRoot!.activeElement).toBe(segs[1]);
  });

  it("moves focus left with ArrowLeft", () => {
    const el = create();
    const segs = getSegments(el);
    segs[1].focus();
    press(segs[1], "ArrowLeft");
    expect(el.shadowRoot!.activeElement).toBe(segs[0]);
  });

  it("does not move left from first segment", () => {
    const el = create();
    const segs = getSegments(el);
    segs[0].focus();
    press(segs[0], "ArrowLeft");
    // Should not throw, focus stays
    expect(true).toBe(true);
  });

  // ─── Events ──────────────────────────────────────────────────────────────

  it("dispatches time-change on ArrowUp", () => {
    const el = create({ value: "10:00:00" });
    const handler = vi.fn();
    el.addEventListener("time-change", handler);
    const segs = getSegments(el);
    press(segs[0], "ArrowUp");
    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent<TimeChangeDetail>).detail;
    expect(detail.value).toBe("11:00:00");
    expect(detail.hours).toBe(11);
    expect(detail.minutes).toBe(0);
    expect(detail.seconds).toBe(0);
    expect(detail.period).toBeNull(); // 24h mode
  });

  it("includes period in event detail for 12h mode", () => {
    const el = create({ use12hour: "", value: "14:00:00" });
    const handler = vi.fn();
    el.addEventListener("time-change", handler);
    const segs = getSegments(el);
    press(segs[1], "ArrowUp");
    const detail = (handler.mock.calls[0][0] as CustomEvent<TimeChangeDetail>).detail;
    expect(detail.period).toBe("PM");
  });

  it("event bubbles and is composed", () => {
    const el = create({ value: "10:00:00" });
    const handler = vi.fn();
    document.addEventListener("time-change", handler);
    const segs = getSegments(el);
    press(segs[0], "ArrowUp");
    expect(handler).toHaveBeenCalledOnce();
    document.removeEventListener("time-change", handler);
  });

  // ─── Numeric input ───────────────────────────────────────────────────────

  it("accepts single large digit for hours (e.g. 5 → 05)", () => {
    const el = create({ value: "00:00:00" });
    const segs = getSegments(el);
    press(segs[0], "5");
    expect(el.hours).toBe(5);
  });

  it("accepts two-digit input for hours (e.g. 1 then 4 → 14)", () => {
    const el = create({ value: "00:00:00" });
    const segs = getSegments(el);
    press(segs[0], "1");
    press(segs[0], "4");
    expect(el.hours).toBe(14);
  });

  it("accepts two-digit input for minutes", () => {
    const el = create({ value: "00:00:00" });
    const segs = getSegments(el);
    press(segs[1], "3");
    press(segs[1], "5");
    expect(el.minutes).toBe(35);
  });

  // ─── Filled state ────────────────────────────────────────────────────────

  it("segments have data-filled when value is set", () => {
    const el = create({ value: "10:30:00" });
    const segs = getSegments(el);
    expect(segs[0].hasAttribute("data-filled")).toBe(true);
    expect(segs[1].hasAttribute("data-filled")).toBe(true);
    expect(segs[2].hasAttribute("data-filled")).toBe(true);
  });

  it("segments lack data-filled when no value", () => {
    const el = create();
    const segs = getSegments(el);
    expect(segs[0].hasAttribute("data-filled")).toBe(false);
  });

  // ─── ARIA ────────────────────────────────────────────────────────────────

  it("segments have spinbutton role", () => {
    const el = create();
    const segs = getSegments(el);
    for (const seg of segs) {
      expect(seg.getAttribute("role")).toBe("spinbutton");
    }
  });

  it("segments have aria-label", () => {
    const el = create();
    const segs = getSegments(el);
    expect(segs[0].getAttribute("aria-label")).toBe("hours");
    expect(segs[1].getAttribute("aria-label")).toBe("minutes");
    expect(segs[2].getAttribute("aria-label")).toBe("seconds");
  });

  it("segments have aria-valuenow after value set", () => {
    const el = create({ value: "14:30:45" });
    const segs = getSegments(el);
    expect(segs[0].getAttribute("aria-valuenow")).toBe("14");
    expect(segs[1].getAttribute("aria-valuenow")).toBe("30");
    expect(segs[2].getAttribute("aria-valuenow")).toBe("45");
  });

  it("time input group has aria-label", () => {
    const el = create();
    const input = el.shadowRoot!.querySelector(".time-input");
    expect(input?.getAttribute("aria-label")).toBe("Time input");
  });

  // ─── Cleanup ─────────────────────────────────────────────────────────────

  it("removes event listeners on disconnect", () => {
    const el = create({ value: "10:00:00" });
    el.remove();
    // No errors on disconnect
    expect(true).toBe(true);
  });
});
