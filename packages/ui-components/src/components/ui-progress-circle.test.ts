import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./ui-progress-circle.js";
import type { ProgressCircleSize, ProgressCircleLabelPosition } from "./ui-progress-circle.js";
import { STATUS_FILL, STATUS_TRACK } from "./ui-progress-bar.styles.js";

describe("ui-progress-circle", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-progress-circle");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-progress-circle")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .container element", () => {
    expect(el.shadowRoot!.querySelector(".container")).not.toBeNull();
  });

  it("renders an SVG element", () => {
    expect(el.shadowRoot!.querySelector("svg")).not.toBeNull();
  });

  it("renders a .track-circle element", () => {
    expect(el.shadowRoot!.querySelector(".track-circle")).not.toBeNull();
  });

  it("renders a .fill-circle element", () => {
    expect(el.shadowRoot!.querySelector(".fill-circle")).not.toBeNull();
  });

  it("renders a .percentage element", () => {
    expect(el.shadowRoot!.querySelector(".percentage")).not.toBeNull();
  });

  it("renders a .label element", () => {
    expect(el.shadowRoot!.querySelector(".label")).not.toBeNull();
  });

  // ── Default attribute values ──────────────────────────────────────────────

  it("defaults size to m", () => {
    expect(el.getAttribute("size")).toBe("m");
  });

  it("defaults label-position to bottom", () => {
    expect(el.getAttribute("label-position")).toBe("bottom");
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

  // ── Attribute: label-position ─────────────────────────────────────────────

  it("accepts label-position=none", () => {
    el.setAttribute("label-position", "none");
    expect(el.getAttribute("label-position")).toBe("none");
  });

  it("accepts label-position=bottom", () => {
    el.setAttribute("label-position", "bottom");
    expect(el.getAttribute("label-position")).toBe("bottom");
  });

  it("accepts label-position=right", () => {
    el.setAttribute("label-position", "right");
    expect(el.getAttribute("label-position")).toBe("right");
  });

  // ── Attribute: status ─────────────────────────────────────────────────────

  it("accepts status=success", () => {
    el.setAttribute("status", "success");
    expect(el.getAttribute("status")).toBe("success");
  });

  it("accepts status=error", () => {
    el.setAttribute("status", "error");
    expect(el.getAttribute("status")).toBe("error");
  });

  it("accepts status=warning", () => {
    el.setAttribute("status", "warning");
    expect(el.getAttribute("status")).toBe("warning");
  });

  it("accepts status=none", () => {
    el.setAttribute("status", "none");
    expect(el.getAttribute("status")).toBe("none");
  });

  // ── Attribute: value & label-text ─────────────────────────────────────────

  it("accepts value=75", () => {
    el.setAttribute("value", "75");
    expect(el.getAttribute("value")).toBe("75");
  });

  it("accepts label-text attribute", () => {
    el.setAttribute("label-text", "CPU Usage");
    expect(el.getAttribute("label-text")).toBe("CPU Usage");
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size getter returns current attribute", () => {
    el.setAttribute("size", "s");
    expect((el as unknown as { size: ProgressCircleSize }).size).toBe("s");
  });

  it("size setter updates attribute", () => {
    (el as unknown as { size: ProgressCircleSize }).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("labelPosition getter returns current attribute", () => {
    el.setAttribute("label-position", "right");
    expect((el as unknown as { labelPosition: ProgressCircleLabelPosition }).labelPosition).toBe("right");
  });

  it("labelPosition setter updates attribute", () => {
    (el as unknown as { labelPosition: ProgressCircleLabelPosition }).labelPosition = "none";
    expect(el.getAttribute("label-position")).toBe("none");
  });

  it("status getter returns current attribute", () => {
    el.setAttribute("status", "error");
    expect((el as unknown as { status: string }).status).toBe("error");
  });

  it("status setter updates attribute", () => {
    (el as unknown as { status: string }).status = "success";
    expect(el.getAttribute("status")).toBe("success");
  });

  it("value getter returns numeric value", () => {
    el.setAttribute("value", "60");
    expect((el as unknown as { value: number }).value).toBe(60);
  });

  it("value setter updates attribute", () => {
    (el as unknown as { value: number }).value = 88;
    expect(el.getAttribute("value")).toBe("88");
  });

  it("labelText getter returns current attribute", () => {
    el.setAttribute("label-text", "Memory");
    expect((el as unknown as { labelText: string }).labelText).toBe("Memory");
  });

  it("labelText setter updates attribute", () => {
    (el as unknown as { labelText: string }).labelText = "Disk";
    expect(el.getAttribute("label-text")).toBe("Disk");
  });

  // ── Value clamping ────────────────────────────────────────────────────────

  it("clamps value below 0 to 0 via getter", () => {
    el.setAttribute("value", "-20");
    expect((el as unknown as { value: number }).value).toBe(0);
  });

  it("clamps value above 100 to 100 via getter", () => {
    el.setAttribute("value", "999");
    expect((el as unknown as { value: number }).value).toBe(100);
  });

  it("clamps value below 0 to 0 via setter", () => {
    (el as unknown as { value: number }).value = -5;
    expect(el.getAttribute("value")).toBe("0");
  });

  it("clamps value above 100 to 100 via setter", () => {
    (el as unknown as { value: number }).value = 200;
    expect(el.getAttribute("value")).toBe("100");
  });

  it("treats non-numeric value as 0", () => {
    el.setAttribute("value", "xyz");
    expect((el as unknown as { value: number }).value).toBe(0);
  });

  // ── SVG dimensions ────────────────────────────────────────────────────────

  it("renders 52px SVG for size=m", () => {
    el.setAttribute("size", "m");
    const svg = el.shadowRoot!.querySelector("svg") as SVGSVGElement;
    expect(svg.getAttribute("width")).toBe("52");
    expect(svg.getAttribute("height")).toBe("52");
  });

  it("renders 24px SVG for size=s", () => {
    el.setAttribute("size", "s");
    const svg = el.shadowRoot!.querySelector("svg") as SVGSVGElement;
    expect(svg.getAttribute("width")).toBe("24");
    expect(svg.getAttribute("height")).toBe("24");
  });

  it("sets correct viewBox for size=m", () => {
    el.setAttribute("size", "m");
    const svg = el.shadowRoot!.querySelector("svg") as SVGSVGElement;
    expect(svg.getAttribute("viewBox")).toBe("0 0 52 52");
  });

  it("sets correct viewBox for size=s", () => {
    el.setAttribute("size", "s");
    const svg = el.shadowRoot!.querySelector("svg") as SVGSVGElement;
    expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
  });

  // ── SVG circle attributes ─────────────────────────────────────────────────

  it("sets track circle cx/cy to center for size=m", () => {
    el.setAttribute("size", "m");
    const track = el.shadowRoot!.querySelector(".track-circle") as SVGCircleElement;
    expect(track.getAttribute("cx")).toBe("26");
    expect(track.getAttribute("cy")).toBe("26");
  });

  it("sets track circle radius for size=m (r = (52-4)/2 = 24)", () => {
    el.setAttribute("size", "m");
    const track = el.shadowRoot!.querySelector(".track-circle") as SVGCircleElement;
    expect(track.getAttribute("r")).toBe("24");
  });

  it("sets track circle stroke-width for size=m", () => {
    el.setAttribute("size", "m");
    const track = el.shadowRoot!.querySelector(".track-circle") as SVGCircleElement;
    expect(track.getAttribute("stroke-width")).toBe("4");
  });

  it("sets fill circle radius for size=s (r = (24-3)/2 = 10.5)", () => {
    el.setAttribute("size", "s");
    const fill = el.shadowRoot!.querySelector(".fill-circle") as SVGCircleElement;
    expect(fill.getAttribute("r")).toBe("10.5");
  });

  it("sets fill circle stroke-linecap to round", () => {
    const fill = el.shadowRoot!.querySelector(".fill-circle") as SVGCircleElement;
    expect(fill.getAttribute("stroke-linecap")).toBe("round");
  });

  // ── Percentage text ───────────────────────────────────────────────────────

  it("shows percentage text for size=m", () => {
    el.setAttribute("size", "m");
    el.setAttribute("value", "42");
    const pct = el.shadowRoot!.querySelector(".percentage") as HTMLElement;
    expect(pct.textContent).toBe("42%");
  });

  it("updates percentage text when value changes", () => {
    el.setAttribute("value", "10");
    el.setAttribute("value", "99");
    const pct = el.shadowRoot!.querySelector(".percentage") as HTMLElement;
    expect(pct.textContent).toBe("99%");
  });

  it("shows 0% for default value", () => {
    const pct = el.shadowRoot!.querySelector(".percentage") as HTMLElement;
    expect(pct.textContent).toBe("0%");
  });

  // ── Label text ────────────────────────────────────────────────────────────

  it("renders label-text in .label element", () => {
    el.setAttribute("label-text", "CPU");
    const label = el.shadowRoot!.querySelector(".label") as HTMLElement;
    expect(label.textContent).toBe("CPU");
  });

  it("updates label when label-text changes", () => {
    el.setAttribute("label-text", "CPU");
    el.setAttribute("label-text", "Memory");
    const label = el.shadowRoot!.querySelector(".label") as HTMLElement;
    expect(label.textContent).toBe("Memory");
  });

  it("renders empty label when no label-text", () => {
    const label = el.shadowRoot!.querySelector(".label") as HTMLElement;
    expect(label.textContent).toBe("");
  });

  // ── Status colors ─────────────────────────────────────────────────────────

  it("applies track stroke color for information status", () => {
    el.setAttribute("status", "information");
    const track = el.shadowRoot!.querySelector(".track-circle") as SVGCircleElement;
    expect(track.style.stroke).toBe(STATUS_TRACK.information);
  });

  it("applies fill stroke color for information status", () => {
    el.setAttribute("status", "information");
    const fill = el.shadowRoot!.querySelector(".fill-circle") as SVGCircleElement;
    expect(fill.style.stroke).toBe(STATUS_FILL.information);
  });

  it("applies fill stroke color for error status", () => {
    el.setAttribute("status", "error");
    const fill = el.shadowRoot!.querySelector(".fill-circle") as SVGCircleElement;
    expect(fill.style.stroke).toBe(STATUS_FILL.error);
  });

  it("applies track stroke color for open status", () => {
    el.setAttribute("status", "open");
    const track = el.shadowRoot!.querySelector(".track-circle") as SVGCircleElement;
    expect(track.style.stroke).toBe(STATUS_TRACK.open);
  });

  // ── Stroke dash ───────────────────────────────────────────────────────────

  it("sets strokeDasharray on fill circle", () => {
    const fill = el.shadowRoot!.querySelector(".fill-circle") as SVGCircleElement;
    expect(fill.style.strokeDasharray).not.toBe("");
  });

  it("sets strokeDashoffset based on value", () => {
    el.setAttribute("value", "50");
    const fill = el.shadowRoot!.querySelector(".fill-circle") as SVGCircleElement;
    // For m: radius=24, circumference=2*PI*24≈150.796, offset=circumference*0.5≈75.398
    const circumference = 2 * Math.PI * 24;
    const expectedOffset = circumference - (50 / 100) * circumference;
    expect(fill.style.strokeDashoffset).toBe(String(expectedOffset));
  });

  it("sets full offset (no fill) for value=0", () => {
    el.setAttribute("value", "0");
    const fill = el.shadowRoot!.querySelector(".fill-circle") as SVGCircleElement;
    const circumference = 2 * Math.PI * 24;
    expect(fill.style.strokeDashoffset).toBe(String(circumference));
  });

  it("sets zero offset (full fill) for value=100", () => {
    el.setAttribute("value", "100");
    const fill = el.shadowRoot!.querySelector(".fill-circle") as SVGCircleElement;
    expect(fill.style.strokeDashoffset).toBe("0");
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it("sets role=progressbar on .container", () => {
    const container = el.shadowRoot!.querySelector(".container") as HTMLElement;
    expect(container.getAttribute("role")).toBe("progressbar");
  });

  it("sets aria-valuemin=0", () => {
    const container = el.shadowRoot!.querySelector(".container") as HTMLElement;
    expect(container.getAttribute("aria-valuemin")).toBe("0");
  });

  it("sets aria-valuemax=100", () => {
    const container = el.shadowRoot!.querySelector(".container") as HTMLElement;
    expect(container.getAttribute("aria-valuemax")).toBe("100");
  });

  it("sets aria-valuenow to current value", () => {
    el.setAttribute("value", "55");
    const container = el.shadowRoot!.querySelector(".container") as HTMLElement;
    expect(container.getAttribute("aria-valuenow")).toBe("55");
  });

  it("updates aria-valuenow when value changes", () => {
    el.setAttribute("value", "10");
    el.setAttribute("value", "80");
    const container = el.shadowRoot!.querySelector(".container") as HTMLElement;
    expect(container.getAttribute("aria-valuenow")).toBe("80");
  });

  it("sets aria-label when label-text is provided", () => {
    el.setAttribute("label-text", "Upload progress");
    const container = el.shadowRoot!.querySelector(".container") as HTMLElement;
    expect(container.getAttribute("aria-label")).toBe("Upload progress");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observes size attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("size");
  });

  it("observes label-position attribute", () => {
    const observed = (el.constructor as typeof HTMLElement & { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("label-position");
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
