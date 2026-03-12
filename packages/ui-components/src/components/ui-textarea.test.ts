import { describe, it, expect, beforeEach, vi } from "vitest";
import "./ui-textarea.js";

describe("ui-textarea", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-textarea");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-textarea")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  it("has correct tag name", () => {
    expect(el.tagName.toLowerCase()).toBe("ui-textarea");
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults status to 'none'", () => {
    expect((el as unknown as { status: string }).status).toBe("none");
  });

  it("defaults value to empty string", () => {
    expect((el as unknown as { value: string }).value).toBe("");
  });

  it("defaults label to empty string", () => {
    expect((el as unknown as { label: string }).label).toBe("");
  });

  it("defaults secondaryLabel to empty string", () => {
    expect((el as unknown as { secondaryLabel: string }).secondaryLabel).toBe("");
  });

  it("defaults placeholder to empty string", () => {
    expect((el as unknown as { placeholder: string }).placeholder).toBe("");
  });

  it("defaults disabled to false", () => {
    expect((el as unknown as { disabled: boolean }).disabled).toBe(false);
  });

  it("defaults readonly to false", () => {
    expect((el as unknown as { readonly: boolean }).readonly).toBe(false);
  });

  it("defaults error to false", () => {
    expect((el as unknown as { error: boolean }).error).toBe(false);
  });

  it("defaults name to empty string", () => {
    expect((el as unknown as { name: string }).name).toBe("");
  });

  it("defaults rows to 4", () => {
    expect((el as unknown as { rows: number }).rows).toBe(4);
  });

  it("defaults maxlength to null", () => {
    expect((el as unknown as { maxlength: number | null }).maxlength).toBe(null);
  });

  // ── Size attribute ───────────────────────────────────────────────────────

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

  // ── Status attribute ─────────────────────────────────────────────────────

  it("reflects status='warning' to attribute", () => {
    (el as unknown as { status: string }).status = "warning";
    expect(el.getAttribute("status")).toBe("warning");
  });

  it("reflects status='error' to attribute", () => {
    (el as unknown as { status: string }).status = "error";
    expect(el.getAttribute("status")).toBe("error");
  });

  it("reflects status='success' to attribute", () => {
    (el as unknown as { status: string }).status = "success";
    expect(el.getAttribute("status")).toBe("success");
  });

  it("reflects status='loading' to attribute", () => {
    (el as unknown as { status: string }).status = "loading";
    expect(el.getAttribute("status")).toBe("loading");
  });

  // ── Boolean attributes ───────────────────────────────────────────────────

  it("sets disabled attribute when property is true", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("removes disabled attribute when property is false", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    (el as unknown as { disabled: boolean }).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("sets readonly attribute when property is true", () => {
    (el as unknown as { readonly: boolean }).readonly = true;
    expect(el.hasAttribute("readonly")).toBe(true);
  });

  it("removes readonly attribute when property is false", () => {
    (el as unknown as { readonly: boolean }).readonly = true;
    (el as unknown as { readonly: boolean }).readonly = false;
    expect(el.hasAttribute("readonly")).toBe(false);
  });

  it("sets error attribute when property is true", () => {
    (el as unknown as { error: boolean }).error = true;
    expect(el.hasAttribute("error")).toBe(true);
  });

  it("removes error attribute when property is false", () => {
    (el as unknown as { error: boolean }).error = true;
    (el as unknown as { error: boolean }).error = false;
    expect(el.hasAttribute("error")).toBe(false);
  });

  // ── Value ────────────────────────────────────────────────────────────────

  it("sets value on native textarea", () => {
    (el as unknown as { value: string }).value = "hello";
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.value).toBe("hello");
  });

  it("reflects value to attribute", () => {
    (el as unknown as { value: string }).value = "test";
    expect(el.getAttribute("value")).toBe("test");
  });

  it("syncs value from attribute", () => {
    el.setAttribute("value", "from-attr");
    expect((el as unknown as { value: string }).value).toBe("from-attr");
  });

  it("gets value from native textarea element", () => {
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    textarea.value = "native-set";
    expect((el as unknown as { value: string }).value).toBe("native-set");
  });

  // ── Placeholder ──────────────────────────────────────────────────────────

  it("sets placeholder on native textarea", () => {
    (el as unknown as { placeholder: string }).placeholder = "Enter text...";
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe("Enter text...");
  });

  it("syncs placeholder from attribute", () => {
    el.setAttribute("placeholder", "Type here");
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe("Type here");
  });

  // ── Name ─────────────────────────────────────────────────────────────────

  it("sets name on native textarea", () => {
    (el as unknown as { name: string }).name = "message";
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.name).toBe("message");
  });

  it("syncs name from attribute", () => {
    el.setAttribute("name", "comment");
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.name).toBe("comment");
  });

  // ── Label ────────────────────────────────────────────────────────────────

  it("sets label attribute and shows label text", () => {
    (el as unknown as { label: string }).label = "Description";
    expect(el.getAttribute("label")).toBe("Description");
    const labelEl = el.shadowRoot!.querySelector("ui-label[emphasis='bold']");
    expect(labelEl!.textContent).toBe("Description");
  });

  it("removes label attribute when set to empty", () => {
    (el as unknown as { label: string }).label = "Description";
    (el as unknown as { label: string }).label = "";
    expect(el.hasAttribute("label")).toBe(false);
  });

  it("syncs label size with component size", () => {
    (el as unknown as { label: string }).label = "Test";
    (el as unknown as { size: string }).size = "l";
    const labelEl = el.shadowRoot!.querySelector("ui-label[emphasis='bold']");
    expect(labelEl!.getAttribute("size")).toBe("l");
  });

  it("sets disabled on label when component is disabled", () => {
    (el as unknown as { label: string }).label = "Test";
    (el as unknown as { disabled: boolean }).disabled = true;
    const labelEl = el.shadowRoot!.querySelector("ui-label[emphasis='bold']");
    expect(labelEl!.hasAttribute("disabled")).toBe(true);
  });

  it("removes disabled from label when component is enabled", () => {
    (el as unknown as { label: string }).label = "Test";
    (el as unknown as { disabled: boolean }).disabled = true;
    (el as unknown as { disabled: boolean }).disabled = false;
    const labelEl = el.shadowRoot!.querySelector("ui-label[emphasis='bold']");
    expect(labelEl!.hasAttribute("disabled")).toBe(false);
  });

  // ── Secondary label ──────────────────────────────────────────────────────

  it("sets secondary-label attribute", () => {
    (el as unknown as { secondaryLabel: string }).secondaryLabel = "Optional";
    expect(el.getAttribute("secondary-label")).toBe("Optional");
    const secEl = el.shadowRoot!.querySelector(".secondary-label");
    expect(secEl!.textContent).toBe("Optional");
  });

  it("removes secondary-label attribute when set to empty", () => {
    (el as unknown as { secondaryLabel: string }).secondaryLabel = "Optional";
    (el as unknown as { secondaryLabel: string }).secondaryLabel = "";
    expect(el.hasAttribute("secondary-label")).toBe(false);
  });

  // ── Rows ─────────────────────────────────────────────────────────────────

  it("defaults native textarea rows to 4", () => {
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(Number(textarea.rows)).toBe(4);
  });

  it("sets custom rows on native textarea", () => {
    (el as unknown as { rows: number }).rows = 8;
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(Number(textarea.rows)).toBe(8);
  });

  it("reflects rows to attribute", () => {
    (el as unknown as { rows: number }).rows = 6;
    expect(el.getAttribute("rows")).toBe("6");
  });

  it("syncs rows from attribute", () => {
    el.setAttribute("rows", "10");
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(Number(textarea.rows)).toBe(10);
  });

  // ── Maxlength ────────────────────────────────────────────────────────────

  it("sets maxlength on native textarea", () => {
    (el as unknown as { maxlength: number | null }).maxlength = 500;
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(500);
  });

  it("reflects maxlength to attribute", () => {
    (el as unknown as { maxlength: number | null }).maxlength = 200;
    expect(el.getAttribute("maxlength")).toBe("200");
  });

  it("removes maxlength when set to null", () => {
    (el as unknown as { maxlength: number | null }).maxlength = 200;
    (el as unknown as { maxlength: number | null }).maxlength = null;
    expect(el.hasAttribute("maxlength")).toBe(false);
  });

  it("removes maxlength from native textarea when set to null", () => {
    (el as unknown as { maxlength: number | null }).maxlength = 200;
    (el as unknown as { maxlength: number | null }).maxlength = null;
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.hasAttribute("maxlength")).toBe(false);
  });

  it("syncs maxlength from attribute", () => {
    el.setAttribute("maxlength", "300");
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(300);
  });

  // ── Char count ───────────────────────────────────────────────────────────

  it("shows char count when maxlength is set", () => {
    (el as unknown as { maxlength: number | null }).maxlength = 500;
    const charCount = el.shadowRoot!.querySelector(".char-count");
    expect(charCount!.textContent).toBe("0/500");
  });

  it("updates char count when value changes via property", () => {
    (el as unknown as { maxlength: number | null }).maxlength = 100;
    (el as unknown as { value: string }).value = "hello";
    const charCount = el.shadowRoot!.querySelector(".char-count");
    expect(charCount!.textContent).toBe("5/100");
  });

  it("updates char count on native input event", () => {
    (el as unknown as { maxlength: number | null }).maxlength = 100;
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    textarea.value = "test input";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    const charCount = el.shadowRoot!.querySelector(".char-count");
    expect(charCount!.textContent).toBe("10/100");
  });

  it("does not show char count when maxlength is not set", () => {
    const charCount = el.shadowRoot!.querySelector(".char-count");
    expect(charCount!.textContent).toBe("");
  });

  // ── Shadow DOM structure ─────────────────────────────────────────────────

  it("has .label-row element", () => {
    expect(el.shadowRoot!.querySelector(".label-row")).toBeTruthy();
  });

  it("has .textarea-container element", () => {
    expect(el.shadowRoot!.querySelector(".textarea-container")).toBeTruthy();
  });

  it("has .native-textarea element", () => {
    expect(el.shadowRoot!.querySelector(".native-textarea")).toBeTruthy();
  });

  it("has .status-icon element", () => {
    expect(el.shadowRoot!.querySelector(".status-icon")).toBeTruthy();
  });

  it("has .secondary-label element", () => {
    expect(el.shadowRoot!.querySelector(".secondary-label")).toBeTruthy();
  });

  it("has .char-count element", () => {
    expect(el.shadowRoot!.querySelector(".char-count")).toBeTruthy();
  });

  it("has ui-label element", () => {
    expect(el.shadowRoot!.querySelector("ui-label")).toBeTruthy();
  });

  // ── Disabled state ───────────────────────────────────────────────────────

  it("disables native textarea when disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });

  it("enables native textarea when not disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    (el as unknown as { disabled: boolean }).disabled = false;
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(false);
  });

  // ── Readonly state ───────────────────────────────────────────────────────

  it("sets readOnly on native textarea when readonly", () => {
    (el as unknown as { readonly: boolean }).readonly = true;
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.readOnly).toBe(true);
  });

  it("removes readOnly on native textarea when not readonly", () => {
    (el as unknown as { readonly: boolean }).readonly = true;
    (el as unknown as { readonly: boolean }).readonly = false;
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.readOnly).toBe(false);
  });

  // ── Status icon ──────────────────────────────────────────────────────────

  it("shows status icon for warning", () => {
    (el as unknown as { status: string }).status = "warning";
    const icon = el.shadowRoot!.querySelector(".status-icon ui-icon");
    expect(icon!.getAttribute("name")).toBe("warning");
  });

  it("shows status icon for error", () => {
    (el as unknown as { status: string }).status = "error";
    const icon = el.shadowRoot!.querySelector(".status-icon ui-icon");
    expect(icon!.getAttribute("name")).toBe("error");
  });

  it("shows status icon for success", () => {
    (el as unknown as { status: string }).status = "success";
    const icon = el.shadowRoot!.querySelector(".status-icon ui-icon");
    expect(icon!.getAttribute("name")).toBe("check_circle");
  });

  it("shows status icon for loading", () => {
    (el as unknown as { status: string }).status = "loading";
    const icon = el.shadowRoot!.querySelector(".status-icon ui-icon");
    expect(icon!.getAttribute("name")).toBe("progress_activity");
  });

  it("clears status icon when status is none", () => {
    (el as unknown as { status: string }).status = "error";
    (el as unknown as { status: string }).status = "none";
    const icon = el.shadowRoot!.querySelector(".status-icon ui-icon");
    expect(icon!.getAttribute("name") ?? "").toBe("");
  });

  it("shows error icon when error boolean is set", () => {
    (el as unknown as { error: boolean }).error = true;
    const icon = el.shadowRoot!.querySelector(".status-icon ui-icon");
    expect(icon!.getAttribute("name")).toBe("error");
  });

  it("error boolean overrides status attribute", () => {
    (el as unknown as { status: string }).status = "success";
    (el as unknown as { error: boolean }).error = true;
    const icon = el.shadowRoot!.querySelector(".status-icon ui-icon");
    expect(icon!.getAttribute("name")).toBe("error");
  });

  it("status icon has filled attribute", () => {
    const icon = el.shadowRoot!.querySelector(".status-icon ui-icon");
    expect(icon!.hasAttribute("filled")).toBe(true);
  });

  // ── Accessibility ────────────────────────────────────────────────────────

  it("sets role='textbox' on connected", () => {
    expect(el.getAttribute("role")).toBe("textbox");
  });

  it("sets aria-multiline='true' on connected", () => {
    expect(el.getAttribute("aria-multiline")).toBe("true");
  });

  it("sets aria-invalid='true' when status is error", () => {
    (el as unknown as { status: string }).status = "error";
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
  });

  it("sets aria-invalid='true' when error attribute is set", () => {
    (el as unknown as { error: boolean }).error = true;
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
  });

  it("removes aria-invalid when status is not error", () => {
    (el as unknown as { status: string }).status = "error";
    (el as unknown as { status: string }).status = "none";
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.hasAttribute("aria-invalid")).toBe(false);
  });

  it("sets aria-disabled='true' when disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.getAttribute("aria-disabled")).toBe("true");
  });

  it("removes aria-disabled when not disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    (el as unknown as { disabled: boolean }).disabled = false;
    expect(el.hasAttribute("aria-disabled")).toBe(false);
  });

  it("sets aria-readonly on native textarea when readonly", () => {
    (el as unknown as { readonly: boolean }).readonly = true;
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.getAttribute("aria-readonly")).toBe("true");
  });

  it("removes aria-readonly when not readonly", () => {
    (el as unknown as { readonly: boolean }).readonly = true;
    (el as unknown as { readonly: boolean }).readonly = false;
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.hasAttribute("aria-readonly")).toBe(false);
  });

  it("sets aria-label on native textarea from label attribute", () => {
    (el as unknown as { label: string }).label = "Message";
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    expect(textarea.getAttribute("aria-label")).toBe("Message");
  });

  it("sets aria-label on host from label attribute", () => {
    (el as unknown as { label: string }).label = "Message";
    expect(el.getAttribute("aria-label")).toBe("Message");
  });

  it("does not override role if already set", () => {
    document.body.innerHTML = "";
    const custom = document.createElement("ui-textarea");
    custom.setAttribute("role", "custom");
    document.body.appendChild(custom);
    expect(custom.getAttribute("role")).toBe("custom");
  });

  it("does not override aria-multiline if already set", () => {
    document.body.innerHTML = "";
    const custom = document.createElement("ui-textarea");
    custom.setAttribute("aria-multiline", "false");
    document.body.appendChild(custom);
    expect(custom.getAttribute("aria-multiline")).toBe("false");
  });

  // ── Status icon aria-hidden ──────────────────────────────────────────────

  it("status icon has aria-hidden='true'", () => {
    const icon = el.shadowRoot!.querySelector(".status-icon");
    expect(icon!.getAttribute("aria-hidden")).toBe("true");
  });

  // ── Input event ──────────────────────────────────────────────────────────

  it("dispatches input event on native input", () => {
    let detail: { value: string } | null = null;
    el.addEventListener("input", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    textarea.value = "typed";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    expect(detail).toEqual({ value: "typed" });
  });

  it("input event bubbles and is composed", () => {
    let event: CustomEvent | null = null;
    el.addEventListener("input", ((e: CustomEvent) => {
      event = e;
    }) as EventListener);
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    textarea.value = "test";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    expect(event).toBeTruthy();
    expect(event!.bubbles).toBe(true);
    expect(event!.composed).toBe(true);
  });

  it("syncs value attribute on input event", () => {
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    textarea.value = "synced";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    expect(el.getAttribute("value")).toBe("synced");
  });

  // ── Change event ─────────────────────────────────────────────────────────

  it("dispatches change event on native change", () => {
    let detail: { value: string } | null = null;
    el.addEventListener("change", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    textarea.value = "changed";
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
    expect(detail).toEqual({ value: "changed" });
  });

  it("change event bubbles and is composed", () => {
    let event: CustomEvent | null = null;
    el.addEventListener("change", ((e: CustomEvent) => {
      event = e;
    }) as EventListener);
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    textarea.value = "test";
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
    expect(event).toBeTruthy();
    expect(event!.bubbles).toBe(true);
    expect(event!.composed).toBe(true);
  });

  it("syncs value attribute on change event", () => {
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    textarea.value = "changed-val";
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
    expect(el.getAttribute("value")).toBe("changed-val");
  });

  // ── Focus / blur delegation ──────────────────────────────────────────────

  it("delegates focus to native textarea", () => {
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    const spy = vi.spyOn(textarea, "focus");
    (el as unknown as { focus: () => void }).focus();
    expect(spy).toHaveBeenCalled();
  });

  it("delegates blur to native textarea", () => {
    const textarea = el.shadowRoot!.querySelector(".native-textarea") as HTMLTextAreaElement;
    const spy = vi.spyOn(textarea, "blur");
    (el as unknown as { blur: () => void }).blur();
    expect(spy).toHaveBeenCalled();
  });

  // ── Property accessors roundtrip ─────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      size: string;
      label: string;
      secondaryLabel: string;
      placeholder: string;
      value: string;
      name: string;
      disabled: boolean;
      readonly: boolean;
      error: boolean;
      status: string;
      rows: number;
      maxlength: number | null;
    };

    component.size = "l";
    expect(component.size).toBe("l");

    component.label = "Description";
    expect(component.label).toBe("Description");

    component.secondaryLabel = "Optional";
    expect(component.secondaryLabel).toBe("Optional");

    component.placeholder = "Type here";
    expect(component.placeholder).toBe("Type here");

    component.value = "test";
    expect(component.value).toBe("test");

    component.name = "field";
    expect(component.name).toBe("field");

    component.disabled = true;
    expect(component.disabled).toBe(true);

    component.readonly = true;
    expect(component.readonly).toBe(true);

    component.error = true;
    expect(component.error).toBe(true);

    component.status = "warning";
    expect(component.status).toBe("warning");

    component.rows = 10;
    expect(component.rows).toBe(10);

    component.maxlength = 500;
    expect(component.maxlength).toBe(500);
  });

  // ── Attribute → property sync ────────────────────────────────────────────

  it("syncs size from attribute to property", () => {
    el.setAttribute("size", "l");
    expect((el as unknown as { size: string }).size).toBe("l");
  });

  it("syncs status from attribute to property", () => {
    el.setAttribute("status", "warning");
    expect((el as unknown as { status: string }).status).toBe("warning");
  });

  it("syncs disabled from attribute to property", () => {
    el.setAttribute("disabled", "");
    expect((el as unknown as { disabled: boolean }).disabled).toBe(true);
  });

  it("syncs readonly from attribute to property", () => {
    el.setAttribute("readonly", "");
    expect((el as unknown as { readonly: boolean }).readonly).toBe(true);
  });

  it("syncs error from attribute to property", () => {
    el.setAttribute("error", "");
    expect((el as unknown as { error: boolean }).error).toBe(true);
  });

  it("syncs rows from attribute to property", () => {
    el.setAttribute("rows", "12");
    expect((el as unknown as { rows: number }).rows).toBe(12);
  });

  it("syncs maxlength from attribute to property", () => {
    el.setAttribute("maxlength", "250");
    expect((el as unknown as { maxlength: number | null }).maxlength).toBe(250);
  });
});
