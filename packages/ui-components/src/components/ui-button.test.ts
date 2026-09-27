import { describe, it, expect, beforeEach, vi } from "vitest";
import "./ui-button.js";

describe("ui-button", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-button");
    document.body.appendChild(el);
  });

  it("registers as a custom element", () => {
    expect(customElements.get("ui-button")).toBeDefined();
  });

  it("renders a shadow DOM with a button", () => {
    const button = el.shadowRoot?.querySelector("button");
    expect(button).toBeTruthy();
  });

  it("has part='button' on the inner button", () => {
    const button = el.shadowRoot?.querySelector("button");
    expect(button?.getAttribute("part")).toBe("button");
  });

  it("slots content into the button", () => {
    el.textContent = "Click me";
    const slot = el.shadowRoot?.querySelector("slot:not([name])");
    expect(slot).toBeTruthy();
  });

  it("reflects disabled attribute to inner button", () => {
    el.setAttribute("disabled", "");
    const button = el.shadowRoot?.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("removes disabled from inner button when attribute removed", () => {
    el.setAttribute("disabled", "");
    el.removeAttribute("disabled");
    const button = el.shadowRoot?.querySelector("button") as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });

  it("exposes disabled property", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
    (el as unknown as { disabled: boolean }).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("has observedAttributes for all variant properties", () => {
    const Ctor = customElements.get("ui-button") as unknown as { observedAttributes: string[] };
    expect(Ctor.observedAttributes).toEqual([
      "action",
      "emphasis",
      "size",
      "shape",
      "icon",
      "status",
      "disabled",
      "type",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
    ]);
  });

  it("forwards and updates an accessible label on the inner button", () => {
    const button = el.shadowRoot?.querySelector("button");
    el.setAttribute("aria-label", "example");
    expect(button?.getAttribute("aria-label")).toBe("example");
    el.removeAttribute("aria-label");
    expect(button?.hasAttribute("aria-label")).toBe(false);
  });

  it("resolves light-DOM label and description references for the shadow button", () => {
    const label = document.createElement("span");
    label.id = "button-label";
    label.textContent = "External label";
    const description = document.createElement("span");
    description.id = "button-description";
    description.textContent = "External description";
    document.body.append(label, description);
    el.setAttribute("aria-labelledby", label.id);
    el.setAttribute("aria-describedby", description.id);

    const button = el.shadowRoot?.querySelector("button");
    expect(button?.getAttribute("aria-label")).toBe("External label");
    expect(button?.getAttribute("aria-description")).toBe("External description");
  });

  it("submits or resets its associated form according to type", () => {
    const form = document.createElement("form");
    form.appendChild(el);
    document.body.appendChild(form);
    const submit = vi.spyOn(form, "requestSubmit").mockImplementation(() => {});
    const reset = vi.spyOn(form, "reset").mockImplementation(() => {});
    const button = el.shadowRoot?.querySelector("button") as HTMLButtonElement;

    button.click();
    expect(submit).not.toHaveBeenCalled();
    el.setAttribute("type", "submit");
    button.click();
    expect(submit).toHaveBeenCalledOnce();
    el.setAttribute("type", "reset");
    button.click();
    expect(reset).toHaveBeenCalledOnce();
    el.setAttribute("disabled", "");
    button.click();
    expect(reset).toHaveBeenCalledOnce();
  });

  // ── Action property ─────────────────────────────────────────────────────

  it("exposes action property with default 'primary'", () => {
    expect((el as unknown as { action: string }).action).toBe("primary");
  });

  it("reflects action property to attribute", () => {
    (el as unknown as { action: string }).action = "destructive";
    expect(el.getAttribute("action")).toBe("destructive");
  });

  // ── Emphasis property ───────────────────────────────────────────────────

  it("exposes emphasis property with default 'bold'", () => {
    expect((el as unknown as { emphasis: string }).emphasis).toBe("bold");
  });

  it("reflects emphasis property to attribute", () => {
    (el as unknown as { emphasis: string }).emphasis = "subtle";
    expect(el.getAttribute("emphasis")).toBe("subtle");
  });

  // ── Size property ───────────────────────────────────────────────────────

  it("exposes size property with default 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("reflects size property to attribute", () => {
    (el as unknown as { size: string }).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  // ── Shape property ──────────────────────────────────────────────────────

  it("exposes shape property with default 'basic'", () => {
    expect((el as unknown as { shape: string }).shape).toBe("basic");
  });

  it("reflects shape property to attribute", () => {
    (el as unknown as { shape: string }).shape = "rounded";
    expect(el.getAttribute("shape")).toBe("rounded");
  });

  // ── Icon property ───────────────────────────────────────────────────────

  it("exposes icon property with default 'text-only'", () => {
    expect((el as unknown as { icon: string }).icon).toBe("text-only");
  });

  it("reflects icon property to attribute", () => {
    (el as unknown as { icon: string }).icon = "leading-icon";
    expect(el.getAttribute("icon")).toBe("leading-icon");
  });

  // ── Status property ─────────────────────────────────────────────────────

  it("exposes status property with default 'none'", () => {
    expect((el as unknown as { status: string }).status).toBe("none");
  });

  it("reflects status property to attribute", () => {
    (el as unknown as { status: string }).status = "loading";
    expect(el.getAttribute("status")).toBe("loading");
  });

  // ── Status icon rendering ───────────────────────────────────────────────

  it("renders error icon when status is 'error'", () => {
    el.setAttribute("status", "error");
    const icon = el.shadowRoot?.querySelector(".status-icon ui-icon");
    expect(icon).toBeTruthy();
  });

  it("renders success icon when status is 'success'", () => {
    el.setAttribute("status", "success");
    const icon = el.shadowRoot?.querySelector(".status-icon ui-icon");
    expect(icon).toBeTruthy();
  });

  it("renders loading icon when status is 'loading'", () => {
    el.setAttribute("status", "loading");
    const icon = el.shadowRoot?.querySelector(".status-icon ui-icon");
    expect(icon).toBeTruthy();
  });

  it("clears status icon when status returns to 'none'", () => {
    el.setAttribute("status", "error");
    el.setAttribute("status", "none");
    const icon = el.shadowRoot?.querySelector(".status-icon ui-icon");
    expect(icon).toBeNull();
  });

  // ── Slots ───────────────────────────────────────────────────────────────

  it("has named slot 'icon-start'", () => {
    const slot = el.shadowRoot?.querySelector('slot[name="icon-start"]');
    expect(slot).toBeTruthy();
  });

  it("has named slot 'icon-end'", () => {
    const slot = el.shadowRoot?.querySelector('slot[name="icon-end"]');
    expect(slot).toBeTruthy();
  });

  it("has a default (unnamed) slot for text", () => {
    const slot = el.shadowRoot?.querySelector("slot:not([name])");
    expect(slot).toBeTruthy();
  });
});
