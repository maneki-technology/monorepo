import { describe, it, expect, beforeEach } from "vitest";
import "./ui-badge.js";
import { STYLES } from "./ui-badge.js";

describe("ui-badge", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-badge");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-badge")).toBeDefined();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults emphasis to 'bold'", () => {
    expect((el as unknown as { emphasis: string }).emphasis).toBe("bold");
  });

  it("defaults shape to 'square'", () => {
    expect((el as unknown as { shape: string }).shape).toBe("square");
  });

  it("defaults color to 'none'", () => {
    expect((el as unknown as { color: string }).color).toBe("none");
  });

  it("defaults status to 'none'", () => {
    expect((el as unknown as { status: string }).status).toBe("none");
  });

  // ── Size attribute ──────────────────────────────────────────────────────

  it("reflects size='xs' to attribute", () => {
    (el as unknown as { size: string }).size = "xs";
    expect(el.getAttribute("size")).toBe("xs");
  });

  it("reflects size='s' to attribute", () => {
    (el as unknown as { size: string }).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("reflects size='m' to attribute", () => {
    (el as unknown as { size: string }).size = "m";
    expect(el.getAttribute("size")).toBe("m");
  });

  it("reflects size='l' to attribute", () => {
    (el as unknown as { size: string }).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  // ── Emphasis attribute ──────────────────────────────────────────────────

  it("reflects emphasis='bold' to attribute", () => {
    (el as unknown as { emphasis: string }).emphasis = "bold";
    expect(el.getAttribute("emphasis")).toBe("bold");
  });

  it("reflects emphasis='subtle' to attribute", () => {
    (el as unknown as { emphasis: string }).emphasis = "subtle";
    expect(el.getAttribute("emphasis")).toBe("subtle");
  });

  it("reflects emphasis='minimal' to attribute", () => {
    (el as unknown as { emphasis: string }).emphasis = "minimal";
    expect(el.getAttribute("emphasis")).toBe("minimal");
  });

  // ── Shape attribute ─────────────────────────────────────────────────────

  it("reflects shape='square' to attribute", () => {
    (el as unknown as { shape: string }).shape = "square";
    expect(el.getAttribute("shape")).toBe("square");
  });

  it("reflects shape='rounded' to attribute", () => {
    (el as unknown as { shape: string }).shape = "rounded";
    expect(el.getAttribute("shape")).toBe("rounded");
  });

  // ── Color attribute ─────────────────────────────────────────────────────

  it("reflects color='none' to attribute", () => {
    (el as unknown as { color: string }).color = "none";
    expect(el.getAttribute("color")).toBe("none");
  });

  it("reflects color='red' to attribute", () => {
    (el as unknown as { color: string }).color = "red";
    expect(el.getAttribute("color")).toBe("red");
  });

  it("reflects color='yellow' to attribute", () => {
    (el as unknown as { color: string }).color = "yellow";
    expect(el.getAttribute("color")).toBe("yellow");
  });

  it("reflects color='green' to attribute", () => {
    (el as unknown as { color: string }).color = "green";
    expect(el.getAttribute("color")).toBe("green");
  });

  it("reflects color='blue' to attribute", () => {
    (el as unknown as { color: string }).color = "blue";
    expect(el.getAttribute("color")).toBe("blue");
  });

  it("reflects color='lime' to attribute", () => {
    (el as unknown as { color: string }).color = "lime";
    expect(el.getAttribute("color")).toBe("lime");
  });

  it("reflects color='teal' to attribute", () => {
    (el as unknown as { color: string }).color = "teal";
    expect(el.getAttribute("color")).toBe("teal");
  });

  it("reflects color='turquoise' to attribute", () => {
    (el as unknown as { color: string }).color = "turquoise";
    expect(el.getAttribute("color")).toBe("turquoise");
  });

  it("reflects color='aqua' to attribute", () => {
    (el as unknown as { color: string }).color = "aqua";
    expect(el.getAttribute("color")).toBe("aqua");
  });

  it("reflects color='ultramarine' to attribute", () => {
    (el as unknown as { color: string }).color = "ultramarine";
    expect(el.getAttribute("color")).toBe("ultramarine");
  });

  it("reflects color='pink' to attribute", () => {
    (el as unknown as { color: string }).color = "pink";
    expect(el.getAttribute("color")).toBe("pink");
  });

  it("reflects color='purple' to attribute", () => {
    (el as unknown as { color: string }).color = "purple";
    expect(el.getAttribute("color")).toBe("purple");
  });

  it("reflects color='orange' to attribute", () => {
    (el as unknown as { color: string }).color = "orange";
    expect(el.getAttribute("color")).toBe("orange");
  });

  // ── Status attribute ────────────────────────────────────────────────────

  it("reflects status='none' to attribute", () => {
    (el as unknown as { status: string }).status = "none";
    expect(el.getAttribute("status")).toBe("none");
  });

  it("reflects status='error' to attribute", () => {
    (el as unknown as { status: string }).status = "error";
    expect(el.getAttribute("status")).toBe("error");
  });

  it("reflects status='warning' to attribute", () => {
    (el as unknown as { status: string }).status = "warning";
    expect(el.getAttribute("status")).toBe("warning");
  });

  it("reflects status='success' to attribute", () => {
    (el as unknown as { status: string }).status = "success";
    expect(el.getAttribute("status")).toBe("success");
  });

  it("reflects status='information' to attribute", () => {
    (el as unknown as { status: string }).status = "information";
    expect(el.getAttribute("status")).toBe("information");
  });

  // ── Shadow DOM structure ───────────────────────────────────────────────

  it("has .base element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".base")).toBeTruthy();
  });

  it("has a <span> as .base element", () => {
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base");
    expect(base!.tagName).toBe("SPAN");
  });

  it("has default slot in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    const defaultSlot = shadow.querySelector("slot:not([name])");
    expect(defaultSlot).toBeTruthy();
  });

  it("has slot inside .base element", () => {
    const shadow = el.shadowRoot!;
    const base = shadow.querySelector(".base");
    const slot = base!.querySelector("slot");
    expect(slot).toBeTruthy();
  });

  it("has a <style> element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.adoptedStyleSheets.length).toBeGreaterThan(0);
  });

  // ── Property accessors ────────────────────────────────────────────────

  it("exposes size property accessor", () => {
    const component = el as unknown as { size: string };
    component.size = "l";
    expect(component.size).toBe("l");
    expect(el.getAttribute("size")).toBe("l");
  });

  it("exposes emphasis property accessor", () => {
    const component = el as unknown as { emphasis: string };
    component.emphasis = "subtle";
    expect(component.emphasis).toBe("subtle");
    expect(el.getAttribute("emphasis")).toBe("subtle");
  });

  it("exposes shape property accessor", () => {
    const component = el as unknown as { shape: string };
    component.shape = "rounded";
    expect(component.shape).toBe("rounded");
    expect(el.getAttribute("shape")).toBe("rounded");
  });

  it("exposes color property accessor", () => {
    const component = el as unknown as { color: string };
    component.color = "blue";
    expect(component.color).toBe("blue");
    expect(el.getAttribute("color")).toBe("blue");
  });

  it("exposes status property accessor", () => {
    const component = el as unknown as { status: string };
    component.status = "error";
    expect(component.status).toBe("error");
    expect(el.getAttribute("status")).toBe("error");
  });

  it("exposes all typed property accessors together", () => {
    const component = el as unknown as {
      size: string;
      emphasis: string;
      shape: string;
      color: string;
      status: string;
    };

    component.size = "xs";
    expect(component.size).toBe("xs");

    component.emphasis = "minimal";
    expect(component.emphasis).toBe("minimal");

    component.shape = "rounded";
    expect(component.shape).toBe("rounded");

    component.color = "purple";
    expect(component.color).toBe("purple");

    component.status = "success";
    expect(component.status).toBe("success");
  });

  // ── observedAttributes ────────────────────────────────────────────────

  it("observes size attribute", () => {
    const observed = (
      customElements.get("ui-badge") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("size");
  });

  it("observes emphasis attribute", () => {
    const observed = (
      customElements.get("ui-badge") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("emphasis");
  });

  it("observes shape attribute", () => {
    const observed = (
      customElements.get("ui-badge") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("shape");
  });

  it("observes color attribute", () => {
    const observed = (
      customElements.get("ui-badge") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("color");
  });

  it("observes status attribute", () => {
    const observed = (
      customElements.get("ui-badge") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("status");
  });

  // ── Attribute via setAttribute ────────────────────────────────────────

  it("reads size from setAttribute", () => {
    el.setAttribute("size", "xs");
    expect((el as unknown as { size: string }).size).toBe("xs");
  });

  it("reads emphasis from setAttribute", () => {
    el.setAttribute("emphasis", "minimal");
    expect((el as unknown as { emphasis: string }).emphasis).toBe("minimal");
  });

  it("reads shape from setAttribute", () => {
    el.setAttribute("shape", "rounded");
    expect((el as unknown as { shape: string }).shape).toBe("rounded");
  });

  it("reads color from setAttribute", () => {
    el.setAttribute("color", "teal");
    expect((el as unknown as { color: string }).color).toBe("teal");
  });

  it("reads status from setAttribute", () => {
    el.setAttribute("status", "warning");
    expect((el as unknown as { status: string }).status).toBe("warning");
  });

  // ── Display ───────────────────────────────────────────────────────────

  it("is an inline-flex element via :host", () => {
    const shadow = el.shadowRoot!;
    const styles = shadow.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain("display: inline-flex");
  });

  // ── CSS contains expected token references ────────────────────────────

  it("CSS contains --ui-badge-bg custom property", () => {
    expect(STYLES).toContain("--ui-badge-bg");
  });

  it("CSS contains --ui-badge-color custom property", () => {
    expect(STYLES).toContain("--ui-badge-color");
  });

  it("CSS contains --ui-badge-border custom property", () => {
    expect(STYLES).toContain("--ui-badge-border");
  });

  it("CSS contains text-transform: uppercase", () => {
    const shadow = el.shadowRoot!;
    const styles = shadow.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain("text-transform: uppercase");
  });

  it("CSS contains font-weight: 500", () => {
    const shadow = el.shadowRoot!;
    const styles = shadow.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain("font-weight: 500");
  });

  it("CSS contains white-space: nowrap", () => {
    const shadow = el.shadowRoot!;
    const styles = shadow.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
    expect(styles).toContain("white-space: nowrap");
  });

  // ── Multiple instances ────────────────────────────────────────────────

  it("supports multiple independent instances", () => {
    const el2 = document.createElement("ui-badge");
    document.body.appendChild(el2);

    (el as unknown as { color: string }).color = "red";
    (el2 as unknown as { color: string }).color = "blue";

    expect((el as unknown as { color: string }).color).toBe("red");
    expect((el2 as unknown as { color: string }).color).toBe("blue");
  });
});
