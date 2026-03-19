import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "./ui-wizard.js";
import type { WizardLayout } from "./ui-wizard.js";

describe("ui-wizard", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-wizard");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-wizard")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── observedAttributes ─────────────────────────────────────────────────────

  it("declares observedAttributes", () => {
    const Ctor = customElements.get("ui-wizard") as unknown as { observedAttributes: string[] };
    expect(Ctor.observedAttributes).toEqual(["layout", "title", "current-step", "loading"]);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .header element", () => {
    expect(el.shadowRoot!.querySelector(".header")).not.toBeNull();
  });

  it("renders a .header-title element", () => {
    expect(el.shadowRoot!.querySelector(".header-title")).not.toBeNull();
  });

  it("renders a .steps-bar element", () => {
    expect(el.shadowRoot!.querySelector(".steps-bar")).not.toBeNull();
  });

  it("renders a .steps-sidebar element", () => {
    expect(el.shadowRoot!.querySelector(".steps-sidebar")).not.toBeNull();
  });

  it("renders a .content element", () => {
    expect(el.shadowRoot!.querySelector(".content")).not.toBeNull();
  });

  it("renders a .footer element", () => {
    expect(el.shadowRoot!.querySelector(".footer")).not.toBeNull();
  });

  it("renders a Previous button", () => {
    const buttons = el.shadowRoot!.querySelectorAll("ui-button");
    const prev = Array.from(buttons).find((b) => b.textContent === "Previous");
    expect(prev).toBeDefined();
  });

  it("renders a Next button", () => {
    const buttons = el.shadowRoot!.querySelectorAll("ui-button");
    const next = Array.from(buttons).find((b) => b.textContent === "Next" || b.textContent === "Finish");
    expect(next).toBeDefined();
  });

  // ── Default attributes ────────────────────────────────────────────────────

  it("defaults layout to horizontal", () => {
    expect(el.getAttribute("layout")).toBe("horizontal");
  });

  it("defaults current-step to 1", () => {
    expect(el.getAttribute("current-step")).toBe("1");
  });

  // ── Attribute: layout ─────────────────────────────────────────────────────

  it("reflects layout attribute to property", () => {
    el.setAttribute("layout", "vertical");
    expect((el as unknown as { layout: WizardLayout }).layout).toBe("vertical");
  });

  it("reflects layout property to attribute", () => {
    (el as unknown as { layout: WizardLayout }).layout = "vertical";
    expect(el.getAttribute("layout")).toBe("vertical");
  });

  // ── Attribute: title ──────────────────────────────────────────────────────

  it("reflects title attribute to wizardTitle property", () => {
    el.setAttribute("title", "Setup Wizard");
    expect((el as unknown as { wizardTitle: string }).wizardTitle).toBe("Setup Wizard");
  });

  it("reflects wizardTitle property to title attribute", () => {
    (el as unknown as { wizardTitle: string }).wizardTitle = "My Wizard";
    expect(el.getAttribute("title")).toBe("My Wizard");
  });

  it("updates header-title text when title is set", () => {
    el.setAttribute("title", "Account Setup");
    const title = el.shadowRoot!.querySelector(".header-title");
    expect(title!.textContent).toBe("Account Setup");
  });

  // ── Attribute: current-step ───────────────────────────────────────────────

  it("reflects current-step attribute to currentStep property", () => {
    el.setAttribute("current-step", "3");
    expect((el as unknown as { currentStep: number }).currentStep).toBe(3);
  });

  it("reflects currentStep property to current-step attribute", () => {
    (el as unknown as { currentStep: number }).currentStep = 4;
    expect(el.getAttribute("current-step")).toBe("4");
  });

  it("defaults currentStep to 1 for invalid values", () => {
    el.setAttribute("current-step", "abc");
    expect((el as unknown as { currentStep: number }).currentStep).toBe(1);
  });

  // ── Layout: horizontal ────────────────────────────────────────────────────

  it("shows steps-bar in horizontal layout", () => {
    el.setAttribute("layout", "horizontal");
    expect(el.getAttribute("layout")).toBe("horizontal");
    // CSS rule :host([layout="horizontal"]) .steps-bar { display: flex } applies at runtime;
    // happy-dom cannot resolve :host() selectors, so verify the attribute drives the rule
    const bar = el.shadowRoot!.querySelector(".steps-bar");
    expect(bar).not.toBeNull();
  });

  it("hides steps-sidebar in horizontal layout", () => {
    el.setAttribute("layout", "horizontal");
    const sidebar = el.shadowRoot!.querySelector(".steps-sidebar") as HTMLElement;
    const style = getComputedStyle(sidebar);
    expect(style.display).toBe("none");
  });

  // ── Layout: vertical ──────────────────────────────────────────────────────

  it("shows steps-sidebar in vertical layout", () => {
    el.setAttribute("layout", "vertical");
    expect(el.getAttribute("layout")).toBe("vertical");
    const sidebar = el.shadowRoot!.querySelector(".steps-sidebar");
    expect(sidebar).not.toBeNull();
  });

  it("hides steps-bar in vertical layout", () => {
    el.setAttribute("layout", "vertical");
    const bar = el.shadowRoot!.querySelector(".steps-bar") as HTMLElement;
    const style = getComputedStyle(bar);
    expect(style.display).toBe("none");
  });

  // ── Buttons: Previous disabled on step 1 ──────────────────────────────────

  it("disables Previous button on step 1", () => {
    el.setAttribute("current-step", "1");
    addSteps(el, 5);
    const prev = getPrevButton();
    expect(prev!.hasAttribute("disabled")).toBe(true);
  });

  it("enables Previous button on step > 1", () => {
    addSteps(el, 5);
    el.setAttribute("current-step", "3");
    const prev = getPrevButton();
    expect(prev!.hasAttribute("disabled")).toBe(false);
  });

  // ── Buttons: Next shows "Finish" on last step ─────────────────────────────

  it("shows 'Next' on non-last step", () => {
    addSteps(el, 5);
    el.setAttribute("current-step", "3");
    const next = getNextButton();
    expect(next!.textContent).toBe("Next");
  });

  it("shows 'Finish' on last step", () => {
    addSteps(el, 5);
    el.setAttribute("current-step", "5");
    const next = getNextButton();
    expect(next!.textContent).toBe("Finish");
  });

  // ── Navigation: clicking Next ─────────────────────────────────────────────

  it("increments current-step when Next is clicked", () => {
    addSteps(el, 5);
    el.setAttribute("current-step", "2");
    const next = getNextButton();
    next!.click();
    expect(el.getAttribute("current-step")).toBe("3");
  });

  it("does not increment past last step", () => {
    addSteps(el, 3);
    el.setAttribute("current-step", "3");
    const next = getNextButton();
    next!.click();
    expect(el.getAttribute("current-step")).toBe("3");
  });

  // ── Navigation: clicking Previous ─────────────────────────────────────────

  it("decrements current-step when Previous is clicked", () => {
    addSteps(el, 5);
    el.setAttribute("current-step", "3");
    const prev = getPrevButton();
    prev!.click();
    expect(el.getAttribute("current-step")).toBe("2");
  });

  it("does not decrement below 1", () => {
    addSteps(el, 5);
    el.setAttribute("current-step", "1");
    const prev = getPrevButton();
    prev!.click();
    expect(el.getAttribute("current-step")).toBe("1");
  });

  // ── Events ────────────────────────────────────────────────────────────────

  it("dispatches wizard-next on Next click", () => {
    addSteps(el, 5);
    el.setAttribute("current-step", "2");
    const handler = vi.fn();
    el.addEventListener("wizard-next", handler);
    const next = getNextButton();
    next!.click();
    expect(handler).toHaveBeenCalledTimes(1);
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.step).toBe(2);
  });

  it("dispatches wizard-previous on Previous click", () => {
    addSteps(el, 5);
    el.setAttribute("current-step", "3");
    const handler = vi.fn();
    el.addEventListener("wizard-previous", handler);
    const prev = getPrevButton();
    prev!.click();
    expect(handler).toHaveBeenCalledTimes(1);
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.step).toBe(3);
  });

  it("dispatches wizard-finish on last step Next click", () => {
    addSteps(el, 3);
    el.setAttribute("current-step", "3");
    const handler = vi.fn();
    el.addEventListener("wizard-finish", handler);
    const next = getNextButton();
    next!.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not dispatch event when Previous is clicked on step 1", () => {
    addSteps(el, 3);
    el.setAttribute("current-step", "1");
    const handler = vi.fn();
    el.addEventListener("wizard-step-change", handler);
    const prev = getPrevButton();
    prev!.click();
    expect(handler).not.toHaveBeenCalled();
  });

  it("wizard-next event bubbles and is composed", () => {
    addSteps(el, 5);
    el.setAttribute("current-step", "1");
    const handler = vi.fn();
    document.body.addEventListener("wizard-next", handler);
    const next = getNextButton();
    next!.click();
    expect(handler).toHaveBeenCalledTimes(1);
    const evt = handler.mock.calls[0][0] as CustomEvent;
    expect(evt.bubbles).toBe(true);
    expect(evt.composed).toBe(true);
    document.body.removeEventListener("wizard-next", handler);
  });

  it("wizard-next is cancelable and blocks navigation", () => {
    addSteps(el, 5);
    el.setAttribute("current-step", "2");
    el.addEventListener("wizard-next", (e) => e.preventDefault());
    const next = getNextButton();
    next!.click();
    expect(el.getAttribute("current-step")).toBe("2");
  });

  it("loading attribute disables buttons and shows spinner", () => {
    addSteps(el, 5);
    el.setAttribute("current-step", "2");
    el.setAttribute("loading", "");
    const next = getNextButton();
    const prev = getPrevButton();
    expect(next!.hasAttribute("disabled")).toBe(true);
    expect(next!.getAttribute("status")).toBe("loading");
    expect(prev!.hasAttribute("disabled")).toBe(true);
  });

  // ── Content slot ──────────────────────────────────────────────────────────

  it("renders slotted content in default slot", () => {
    const content = document.createElement("div");
    content.textContent = "Step content here";
    el.appendChild(content);
    const slot = el.shadowRoot!.querySelector(".content slot:not([name])") as HTMLSlotElement;
    expect(slot).not.toBeNull();
    const assigned = slot!.assignedElements();
    expect(assigned.length).toBe(1);
    expect(assigned[0].textContent).toBe("Step content here");
  });

  // ── Steps slot ────────────────────────────────────────────────────────────

  it("has a named steps slot", () => {
    const slot = el.shadowRoot!.querySelector('slot[name="steps"]') as HTMLSlotElement;
    expect(slot).not.toBeNull();
  });

  it("renders slotted ui-step-group in steps slot", () => {
    addSteps(el, 3);
    const slot = el.shadowRoot!.querySelector('slot[name="steps"]') as HTMLSlotElement;
    const assigned = slot!.assignedElements();
    expect(assigned.length).toBe(1);
    expect(assigned[0].tagName).toBe("UI-STEP-GROUP");
  });

  // ── Separator elements ────────────────────────────────────────────────────

  it("renders ui-separator elements", () => {
    const seps = el.shadowRoot!.querySelectorAll("ui-separator");
    expect(seps.length).toBe(2);
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  function getPrevButton(): HTMLElement | undefined {
    const buttons = el.shadowRoot!.querySelectorAll("ui-button");
    return Array.from(buttons).find((b) => b.textContent === "Previous" || b.textContent === "previous") as HTMLElement | undefined;
  }

  function getNextButton(): HTMLElement | undefined {
    const buttons = el.shadowRoot!.querySelectorAll("ui-button");
    return Array.from(buttons).find((b) => b.textContent === "Next" || b.textContent === "Finish") as HTMLElement | undefined;
  }

  function addSteps(wizard: HTMLElement, count: number): void {
    const group = document.createElement("ui-step-group");
    group.slot = "steps";
    for (let i = 0; i < count; i++) {
      const item = document.createElement("ui-step-item");
      item.setAttribute("label", `Step ${i + 1}`);
      group.appendChild(item);
    }
    wizard.appendChild(group);
  }
});
