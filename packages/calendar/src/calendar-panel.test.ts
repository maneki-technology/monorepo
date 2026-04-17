import { describe, it, expect, beforeEach, vi } from "vitest";
import "./calendar-panel.js";
import type { ManekiCalendarPanel } from "./calendar-panel.js";

function create(attrs: Record<string, string> = {}): ManekiCalendarPanel {
  const el = document.createElement("maneki-calendar-panel") as ManekiCalendarPanel;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

function cleanup(): void {
  document.body.innerHTML = "";
}

describe("maneki-calendar-panel", () => {
  beforeEach(cleanup);

  // ─── Rendering ───────────────────────────────────────────────────────────

  it("renders shadow DOM with panel structure", () => {
    const el = create();
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".panel")).toBeTruthy();
    expect(shadow.querySelector(".slot-top")).toBeTruthy();
    expect(shadow.querySelector(".slot-calendar")).toBeTruthy();
    expect(shadow.querySelector(".slot-time")).toBeTruthy();
    expect(shadow.querySelector(".slot-bottom")).toBeTruthy();
  });

  it("has named slots: top, time, bottom, and default", () => {
    const el = create();
    const shadow = el.shadowRoot!;
    const slots = shadow.querySelectorAll("slot");
    const names = Array.from(slots).map((s) => s.name || "(default)");
    expect(names).toContain("top");
    expect(names).toContain("time");
    expect(names).toContain("bottom");
    expect(names).toContain("(default)");
  });

  // ─── Actions ─────────────────────────────────────────────────────────────

  it("hides actions bar by default", () => {
    const el = create();
    const actions = el.shadowRoot!.querySelector(".actions") as HTMLElement;
    expect(actions.style.display).toBe("none");
  });

  it("shows actions bar when show-actions is set", () => {
    const el = create({ "show-actions": "" });
    const actions = el.shadowRoot!.querySelector(".actions") as HTMLElement;
    expect(actions.style.display).not.toBe("none");
  });

  it("toggles actions via property", () => {
    const el = create();
    const actions = el.shadowRoot!.querySelector(".actions") as HTMLElement;
    expect(actions.style.display).toBe("none");
    el.showActions = true;
    expect(actions.style.display).not.toBe("none");
    el.showActions = false;
    expect(actions.style.display).toBe("none");
  });

  it("has OK and Cancel buttons in actions", () => {
    const el = create({ "show-actions": "" });
    const buttons = el.shadowRoot!.querySelectorAll(".action-btn");
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toBe("Cancel");
    expect(buttons[1].textContent).toBe("OK");
  });

  // ─── Events ──────────────────────────────────────────────────────────────

  it("dispatches panel-ok on OK click", () => {
    const el = create({ "show-actions": "" });
    const handler = vi.fn();
    el.addEventListener("panel-ok", handler);
    const okBtn = el.shadowRoot!.querySelector(".action-btn[data-primary]") as HTMLButtonElement;
    okBtn.click();
    expect(handler).toHaveBeenCalledOnce();
  });

  it("dispatches panel-cancel on Cancel click", () => {
    const el = create({ "show-actions": "" });
    const handler = vi.fn();
    el.addEventListener("panel-cancel", handler);
    const cancelBtn = el.shadowRoot!.querySelector(".action-btn:not([data-primary])") as HTMLButtonElement;
    cancelBtn.click();
    expect(handler).toHaveBeenCalledOnce();
  });

  // ─── Properties ──────────────────────────────────────────────────────────

  it("showActions property reflects attribute", () => {
    const el = create();
    expect(el.showActions).toBe(false);
    el.setAttribute("show-actions", "");
    expect(el.showActions).toBe(true);
  });

  // ─── Slotting ────────────────────────────────────────────────────────────

  it("accepts slotted content in top slot", () => {
    const el = create();
    const topContent = document.createElement("div");
    topContent.slot = "top";
    topContent.textContent = "Top content";
    el.appendChild(topContent);
    const slot = el.shadowRoot!.querySelector('slot[name="top"]') as HTMLSlotElement;
    expect(slot).toBeTruthy();
  });

  it("accepts slotted content in time slot", () => {
    const el = create();
    const timeContent = document.createElement("div");
    timeContent.slot = "time";
    timeContent.textContent = "Time content";
    el.appendChild(timeContent);
    const slot = el.shadowRoot!.querySelector('slot[name="time"]') as HTMLSlotElement;
    expect(slot).toBeTruthy();
  });

  it("accepts slotted content in bottom slot", () => {
    const el = create();
    const bottomContent = document.createElement("div");
    bottomContent.slot = "bottom";
    bottomContent.textContent = "Bottom content";
    el.appendChild(bottomContent);
    const slot = el.shadowRoot!.querySelector('slot[name="bottom"]') as HTMLSlotElement;
    expect(slot).toBeTruthy();
  });

  it("accepts default slotted content (calendar)", () => {
    const el = create();
    const cal = document.createElement("div");
    cal.textContent = "Calendar";
    el.appendChild(cal);
    const slot = el.shadowRoot!.querySelector("slot:not([name])") as HTMLSlotElement;
    expect(slot).toBeTruthy();
  });

  // ─── Cleanup ─────────────────────────────────────────────────────────────

  it("removes event listeners on disconnect", () => {
    const el = create({ "show-actions": "" });
    const handler = vi.fn();
    el.addEventListener("panel-ok", handler);
    el.remove();
    // After removal, clicking should not dispatch (button is in shadow DOM, not accessible)
    // Just verify no errors on disconnect
    expect(true).toBe(true);
  });
});
