import { describe, it, expect, afterEach, vi } from "vitest";
import "./ui-calendar-time.js";
import type { UiCalendarTime } from "./ui-calendar-time.js";

const tick = () => new Promise((r) => setTimeout(r, 0));

function create(attrs = ""): UiCalendarTime {
  const el = document.createElement("div");
  el.innerHTML = `<ui-calendar-time ${attrs}></ui-calendar-time>`;
  document.body.appendChild(el);
  return el.querySelector("ui-calendar-time") as UiCalendarTime;
}

describe("ui-calendar-time", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  const shadow = (el: UiCalendarTime) => el.shadowRoot!;
  const container = (el: UiCalendarTime) => shadow(el).querySelector(".container")!;
  const separator = (el: UiCalendarTime) => shadow(el).querySelector(".separator")!;
  const hourInput = (el: UiCalendarTime) =>
    shadow(el).querySelector('input[aria-label="Hour"]') as HTMLInputElement;
  const minuteInput = (el: UiCalendarTime) =>
    shadow(el).querySelector('input[aria-label="Minute"]') as HTMLInputElement;
  const colon = (el: UiCalendarTime) => shadow(el).querySelector(".colon")!;
  const switchEl = (el: UiCalendarTime) =>
    shadow(el).querySelector('[role="switch"]') as HTMLElement;
  const amLabel = (el: UiCalendarTime) => {
    const labels = shadow(el).querySelectorAll(".toggle-label");
    return labels[0] as HTMLElement;
  };
  const pmLabel = (el: UiCalendarTime) => {
    const labels = shadow(el).querySelectorAll(".toggle-label");
    return labels[1] as HTMLElement;
  };

  // ─── Default rendering ──────────────────────────────────────────────

  describe("default rendering", () => {
    it("creates shadow DOM", () => {
      const el = create();
      expect(shadow(el)).toBeTruthy();
    });

    it("uses adoptedStyleSheets", () => {
      const el = create();
      expect(shadow(el).adoptedStyleSheets.length).toBeGreaterThan(0);
    });

    it("renders .container", () => {
      const el = create();
      expect(container(el)).toBeTruthy();
    });

    it("renders separator line", () => {
      const el = create();
      expect(separator(el)).toBeTruthy();
    });

    it("renders two text inputs", () => {
      const el = create();
      const inputs = shadow(el).querySelectorAll("input.time-input");
      expect(inputs.length).toBe(2);
    });

    it("renders hour input with inputMode=numeric and maxLength=2", () => {
      const el = create();
      const h = hourInput(el);
      expect(h.type).toBe("text");
      expect(h.inputMode).toBe("numeric");
      expect(h.maxLength).toBe(2);
    });

    it("renders minute input with inputMode=numeric and maxLength=2", () => {
      const el = create();
      const m = minuteInput(el);
      expect(m.type).toBe("text");
      expect(m.inputMode).toBe("numeric");
      expect(m.maxLength).toBe(2);
    });

    it("renders colon separator between inputs", () => {
      const el = create();
      expect(colon(el)).toBeTruthy();
      expect(colon(el).textContent).toBe(":");
    });

    it("renders AM/PM toggle with role=switch", () => {
      const el = create();
      expect(switchEl(el)).toBeTruthy();
      expect(switchEl(el).getAttribute("role")).toBe("switch");
    });

    it("renders AM and PM labels", () => {
      const el = create();
      expect(amLabel(el).textContent).toBe("AM");
      expect(pmLabel(el).textContent).toBe("PM");
    });

    it("renders switch track and handle", () => {
      const el = create();
      const sw = switchEl(el);
      expect(sw.querySelector(".switch-track")).toBeTruthy();
      expect(sw.querySelector(".switch-handle")).toBeTruthy();
    });

    it("defaults to 12:00 AM display", () => {
      const el = create();
      expect(hourInput(el).value).toBe("12");
      expect(minuteInput(el).value).toBe("00");
    });
  });

  // ─── Default attributes ─────────────────────────────────────────────

  describe("default attributes", () => {
    it("sets size=m by default", () => {
      const el = create();
      expect(el.getAttribute("size")).toBe("m");
    });

    it("sets role=group by default", () => {
      const el = create();
      expect(el.getAttribute("role")).toBe("group");
    });

    it("defaults AM active (not PM)", () => {
      const el = create();
      expect(switchEl(el).hasAttribute("data-pm")).toBe(false);
      expect(switchEl(el).getAttribute("aria-checked")).toBe("false");
      expect(amLabel(el).hasAttribute("data-active")).toBe(true);
      expect(pmLabel(el).hasAttribute("data-active")).toBe(false);
    });
  });

  // ─── Size attribute ─────────────────────────────────────────────────

  describe("size attribute", () => {
    it("accepts size=s", () => {
      const el = create('size="s"');
      expect(el.getAttribute("size")).toBe("s");
      expect(el.size).toBe("s");
    });

    it("accepts size=m", () => {
      const el = create('size="m"');
      expect(el.size).toBe("m");
    });

    it("accepts size=l", () => {
      const el = create('size="l"');
      expect(el.size).toBe("l");
    });

    it("sets size via property", () => {
      const el = create();
      el.size = "l";
      expect(el.getAttribute("size")).toBe("l");
    });
  });

  // ─── Value parsing ──────────────────────────────────────────────────

  describe("value parsing", () => {
    it("parses 14:30 → hour=2, minute=30, PM", () => {
      const el = create('value="14:30"');
      expect(hourInput(el).value).toBe("02");
      expect(minuteInput(el).value).toBe("30");
      expect(switchEl(el).hasAttribute("data-pm")).toBe(true);
    });

    it("parses 09:15 → hour=9, minute=15, AM", () => {
      const el = create('value="09:15"');
      expect(hourInput(el).value).toBe("09");
      expect(minuteInput(el).value).toBe("15");
      expect(switchEl(el).hasAttribute("data-pm")).toBe(false);
    });

    it("parses 00:00 → hour=12, minute=0, AM (midnight)", () => {
      const el = create('value="00:00"');
      expect(hourInput(el).value).toBe("12");
      expect(minuteInput(el).value).toBe("00");
      expect(switchEl(el).hasAttribute("data-pm")).toBe(false);
    });

    it("parses 12:00 → hour=12, minute=0, PM (noon)", () => {
      const el = create('value="12:00"');
      expect(hourInput(el).value).toBe("12");
      expect(minuteInput(el).value).toBe("00");
      expect(switchEl(el).hasAttribute("data-pm")).toBe(true);
    });

    it("parses 23:59 → hour=11, minute=59, PM", () => {
      const el = create('value="23:59"');
      expect(hourInput(el).value).toBe("11");
      expect(minuteInput(el).value).toBe("59");
      expect(switchEl(el).hasAttribute("data-pm")).toBe(true);
    });

    it("parses 1:05 → hour=1, minute=5, AM", () => {
      const el = create('value="1:05"');
      expect(hourInput(el).value).toBe("01");
      expect(minuteInput(el).value).toBe("05");
      expect(switchEl(el).hasAttribute("data-pm")).toBe(false);
    });
  });

  // ─── Value property getter ──────────────────────────────────────────

  describe("value property getter", () => {
    it("returns 00:00 for default (12 AM)", () => {
      const el = create();
      expect(el.value).toBe("00:00");
    });

    it("returns 14:30 for 2:30 PM", () => {
      const el = create('value="14:30"');
      expect(el.value).toBe("14:30");
    });

    it("returns 12:00 for noon", () => {
      const el = create('value="12:00"');
      expect(el.value).toBe("12:00");
    });

    it("returns 00:00 for midnight", () => {
      const el = create('value="00:00"');
      expect(el.value).toBe("00:00");
    });
  });

  // ─── hour24 property ────────────────────────────────────────────────

  describe("hour24 property", () => {
    it("returns 0 for 12 AM (midnight)", () => {
      const el = create('value="00:00"');
      expect(el.hour24).toBe(0);
    });

    it("returns 12 for 12 PM (noon)", () => {
      const el = create('value="12:00"');
      expect(el.hour24).toBe(12);
    });

    it("returns 14 for 2 PM", () => {
      const el = create('value="14:00"');
      expect(el.hour24).toBe(14);
    });

    it("returns 9 for 9 AM", () => {
      const el = create('value="09:00"');
      expect(el.hour24).toBe(9);
    });

    it("returns 23 for 11 PM", () => {
      const el = create('value="23:00"');
      expect(el.hour24).toBe(23);
    });
  });

  // ─── minute property ────────────────────────────────────────────────

  describe("minute property", () => {
    it("returns 0 by default", () => {
      const el = create();
      expect(el.minute).toBe(0);
    });

    it("returns 30 for value=14:30", () => {
      const el = create('value="14:30"');
      expect(el.minute).toBe(30);
    });

    it("returns 59 for value=23:59", () => {
      const el = create('value="23:59"');
      expect(el.minute).toBe(59);
    });
  });

  // ─── Hour input change ──────────────────────────────────────────────

  describe("hour input change", () => {
    it("updates hour when input value changes", () => {
      const el = create('value="09:00"');
      const h = hourInput(el);
      h.value = "5";
      h.dispatchEvent(new Event("change"));
      expect(hourInput(el).value).toBe("05");
      expect(el.hour24).toBe(5);
    });

    it("clamps hour > 12 to 12", () => {
      const el = create();
      const h = hourInput(el);
      h.value = "15";
      h.dispatchEvent(new Event("change"));
      expect(hourInput(el).value).toBe("12");
    });

    it("clamps NaN to 12", () => {
      const el = create();
      const h = hourInput(el);
      h.value = "abc";
      h.dispatchEvent(new Event("change"));
      expect(hourInput(el).value).toBe("12");
    });

    it("clamps hour < 1 to 12", () => {
      const el = create();
      const h = hourInput(el);
      h.value = "0";
      h.dispatchEvent(new Event("change"));
      expect(hourInput(el).value).toBe("12");
    });
  });

  // ─── Minute input change ────────────────────────────────────────────

  describe("minute input change", () => {
    it("updates minute when input value changes", () => {
      const el = create('value="09:00"');
      const m = minuteInput(el);
      m.value = "45";
      m.dispatchEvent(new Event("change"));
      expect(minuteInput(el).value).toBe("45");
      expect(el.minute).toBe(45);
    });

    it("clamps minute > 59 to 59", () => {
      const el = create();
      const m = minuteInput(el);
      m.value = "99";
      m.dispatchEvent(new Event("change"));
      expect(minuteInput(el).value).toBe("59");
    });

    it("clamps NaN to 0", () => {
      const el = create();
      const m = minuteInput(el);
      m.value = "abc";
      m.dispatchEvent(new Event("change"));
      expect(minuteInput(el).value).toBe("00");
    });

    it("clamps negative to 0", () => {
      const el = create();
      const m = minuteInput(el);
      m.value = "-5";
      m.dispatchEvent(new Event("change"));
      expect(minuteInput(el).value).toBe("00");
    });
  });

  // ─── Arrow key on hour input ────────────────────────────────────────

  describe("arrow key on hour input", () => {
    it("ArrowUp increments hour", () => {
      const el = create('value="09:00"');
      const h = hourInput(el);
      h.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(hourInput(el).value).toBe("10");
    });

    it("ArrowDown decrements hour", () => {
      const el = create('value="09:00"');
      const h = hourInput(el);
      h.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(hourInput(el).value).toBe("08");
    });

    it("ArrowUp wraps 12 → 1", () => {
      const el = create('value="12:00"');
      const h = hourInput(el);
      h.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(hourInput(el).value).toBe("01");
    });

    it("ArrowDown wraps 1 → 12", () => {
      const el = create('value="01:00"');
      const h = hourInput(el);
      h.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(hourInput(el).value).toBe("12");
    });
  });

  // ─── Arrow key on minute input ──────────────────────────────────────

  describe("arrow key on minute input", () => {
    it("ArrowUp increments minute", () => {
      const el = create('value="09:30"');
      const m = minuteInput(el);
      m.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(minuteInput(el).value).toBe("31");
    });

    it("ArrowDown decrements minute", () => {
      const el = create('value="09:30"');
      const m = minuteInput(el);
      m.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(minuteInput(el).value).toBe("29");
    });

    it("ArrowUp wraps 59 → 0", () => {
      const el = create('value="09:59"');
      const m = minuteInput(el);
      m.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      expect(minuteInput(el).value).toBe("00");
    });

    it("ArrowDown wraps 0 → 59", () => {
      const el = create('value="09:00"');
      const m = minuteInput(el);
      m.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      expect(minuteInput(el).value).toBe("59");
    });
  });

  // ─── AM/PM toggle ───────────────────────────────────────────────────

  describe("AM/PM toggle", () => {
    it("click switch toggles from AM to PM", () => {
      const el = create();
      expect(switchEl(el).hasAttribute("data-pm")).toBe(false);
      switchEl(el).click();
      expect(switchEl(el).hasAttribute("data-pm")).toBe(true);
      expect(pmLabel(el).hasAttribute("data-active")).toBe(true);
      expect(amLabel(el).hasAttribute("data-active")).toBe(false);
    });

    it("click switch toggles from PM to AM", () => {
      const el = create('value="14:00"');
      expect(switchEl(el).hasAttribute("data-pm")).toBe(true);
      switchEl(el).click();
      expect(switchEl(el).hasAttribute("data-pm")).toBe(false);
      expect(amLabel(el).hasAttribute("data-active")).toBe(true);
    });

    it("updates hour24 when toggling", () => {
      const el = create('value="09:00"');
      expect(el.hour24).toBe(9);
      switchEl(el).click();
      expect(el.hour24).toBe(21);
    });
  });

  // ─── AM label click ─────────────────────────────────────────────────

  describe("AM label click", () => {
    it("sets AM when currently PM", () => {
      const el = create('value="14:00"');
      expect(switchEl(el).hasAttribute("data-pm")).toBe(true);
      amLabel(el).click();
      expect(switchEl(el).hasAttribute("data-pm")).toBe(false);
      expect(el.hour24).toBe(2);
    });

    it("does nothing when already AM", () => {
      const el = create('value="09:00"');
      const spy = vi.fn();
      el.addEventListener("change", spy);
      amLabel(el).click();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  // ─── PM label click ─────────────────────────────────────────────────

  describe("PM label click", () => {
    it("sets PM when currently AM", () => {
      const el = create('value="09:00"');
      expect(switchEl(el).hasAttribute("data-pm")).toBe(false);
      pmLabel(el).click();
      expect(switchEl(el).hasAttribute("data-pm")).toBe(true);
      expect(el.hour24).toBe(21);
    });

    it("does nothing when already PM", () => {
      const el = create('value="14:00"');
      const spy = vi.fn();
      el.addEventListener("change", spy);
      pmLabel(el).click();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  // ─── Switch keyboard ────────────────────────────────────────────────

  describe("switch keyboard", () => {
    it("Enter toggles AM/PM", () => {
      const el = create();
      expect(switchEl(el).hasAttribute("data-pm")).toBe(false);
      switchEl(el).dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
      expect(switchEl(el).hasAttribute("data-pm")).toBe(true);
    });

    it("Space toggles AM/PM", () => {
      const el = create();
      expect(switchEl(el).hasAttribute("data-pm")).toBe(false);
      switchEl(el).dispatchEvent(
        new KeyboardEvent("keydown", { key: " ", bubbles: true }),
      );
      expect(switchEl(el).hasAttribute("data-pm")).toBe(true);
    });

    it("other keys do not toggle", () => {
      const el = create();
      switchEl(el).dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
      );
      expect(switchEl(el).hasAttribute("data-pm")).toBe(false);
    });
  });

  // ─── Change event ───────────────────────────────────────────────────

  describe("change event", () => {
    it("dispatches on hour input change", () => {
      const el = create('value="09:00"');
      const spy = vi.fn();
      el.addEventListener("change", spy);
      const h = hourInput(el);
      h.value = "5";
      h.dispatchEvent(new Event("change"));
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("dispatches on minute input change", () => {
      const el = create('value="09:00"');
      const spy = vi.fn();
      el.addEventListener("change", spy);
      const m = minuteInput(el);
      m.value = "45";
      m.dispatchEvent(new Event("change"));
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("dispatches on toggle click", () => {
      const el = create();
      const spy = vi.fn();
      el.addEventListener("change", spy);
      switchEl(el).click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("includes detail.value in 24h format", () => {
      const el = create('value="09:30"');
      const spy = vi.fn();
      el.addEventListener("change", spy);
      switchEl(el).click(); // toggle to PM → 21:30
      const detail = spy.mock.calls[0][0].detail;
      expect(detail.value).toBe("21:30");
    });

    it("includes detail.hour24", () => {
      const el = create('value="09:30"');
      const spy = vi.fn();
      el.addEventListener("change", spy);
      switchEl(el).click();
      expect(spy.mock.calls[0][0].detail.hour24).toBe(21);
    });

    it("includes detail.minute", () => {
      const el = create('value="09:30"');
      const spy = vi.fn();
      el.addEventListener("change", spy);
      switchEl(el).click();
      expect(spy.mock.calls[0][0].detail.minute).toBe(30);
    });

    it("bubbles", () => {
      const el = create();
      const spy = vi.fn();
      document.body.addEventListener("change", spy);
      switchEl(el).click();
      expect(spy).toHaveBeenCalledTimes(1);
      document.body.removeEventListener("change", spy);
    });

    it("dispatches on arrow key", () => {
      const el = create('value="09:00"');
      const spy = vi.fn();
      el.addEventListener("change", spy);
      hourInput(el).dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
      );
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Attribute change ───────────────────────────────────────────────

  describe("attribute change", () => {
    it("setting value attribute updates display", async () => {
      const el = create();
      el.setAttribute("value", "15:45");
      await tick();
      expect(hourInput(el).value).toBe("03");
      expect(minuteInput(el).value).toBe("45");
      expect(switchEl(el).hasAttribute("data-pm")).toBe(true);
    });

    it("setting value property updates attribute and display", async () => {
      const el = create();
      el.value = "08:20";
      await tick();
      expect(hourInput(el).value).toBe("08");
      expect(minuteInput(el).value).toBe("20");
      expect(switchEl(el).hasAttribute("data-pm")).toBe(false);
    });

    it("changing value from one valid to another updates", async () => {
      const el = create('value="09:00"');
      el.setAttribute("value", "21:30");
      await tick();
      expect(el.value).toBe("21:30");
      expect(el.hour24).toBe(21);
      expect(el.minute).toBe(30);
    });
  });

  // ─── Invalid value ──────────────────────────────────────────────────

  describe("invalid value", () => {
    it("ignores empty string", () => {
      const el = create('value=""');
      expect(hourInput(el).value).toBe("12");
      expect(minuteInput(el).value).toBe("00");
    });

    it("ignores non-time string", () => {
      const el = create('value="hello"');
      expect(hourInput(el).value).toBe("12");
      expect(minuteInput(el).value).toBe("00");
    });

    it("ignores hour > 23", () => {
      const el = create('value="25:00"');
      expect(hourInput(el).value).toBe("12");
    });

    it("ignores minute > 59", () => {
      const el = create('value="10:60"');
      expect(hourInput(el).value).toBe("12");
    });

    it("ignores negative hour", () => {
      const el = create('value="-1:00"');
      expect(hourInput(el).value).toBe("12");
    });

    it("ignores malformed format", () => {
      const el = create('value="9"');
      expect(hourInput(el).value).toBe("12");
    });
  });

  // ─── Edge cases ─────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("12 AM = hour24 0", () => {
      const el = create('value="00:00"');
      expect(el.hour24).toBe(0);
      expect(hourInput(el).value).toBe("12");
      expect(switchEl(el).hasAttribute("data-pm")).toBe(false);
    });

    it("12 PM = hour24 12", () => {
      const el = create('value="12:00"');
      expect(el.hour24).toBe(12);
      expect(hourInput(el).value).toBe("12");
      expect(switchEl(el).hasAttribute("data-pm")).toBe(true);
    });

    it("toggling 12 AM → 12 PM changes hour24 from 0 to 12", () => {
      const el = create('value="00:00"');
      expect(el.hour24).toBe(0);
      switchEl(el).click();
      expect(el.hour24).toBe(12);
    });

    it("toggling 12 PM → 12 AM changes hour24 from 12 to 0", () => {
      const el = create('value="12:00"');
      expect(el.hour24).toBe(12);
      switchEl(el).click();
      expect(el.hour24).toBe(0);
    });

    it("arrow up on hour 12 wraps to 1 (not 13)", () => {
      const el = create('value="12:00"');
      hourInput(el).dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
      );
      expect(hourInput(el).value).toBe("01");
    });

    it("arrow down on hour 1 wraps to 12 (not 0)", () => {
      const el = create('value="01:00"');
      hourInput(el).dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      expect(hourInput(el).value).toBe("12");
    });

    it("minute 59 + ArrowUp wraps to 00", () => {
      const el = create('value="09:59"');
      minuteInput(el).dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
      );
      expect(minuteInput(el).value).toBe("00");
      expect(el.minute).toBe(0);
    });

    it("minute 0 + ArrowDown wraps to 59", () => {
      const el = create('value="09:00"');
      minuteInput(el).dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      expect(minuteInput(el).value).toBe("59");
      expect(el.minute).toBe(59);
    });

    it("switch has tabindex=0 for keyboard focus", () => {
      const el = create();
      expect(switchEl(el).getAttribute("tabindex")).toBe("0");
    });

    it("switch aria-label is set", () => {
      const el = create();
      expect(switchEl(el).getAttribute("aria-label")).toBe("Toggle AM/PM");
    });

    it("preserves custom role if set before connect", async () => {
      const el = document.createElement("ui-calendar-time") as UiCalendarTime;
      el.setAttribute("role", "application");
      document.body.appendChild(el);
      await tick();
      expect(el.getAttribute("role")).toBe("application");
    });

    it("cleans up event listeners on disconnect", () => {
      const el = create('value="09:00"');
      el.remove();
      // Re-append — should re-register listeners in connectedCallback
      document.body.appendChild(el);
      const spy = vi.fn();
      el.addEventListener("change", spy);
      switchEl(el).click();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
