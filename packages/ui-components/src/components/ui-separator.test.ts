import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./ui-separator.js";
import type {
  SeparatorOrientation,
  SeparatorEmphasis,
  SeparatorLength,
} from "./ui-separator.js";
import { UiSeparator } from "./ui-separator.js";

describe("ui-separator", () => {
  let el: UiSeparator;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-separator") as UiSeparator;
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-separator")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .line element", () => {
    const line = el.shadowRoot!.querySelector(".line");
    expect(line).not.toBeNull();
  });

  it("sets role=separator on the .line element", () => {
    const line = el.shadowRoot!.querySelector(".line");
    expect(line!.getAttribute("role")).toBe("separator");
  });

  // ── Default attributes ────────────────────────────────────────────────────

  it("defaults orientation to horizontal", () => {
    expect(el.getAttribute("orientation")).toBe("horizontal");
  });

  it("defaults emphasis to minimal", () => {
    expect(el.getAttribute("emphasis")).toBe("minimal");
  });

  it("defaults length to full", () => {
    expect(el.getAttribute("length")).toBe("full");
  });

  it("defaults role to separator on host", () => {
    expect(el.getAttribute("role")).toBe("separator");
  });

  // ── Orientation attribute ─────────────────────────────────────────────────

  it("accepts orientation=horizontal", () => {
    el.setAttribute("orientation", "horizontal");
    expect(el.getAttribute("orientation")).toBe("horizontal");
  });

  it("accepts orientation=vertical", () => {
    el.setAttribute("orientation", "vertical");
    expect(el.getAttribute("orientation")).toBe("vertical");
  });

  // ── Emphasis attribute ────────────────────────────────────────────────────

  const emphases: SeparatorEmphasis[] = [
    "minimal",
    "subtle",
    "moderate",
    "bold",
    "contrast",
  ];

  for (const emphasis of emphases) {
    it(`accepts emphasis=${emphasis}`, () => {
      el.setAttribute("emphasis", emphasis);
      expect(el.getAttribute("emphasis")).toBe(emphasis);
    });
  }

  // ── Length attribute ──────────────────────────────────────────────────────

  const lengths: SeparatorLength[] = [
    "full",
    "inset-04",
    "inset-08",
    "inset-16",
    "inset-24",
  ];

  for (const length of lengths) {
    it(`accepts length=${length}`, () => {
      el.setAttribute("length", length);
      expect(el.getAttribute("length")).toBe(length);
    });
  }

  // ── Property accessors ────────────────────────────────────────────────────

  it("orientation getter returns current attribute value", () => {
    el.setAttribute("orientation", "vertical");
    expect(el.orientation).toBe("vertical");
  });

  it("orientation setter updates the attribute", () => {
    el.orientation = "vertical";
    expect(el.getAttribute("orientation")).toBe("vertical");
  });

  it("emphasis getter returns current attribute value", () => {
    el.setAttribute("emphasis", "bold");
    expect(el.emphasis).toBe("bold");
  });

  it("emphasis setter updates the attribute", () => {
    el.emphasis = "contrast";
    expect(el.getAttribute("emphasis")).toBe("contrast");
  });

  it("length getter returns current attribute value", () => {
    el.setAttribute("length", "inset-16");
    expect(el.length).toBe("inset-16");
  });

  it("length setter updates the attribute", () => {
    el.length = "inset-24";
    expect(el.getAttribute("length")).toBe("inset-24");
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it("has role=separator on the host element", () => {
    expect(el.getAttribute("role")).toBe("separator");
  });

  it("does not override an existing role on the host", () => {
    const el2 = document.createElement("ui-separator") as UiSeparator;
    el2.setAttribute("role", "presentation");
    document.body.appendChild(el2);
    expect(el2.getAttribute("role")).toBe("presentation");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observes orientation, emphasis, and length", () => {
    expect(UiSeparator.observedAttributes).toEqual([
      "orientation",
      "emphasis",
      "length",
    ]);
  });

  it("observedAttributes has exactly 3 entries", () => {
    expect(UiSeparator.observedAttributes).toHaveLength(3);
  });
});
