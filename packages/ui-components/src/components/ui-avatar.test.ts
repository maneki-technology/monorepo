import { describe, it, expect, beforeEach } from "vitest";
import "./ui-avatar.js";

describe("ui-avatar", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-avatar");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-avatar")).toBeDefined();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults type to 'text'", () => {
    expect((el as unknown as { type: string }).type).toBe("text");
  });

  it("defaults emphasis to 'bold'", () => {
    expect((el as unknown as { emphasis: string }).emphasis).toBe("bold");
  });

  it("defaults shape to 'circle'", () => {
    expect((el as unknown as { shape: string }).shape).toBe("circle");
  });

  it("defaults status to 'none'", () => {
    expect((el as unknown as { status: string }).status).toBe("none");
  });

  it("defaults color to 'none'", () => {
    expect((el as unknown as { color: string }).color).toBe("none");
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

  it("reflects size='xl' to attribute", () => {
    (el as unknown as { size: string }).size = "xl";
    expect(el.getAttribute("size")).toBe("xl");
  });

  // ── Type attribute ──────────────────────────────────────────────────────

  it("reflects type='text' to attribute", () => {
    (el as unknown as { type: string }).type = "text";
    expect(el.getAttribute("type")).toBe("text");
  });

  it("reflects type='icon' to attribute", () => {
    (el as unknown as { type: string }).type = "icon";
    expect(el.getAttribute("type")).toBe("icon");
  });

  it("reflects type='image' to attribute", () => {
    (el as unknown as { type: string }).type = "image";
    expect(el.getAttribute("type")).toBe("image");
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

  // ── Shape attribute ─────────────────────────────────────────────────────

  it("reflects shape='circle' to attribute", () => {
    (el as unknown as { shape: string }).shape = "circle";
    expect(el.getAttribute("shape")).toBe("circle");
  });

  it("reflects shape='square' to attribute", () => {
    (el as unknown as { shape: string }).shape = "square";
    expect(el.getAttribute("shape")).toBe("square");
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

  // ── Color attribute ─────────────────────────────────────────────────────

  it("reflects color='none' to attribute", () => {
    (el as unknown as { color: string }).color = "none";
    expect(el.getAttribute("color")).toBe("none");
  });

  it("reflects color='gray' to attribute", () => {
    (el as unknown as { color: string }).color = "gray";
    expect(el.getAttribute("color")).toBe("gray");
  });

  it("reflects color='red' to attribute", () => {
    (el as unknown as { color: string }).color = "red";
    expect(el.getAttribute("color")).toBe("red");
  });

  it("reflects color='orange' to attribute", () => {
    (el as unknown as { color: string }).color = "orange";
    expect(el.getAttribute("color")).toBe("orange");
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

  it("reflects color='purple' to attribute", () => {
    (el as unknown as { color: string }).color = "purple";
    expect(el.getAttribute("color")).toBe("purple");
  });

  it("reflects color='pink' to attribute", () => {
    (el as unknown as { color: string }).color = "pink";
    expect(el.getAttribute("color")).toBe("pink");
  });

  // ── ARIA role="img" ─────────────────────────────────────────────────────

  it("has role='img' on the host element", () => {
    expect(el.getAttribute("role")).toBe("img");
  });

  it("does not override existing role attribute", () => {
    document.body.innerHTML = "";
    const custom = document.createElement("ui-avatar");
    custom.setAttribute("role", "presentation");
    document.body.appendChild(custom);
    expect(custom.getAttribute("role")).toBe("presentation");
  });

  // ── Shadow DOM structure ───────────────────────────────────────────────

  it("has .base element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".base")).toBeTruthy();
  });

  it("has .text element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".text")).toBeTruthy();
  });

  it("has .icon element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".icon")).toBeTruthy();
  });

  it("has .image element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".image")).toBeTruthy();
  });

  it("has default icon slot in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    const iconSlot = shadow.querySelector('slot[name="icon"]');
    expect(iconSlot).toBeTruthy();
  });

  it("has image slot in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    const imageSlot = shadow.querySelector('slot[name="image"]');
    expect(imageSlot).toBeTruthy();
  });

  it("has default (text) slot in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    const defaultSlot = shadow.querySelector("slot:not([name])");
    expect(defaultSlot).toBeTruthy();
  });

  // ── Default icon for type=icon ─────────────────────────────────────────

  it("shows default user icon when type=icon and no icon slotted", () => {
    el.setAttribute("type", "icon");
    const shadow = el.shadowRoot!;
    const defaultIcon = shadow.querySelector(".default-icon");
    expect(defaultIcon).toBeTruthy();
    expect(defaultIcon!.querySelector("svg")).toBeTruthy();
  });

  // ── Property accessors ────────────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      size: string;
      type: string;
      emphasis: string;
      shape: string;
      status: string;
      color: string;
    };

    component.size = "l";
    expect(component.size).toBe("l");

    component.type = "icon";
    expect(component.type).toBe("icon");

    component.emphasis = "subtle";
    expect(component.emphasis).toBe("subtle");

    component.shape = "square";
    expect(component.shape).toBe("square");

    component.status = "error";
    expect(component.status).toBe("error");

    component.color = "blue";
    expect(component.color).toBe("blue");
  });

  // ── observedAttributes ────────────────────────────────────────────────

  it("observes size, type, emphasis, shape, status, color attributes", () => {
    const observed = (
      customElements.get("ui-avatar") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("size");
    expect(observed).toContain("type");
    expect(observed).toContain("emphasis");
    expect(observed).toContain("shape");
    expect(observed).toContain("status");
    expect(observed).toContain("color");
  });
});
