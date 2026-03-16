import { describe, it, expect, afterEach } from "vitest";
import "./ui-calendar-panel.js";

function create(attrs = "", inner = ""): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = `<ui-calendar-panel ${attrs}>${inner}</ui-calendar-panel>`;
  document.body.appendChild(el);
  return el.querySelector("ui-calendar-panel")!;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("ui-calendar-panel", () => {
  // ── Default rendering ──────────────────────────────────────────────────

  it("should have shadow DOM", () => {
    const el = create();
    expect(el.shadowRoot).toBeTruthy();
  });

  it("should default to size m", () => {
    const el = create();
    expect(el.getAttribute("size")).toBe("m");
  });

  it("should have body and main containers", () => {
    const el = create();
    const body = el.shadowRoot!.querySelector(".body");
    const main = el.shadowRoot!.querySelector(".main");
    expect(body).toBeTruthy();
    expect(main).toBeTruthy();
  });

  it("should have actions bar hidden by default", () => {
    const el = create();
    const actions = el.shadowRoot!.querySelector(".actions") as HTMLElement;
    expect(actions).toBeTruthy();
    expect(el.hasAttribute("show-actions")).toBe(false);
  });

  // ── Size attribute ─────────────────────────────────────────────────────

  it("should accept size s", () => {
    const el = create('size="s"');
    expect(el.getAttribute("size")).toBe("s");
  });

  it("should accept size l", () => {
    const el = create('size="l"');
    expect(el.getAttribute("size")).toBe("l");
  });

  it("should update size via property", () => {
    const el = create() as any;
    el.size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  // ── Size propagation ──────────────────────────────────────────────────

  it("should propagate size to ui-calendar child on attribute change", () => {
    const el = create("", '<ui-calendar value="2024-06-15"></ui-calendar>');
    el.setAttribute("size", "l");
    const cal = el.querySelector("ui-calendar")!;
    expect(cal.getAttribute("size")).toBe("l");
  });

  it("should propagate size to ui-calendar-quicklinks child", () => {
    const el = create("", '<ui-calendar-quicklinks orientation="side"></ui-calendar-quicklinks>');
    el.setAttribute("size", "s");
    const ql = el.querySelector("ui-calendar-quicklinks")!;
    expect(ql.getAttribute("size")).toBe("s");
  });

  it("should propagate size to ui-calendar-time child", () => {
    const el = create("", '<ui-calendar-time value="14:30"></ui-calendar-time>');
    el.setAttribute("size", "l");
    const ct = el.querySelector("ui-calendar-time")!;
    expect(ct.getAttribute("size")).toBe("l");
  });

  // ── show-actions attribute ─────────────────────────────────────────────

  it("should accept show-actions attribute", () => {
    const el = create("show-actions");
    expect(el.hasAttribute("show-actions")).toBe(true);
  });

  it("should toggle show-actions", () => {
    const el = create();
    expect(el.hasAttribute("show-actions")).toBe(false);
    el.setAttribute("show-actions", "");
    expect(el.hasAttribute("show-actions")).toBe(true);
    el.removeAttribute("show-actions");
    expect(el.hasAttribute("show-actions")).toBe(false);
  });

  // ── Slots ──────────────────────────────────────────────────────────────

  it("should have default slot in main", () => {
    const el = create();
    const main = el.shadowRoot!.querySelector(".main");
    const slot = main!.querySelector("slot:not([name])");
    expect(slot).toBeTruthy();
  });

  it("should have side slot in body", () => {
    const el = create();
    const body = el.shadowRoot!.querySelector(".body");
    const slot = body!.querySelector('slot[name="side"]');
    expect(slot).toBeTruthy();
  });

  it("should have bottom slot in main", () => {
    const el = create();
    const main = el.shadowRoot!.querySelector(".main");
    const slot = main!.querySelector('slot[name="bottom"]');
    expect(slot).toBeTruthy();
  });

  // ── Events ─────────────────────────────────────────────────────────────

  it("should dispatch cancel event from cancel button", () => {
    const el = create("show-actions");
    let fired = false;
    el.addEventListener("cancel", () => { fired = true; });
    const buttons = el.shadowRoot!.querySelectorAll("ui-button");
    const cancelBtn = buttons[0] as HTMLElement;
    cancelBtn.click();
    expect(fired).toBe(true);
  });

  it("should dispatch confirm event from OK button", () => {
    const el = create("show-actions");
    let fired = false;
    el.addEventListener("confirm", () => { fired = true; });
    const buttons = el.shadowRoot!.querySelectorAll("ui-button");
    const okBtn = buttons[1] as HTMLElement;
    okBtn.click();
    expect(fired).toBe(true);
  });

  // ── Composed usage ─────────────────────────────────────────────────────

  it("should work with calendar + quicklinks side", () => {
    const el = create('size="m"', `
      <ui-calendar-quicklinks slot="side" orientation="side"></ui-calendar-quicklinks>
      <ui-calendar value="2024-06-15"></ui-calendar>
    `);
    expect(el.querySelector("ui-calendar")).toBeTruthy();
    expect(el.querySelector("ui-calendar-quicklinks")).toBeTruthy();
  });

  it("should work with calendar + time bottom", () => {
    const el = create('size="m"', `
      <ui-calendar value="2024-06-15"></ui-calendar>
      <ui-calendar-time slot="bottom" value="14:30"></ui-calendar-time>
    `);
    expect(el.querySelector("ui-calendar")).toBeTruthy();
    expect(el.querySelector("ui-calendar-time")).toBeTruthy();
  });
});
