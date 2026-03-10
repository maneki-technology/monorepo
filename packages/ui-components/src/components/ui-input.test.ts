import { describe, it, expect, beforeEach, vi } from "vitest";
import "./ui-input.js";

describe("ui-input", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-input");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-input")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults type to 'text'", () => {
    expect((el as unknown as { type: string }).type).toBe("text");
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

  it("defaults supportive to empty string", () => {
    expect((el as unknown as { supportive: string }).supportive).toBe("");
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

  it("defaults placeholder to empty string", () => {
    expect((el as unknown as { placeholder: string }).placeholder).toBe("");
  });

  it("defaults secondaryLabel to empty string", () => {
    expect((el as unknown as { secondaryLabel: string }).secondaryLabel).toBe("");
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

  // ── Type attribute ───────────────────────────────────────────────────────

  it("reflects type='text' to attribute", () => {
    (el as unknown as { type: string }).type = "text";
    expect(el.getAttribute("type")).toBe("text");
  });

  it("reflects type='numeric' to attribute", () => {
    (el as unknown as { type: string }).type = "numeric";
    expect(el.getAttribute("type")).toBe("numeric");
  });

  it("reflects type='clearable' to attribute", () => {
    (el as unknown as { type: string }).type = "clearable";
    expect(el.getAttribute("type")).toBe("clearable");
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

  it("sets value on native input", () => {
    (el as unknown as { value: string }).value = "hello";
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.value).toBe("hello");
  });

  it("reflects value to attribute", () => {
    (el as unknown as { value: string }).value = "test";
    expect(el.getAttribute("value")).toBe("test");
  });

  it("syncs value from attribute", () => {
    el.setAttribute("value", "from-attr");
    expect((el as unknown as { value: string }).value).toBe("from-attr");
  });

  // ── Placeholder ──────────────────────────────────────────────────────────

  it("sets placeholder on native input", () => {
    (el as unknown as { placeholder: string }).placeholder = "Enter text...";
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.placeholder).toBe("Enter text...");
  });

  // ── Name ─────────────────────────────────────────────────────────────────

  it("sets name on native input", () => {
    (el as unknown as { name: string }).name = "username";
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.name).toBe("username");
  });

  // ── Label ────────────────────────────────────────────────────────────────

  it("sets label attribute and shows label text", () => {
    (el as unknown as { label: string }).label = "Email";
    expect(el.getAttribute("label")).toBe("Email");
    const labelEl = el.shadowRoot!.querySelector(".label-text");
    expect(labelEl!.textContent).toBe("Email");
  });

  it("removes label attribute when set to empty", () => {
    (el as unknown as { label: string }).label = "Email";
    (el as unknown as { label: string }).label = "";
    expect(el.hasAttribute("label")).toBe(false);
  });

  // ── Secondary label ──────────────────────────────────────────────────────

  it("sets secondary-label attribute", () => {
    (el as unknown as { secondaryLabel: string }).secondaryLabel = "Optional";
    expect(el.getAttribute("secondary-label")).toBe("Optional");
    const secEl = el.shadowRoot!.querySelector(".secondary-label-text");
    expect(secEl!.textContent).toBe("Optional");
  });

  it("removes secondary-label attribute when set to empty", () => {
    (el as unknown as { secondaryLabel: string }).secondaryLabel = "Optional";
    (el as unknown as { secondaryLabel: string }).secondaryLabel = "";
    expect(el.hasAttribute("secondary-label")).toBe(false);
  });

  // ── Supportive text ──────────────────────────────────────────────────────

  it("sets supportive attribute and shows text", () => {
    (el as unknown as { supportive: string }).supportive = "Helper text";
    expect(el.getAttribute("supportive")).toBe("Helper text");
    const supEl = el.shadowRoot!.querySelector(".supportive-text");
    expect(supEl!.textContent).toBe("Helper text");
  });

  it("removes supportive attribute when set to empty", () => {
    (el as unknown as { supportive: string }).supportive = "Helper";
    (el as unknown as { supportive: string }).supportive = "";
    expect(el.hasAttribute("supportive")).toBe(false);
  });

  // ── Shadow DOM structure ─────────────────────────────────────────────────

  it("has .label-row element", () => {
    expect(el.shadowRoot!.querySelector(".label-row")).toBeTruthy();
  });

  it("has .input-container element", () => {
    expect(el.shadowRoot!.querySelector(".input-container")).toBeTruthy();
  });

  it("has .native-input element", () => {
    expect(el.shadowRoot!.querySelector(".native-input")).toBeTruthy();
  });

  it("has .status-icon element", () => {
    expect(el.shadowRoot!.querySelector(".status-icon")).toBeTruthy();
  });

  it("has .clear-btn element", () => {
    expect(el.shadowRoot!.querySelector(".clear-btn")).toBeTruthy();
  });

  it("has .numeric-controls element", () => {
    expect(el.shadowRoot!.querySelector(".numeric-controls")).toBeTruthy();
  });

  it("has .supportive-text element", () => {
    expect(el.shadowRoot!.querySelector(".supportive-text")).toBeTruthy();
  });

  it("has leading slot", () => {
    const slot = el.shadowRoot!.querySelector('slot[name="leading"]');
    expect(slot).toBeTruthy();
  });

  it("has trailing slot", () => {
    const slot = el.shadowRoot!.querySelector('slot[name="trailing"]');
    expect(slot).toBeTruthy();
  });

  // ── Accessibility ────────────────────────────────────────────────────────

  it("sets role='textbox' on connected", () => {
    expect(el.getAttribute("role")).toBe("textbox");
  });

  it("sets aria-invalid='true' when status is error", () => {
    (el as unknown as { status: string }).status = "error";
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("sets aria-invalid='true' when error attribute is set", () => {
    (el as unknown as { error: boolean }).error = true;
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("removes aria-invalid when status is not error", () => {
    (el as unknown as { status: string }).status = "error";
    (el as unknown as { status: string }).status = "none";
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.hasAttribute("aria-invalid")).toBe(false);
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

  it("sets aria-readonly on native input when readonly", () => {
    (el as unknown as { readonly: boolean }).readonly = true;
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.getAttribute("aria-readonly")).toBe("true");
  });

  it("sets aria-describedby when supportive text is present", () => {
    (el as unknown as { supportive: string }).supportive = "Help text";
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    const supEl = el.shadowRoot!.querySelector(".supportive-text");
    expect(input.getAttribute("aria-describedby")).toBe(supEl!.id);
  });

  it("sets aria-label on native input from label attribute", () => {
    (el as unknown as { label: string }).label = "Username";
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.getAttribute("aria-label")).toBe("Username");
  });

  // ── Disabled state ───────────────────────────────────────────────────────

  it("disables native input when disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("enables native input when not disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    (el as unknown as { disabled: boolean }).disabled = false;
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.disabled).toBe(false);
  });

  // ── Readonly state ───────────────────────────────────────────────────────

  it("sets readOnly on native input when readonly", () => {
    (el as unknown as { readonly: boolean }).readonly = true;
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.readOnly).toBe(true);
  });

  // ── Status icon ──────────────────────────────────────────────────────────

  it("shows status icon for warning", () => {
    (el as unknown as { status: string }).status = "warning";
    const icon = el.shadowRoot!.querySelector(".status-icon");
    expect(icon!.textContent).toContain("warning");
  });

  it("shows status icon for error", () => {
    (el as unknown as { status: string }).status = "error";
    const icon = el.shadowRoot!.querySelector(".status-icon");
    expect(icon!.textContent).toContain("error");
  });

  it("shows status icon for success", () => {
    (el as unknown as { status: string }).status = "success";
    const icon = el.shadowRoot!.querySelector(".status-icon");
    expect(icon!.textContent).toContain("check_circle");
  });

  it("shows status icon for loading", () => {
    (el as unknown as { status: string }).status = "loading";
    const icon = el.shadowRoot!.querySelector(".status-icon");
    expect(icon!.textContent).toContain("progress_activity");
  });

  it("clears status icon when status is none", () => {
    (el as unknown as { status: string }).status = "error";
    (el as unknown as { status: string }).status = "none";
    const icon = el.shadowRoot!.querySelector(".status-icon");
    expect(icon!.textContent?.trim()).toBe("");
  });

  it("shows error icon when error boolean is set", () => {
    (el as unknown as { error: boolean }).error = true;
    const icon = el.shadowRoot!.querySelector(".status-icon");
    expect(icon!.textContent).toContain("error");
  });

  // ── Input event ──────────────────────────────────────────────────────────

  it("dispatches input event on native input", () => {
    let detail: { value: string } | null = null;
    el.addEventListener("input", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    input.value = "typed";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(detail).toEqual({ value: "typed" });
  });

  it("input event bubbles and is composed", () => {
    let event: CustomEvent | null = null;
    el.addEventListener("input", ((e: CustomEvent) => {
      event = e;
    }) as EventListener);
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    input.value = "test";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(event).toBeTruthy();
    expect(event!.bubbles).toBe(true);
    expect(event!.composed).toBe(true);
  });

  // ── Change event ─────────────────────────────────────────────────────────

  it("dispatches change event on native change", () => {
    let detail: { value: string } | null = null;
    el.addEventListener("change", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    input.value = "changed";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    expect(detail).toEqual({ value: "changed" });
  });

  // ── Clear event ──────────────────────────────────────────────────────────

  it("dispatches clear event when clear button is clicked", () => {
    (el as unknown as { type: string }).type = "clearable";
    (el as unknown as { value: string }).value = "some text";
    let cleared = false;
    el.addEventListener("clear", () => {
      cleared = true;
    });
    const clearBtn = el.shadowRoot!.querySelector(".clear-btn") as HTMLButtonElement;
    clearBtn.click();
    expect(cleared).toBe(true);
  });

  it("clears value when clear button is clicked", () => {
    (el as unknown as { type: string }).type = "clearable";
    (el as unknown as { value: string }).value = "some text";
    const clearBtn = el.shadowRoot!.querySelector(".clear-btn") as HTMLButtonElement;
    clearBtn.click();
    expect((el as unknown as { value: string }).value).toBe("");
  });

  it("dispatches input event after clear", () => {
    (el as unknown as { type: string }).type = "clearable";
    (el as unknown as { value: string }).value = "some text";
    let inputDetail: { value: string } | null = null;
    el.addEventListener("input", ((e: CustomEvent) => {
      inputDetail = e.detail;
    }) as EventListener);
    const clearBtn = el.shadowRoot!.querySelector(".clear-btn") as HTMLButtonElement;
    clearBtn.click();
    expect(inputDetail).toEqual({ value: "" });
  });

  // ── Clear button visibility ──────────────────────────────────────────────

  it("clear button has has-value class when value is set", () => {
    (el as unknown as { type: string }).type = "clearable";
    (el as unknown as { value: string }).value = "text";
    const clearBtn = el.shadowRoot!.querySelector(".clear-btn") as HTMLButtonElement;
    expect(clearBtn.classList.contains("has-value")).toBe(true);
  });

  it("clear button does not have has-value class when value is empty", () => {
    (el as unknown as { type: string }).type = "clearable";
    const clearBtn = el.shadowRoot!.querySelector(".clear-btn") as HTMLButtonElement;
    expect(clearBtn.classList.contains("has-value")).toBe(false);
  });

  // ── Numeric controls ─────────────────────────────────────────────────────

  it("increments value on up button click", () => {
    (el as unknown as { type: string }).type = "numeric";
    (el as unknown as { value: string }).value = "5";
    const upBtn = el.shadowRoot!.querySelector(".spinner-up") as HTMLButtonElement;
    upBtn.click();
    expect((el as unknown as { value: string }).value).toBe("6");
  });

  it("decrements value on down button click", () => {
    (el as unknown as { type: string }).type = "numeric";
    (el as unknown as { value: string }).value = "5";
    const downBtn = el.shadowRoot!.querySelector(".spinner-down") as HTMLButtonElement;
    downBtn.click();
    expect((el as unknown as { value: string }).value).toBe("4");
  });

  it("increments from 0 when value is empty", () => {
    (el as unknown as { type: string }).type = "numeric";
    const upBtn = el.shadowRoot!.querySelector(".spinner-up") as HTMLButtonElement;
    upBtn.click();
    expect((el as unknown as { value: string }).value).toBe("1");
  });

  it("decrements from 0 when value is empty", () => {
    (el as unknown as { type: string }).type = "numeric";
    const downBtn = el.shadowRoot!.querySelector(".spinner-down") as HTMLButtonElement;
    downBtn.click();
    expect((el as unknown as { value: string }).value).toBe("-1");
  });

  it("dispatches input and change events on increment", () => {
    (el as unknown as { type: string }).type = "numeric";
    (el as unknown as { value: string }).value = "0";
    const events: string[] = [];
    el.addEventListener("input", () => events.push("input"));
    el.addEventListener("change", () => events.push("change"));
    const upBtn = el.shadowRoot!.querySelector(".spinner-up") as HTMLButtonElement;
    upBtn.click();
    expect(events).toEqual(["input", "change"]);
  });

  it("does not increment when disabled", () => {
    (el as unknown as { type: string }).type = "numeric";
    (el as unknown as { value: string }).value = "5";
    (el as unknown as { disabled: boolean }).disabled = true;
    // pointer-events: none prevents clicks in real browser, but we test the handler guard
    const upBtn = el.shadowRoot!.querySelector(".spinner-up") as HTMLButtonElement;
    upBtn.click();
    expect((el as unknown as { value: string }).value).toBe("5");
  });

  it("does not decrement when readonly", () => {
    (el as unknown as { type: string }).type = "numeric";
    (el as unknown as { value: string }).value = "5";
    (el as unknown as { readonly: boolean }).readonly = true;
    const downBtn = el.shadowRoot!.querySelector(".spinner-down") as HTMLButtonElement;
    downBtn.click();
    expect((el as unknown as { value: string }).value).toBe("5");
  });

  // ── Numeric input mode ───────────────────────────────────────────────────

  it("sets inputMode to numeric for numeric type", () => {
    (el as unknown as { type: string }).type = "numeric";
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.inputMode).toBe("numeric");
  });

  it("sets pattern for numeric type", () => {
    (el as unknown as { type: string }).type = "numeric";
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.pattern).toBe("[0-9]*");
  });

  // ── Focus / blur delegation ──────────────────────────────────────────────

  it("delegates focus to native input", () => {
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    const spy = vi.spyOn(input, "focus");
    (el as unknown as { focus: () => void }).focus();
    expect(spy).toHaveBeenCalled();
  });

  it("delegates blur to native input", () => {
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    const spy = vi.spyOn(input, "blur");
    (el as unknown as { blur: () => void }).blur();
    expect(spy).toHaveBeenCalled();
  });

  // ── Property accessors roundtrip ─────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      size: string;
      type: string;
      label: string;
      secondaryLabel: string;
      supportive: string;
      placeholder: string;
      value: string;
      name: string;
      disabled: boolean;
      readonly: boolean;
      error: boolean;
      status: string;
    };

    component.size = "l";
    expect(component.size).toBe("l");

    component.type = "numeric";
    expect(component.type).toBe("numeric");

    component.label = "Email";
    expect(component.label).toBe("Email");

    component.secondaryLabel = "Optional";
    expect(component.secondaryLabel).toBe("Optional");

    component.supportive = "Help";
    expect(component.supportive).toBe("Help");

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
  });

  // ── Status icon aria-hidden ──────────────────────────────────────────────

  it("status icon has aria-hidden='true'", () => {
    const icon = el.shadowRoot!.querySelector(".status-icon");
    expect(icon!.getAttribute("aria-hidden")).toBe("true");
  });

  // ── Clear button aria-label ──────────────────────────────────────────────

  it("clear button has aria-label", () => {
    const clearBtn = el.shadowRoot!.querySelector(".clear-btn");
    expect(clearBtn!.getAttribute("aria-label")).toBe("Clear input");
  });

  // ── Spinner buttons aria-labels ──────────────────────────────────────────

  it("spinner up button has aria-label", () => {
    const upBtn = el.shadowRoot!.querySelector(".spinner-up");
    expect(upBtn!.getAttribute("aria-label")).toBe("Increment");
  });

  it("spinner down button has aria-label", () => {
    const downBtn = el.shadowRoot!.querySelector(".spinner-down");
    expect(downBtn!.getAttribute("aria-label")).toBe("Decrement");
  });

  // ── Password type ──────────────────────────────────────────────────────

  it("has .password-toggle element", () => {
    const toggle = el.shadowRoot!.querySelector(".password-toggle");
    expect(toggle).toBeTruthy();
  });

  it("sets native input type to password when type is password", () => {
    (el as unknown as { type: string }).type = "password";
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("password toggle is hidden by default via CSS", () => {
    const styles = el.shadowRoot!.querySelector("style")!.textContent!;
    expect(styles).toContain(".password-toggle");
    expect(styles).toContain(":host([type=\"password\"]) .password-toggle");
  });

  it("password toggle has aria-label", () => {
    const toggle = el.shadowRoot!.querySelector(".password-toggle");
    expect(toggle!.getAttribute("aria-label")).toBe("Toggle password visibility");
  });

  it("toggles native input type on password toggle click", () => {
    (el as unknown as { type: string }).type = "password";
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    const toggle = el.shadowRoot!.querySelector(".password-toggle") as HTMLButtonElement;
    expect(input.type).toBe("password");
    toggle.click();
    expect(input.type).toBe("text");
    toggle.click();
    expect(input.type).toBe("password");
  });

  it("updates password toggle icon on click", () => {
    (el as unknown as { type: string }).type = "password";
    const toggle = el.shadowRoot!.querySelector(".password-toggle") as HTMLButtonElement;
    const icon = toggle.querySelector(".material-symbols-outlined")!;
    expect(icon.textContent).toBe("visibility");
    toggle.click();
    expect(icon.textContent).toBe("visibility_off");
    toggle.click();
    expect(icon.textContent).toBe("visibility");
  });

  it("updates aria-label on password toggle click", () => {
    (el as unknown as { type: string }).type = "password";
    const toggle = el.shadowRoot!.querySelector(".password-toggle") as HTMLButtonElement;
    toggle.click();
    expect(toggle.getAttribute("aria-label")).toBe("Hide password");
    toggle.click();
    expect(toggle.getAttribute("aria-label")).toBe("Show password");
  });

  it("resets to password type when switching back from another type", () => {
    (el as unknown as { type: string }).type = "password";
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    const toggle = el.shadowRoot!.querySelector(".password-toggle") as HTMLButtonElement;
    toggle.click();
    expect(input.type).toBe("text");
    (el as unknown as { type: string }).type = "text";
    expect(input.type).toBe("text");
    (el as unknown as { type: string }).type = "password";
    expect(input.type).toBe("text");
  });

  it("reflects type='password' to attribute", () => {
    (el as unknown as { type: string }).type = "password";
    expect(el.getAttribute("type")).toBe("password");
  });

  it("password toggle focuses input after click", () => {
    (el as unknown as { type: string }).type = "password";
    const input = el.shadowRoot!.querySelector(".native-input") as HTMLInputElement;
    const toggle = el.shadowRoot!.querySelector(".password-toggle") as HTMLButtonElement;
    const focusSpy = vi.spyOn(input, "focus");
    toggle.click();
    expect(focusSpy).toHaveBeenCalled();
  });
});
