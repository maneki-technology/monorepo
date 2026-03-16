import { describe, it, expect, beforeEach } from "vitest";
import "./ui-metric.js";
import "./ui-metric-group.js";
import type { MetricSize } from "./ui-metric.js";

describe("ui-metric-group", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-metric-group");
    document.body.appendChild(el);
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-metric-group")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .wrapper element", () => {
    expect(el.shadowRoot!.querySelector(".wrapper")).not.toBeNull();
  });

  it("renders a .separator element", () => {
    expect(el.shadowRoot!.querySelector(".separator")).not.toBeNull();
  });

  it("renders a .group element", () => {
    expect(el.shadowRoot!.querySelector(".group")).not.toBeNull();
  });

  it("renders a .title element", () => {
    expect(el.shadowRoot!.querySelector(".title")).not.toBeNull();
  });

  it("renders a .metrics element", () => {
    expect(el.shadowRoot!.querySelector(".metrics")).not.toBeNull();
  });

  it("renders a slot inside .metrics", () => {
    const metrics = el.shadowRoot!.querySelector(".metrics");
    expect(metrics!.querySelector("slot")).not.toBeNull();
  });

  it("title element is empty by default", () => {
    expect(el.shadowRoot!.querySelector(".title")!.textContent).toBe("");
  });

  // ── Title attribute ───────────────────────────────────────────────────────

  it("sets title text from attribute", () => {
    el.setAttribute("title", "Revenue Metrics");
    expect(el.shadowRoot!.querySelector(".title")!.textContent).toBe(
      "Revenue Metrics",
    );
  });

  it("clears title text when attribute removed", () => {
    el.setAttribute("title", "Revenue Metrics");
    el.removeAttribute("title");
    expect(el.shadowRoot!.querySelector(".title")!.textContent).toBe("");
  });

  it("updates title text when attribute changes", () => {
    el.setAttribute("title", "Old Title");
    el.setAttribute("title", "New Title");
    expect(el.shadowRoot!.querySelector(".title")!.textContent).toBe("New Title");
  });

  // ── Size property accessor ────────────────────────────────────────────────

  it("defaults size to 's'", () => {
    expect((el as unknown as { size: MetricSize }).size).toBe("s");
  });

  it("reflects size to attribute via setter", () => {
    (el as unknown as { size: MetricSize }).size = "m";
    expect(el.getAttribute("size")).toBe("m");
  });

  it("reads size from attribute via getter", () => {
    el.setAttribute("size", "l");
    expect((el as unknown as { size: MetricSize }).size).toBe("l");
  });

  // ── Size propagation ─────────────────────────────────────────────────────

  it("propagates size to slotted ui-metric children", async () => {
    const metric = document.createElement("ui-metric");
    el.appendChild(metric);
    el.setAttribute("size", "l");

    // Wait for slotchange event to fire
    await new Promise((r) => setTimeout(r, 0));

    expect(metric.getAttribute("size")).toBe("l");
  });

  it("propagates size to multiple slotted ui-metric children", async () => {
    const m1 = document.createElement("ui-metric");
    const m2 = document.createElement("ui-metric");
    el.appendChild(m1);
    el.appendChild(m2);
    el.setAttribute("size", "m");

    await new Promise((r) => setTimeout(r, 0));

    expect(m1.getAttribute("size")).toBe("m");
    expect(m2.getAttribute("size")).toBe("m");
  });

  it("does not propagate size to non-ui-metric children", async () => {
    const div = document.createElement("div");
    el.appendChild(div);
    el.setAttribute("size", "l");

    await new Promise((r) => setTimeout(r, 0));

    expect(div.hasAttribute("size")).toBe(false);
  });

  it("does not propagate when size attribute is absent", async () => {
    const metric = document.createElement("ui-metric");
    el.appendChild(metric);

    await new Promise((r) => setTimeout(r, 0));

    // No size attribute on group → no propagation
    expect(metric.hasAttribute("size")).toBe(false);
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observes size and title attributes", () => {
    const Ctor = customElements.get("ui-metric-group") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes).toEqual(
      expect.arrayContaining(["size", "title"]),
    );
  });

  // ── DOM structure ─────────────────────────────────────────────────────────

  it("separator is first child of wrapper", () => {
    const wrapper = el.shadowRoot!.querySelector(".wrapper")!;
    expect((wrapper.firstElementChild as HTMLElement).className).toBe("separator");
  });

  it("group is second child of wrapper", () => {
    const wrapper = el.shadowRoot!.querySelector(".wrapper")!;
    const children = Array.from(wrapper.children);
    expect((children[1] as HTMLElement).className).toBe("group");
  });

  it("title is first child of group", () => {
    const group = el.shadowRoot!.querySelector(".group")!;
    expect((group.firstElementChild as HTMLElement).className).toBe("title");
  });

  it("metrics is second child of group", () => {
    const group = el.shadowRoot!.querySelector(".group")!;
    const children = Array.from(group.children);
    expect((children[1] as HTMLElement).className).toBe("metrics");
  });
});
