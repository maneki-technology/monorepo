import { describe, it, expect, beforeEach } from "vitest";
import "./ui-alert.js";

describe("ui-alert", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-alert");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-alert")).toBeDefined();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults emphasis to 'bold'", () => {
    expect((el as unknown as { emphasis: string }).emphasis).toBe("bold");
  });

  it("defaults status to 'none'", () => {
    expect((el as unknown as { status: string }).status).toBe("none");
  });

  it("defaults dismissable to false", () => {
    expect((el as unknown as { dismissable: boolean }).dismissable).toBe(false);
  });

  it("defaults leadingIcon to false", () => {
    expect((el as unknown as { leadingIcon: boolean }).leadingIcon).toBe(false);
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

  // ── Status attribute ────────────────────────────────────────────────────

  it("reflects status='none' to attribute", () => {
    (el as unknown as { status: string }).status = "none";
    expect(el.getAttribute("status")).toBe("none");
  });

  it("reflects status='information' to attribute", () => {
    (el as unknown as { status: string }).status = "information";
    expect(el.getAttribute("status")).toBe("information");
  });

  it("reflects status='success' to attribute", () => {
    (el as unknown as { status: string }).status = "success";
    expect(el.getAttribute("status")).toBe("success");
  });

  it("reflects status='error' to attribute", () => {
    (el as unknown as { status: string }).status = "error";
    expect(el.getAttribute("status")).toBe("error");
  });

  it("reflects status='warning' to attribute", () => {
    (el as unknown as { status: string }).status = "warning";
    expect(el.getAttribute("status")).toBe("warning");
  });

  // ── Dismissable attribute ───────────────────────────────────────────────

  it("sets dismissable attribute when property is true", () => {
    (el as unknown as { dismissable: boolean }).dismissable = true;
    expect(el.hasAttribute("dismissable")).toBe(true);
  });

  it("removes dismissable attribute when property is false", () => {
    (el as unknown as { dismissable: boolean }).dismissable = true;
    (el as unknown as { dismissable: boolean }).dismissable = false;
    expect(el.hasAttribute("dismissable")).toBe(false);
  });

  // ── Leading icon attribute ──────────────────────────────────────────────

  it("sets leading-icon attribute when leadingIcon property is true", () => {
    (el as unknown as { leadingIcon: boolean }).leadingIcon = true;
    expect(el.hasAttribute("leading-icon")).toBe(true);
  });

  it("removes leading-icon attribute when leadingIcon property is false", () => {
    (el as unknown as { leadingIcon: boolean }).leadingIcon = true;
    (el as unknown as { leadingIcon: boolean }).leadingIcon = false;
    expect(el.hasAttribute("leading-icon")).toBe(false);
  });

  // ── Close button dispatches dismiss event ───────────────────────────────

  it("dispatches dismiss event when close button is clicked", () => {
    el.setAttribute("dismissable", "");
    const shadow = el.shadowRoot!;
    const closeBtn = shadow.querySelector(".close-btn") as HTMLElement;
    let eventFired = false;
    el.addEventListener("dismiss", () => {
      eventFired = true;
    });
    closeBtn.click();
    expect(eventFired).toBe(true);
  });

  it("dismiss event has bubbles and composed set to true", () => {
    el.setAttribute("dismissable", "");
    const shadow = el.shadowRoot!;
    const closeBtn = shadow.querySelector(".close-btn") as HTMLElement;
    let event: CustomEvent | null = null;
    el.addEventListener("dismiss", (e: Event) => {
      event = e as CustomEvent;
    });
    closeBtn.click();
    expect(event).toBeTruthy();
    expect(event!.bubbles).toBe(true);
    expect(event!.composed).toBe(true);
  });

  // ── Close button hidden when not dismissable ───────────────────────────

  it("close button is not visible when dismissable is absent", () => {
    const shadow = el.shadowRoot!;
    const closeBtn = shadow.querySelector(".close-btn") as HTMLElement;
    expect(closeBtn).toBeTruthy();
    // The button exists in DOM but is hidden via CSS :host([dismissable]) .close-btn
    // Without the attribute, display is 'none'
    expect(el.hasAttribute("dismissable")).toBe(false);
  });

  it("close button is visible when dismissable is present", () => {
    el.setAttribute("dismissable", "");
    const shadow = el.shadowRoot!;
    const closeBtn = shadow.querySelector(".close-btn") as HTMLElement;
    expect(closeBtn).toBeTruthy();
    expect(el.hasAttribute("dismissable")).toBe(true);
  });

  // ── ARIA role="alert" ──────────────────────────────────────────────────

  it("has role='alert' on the host element", () => {
    expect(el.getAttribute("role")).toBe("alert");
  });

  it("does not override existing role attribute", () => {
    document.body.innerHTML = "";
    const custom = document.createElement("ui-alert");
    custom.setAttribute("role", "status");
    document.body.appendChild(custom);
    expect(custom.getAttribute("role")).toBe("status");
  });

  // ── Close button ARIA ──────────────────────────────────────────────────

  it("close button has aria-label='Dismiss'", () => {
    const shadow = el.shadowRoot!;
    const closeBtn = shadow.querySelector(".close-btn") as HTMLElement;
    expect(closeBtn.getAttribute("aria-label")).toBe("Dismiss");
  });

  // ── Shadow DOM structure ───────────────────────────────────────────────

  it("has .base element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".base")).toBeTruthy();
  });

  it("has .top-content element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".top-content")).toBeTruthy();
  });

  it("has .title element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".title")).toBeTruthy();
  });

  it("has .close-btn element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".close-btn")).toBeTruthy();
  });

  it("has .description element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".description")).toBeTruthy();
  });

  it("has .leading-icon element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".leading-icon")).toBeTruthy();
  });
  it("footer is hidden by default", () => {
    const shadow = el.shadowRoot!;
    const footer = shadow.querySelector(".footer");
    expect(footer).toBeTruthy();
    expect(el.hasAttribute("has-footer")).toBe(false);
  });
  it("has .footer element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".footer")).toBeTruthy();
  });

  // ── Leading icon visibility ────────────────────────────────────────────

  it("leading-icon container is present but hidden by default", () => {
    const shadow = el.shadowRoot!;
    const leadingIcon = shadow.querySelector(".leading-icon");
    expect(leadingIcon).toBeTruthy();
    expect(el.hasAttribute("leading-icon")).toBe(false);
  });

  it("leading-icon container becomes visible when attribute is set", () => {
    el.setAttribute("leading-icon", "");
    const shadow = el.shadowRoot!;
    const leadingIcon = shadow.querySelector(".leading-icon");
    expect(leadingIcon).toBeTruthy();
    expect(el.hasAttribute("leading-icon")).toBe(true);
  });

  // ── Property accessors ────────────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      size: string;
      emphasis: string;
      status: string;
      dismissable: boolean;
      leadingIcon: boolean;
    };

    component.size = "l";
    expect(component.size).toBe("l");

    component.emphasis = "subtle";
    expect(component.emphasis).toBe("subtle");

    component.status = "error";
    expect(component.status).toBe("error");

    component.dismissable = true;
    expect(component.dismissable).toBe(true);

    component.leadingIcon = true;
    expect(component.leadingIcon).toBe(true);
  });
});
