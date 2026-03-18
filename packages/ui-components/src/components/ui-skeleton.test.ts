import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./ui-skeleton.js";
import type { SkeletonVariant } from "./ui-skeleton.js";
import { UiSkeleton } from "./ui-skeleton.js";

describe("ui-skeleton", () => {
  let el: UiSkeleton;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-skeleton") as UiSkeleton;
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-skeleton")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .bone element", () => {
    const bone = el.shadowRoot!.querySelector(".bone");
    expect(bone).not.toBeNull();
  });

  it("sets aria-hidden on .bone", () => {
    const bone = el.shadowRoot!.querySelector(".bone");
    expect(bone!.getAttribute("aria-hidden")).toBe("true");
  });

  it(".bone is a div", () => {
    const bone = el.shadowRoot!.querySelector(".bone");
    expect(bone!.tagName).toBe("DIV");
  });

  // ── Default attributes ────────────────────────────────────────────────────

  it("sets role=status by default", () => {
    expect(el.getAttribute("role")).toBe("status");
  });

  it("sets aria-label=Loading by default", () => {
    expect(el.getAttribute("aria-label")).toBe("Loading");
  });

  it("does not override existing role", () => {
    const custom = document.createElement("ui-skeleton") as UiSkeleton;
    custom.setAttribute("role", "progressbar");
    document.body.appendChild(custom);
    expect(custom.getAttribute("role")).toBe("progressbar");
  });

  it("does not override existing aria-label", () => {
    const custom = document.createElement("ui-skeleton") as UiSkeleton;
    custom.setAttribute("aria-label", "Please wait");
    document.body.appendChild(custom);
    expect(custom.getAttribute("aria-label")).toBe("Please wait");
  });

  // ── Variant: text (default) ───────────────────────────────────────────────

  it("defaults variant to text", () => {
    expect(el.variant).toBe("text");
  });

  it("text variant has no variant attribute on host", () => {
    expect(el.hasAttribute("variant")).toBe(false);
  });

  // ── Variant: circle ───────────────────────────────────────────────────────

  it("accepts circle variant via attribute", () => {
    el.setAttribute("variant", "circle");
    expect(el.variant).toBe("circle");
  });

  it("circle variant reflects attribute", () => {
    el.variant = "circle";
    expect(el.getAttribute("variant")).toBe("circle");
  });

  // ── Variant: rect ─────────────────────────────────────────────────────────

  it("accepts rect variant via attribute", () => {
    el.setAttribute("variant", "rect");
    expect(el.variant).toBe("rect");
  });

  it("rect variant reflects attribute", () => {
    el.variant = "rect";
    expect(el.getAttribute("variant")).toBe("rect");
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("variant getter returns attribute value", () => {
    el.setAttribute("variant", "circle");
    expect(el.variant).toBe("circle");
  });

  it("variant setter sets attribute", () => {
    el.variant = "rect";
    expect(el.getAttribute("variant")).toBe("rect");
  });

  it("variant getter returns text when no attribute", () => {
    expect(el.variant).toBe("text");
  });

  // ── Width / height attributes ─────────────────────────────────────────────

  it("setting width updates --ui-skeleton-width on .bone", () => {
    el.setAttribute("width", "200px");
    const bone = el.shadowRoot!.querySelector(".bone") as HTMLElement;
    expect(bone.style.getPropertyValue("--ui-skeleton-width")).toBe("200px");
  });

  it("setting height updates --ui-skeleton-height on .bone", () => {
    el.setAttribute("height", "32px");
    const bone = el.shadowRoot!.querySelector(".bone") as HTMLElement;
    expect(bone.style.getPropertyValue("--ui-skeleton-height")).toBe("32px");
  });

  it("width without suffix appends px", () => {
    el.setAttribute("width", "120");
    const bone = el.shadowRoot!.querySelector(".bone") as HTMLElement;
    expect(bone.style.getPropertyValue("--ui-skeleton-width")).toBe("120px");
  });

  it("width with px suffix is kept as-is", () => {
    el.setAttribute("width", "80px");
    const bone = el.shadowRoot!.querySelector(".bone") as HTMLElement;
    expect(bone.style.getPropertyValue("--ui-skeleton-width")).toBe("80px");
  });

  it("width with % suffix is kept as-is", () => {
    el.setAttribute("width", "50%");
    const bone = el.shadowRoot!.querySelector(".bone") as HTMLElement;
    expect(bone.style.getPropertyValue("--ui-skeleton-width")).toBe("50%");
  });

  it("height without suffix appends px", () => {
    el.setAttribute("height", "24");
    const bone = el.shadowRoot!.querySelector(".bone") as HTMLElement;
    expect(bone.style.getPropertyValue("--ui-skeleton-height")).toBe("24px");
  });

  it("removing width clears --ui-skeleton-width", () => {
    el.setAttribute("width", "100px");
    el.removeAttribute("width");
    const bone = el.shadowRoot!.querySelector(".bone") as HTMLElement;
    expect(bone.style.getPropertyValue("--ui-skeleton-width")).toBe("");
  });

  it("removing height clears --ui-skeleton-height", () => {
    el.setAttribute("height", "48px");
    el.removeAttribute("height");
    const bone = el.shadowRoot!.querySelector(".bone") as HTMLElement;
    expect(bone.style.getPropertyValue("--ui-skeleton-height")).toBe("");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observedAttributes includes variant", () => {
    expect(UiSkeleton.observedAttributes).toContain("variant");
  });

  it("observedAttributes includes width", () => {
    expect(UiSkeleton.observedAttributes).toContain("width");
  });

  it("observedAttributes includes height", () => {
    expect(UiSkeleton.observedAttributes).toContain("height");
  });

  it("observedAttributes has exactly 3 entries", () => {
    expect(UiSkeleton.observedAttributes).toHaveLength(3);
  });

  // ── STYLES content ────────────────────────────────────────────────────────

  it("STYLES contains @keyframes pulse", () => {
    const sheet = el.shadowRoot!.adoptedStyleSheets[0];
    const rules = Array.from(sheet.cssRules).map((r) => r.cssText);
    const hasPulse = rules.some((r) => r.includes("pulse"));
    expect(hasPulse).toBe(true);
  });

  it("STYLES contains prefers-reduced-motion", () => {
    const sheet = el.shadowRoot!.adoptedStyleSheets[0];
    const rules = Array.from(sheet.cssRules).map((r) => r.cssText);
    const hasReducedMotion = rules.some((r) =>
      r.includes("prefers-reduced-motion"),
    );
    expect(hasReducedMotion).toBe(true);
  });

  // ── attributeChangedCallback guards ────────────────────────────────────────

  it("does not sync dimensions when not connected", () => {
    const detached = document.createElement("ui-skeleton") as UiSkeleton;
    detached.setAttribute("width", "100px");
    const bone = detached.shadowRoot!.querySelector(".bone") as HTMLElement;
    expect(bone.style.getPropertyValue("--ui-skeleton-width")).toBe("");
  });
});
