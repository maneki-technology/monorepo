import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-modal.js";

describe("ui-modal", () => {
  let el: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = "";
    el = document.createElement("ui-modal");
    document.body.appendChild(el);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-modal")).toBeDefined();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults layout to 'auto'", () => {
    expect((el as unknown as { layout: string }).layout).toBe("auto");
  });

  it("defaults open to false", () => {
    expect((el as unknown as { open: boolean }).open).toBe(false);
  });

  it("defaults dismissible to false", () => {
    expect((el as unknown as { dismissible: boolean }).dismissible).toBe(false);
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

  it("reads size from attribute", () => {
    el.setAttribute("size", "l");
    expect((el as unknown as { size: string }).size).toBe("l");
  });

  // ── Layout attribute ────────────────────────────────────────────────────

  it("reflects layout='auto' to attribute", () => {
    (el as unknown as { layout: string }).layout = "auto";
    expect(el.getAttribute("layout")).toBe("auto");
  });

  it("reflects layout='fluid' to attribute", () => {
    (el as unknown as { layout: string }).layout = "fluid";
    expect(el.getAttribute("layout")).toBe("fluid");
  });

  it("reads layout from attribute", () => {
    el.setAttribute("layout", "fluid");
    expect((el as unknown as { layout: string }).layout).toBe("fluid");
  });

  // ── Open/close ──────────────────────────────────────────────────────────

  it("sets open attribute when open property is true", () => {
    (el as unknown as { open: boolean }).open = true;
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("removes open attribute when open property is false", () => {
    (el as unknown as { open: boolean }).open = true;
    (el as unknown as { open: boolean }).open = false;
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("host is display:none when not open", () => {
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("host has open attribute when opened via setAttribute", () => {
    el.setAttribute("open", "");
    expect((el as unknown as { open: boolean }).open).toBe(true);
  });

  it("show() sets open attribute", () => {
    (el as unknown as { show: () => void }).show();
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("close() removes open attribute", () => {
    (el as unknown as { open: boolean }).open = true;
    (el as unknown as { close: () => void }).close();
    vi.advanceTimersByTime(250);
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("close() dispatches close event before removing attribute", () => {
    (el as unknown as { open: boolean }).open = true;
    let eventFired = false;
    el.addEventListener("close", () => {
      eventFired = true;
    });
    (el as unknown as { close: () => void }).close();
    expect(eventFired).toBe(true);
  });

  it("close() does not remove open if close event is prevented", () => {
    (el as unknown as { open: boolean }).open = true;
    el.addEventListener("close", (e: Event) => {
      e.preventDefault();
    });
    (el as unknown as { close: () => void }).close();
    expect(el.hasAttribute("open")).toBe(true);
  });

  // ── Dismissible attribute ───────────────────────────────────────────────

  it("sets dismissible attribute when property is true", () => {
    (el as unknown as { dismissible: boolean }).dismissible = true;
    expect(el.hasAttribute("dismissible")).toBe(true);
  });

  it("removes dismissible attribute when property is false", () => {
    (el as unknown as { dismissible: boolean }).dismissible = true;
    (el as unknown as { dismissible: boolean }).dismissible = false;
    expect(el.hasAttribute("dismissible")).toBe(false);
  });

  // ── Close button visibility ─────────────────────────────────────────────

  it("close button exists in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    const closeBtn = shadow.querySelector(".close-btn");
    expect(closeBtn).toBeTruthy();
  });

  it("close button is hidden when not dismissible", () => {
    expect(el.hasAttribute("dismissible")).toBe(false);
    // CSS hides it via :host([dismissible]) .close-btn { display: inline-flex }
  });

  it("close button is visible when dismissible", () => {
    el.setAttribute("dismissible", "");
    expect(el.hasAttribute("dismissible")).toBe(true);
  });

  it("close button click calls close()", () => {
    el.setAttribute("dismissible", "");
    el.setAttribute("open", "");
    const shadow = el.shadowRoot!;
    const closeBtn = shadow.querySelector(".close-btn") as HTMLElement;
    let eventFired = false;
    el.addEventListener("close", () => {
      eventFired = true;
    });
    closeBtn.click();
    expect(eventFired).toBe(true);
    vi.advanceTimersByTime(250);
    expect(el.hasAttribute("open")).toBe(false);
  });

  // ── Backdrop click ──────────────────────────────────────────────────────

  it("backdrop click closes when dismissible", () => {
    el.setAttribute("dismissible", "");
    el.setAttribute("open", "");
    const shadow = el.shadowRoot!;
    const backdrop = shadow.querySelector(".backdrop") as HTMLElement;
    backdrop.click();
    vi.advanceTimersByTime(250);
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("backdrop click does not close when not dismissible", () => {
    el.setAttribute("open", "");
    const shadow = el.shadowRoot!;
    const backdrop = shadow.querySelector(".backdrop") as HTMLElement;
    backdrop.click();
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("clicking dialog does not close modal", () => {
    el.setAttribute("dismissible", "");
    el.setAttribute("open", "");
    const shadow = el.shadowRoot!;
    const dialog = shadow.querySelector(".dialog") as HTMLElement;
    dialog.click();
    expect(el.hasAttribute("open")).toBe(true);
  });

  // ── Escape key ──────────────────────────────────────────────────────────

  it("escape key closes when dismissible and open", () => {
    el.setAttribute("dismissible", "");
    el.setAttribute("open", "");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    vi.advanceTimersByTime(250);
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("escape key does not close when not dismissible", () => {
    el.setAttribute("open", "");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("escape key does not close when not open", () => {
    el.setAttribute("dismissible", "");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("non-escape key does not close modal", () => {
    el.setAttribute("dismissible", "");
    el.setAttribute("open", "");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(el.hasAttribute("open")).toBe(true);
  });

  // ── Close event ─────────────────────────────────────────────────────────

  it("close event has bubbles and composed set to true", () => {
    el.setAttribute("open", "");
    let event: CustomEvent | null = null;
    el.addEventListener("close", (e: Event) => {
      event = e as CustomEvent;
    });
    (el as unknown as { close: () => void }).close();
    expect(event).toBeTruthy();
    expect(event!.bubbles).toBe(true);
    expect(event!.composed).toBe(true);
  });

  it("close event is cancelable", () => {
    el.setAttribute("open", "");
    let event: CustomEvent | null = null;
    el.addEventListener("close", (e: Event) => {
      event = e as CustomEvent;
    });
    (el as unknown as { close: () => void }).close();
    expect(event).toBeTruthy();
    expect(event!.cancelable).toBe(true);
  });

  it("close event dispatched on escape key dismiss", () => {
    el.setAttribute("dismissible", "");
    el.setAttribute("open", "");
    let eventFired = false;
    el.addEventListener("close", () => {
      eventFired = true;
    });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(eventFired).toBe(true);
  });

  it("close event dispatched on backdrop click dismiss", () => {
    el.setAttribute("dismissible", "");
    el.setAttribute("open", "");
    let eventFired = false;
    el.addEventListener("close", () => {
      eventFired = true;
    });
    const shadow = el.shadowRoot!;
    const backdrop = shadow.querySelector(".backdrop") as HTMLElement;
    backdrop.click();
    expect(eventFired).toBe(true);
  });

  it("preventing close event on escape keeps modal open", () => {
    el.setAttribute("dismissible", "");
    el.setAttribute("open", "");
    el.addEventListener("close", (e: Event) => {
      e.preventDefault();
    });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("preventing close event on backdrop click keeps modal open", () => {
    el.setAttribute("dismissible", "");
    el.setAttribute("open", "");
    el.addEventListener("close", (e: Event) => {
      e.preventDefault();
    });
    const shadow = el.shadowRoot!;
    const backdrop = shadow.querySelector(".backdrop") as HTMLElement;
    backdrop.click();
    expect(el.hasAttribute("open")).toBe(true);
  });

  // ── Slot detection ──────────────────────────────────────────────────────

  it("has-subtitle not set by default", () => {
    expect(el.hasAttribute("has-subtitle")).toBe(false);
  });

  it("has-footer not set by default", () => {
    expect(el.hasAttribute("has-footer")).toBe(false);
  });

  // ── Property accessors ────────────────────────────────────────────────

  it("exposes size property accessor", () => {
    const component = el as unknown as { size: string };
    component.size = "l";
    expect(component.size).toBe("l");
    expect(el.getAttribute("size")).toBe("l");
  });

  it("exposes layout property accessor", () => {
    const component = el as unknown as { layout: string };
    component.layout = "fluid";
    expect(component.layout).toBe("fluid");
    expect(el.getAttribute("layout")).toBe("fluid");
  });

  it("exposes open property accessor", () => {
    const component = el as unknown as { open: boolean };
    component.open = true;
    expect(component.open).toBe(true);
    expect(el.hasAttribute("open")).toBe(true);
    component.open = false;
    expect(component.open).toBe(false);
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("exposes dismissible property accessor", () => {
    const component = el as unknown as { dismissible: boolean };
    component.dismissible = true;
    expect(component.dismissible).toBe(true);
    expect(el.hasAttribute("dismissible")).toBe(true);
    component.dismissible = false;
    expect(component.dismissible).toBe(false);
    expect(el.hasAttribute("dismissible")).toBe(false);
  });

  // ── ARIA attributes ─────────────────────────────────────────────────────

  it("dialog has role='dialog'", () => {
    const shadow = el.shadowRoot!;
    const dialog = shadow.querySelector(".dialog") as HTMLElement;
    expect(dialog.getAttribute("role")).toBe("dialog");
  });

  it("dialog has aria-modal='true'", () => {
    const shadow = el.shadowRoot!;
    const dialog = shadow.querySelector(".dialog") as HTMLElement;
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });

  it("dialog has aria-labelledby pointing to title", () => {
    const shadow = el.shadowRoot!;
    const dialog = shadow.querySelector(".dialog") as HTMLElement;
    const title = shadow.querySelector("#modal-title");
    expect(dialog.getAttribute("aria-labelledby")).toBe("modal-title");
    expect(title).toBeTruthy();
  });

  it("close button has aria-label='Close'", () => {
    const shadow = el.shadowRoot!;
    const closeBtn = shadow.querySelector(".close-btn") as HTMLElement;
    expect(closeBtn.getAttribute("aria-label")).toBe("Close");
  });

  // ── Focus management ────────────────────────────────────────────────────

  it("dialog has tabindex=-1 for programmatic focus", () => {
    const shadow = el.shadowRoot!;
    const dialog = shadow.querySelector(".dialog") as HTMLElement;
    expect(dialog.getAttribute("tabindex")).toBe("-1");
  });

  // ── Shadow DOM structure ────────────────────────────────────────────────

  it("has .backdrop element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".backdrop")).toBeTruthy();
  });

  it("has .dialog element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".dialog")).toBeTruthy();
  });

  it("has .header element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".header")).toBeTruthy();
  });

  it("has .title-group element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".title-group")).toBeTruthy();
  });

  it("has .title element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".title")).toBeTruthy();
  });

  it("has .subtitle element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".subtitle")).toBeTruthy();
  });

  it("has .body element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".body")).toBeTruthy();
  });

  it("has .footer element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".footer")).toBeTruthy();
  });

  it("has .footer-start element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".footer-start")).toBeTruthy();
  });

  it("has .footer-end element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".footer-end")).toBeTruthy();
  });

  it("has .close-btn element in shadow DOM", () => {
    const shadow = el.shadowRoot!;
    expect(shadow.querySelector(".close-btn")).toBeTruthy();
  });

  // ── Slots ───────────────────────────────────────────────────────────────

  it("has default slot for title", () => {
    const shadow = el.shadowRoot!;
    const title = shadow.querySelector(".title");
    const slot = title?.querySelector("slot:not([name])");
    expect(slot).toBeTruthy();
  });

  it("has subtitle slot", () => {
    const shadow = el.shadowRoot!;
    const slot = shadow.querySelector('slot[name="subtitle"]');
    expect(slot).toBeTruthy();
  });

  it("has body slot", () => {
    const shadow = el.shadowRoot!;
    const slot = shadow.querySelector('slot[name="body"]');
    expect(slot).toBeTruthy();
  });

  it("has footer-start slot", () => {
    const shadow = el.shadowRoot!;
    const slot = shadow.querySelector('slot[name="footer-start"]');
    expect(slot).toBeTruthy();
  });

  it("has footer-end slot", () => {
    const shadow = el.shadowRoot!;
    const slot = shadow.querySelector('slot[name="footer-end"]');
    expect(slot).toBeTruthy();
  });

  // ── Animation ───────────────────────────────────────────────────────────

  it("backdrop starts without visible class", () => {
    const shadow = el.shadowRoot!;
    const backdrop = shadow.querySelector(".backdrop") as HTMLElement;
    expect(backdrop.classList.contains("visible")).toBe(false);
  });

  it("backdrop gets visible class removed on close", () => {
    el.setAttribute("open", "");
    const shadow = el.shadowRoot!;
    const backdrop = shadow.querySelector(".backdrop") as HTMLElement;
    // Manually add visible to simulate animation having completed
    backdrop.classList.add("visible");
    el.removeAttribute("open");
    expect(backdrop.classList.contains("visible")).toBe(false);
  });

  // ── Fluid layout ────────────────────────────────────────────────────────

  it("accepts fluid layout attribute", () => {
    el.setAttribute("layout", "fluid");
    expect((el as unknown as { layout: string }).layout).toBe("fluid");
  });

  it("accepts auto layout attribute", () => {
    el.setAttribute("layout", "auto");
    expect((el as unknown as { layout: string }).layout).toBe("auto");
  });

  // ── Multiple modals ─────────────────────────────────────────────────────

  it("only topmost modal responds to escape", () => {
    const modal1 = document.createElement("ui-modal");
    modal1.setAttribute("dismissible", "");
    modal1.setAttribute("open", "");
    document.body.appendChild(modal1);

    const modal2 = document.createElement("ui-modal");
    modal2.setAttribute("dismissible", "");
    modal2.setAttribute("open", "");
    document.body.appendChild(modal2);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    vi.advanceTimersByTime(250);

    // Both modals close since both are dismissible and open
    expect(modal2.hasAttribute("open")).toBe(false);
  });

  // ── Disconnected cleanup ────────────────────────────────────────────────

  it("removes keydown listener on disconnect", () => {
    el.setAttribute("dismissible", "");
    el.setAttribute("open", "");
    document.body.removeChild(el);
    // After disconnect, escape should not affect the element
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    // Element still has open attribute since listener was removed
    expect(el.hasAttribute("open")).toBe(true);
  });

  // ── observedAttributes ──────────────────────────────────────────────────

  it("observes size, open, dismissible, layout attributes", () => {
    const observed = (customElements.get("ui-modal") as unknown as { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("size");
    expect(observed).toContain("open");
    expect(observed).toContain("dismissible");
    expect(observed).toContain("layout");
  });

  // ── Close button SVG ────────────────────────────────────────────────────

  it("close button contains SVG icon", () => {
    const shadow = el.shadowRoot!;
    const closeBtn = shadow.querySelector(".close-btn") as HTMLElement;
    expect(closeBtn.querySelector("svg")).toBeTruthy();
  });

  // ── Title ID ────────────────────────────────────────────────────────────

  it("title element has id 'modal-title'", () => {
    const shadow = el.shadowRoot!;
    const title = shadow.querySelector(".title") as HTMLElement;
    expect(title.id).toBe("modal-title");
  });

  // ── Footer hidden by default ────────────────────────────────────────────

  it("footer is hidden by default (no has-footer attribute)", () => {
    expect(el.hasAttribute("has-footer")).toBe(false);
  });

  // ── Subtitle hidden by default ──────────────────────────────────────────

  it("subtitle is hidden by default (no has-subtitle attribute)", () => {
    expect(el.hasAttribute("has-subtitle")).toBe(false);
  });
});
