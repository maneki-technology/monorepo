import { describe, it, expect, beforeEach } from "vitest";
import "./ui-step-group.js";
import "./ui-step-item.js";
import { UiStepGroup } from "./ui-step-group.js";

describe("ui-step-group", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-step-group");
    document.body.appendChild(el);
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-step-group")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("renders a .group wrapper", () => {
    expect(el.shadowRoot!.querySelector(".group")).not.toBeNull();
  });

  it("renders a slot inside .group", () => {
    const group = el.shadowRoot!.querySelector(".group");
    expect(group!.querySelector("slot")).not.toBeNull();
  });

  // ── Default attributes ────────────────────────────────────────────────────

  it("defaults size to m", () => {
    expect(el.getAttribute("size")).toBe("m");
  });

  it("defaults orientation to horizontal", () => {
    expect(el.getAttribute("orientation")).toBe("horizontal");
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size getter returns attribute value", () => {
    el.setAttribute("size", "s");
    expect((el as UiStepGroup).size).toBe("s");
  });

  it("size setter updates attribute", () => {
    (el as UiStepGroup).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("orientation getter returns attribute value", () => {
    el.setAttribute("orientation", "vertical");
    expect((el as UiStepGroup).orientation).toBe("vertical");
  });

  it("orientation setter updates attribute", () => {
    (el as UiStepGroup).orientation = "vertical";
    expect(el.getAttribute("orientation")).toBe("vertical");
  });

  it("currentStep getter returns parsed number", () => {
    el.setAttribute("current-step", "3");
    expect((el as UiStepGroup).currentStep).toBe(3);
  });

  it("currentStep setter updates attribute", () => {
    (el as UiStepGroup).currentStep = 5;
    expect(el.getAttribute("current-step")).toBe("5");
  });

  it("currentStep defaults to 0 when not set", () => {
    expect((el as UiStepGroup).currentStep).toBe(0);
  });

  it("labels getter returns boolean", () => {
    expect((el as UiStepGroup).labels).toBe(false);
    el.setAttribute("labels", "");
    expect((el as UiStepGroup).labels).toBe(true);
  });

  it("labels setter toggles attribute", () => {
    (el as UiStepGroup).labels = true;
    expect(el.hasAttribute("labels")).toBe(true);
    (el as UiStepGroup).labels = false;
    expect(el.hasAttribute("labels")).toBe(false);
  });

  // ── Size propagation ──────────────────────────────────────────────────────

  it("propagates size to child step items", async () => {
    el.setAttribute("size", "s");
    const item = document.createElement("ui-step-item");
    el.appendChild(item);
    // Wait for slotchange
    await new Promise((r) => setTimeout(r, 0));
    expect(item.getAttribute("size")).toBe("s");
  });

  it("updates child size when group size changes", async () => {
    const item = document.createElement("ui-step-item");
    el.appendChild(item);
    await new Promise((r) => setTimeout(r, 0));
    el.setAttribute("size", "s");
    expect(item.getAttribute("size")).toBe("s");
  });

  // ── Orientation propagation ───────────────────────────────────────────────

  it("propagates orientation to child step items", async () => {
    el.setAttribute("orientation", "vertical");
    const item = document.createElement("ui-step-item");
    el.appendChild(item);
    await new Promise((r) => setTimeout(r, 0));
    expect(item.getAttribute("orientation")).toBe("vertical");
  });

  // ── Labels propagation ────────────────────────────────────────────────────

  it("propagates labels attribute to children", async () => {
    el.setAttribute("labels", "");
    const item = document.createElement("ui-step-item");
    el.appendChild(item);
    await new Promise((r) => setTimeout(r, 0));
    expect(item.hasAttribute("labels")).toBe(true);
  });

  it("removes labels from children when removed from group", async () => {
    el.setAttribute("labels", "");
    const item = document.createElement("ui-step-item");
    el.appendChild(item);
    await new Promise((r) => setTimeout(r, 0));
    expect(item.hasAttribute("labels")).toBe(true);
    el.removeAttribute("labels");
    expect(item.hasAttribute("labels")).toBe(false);
  });

  // ── First / Last auto-set ─────────────────────────────────────────────────

  it("sets first on the first child item", async () => {
    const items = [document.createElement("ui-step-item"), document.createElement("ui-step-item"), document.createElement("ui-step-item")];
    items.forEach((i) => el.appendChild(i));
    await new Promise((r) => setTimeout(r, 0));
    expect(items[0].hasAttribute("first")).toBe(true);
    expect(items[1].hasAttribute("first")).toBe(false);
    expect(items[2].hasAttribute("first")).toBe(false);
  });

  it("sets last on the last child item", async () => {
    const items = [document.createElement("ui-step-item"), document.createElement("ui-step-item"), document.createElement("ui-step-item")];
    items.forEach((i) => el.appendChild(i));
    await new Promise((r) => setTimeout(r, 0));
    expect(items[0].hasAttribute("last")).toBe(false);
    expect(items[1].hasAttribute("last")).toBe(false);
    expect(items[2].hasAttribute("last")).toBe(true);
  });

  // ── current-step auto-status ──────────────────────────────────────────────

  it("sets complete on steps before current-step", async () => {
    el.setAttribute("current-step", "3");
    const items = Array.from({ length: 4 }, () => document.createElement("ui-step-item"));
    items.forEach((i) => el.appendChild(i));
    await new Promise((r) => setTimeout(r, 0));
    expect(items[0].getAttribute("status")).toBe("complete");
    expect(items[1].getAttribute("status")).toBe("complete");
  });

  it("sets active on the current step", async () => {
    el.setAttribute("current-step", "3");
    const items = Array.from({ length: 4 }, () => document.createElement("ui-step-item"));
    items.forEach((i) => el.appendChild(i));
    await new Promise((r) => setTimeout(r, 0));
    expect(items[2].getAttribute("status")).toBe("active");
  });

  it("sets incomplete on steps after current-step", async () => {
    el.setAttribute("current-step", "3");
    const items = Array.from({ length: 4 }, () => document.createElement("ui-step-item"));
    items.forEach((i) => el.appendChild(i));
    await new Promise((r) => setTimeout(r, 0));
    expect(items[3].getAttribute("status")).toBe("incomplete");
  });

  it("does not override error/warning/disabled statuses after current step", async () => {
    el.setAttribute("current-step", "2");
    const items = Array.from({ length: 4 }, () => document.createElement("ui-step-item"));
    items[2].setAttribute("status", "error");
    items[3].setAttribute("status", "warning");
    items.forEach((i) => el.appendChild(i));
    await new Promise((r) => setTimeout(r, 0));
    expect(items[2].getAttribute("status")).toBe("error");
    expect(items[3].getAttribute("status")).toBe("warning");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("has correct observedAttributes list", () => {
    const Ctor = customElements.get("ui-step-group") as typeof UiStepGroup;
    expect(Ctor.observedAttributes).toEqual(["size", "orientation", "current-step", "labels"]);
  });
});
