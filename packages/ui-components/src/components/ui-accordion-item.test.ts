import { describe, it, expect, beforeEach } from "vitest";
import "./ui-accordion-item.js";

describe("ui-accordion-item", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-accordion-item");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-accordion-item")).toBeDefined();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults emphasis to 'subtle'", () => {
    expect((el as unknown as { emphasis: string }).emphasis).toBe("subtle");
  });

  it("defaults expanded to false", () => {
    expect((el as unknown as { expanded: boolean }).expanded).toBe(false);
  });

  it("defaults status to 'none'", () => {
    expect((el as unknown as { status: string }).status).toBe("none");
  });

  it("defaults disabled to false", () => {
    expect((el as unknown as { disabled: boolean }).disabled).toBe(false);
  });

  // ── Size attribute ──────────────────────────────────────────────────────

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

  // ── Expanded toggle ─────────────────────────────────────────────────────

  it("toggles expanded when header is clicked", () => {
    const shadow = el.shadowRoot!;
    const header = shadow.querySelector(".header") as HTMLElement;
    expect((el as unknown as { expanded: boolean }).expanded).toBe(false);
    header.click();
    expect((el as unknown as { expanded: boolean }).expanded).toBe(true);
    header.click();
    expect((el as unknown as { expanded: boolean }).expanded).toBe(false);
  });

  // ── Expanded property ───────────────────────────────────────────────────

  it("sets expanded attribute when property is true", () => {
    (el as unknown as { expanded: boolean }).expanded = true;
    expect(el.hasAttribute("expanded")).toBe(true);
  });

  it("removes expanded attribute when property is false", () => {
    (el as unknown as { expanded: boolean }).expanded = true;
    (el as unknown as { expanded: boolean }).expanded = false;
    expect(el.hasAttribute("expanded")).toBe(false);
  });

  // ── Disabled ────────────────────────────────────────────────────────────

  it("does not toggle expanded when disabled and header is clicked", () => {
    const shadow = el.shadowRoot!;
    const header = shadow.querySelector(".header") as HTMLElement;
    (el as unknown as { disabled: boolean }).disabled = true;
    expect((el as unknown as { expanded: boolean }).expanded).toBe(false);
    header.click();
    expect((el as unknown as { expanded: boolean }).expanded).toBe(false);
  });

  // ── Status attribute ────────────────────────────────────────────────────

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

  it("reflects status='none' to attribute", () => {
    (el as unknown as { status: string }).status = "none";
    expect(el.getAttribute("status")).toBe("none");
  });

  // ── Status icon rendering ───────────────────────────────────────────────

  it("renders error SVG when status='error'", () => {
    el.setAttribute("status", "error");
    const shadow = el.shadowRoot!;
    const statusIcon = shadow.querySelector(".status-icon");
    const svg = statusIcon?.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("renders warning SVG when status='warning'", () => {
    el.setAttribute("status", "warning");
    const shadow = el.shadowRoot!;
    const statusIcon = shadow.querySelector(".status-icon");
    const svg = statusIcon?.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("renders success SVG when status='success'", () => {
    el.setAttribute("status", "success");
    const shadow = el.shadowRoot!;
    const statusIcon = shadow.querySelector(".status-icon");
    const svg = statusIcon?.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("clears status icon when status='none'", () => {
    el.setAttribute("status", "error");
    el.setAttribute("status", "none");
    const shadow = el.shadowRoot!;
    const statusIcon = shadow.querySelector(".status-icon");
    const svg = statusIcon?.querySelector("svg");
    expect(svg).toBeNull();
  });

  // ── Leading icon attribute ──────────────────────────────────────────────

  it("exposes leadingIcon property as false by default", () => {
    expect((el as unknown as { leadingIcon: boolean }).leadingIcon).toBe(false);
  });

  it("sets leadingIcon property to true when attribute is present", () => {
    el.setAttribute("leading-icon", "");
    expect((el as unknown as { leadingIcon: boolean }).leadingIcon).toBe(true);
  });

  it("reflects leadingIcon property to attribute", () => {
    (el as unknown as { leadingIcon: boolean }).leadingIcon = true;
    expect(el.hasAttribute("leading-icon")).toBe(true);
  });

  // ── Toggle event ────────────────────────────────────────────────────────

  it("dispatches toggle event with expanded detail when header is clicked", () => {
    const shadow = el.shadowRoot!;
    const header = shadow.querySelector(".header") as HTMLElement;
    let detail: unknown = null;
    el.addEventListener("toggle", (e: Event) => {
      detail = (e as CustomEvent).detail;
    });
    header.click();
    expect(detail).toEqual({ expanded: true });
  });

  it("does not dispatch toggle event when disabled", () => {
    const shadow = el.shadowRoot!;
    const header = shadow.querySelector(".header") as HTMLElement;
    (el as unknown as { disabled: boolean }).disabled = true;
    let eventFired = false;
    el.addEventListener("toggle", () => {
      eventFired = true;
    });
    header.click();
    expect(eventFired).toBe(false);
  });

  // ── Keyboard: Enter ─────────────────────────────────────────────────────

  it("toggles expanded when Enter key is pressed on header", () => {
    const shadow = el.shadowRoot!;
    const header = shadow.querySelector(".header") as HTMLElement;
    expect((el as unknown as { expanded: boolean }).expanded).toBe(false);
    header.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
    );
    expect((el as unknown as { expanded: boolean }).expanded).toBe(true);
  });

  // ── Keyboard: Space ─────────────────────────────────────────────────────

  it("toggles expanded when Space key is pressed on header", () => {
    const shadow = el.shadowRoot!;
    const header = shadow.querySelector(".header") as HTMLElement;
    expect((el as unknown as { expanded: boolean }).expanded).toBe(false);
    header.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", bubbles: true })
    );
    expect((el as unknown as { expanded: boolean }).expanded).toBe(true);
  });

  // ── ARIA: aria-expanded ─────────────────────────────────────────────────

  it("syncs aria-expanded to 'false' by default", () => {
    const shadow = el.shadowRoot!;
    const header = shadow.querySelector(".header");
    expect(header?.getAttribute("aria-expanded")).toBe("false");
  });

  it("syncs aria-expanded to 'true' when expanded", () => {
    const shadow = el.shadowRoot!;
    const header = shadow.querySelector(".header");
    (el as unknown as { expanded: boolean }).expanded = true;
    expect(header?.getAttribute("aria-expanded")).toBe("true");
  });

  // ── ARIA: role ──────────────────────────────────────────────────────────

  it("has role='button' on header", () => {
    const shadow = el.shadowRoot!;
    const header = shadow.querySelector(".header");
    expect(header?.getAttribute("role")).toBe("button");
  });

  it("has role='region' on content panel", () => {
    const shadow = el.shadowRoot!;
    const content = shadow.querySelector(".content");
    expect(content?.getAttribute("role")).toBe("region");
  });

  // ── ARIA: aria-controls ────────────────────────────────────────────────

  it("has aria-controls linking header to content panel", () => {
    const shadow = el.shadowRoot!;
    const header = shadow.querySelector(".header");
    const content = shadow.querySelector(".content");
    const headerId = header?.getAttribute("aria-controls");
    const contentId = content?.id;
    expect(headerId).toBe(contentId);
    expect(headerId).toBeTruthy();
  });

  // ── ARIA: aria-labelledby ──────────────────────────────────────────────

  it("has aria-labelledby linking content panel to header", () => {
    const shadow = el.shadowRoot!;
    const header = shadow.querySelector(".header");
    const content = shadow.querySelector(".content");
    const contentLabelledBy = content?.getAttribute("aria-labelledby");
    const headerId = header?.id;
    expect(contentLabelledBy).toBe(headerId);
    expect(headerId).toBeTruthy();
  });

  // ── Shadow DOM structure ────────────────────────────────────────────────

  it("has separator element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    const separator = shadow.querySelector(".separator");
    expect(separator).toBeTruthy();
  });

  it("has chevron element with SVG in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    const chevron = shadow.querySelector(".chevron");
    const svg = chevron?.querySelector("svg");
    expect(chevron).toBeTruthy();
    expect(svg).toBeTruthy();
  });

  it("has content panel in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    const content = shadow.querySelector(".content");
    expect(content).toBeTruthy();
  });

  // ── Property accessors ──────────────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      size: string;
      emphasis: string;
      expanded: boolean;
      leadingIcon: boolean;
      status: string;
      disabled: boolean;
    };

    component.size = "l";
    expect(component.size).toBe("l");

    component.emphasis = "bold";
    expect(component.emphasis).toBe("bold");

    component.expanded = true;
    expect(component.expanded).toBe(true);

    component.leadingIcon = true;
    expect(component.leadingIcon).toBe(true);

    component.status = "error";
    expect(component.status).toBe("error");

    component.disabled = true;
    expect(component.disabled).toBe(true);
  });
});
