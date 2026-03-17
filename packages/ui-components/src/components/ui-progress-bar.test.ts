import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./ui-progress-bar.js";
import type { ProgressBarSize, ProgressBarLabel, ProgressStatus } from "./ui-progress-bar.js";
import {
  STATUS_FILL,
  STATUS_TRACK,
  STATUS_INNER_FILL,
  STATUS_INNER_TRACK,
} from "./ui-progress-bar.styles.js";

describe("ui-progress-bar", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-progress-bar");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-progress-bar")).toBeDefined();
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

  it("renders a .bar element", () => {
    expect(el.shadowRoot!.querySelector(".bar")).not.toBeNull();
  });

  it("renders a .track element", () => {
    expect(el.shadowRoot!.querySelector(".track")).not.toBeNull();
  });

  it("renders a .fill element", () => {
    expect(el.shadowRoot!.querySelector(".fill")).not.toBeNull();
  });

  it("renders a .top-label element", () => {
    expect(el.shadowRoot!.querySelector(".top-label")).not.toBeNull();
  });

  it("renders a .inner-label element", () => {
    expect(el.shadowRoot!.querySelector(".inner-label")).not.toBeNull();
  });

  // ── Default attribute values ──────────────────────────────────────────────

  it("defaults size to m", () => {
    expect(el.getAttribute("size")).toBe("m");
  });

  it("defaults label to top-label", () => {
    expect(el.getAttribute("label")).toBe("top-label");
  });

  it("defaults status to information", () => {
    expect(el.getAttribute("status")).toBe("information");
  });

  it("defaults value to 0", () => {
    expect(el.getAttribute("value")).toBe("0");
  });

  // ── Attribute: size ───────────────────────────────────────────────────────

  it("accepts size=s", () => {
    el.setAttribute("size", "s");
    expect(el.getAttribute("size")).toBe("s");
  });

  it("accepts size=m", () => {
    el.setAttribute("size", "m");
    expect(el.getAttribute("size")).toBe("m");
  });

  it("accepts size=l", () => {
    el.setAttribute("size", "l");
    expect(el.getAttribute("size")).toBe("l");
  });

  // ── Attribute: label ──────────────────────────────────────────────────────

  it("accepts label=none", () => {
    el.setAttribute("label", "none");
    expect(el.getAttribute("label")).toBe("none");
  });

  it("accepts label=top-label", () => {
    el.setAttribute("label", "top-label");
    expect(el.getAttribute("label")).toBe("top-label");
  });

  it("accepts label=inner-label", () => {
    el.setAttribute("label", "inner-label");
    expect(el.getAttribute("label")).toBe("inner-label");
  });

  // ── Attribute: status ─────────────────────────────────────────────────────

  const ALL_STATUSES: ProgressStatus[] = [
    "none",
    "information",
    "success",
    "warning",
    "error",
    "open",
    "complete",
    "suspended",
    "cancelled",
  ];

  for (const status of ALL_STATUSES) {
    it(`accepts status=${status}`, () => {
      el.setAttribute("status", status);
      expect(el.getAttribute("status")).toBe(status);
    });
  }

  // ── Attribute: value ──────────────────────────────────────────────────────

  it("accepts value=50", () => {
    el.setAttribute("value", "50");
    expect(el.getAttribute("value")).toBe("50");
  });

  it("accepts value=100", () => {
    el.setAttribute("value", "100");
    expect(el.getAttribute("value")).toBe("100");
  });

  // ── Attribute: label-text ─────────────────────────────────────────────────

  it("accepts label-text attribute", () => {
    el.setAttribute("label-text", "Loading…");
    expect(el.getAttribute("label-text")).toBe("Loading…");
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size getter returns current attribute", () => {
    el.setAttribute("size", "l");
    expect((el as unknown as { size: ProgressBarSize }).size).toBe("l");
  });

  it("size setter updates attribute", () => {
    (el as unknown as { size: ProgressBarSize }).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("label getter returns current attribute", () => {
    el.setAttribute("label", "inner-label");
    expect((el as unknown as { label: ProgressBarLabel }).label).toBe("inner-label");
  });

  it("label setter updates attribute", () => {
    (el as unknown as { label: ProgressBarLabel }).label = "none";
    expect(el.getAttribute("label")).toBe("none");
  });

  it("status getter returns current attribute", () => {
    el.setAttribute("status", "error");
    expect((el as unknown as { status: ProgressStatus }).status).toBe("error");
  });

  it("status setter updates attribute", () => {
    (el as unknown as { status: ProgressStatus }).status = "success";
    expect(el.getAttribute("status")).toBe("success");
  });

  it("value getter returns numeric value", () => {
    el.setAttribute("value", "75");
    expect((el as unknown as { value: number }).value).toBe(75);
  });

  it("value setter updates attribute", () => {
    (el as unknown as { value: number }).value = 42;
    expect(el.getAttribute("value")).toBe("42");
  });

  it("labelText getter returns current attribute", () => {
    el.setAttribute("label-text", "Progress");
    expect((el as unknown as { labelText: string }).labelText).toBe("Progress");
  });

  it("labelText setter updates attribute", () => {
    (el as unknown as { labelText: string }).labelText = "Uploading";
    expect(el.getAttribute("label-text")).toBe("Uploading");
  });

  // ── Value clamping ────────────────────────────────────────────────────────

  it("clamps value below 0 to 0 via getter", () => {
    el.setAttribute("value", "-10");
    expect((el as unknown as { value: number }).value).toBe(0);
  });

  it("clamps value above 100 to 100 via getter", () => {
    el.setAttribute("value", "200");
    expect((el as unknown as { value: number }).value).toBe(100);
  });

  it("clamps value below 0 to 0 via setter", () => {
    (el as unknown as { value: number }).value = -50;
    expect(el.getAttribute("value")).toBe("0");
  });

  it("clamps value above 100 to 100 via setter", () => {
    (el as unknown as { value: number }).value = 150;
    expect(el.getAttribute("value")).toBe("100");
  });

  it("treats non-numeric value as 0", () => {
    el.setAttribute("value", "abc");
    expect((el as unknown as { value: number }).value).toBe(0);
  });

  // ── Fill width ────────────────────────────────────────────────────────────

  it("sets fill width to 0% for value=0", () => {
    el.setAttribute("value", "0");
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    expect(fill.style.width).toBe("0%");
  });

  it("sets fill width to 50% for value=50", () => {
    el.setAttribute("value", "50");
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    expect(fill.style.width).toBe("50%");
  });

  it("sets fill width to 100% for value=100", () => {
    el.setAttribute("value", "100");
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  // ── Colors: default (non-inner) mode ──────────────────────────────────────

  it("applies correct track color for information status", () => {
    el.setAttribute("status", "information");
    const track = el.shadowRoot!.querySelector(".track") as HTMLElement;
    expect(track.style.backgroundColor).toBe(STATUS_TRACK.information);
  });

  it("applies correct fill color for information status", () => {
    el.setAttribute("status", "information");
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    expect(fill.style.backgroundColor).toBe(STATUS_FILL.information);
  });

  it("applies correct fill color for success status", () => {
    el.setAttribute("status", "success");
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    expect(fill.style.backgroundColor).toBe(STATUS_FILL.success);
  });

  it("applies correct fill color for error status", () => {
    el.setAttribute("status", "error");
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    expect(fill.style.backgroundColor).toBe(STATUS_FILL.error);
  });

  it("applies correct track color for open status", () => {
    el.setAttribute("status", "open");
    const track = el.shadowRoot!.querySelector(".track") as HTMLElement;
    expect(track.style.backgroundColor).toBe(STATUS_TRACK.open);
  });

  it("applies correct fill color for cancelled status", () => {
    el.setAttribute("status", "cancelled");
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    expect(fill.style.backgroundColor).toBe(STATUS_FILL.cancelled);
  });

  // ── Colors: inner-label mode ──────────────────────────────────────────────

  it("applies inner track color in inner-label mode", () => {
    el.setAttribute("label", "inner-label");
    el.setAttribute("status", "information");
    const track = el.shadowRoot!.querySelector(".track") as HTMLElement;
    expect(track.style.backgroundColor).toBe(STATUS_INNER_TRACK.information);
  });

  it("applies inner fill color in inner-label mode", () => {
    el.setAttribute("label", "inner-label");
    el.setAttribute("status", "information");
    const fill = el.shadowRoot!.querySelector(".fill") as HTMLElement;
    expect(fill.style.backgroundColor).toBe(STATUS_INNER_FILL.information);
  });

  it("switches from inner to normal colors when label changes", () => {
    el.setAttribute("label", "inner-label");
    el.setAttribute("status", "information");
    el.setAttribute("label", "top-label");
    const track = el.shadowRoot!.querySelector(".track") as HTMLElement;
    expect(track.style.backgroundColor).toBe(STATUS_TRACK.information);
  });

  // ── Top label mode ────────────────────────────────────────────────────────

  it("shows label-text in top label", () => {
    el.setAttribute("label", "top-label");
    el.setAttribute("label-text", "Uploading");
    const labelText = el.shadowRoot!.querySelector(".top-label .label-text") as HTMLElement;
    expect(labelText.textContent).toBe("Uploading");
  });

  it("shows value% in top label", () => {
    el.setAttribute("label", "top-label");
    el.setAttribute("value", "65");
    const valueText = el.shadowRoot!.querySelector(".top-label .value-text") as HTMLElement;
    expect(valueText.textContent).toBe("65%");
  });

  // ── Inner label mode ──────────────────────────────────────────────────────

  it("shows label-text in inner label", () => {
    el.setAttribute("label", "inner-label");
    el.setAttribute("label-text", "Processing");
    const labelText = el.shadowRoot!.querySelector(".inner-label .label-text") as HTMLElement;
    expect(labelText.textContent).toBe("Processing");
  });

  it("shows value% in inner label", () => {
    el.setAttribute("label", "inner-label");
    el.setAttribute("value", "30");
    const valueText = el.shadowRoot!.querySelector(".inner-label .value-text") as HTMLElement;
    expect(valueText.textContent).toBe("30%");
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it("sets role=progressbar on .bar", () => {
    const bar = el.shadowRoot!.querySelector(".bar") as HTMLElement;
    expect(bar.getAttribute("role")).toBe("progressbar");
  });

  it("sets aria-valuemin=0", () => {
    const bar = el.shadowRoot!.querySelector(".bar") as HTMLElement;
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
  });

  it("sets aria-valuemax=100", () => {
    const bar = el.shadowRoot!.querySelector(".bar") as HTMLElement;
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
  });

  it("sets aria-valuenow to current value", () => {
    el.setAttribute("value", "42");
    const bar = el.shadowRoot!.querySelector(".bar") as HTMLElement;
    expect(bar.getAttribute("aria-valuenow")).toBe("42");
  });

  it("updates aria-valuenow when value changes", () => {
    el.setAttribute("value", "10");
    el.setAttribute("value", "90");
    const bar = el.shadowRoot!.querySelector(".bar") as HTMLElement;
    expect(bar.getAttribute("aria-valuenow")).toBe("90");
  });

  it("sets aria-label when label-text is provided", () => {
    el.setAttribute("label-text", "Upload progress");
    const bar = el.shadowRoot!.querySelector(".bar") as HTMLElement;
    expect(bar.getAttribute("aria-label")).toBe("Upload progress");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observes size attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("size");
  });

  it("observes label attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("label");
  });

  it("observes status attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("status");
  });

  it("observes value attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("value");
  });

  it("observes label-text attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("label-text");
  });

  it("has exactly 5 observed attributes", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed.length).toBe(5);
  });
});
