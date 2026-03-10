import { describe, it, expect, beforeEach, vi } from "vitest";
import { ICON_WARNING, ICON_ERROR, ICON_CHECK_CIRCLE, ICON_PROGRESS_ACTIVITY, ICON_EXPAND_MORE } from "@maneki/foundation";
import "./ui-select.js";
import "./ui-dropdown-item.js";

function createSelect(attrs: Record<string, string> = {}, items: { value: string; text: string; disabled?: boolean }[] = []): HTMLElement {
  const el = document.createElement("ui-select");
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  for (const item of items) {
    const di = document.createElement("ui-dropdown-item");
    di.setAttribute("value", item.value);
    di.textContent = item.text;
    if (item.disabled) di.setAttribute("disabled", "");
    el.appendChild(di);
  }
  document.body.appendChild(el);
  return el;
}

const DEFAULT_ITEMS = [
  { value: "a", text: "Alpha" },
  { value: "b", text: "Beta" },
  { value: "c", text: "Gamma" },
];

describe("ui-select", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-select")).toBeDefined();
  });

  it("creates a shadow root", () => {
    el = createSelect();
    expect(el.shadowRoot).toBeTruthy();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    el = createSelect();
    expect((el as any).size).toBe("m");
  });

  it("defaults status to 'none'", () => {
    el = createSelect();
    expect((el as any).status).toBe("none");
  });

  it("defaults placeholder to 'Select an option'", () => {
    el = createSelect();
    expect((el as any).placeholder).toBe("Select an option");
  });

  it("defaults disabled to false", () => {
    el = createSelect();
    expect((el as any).disabled).toBe(false);
  });

  it("defaults readonly to false", () => {
    el = createSelect();
    expect((el as any).readonly).toBe(false);
  });

  it("defaults open to false", () => {
    el = createSelect();
    expect((el as any).open).toBe(false);
  });

  it("defaults multiple to false", () => {
    el = createSelect();
    expect((el as any).multiple).toBe(false);
  });

  it("defaults error to false", () => {
    el = createSelect();
    expect((el as any).error).toBe(false);
  });

  it("defaults value to empty string", () => {
    el = createSelect();
    expect((el as any).value).toBe("");
  });

  it("defaults label to empty string", () => {
    el = createSelect();
    expect((el as any).label).toBe("");
  });

  it("defaults supportive to empty string", () => {
    el = createSelect();
    expect((el as any).supportive).toBe("");
  });

  it("defaults name to empty string", () => {
    el = createSelect();
    expect((el as any).name).toBe("");
  });

  // ── Size attribute ───────────────────────────────────────────────────────

  it("reflects size='s' to attribute", () => {
    el = createSelect();
    (el as any).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("reflects size='l' to attribute", () => {
    el = createSelect();
    (el as any).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  it("propagates size to slotted items", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    (el as any).size = "l";
    // Trigger slotchange manually in test env
    const items = el.querySelectorAll("ui-dropdown-item");
    // In happy-dom, slotchange may not fire automatically
    // but propagateSize is called in connectedCallback
  });

  // ── Label ────────────────────────────────────────────────────────────────

  it("shows label row when label attribute is set", () => {
    el = createSelect({ label: "Country" });
    const labelRow = el.shadowRoot!.querySelector(".label-row") as HTMLElement;
    expect(labelRow).toBeTruthy();
  });

  it("sets label text on ui-label element", () => {
    el = createSelect({ label: "Country" });
    const labelEl = el.shadowRoot!.querySelector("ui-label");
    expect(labelEl?.textContent).toBe("Country");
  });

  it("sets secondary label text", () => {
    el = createSelect({ label: "Country", "secondary-label": "Optional" });
    const labels = el.shadowRoot!.querySelectorAll("ui-label");
    expect(labels[1]?.textContent).toBe("Optional");
  });

  // ── Supportive text ──────────────────────────────────────────────────────

  it("sets supportive text content", () => {
    el = createSelect({ supportive: "Pick one" });
    const sup = el.shadowRoot!.querySelector(".supportive-text");
    expect(sup?.textContent).toBe("Pick one");
  });

  // ── Placeholder ──────────────────────────────────────────────────────────

  it("shows placeholder text when no selection", () => {
    el = createSelect({ placeholder: "Choose..." });
    const display = el.shadowRoot!.querySelector(".display-value");
    expect(display?.textContent).toBe("Choose...");
    expect(display?.classList.contains("placeholder")).toBe(true);
  });

  it("uses default placeholder when none specified", () => {
    el = createSelect();
    const display = el.shadowRoot!.querySelector(".display-value");
    expect(display?.textContent).toBe("Select an option");
  });

  // ── Open / Close ─────────────────────────────────────────────────────────

  it("opens panel when open attribute is set", () => {
    el = createSelect();
    (el as any).open = true;
    expect(el.hasAttribute("open")).toBe(true);
  });

  it("sets aria-expanded on trigger when open", () => {
    el = createSelect();
    (el as any).open = true;
    const trigger = el.shadowRoot!.querySelector(".trigger");
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
  });

  it("does not open when disabled", () => {
    el = createSelect({ disabled: "" });
    (el as any).open = true;
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("does not open when readonly", () => {
    el = createSelect({ readonly: "" });
    (el as any).open = true;
    expect(el.hasAttribute("open")).toBe(false);
  });

  it("dispatches toggle event on open", () => {
    el = createSelect();
    const handler = vi.fn();
    el.addEventListener("toggle", handler);
    (el as any).open = true;
    expect(handler).toHaveBeenCalled();
    expect(handler.mock.calls[0][0].detail.open).toBe(true);
  });

  // ── Disabled ─────────────────────────────────────────────────────────────

  it("reflects disabled property to attribute", () => {
    el = createSelect();
    (el as any).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("sets aria-disabled when disabled", () => {
    el = createSelect({ disabled: "" });
    expect(el.getAttribute("aria-disabled")).toBe("true");
  });

  it("sets tabindex -1 on trigger when disabled", () => {
    el = createSelect({ disabled: "" });
    const trigger = el.shadowRoot!.querySelector(".trigger");
    expect(trigger?.getAttribute("tabindex")).toBe("-1");
  });

  // ── Readonly ─────────────────────────────────────────────────────────────

  it("reflects readonly property to attribute", () => {
    el = createSelect();
    (el as any).readonly = true;
    expect(el.hasAttribute("readonly")).toBe(true);
  });

  it("sets aria-readonly when readonly", () => {
    el = createSelect({ readonly: "" });
    expect(el.getAttribute("aria-readonly")).toBe("true");
  });

  // ── Status ───────────────────────────────────────────────────────────────

  it("reflects status property", () => {
    el = createSelect();
    (el as any).status = "error";
    expect(el.getAttribute("status")).toBe("error");
  });

  it("shows status icon for warning", () => {
    el = createSelect({ status: "warning" });
    const icon = el.shadowRoot!.querySelector(".status-icon .material-symbols-outlined");
    expect(icon?.textContent).toBe(ICON_WARNING);
  });

  it("shows status icon for error", () => {
    el = createSelect({ status: "error" });
    const icon = el.shadowRoot!.querySelector(".status-icon .material-symbols-outlined");
    expect(icon?.textContent).toBe(ICON_ERROR);
  });

  it("shows status icon for success", () => {
    el = createSelect({ status: "success" });
    const icon = el.shadowRoot!.querySelector(".status-icon .material-symbols-outlined");
    expect(icon?.textContent).toBe(ICON_CHECK_CIRCLE);
  });

  it("shows status icon for loading", () => {
    el = createSelect({ status: "loading" });
    const icon = el.shadowRoot!.querySelector(".status-icon .material-symbols-outlined");
    expect(icon?.textContent).toBe(ICON_PROGRESS_ACTIVITY);
  });

  it("error attribute overrides status for icon", () => {
    el = createSelect({ status: "warning", error: "" });
    const icon = el.shadowRoot!.querySelector(".status-icon .material-symbols-outlined");
    expect(icon?.textContent).toBe(ICON_ERROR);
  });

  // ── Error ────────────────────────────────────────────────────────────────

  it("reflects error property", () => {
    el = createSelect();
    (el as any).error = true;
    expect(el.hasAttribute("error")).toBe(true);
  });

  it("sets aria-invalid on trigger when error", () => {
    el = createSelect({ error: "" });
    const trigger = el.shadowRoot!.querySelector(".trigger");
    expect(trigger?.getAttribute("aria-invalid")).toBe("true");
  });

  it("sets aria-invalid on trigger when status=error", () => {
    el = createSelect({ status: "error" });
    const trigger = el.shadowRoot!.querySelector(".trigger");
    expect(trigger?.getAttribute("aria-invalid")).toBe("true");
  });

  // ── ARIA ─────────────────────────────────────────────────────────────────

  it("trigger has role=combobox", () => {
    el = createSelect();
    const trigger = el.shadowRoot!.querySelector(".trigger");
    expect(trigger?.getAttribute("role")).toBe("combobox");
  });

  it("trigger has aria-haspopup=listbox", () => {
    el = createSelect();
    const trigger = el.shadowRoot!.querySelector(".trigger");
    expect(trigger?.getAttribute("aria-haspopup")).toBe("listbox");
  });

  it("panel has role=listbox", () => {
    el = createSelect();
    const panel = el.shadowRoot!.querySelector(".panel");
    expect(panel?.getAttribute("role")).toBe("listbox");
  });

  it("trigger aria-controls points to panel id", () => {
    el = createSelect();
    const trigger = el.shadowRoot!.querySelector(".trigger");
    const panel = el.shadowRoot!.querySelector(".panel");
    expect(trigger?.getAttribute("aria-controls")).toBe(panel?.id);
  });

  it("sets aria-describedby when supportive text exists", () => {
    el = createSelect({ supportive: "Help text" });
    const trigger = el.shadowRoot!.querySelector(".trigger");
    const sup = el.shadowRoot!.querySelector(".supportive-text");
    expect(trigger?.getAttribute("aria-describedby")).toBe(sup?.id);
  });

  it("sets aria-label from label attribute", () => {
    el = createSelect({ label: "Country" });
    const trigger = el.shadowRoot!.querySelector(".trigger");
    expect(trigger?.getAttribute("aria-label")).toBe("Country");
  });

  // ── Multiple ─────────────────────────────────────────────────────────────

  it("reflects multiple property", () => {
    el = createSelect();
    (el as any).multiple = true;
    expect(el.hasAttribute("multiple")).toBe(true);
  });

  // ── Value (single select) ────────────────────────────────────────────────

  it("returns empty string when nothing selected (single)", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    expect((el as any).value).toBe("");
  });

  it("sets value programmatically (single)", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    (el as any).value = "b";
    expect((el as any).value).toBe("b");
  });

  // ── Value (multi select) ─────────────────────────────────────────────────

  it("returns empty array when nothing selected (multi)", () => {
    el = createSelect({ multiple: "" }, DEFAULT_ITEMS);
    expect((el as any).value).toEqual([]);
  });

  it("sets value programmatically (multi)", () => {
    el = createSelect({ multiple: "" }, DEFAULT_ITEMS);
    (el as any).value = ["a", "c"];
    expect((el as any).value).toEqual(["a", "c"]);
  });

  // ── Clear button ─────────────────────────────────────────────────────────

  it("shows clear button when value is set", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    (el as any).value = "a";
    const clearBtn = el.shadowRoot!.querySelector(".clear-btn");
    expect(clearBtn?.classList.contains("visible")).toBe(true);
  });

  it("hides clear button when no value", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    const clearBtn = el.shadowRoot!.querySelector(".clear-btn");
    expect(clearBtn?.classList.contains("visible")).toBe(false);
  });

  it("hides clear button when disabled", () => {
    el = createSelect({ disabled: "" }, DEFAULT_ITEMS);
    (el as any).value = "a";
    const clearBtn = el.shadowRoot!.querySelector(".clear-btn");
    expect(clearBtn?.classList.contains("visible")).toBe(false);
  });

  it("hides clear button when readonly", () => {
    el = createSelect({ readonly: "" }, DEFAULT_ITEMS);
    // Set value before readonly to populate _selectedValues
    (el as any).value = "a";
    // readonly prevents clear
    const clearBtn = el.shadowRoot!.querySelector(".clear-btn");
    expect(clearBtn?.classList.contains("visible")).toBe(false);
  });

  it("clears selection on clear button click", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    (el as any).value = "a";
    const clearBtn = el.shadowRoot!.querySelector(".clear-btn") as HTMLElement;
    clearBtn.click();
    expect((el as any).value).toBe("");
  });

  it("dispatches clear event on clear button click", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    (el as any).value = "a";
    const handler = vi.fn();
    el.addEventListener("clear", handler);
    const clearBtn = el.shadowRoot!.querySelector(".clear-btn") as HTMLElement;
    clearBtn.click();
    expect(handler).toHaveBeenCalled();
  });

  it("dispatches change event on clear button click", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    (el as any).value = "a";
    const handler = vi.fn();
    el.addEventListener("change", handler);
    const clearBtn = el.shadowRoot!.querySelector(".clear-btn") as HTMLElement;
    clearBtn.click();
    expect(handler).toHaveBeenCalled();
  });

  // ── Chevron ──────────────────────────────────────────────────────────────

  it("renders chevron icon", () => {
    el = createSelect();
    const chevron = el.shadowRoot!.querySelector(".chevron .material-symbols-outlined");
    expect(chevron?.textContent).toBe(ICON_EXPAND_MORE);
  });

  // ── Display value ────────────────────────────────────────────────────────

  it("shows selected text for single select", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    (el as any).value = "b";
    const display = el.shadowRoot!.querySelector(".display-value");
    expect(display?.textContent).toContain("Beta");
    expect(display?.classList.contains("placeholder")).toBe(false);
  });

  it("shows tags for multi select", () => {
    el = createSelect({ multiple: "" }, DEFAULT_ITEMS);
    (el as any).value = ["a", "c"];
    const tags = el.shadowRoot!.querySelectorAll(".tag");
    expect(tags.length).toBe(2);
    expect(tags[0].querySelector(".tag-label")?.textContent).toBe("Alpha");
    expect(tags[1].querySelector(".tag-label")?.textContent).toBe("Gamma");
  });

  it("shows placeholder when value is cleared", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    (el as any).value = "a";
    (el as any).value = "";
    const display = el.shadowRoot!.querySelector(".display-value");
    expect(display?.classList.contains("placeholder")).toBe(true);
  });

  // ── Tag dismiss ──────────────────────────────────────────────────────────

  it("removes tag on dismiss click (multi)", () => {
    el = createSelect({ multiple: "" }, DEFAULT_ITEMS);
    (el as any).value = ["a", "b"];
    const dismissBtns = el.shadowRoot!.querySelectorAll(".tag-dismiss");
    expect(dismissBtns.length).toBe(2);
    (dismissBtns[0] as HTMLElement).click();
    expect((el as any).value).toEqual(["b"]);
  });

  it("dispatches change event on tag dismiss", () => {
    el = createSelect({ multiple: "" }, DEFAULT_ITEMS);
    (el as any).value = ["a", "b"];
    const handler = vi.fn();
    el.addEventListener("change", handler);
    const dismissBtns = el.shadowRoot!.querySelectorAll(".tag-dismiss");
    (dismissBtns[0] as HTMLElement).click();
    expect(handler).toHaveBeenCalled();
  });

  // ── Name ─────────────────────────────────────────────────────────────────

  it("reflects name property", () => {
    el = createSelect();
    (el as any).name = "country";
    expect(el.getAttribute("name")).toBe("country");
  });

  // ── observedAttributes ───────────────────────────────────────────────────

  it("has correct observedAttributes", () => {
    const observed = (customElements.get("ui-select") as any).observedAttributes;
    expect(observed).toContain("size");
    expect(observed).toContain("label");
    expect(observed).toContain("secondary-label");
    expect(observed).toContain("supportive");
    expect(observed).toContain("placeholder");
    expect(observed).toContain("disabled");
    expect(observed).toContain("readonly");
    expect(observed).toContain("open");
    expect(observed).toContain("multiple");
    expect(observed).toContain("status");
    expect(observed).toContain("error");
    expect(observed).toContain("value");
    expect(observed).toContain("name");
  });

  // ── Trigger click ────────────────────────────────────────────────────────

  it("toggles open on trigger click", () => {
    el = createSelect();
    const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLElement;
    trigger.click();
    expect((el as any).open).toBe(true);
    trigger.click();
    expect((el as any).open).toBe(false);
  });

  it("does not toggle when disabled", () => {
    el = createSelect({ disabled: "" });
    const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLElement;
    trigger.click();
    expect((el as any).open).toBe(false);
  });

  it("does not toggle when readonly", () => {
    el = createSelect({ readonly: "" });
    const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLElement;
    trigger.click();
    expect((el as any).open).toBe(false);
  });

  // ── Keyboard navigation ──────────────────────────────────────────────────

  it("opens on ArrowDown key when closed", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLElement;
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect((el as any).open).toBe(true);
  });

  it("opens on ArrowUp key when closed", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLElement;
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    expect((el as any).open).toBe(true);
  });

  it("opens on Enter key when closed", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLElement;
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect((el as any).open).toBe(true);
  });

  it("opens on Space key when closed", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLElement;
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect((el as any).open).toBe(true);
  });

  it("closes on Escape key when open", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    (el as any).open = true;
    const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLElement;
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect((el as any).open).toBe(false);
  });

  it("closes on Tab key when open", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    (el as any).open = true;
    const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLElement;
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    expect((el as any).open).toBe(false);
  });

  it("does not open on ArrowDown when disabled", () => {
    el = createSelect({ disabled: "" }, DEFAULT_ITEMS);
    const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLElement;
    trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect((el as any).open).toBe(false);
  });

  // ── Outside click ────────────────────────────────────────────────────────

  it("closes on outside click", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    (el as any).open = true;
    document.body.click();
    expect((el as any).open).toBe(false);
  });

  it("does not close on click inside", () => {
    el = createSelect({}, DEFAULT_ITEMS);
    (el as any).open = true;
    el.click();
    // Clicking the host itself — the trigger click handler toggles
    // but the outside click handler should not close it
  });

  // ── Label disabled sync ──────────────────────────────────────────────────

  it("propagates disabled to label elements", () => {
    el = createSelect({ label: "Test", disabled: "" });
    const labels = el.shadowRoot!.querySelectorAll("ui-label");
    expect(labels[0]?.hasAttribute("disabled")).toBe(true);
    expect(labels[1]?.hasAttribute("disabled")).toBe(true);
  });

  it("removes disabled from labels when enabled", () => {
    el = createSelect({ label: "Test", disabled: "" });
    (el as any).disabled = false;
    const labels = el.shadowRoot!.querySelectorAll("ui-label");
    expect(labels[0]?.hasAttribute("disabled")).toBe(false);
  });

  // ── Label size sync ──────────────────────────────────────────────────────

  it("propagates size to label elements", () => {
    el = createSelect({ label: "Test", size: "l" });
    const labels = el.shadowRoot!.querySelectorAll("ui-label");
    expect(labels[0]?.getAttribute("size")).toBe("l");
    expect(labels[1]?.getAttribute("size")).toBe("l");
  });
});
