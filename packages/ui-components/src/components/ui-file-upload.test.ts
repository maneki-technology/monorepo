import { describe, it, expect, beforeEach, vi } from "vitest";
import "./ui-file-upload.js";

describe("ui-file-upload", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-file-upload");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-file-upload")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults placeholder to 'Choose files to upload'", () => {
    expect((el as unknown as { placeholder: string }).placeholder).toBe(
      "Choose files to upload",
    );
  });

  it("defaults buttonText to 'Browse'", () => {
    expect((el as unknown as { buttonText: string }).buttonText).toBe("Browse");
  });

  it("defaults accept to empty string", () => {
    expect((el as unknown as { accept: string }).accept).toBe("");
  });

  it("defaults multiple to false", () => {
    expect((el as unknown as { multiple: boolean }).multiple).toBe(false);
  });

  it("defaults disabled to false", () => {
    expect((el as unknown as { disabled: boolean }).disabled).toBe(false);
  });

  it("defaults name to empty string", () => {
    expect((el as unknown as { name: string }).name).toBe("");
  });

  it("defaults files to empty FileList", () => {
    const files = (el as unknown as { files: FileList | null }).files;
    expect(files).toBeTruthy();
    expect(files!.length).toBe(0);
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

  // ── Placeholder ──────────────────────────────────────────────────────────

  it("shows default placeholder text in display area", () => {
    const displayText = el.shadowRoot!.querySelector(".display-text");
    expect(displayText!.textContent).toBe("Choose files to upload");
  });

  it("updates placeholder text via property", () => {
    (el as unknown as { placeholder: string }).placeholder = "Drop files here";
    const displayText = el.shadowRoot!.querySelector(".display-text");
    expect(displayText!.textContent).toBe("Drop files here");
  });

  it("updates placeholder text via attribute", () => {
    el.setAttribute("placeholder", "Select a file");
    const displayText = el.shadowRoot!.querySelector(".display-text");
    expect(displayText!.textContent).toBe("Select a file");
  });

  it("display text has placeholder class when no files selected", () => {
    const displayText = el.shadowRoot!.querySelector(".display-text");
    expect(displayText!.classList.contains("placeholder")).toBe(true);
  });

  // ── Button text ──────────────────────────────────────────────────────────

  it("shows default button text", () => {
    const btn = el.shadowRoot!.querySelector(".browse-btn");
    expect(btn!.textContent).toBe("Browse");
  });

  it("updates button text via property", () => {
    (el as unknown as { buttonText: string }).buttonText = "Choose";
    const btn = el.shadowRoot!.querySelector(".browse-btn");
    expect(btn!.textContent).toBe("Choose");
  });

  it("updates button text via attribute", () => {
    el.setAttribute("button-text", "Upload");
    const btn = el.shadowRoot!.querySelector(".browse-btn");
    expect(btn!.textContent).toBe("Upload");
  });

  it("reflects buttonText to button-text attribute", () => {
    (el as unknown as { buttonText: string }).buttonText = "Pick";
    expect(el.getAttribute("button-text")).toBe("Pick");
  });

  // ── Accept attribute ─────────────────────────────────────────────────────

  it("passes accept to hidden input", () => {
    (el as unknown as { accept: string }).accept = "image/*";
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    expect(hiddenInput.accept).toBe("image/*");
  });

  it("sets accept via attribute", () => {
    el.setAttribute("accept", ".pdf,.doc");
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    expect(hiddenInput.accept).toBe(".pdf,.doc");
  });

  // ── Multiple attribute ───────────────────────────────────────────────────

  it("passes multiple to hidden input", () => {
    (el as unknown as { multiple: boolean }).multiple = true;
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    expect(hiddenInput.multiple).toBe(true);
  });

  it("sets multiple attribute", () => {
    (el as unknown as { multiple: boolean }).multiple = true;
    expect(el.hasAttribute("multiple")).toBe(true);
  });

  it("removes multiple attribute when set to false", () => {
    (el as unknown as { multiple: boolean }).multiple = true;
    (el as unknown as { multiple: boolean }).multiple = false;
    expect(el.hasAttribute("multiple")).toBe(false);
  });

  // ── Disabled state ───────────────────────────────────────────────────────

  it("sets disabled attribute when property is true", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("removes disabled attribute when property is false", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    (el as unknown as { disabled: boolean }).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("disables hidden input when disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    expect(hiddenInput.disabled).toBe(true);
  });

  it("disables browse button when disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    const btn = el.shadowRoot!.querySelector(
      ".browse-btn",
    ) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("does not open file picker when disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    const spy = vi.spyOn(hiddenInput, "click");
    // Manually call _openPicker to test the guard
    (el as unknown as { _openPicker: () => void })._openPicker();
    expect(spy).not.toHaveBeenCalled();
  });

  // ── Name attribute ───────────────────────────────────────────────────────

  it("passes name to hidden input", () => {
    (el as unknown as { name: string }).name = "avatar";
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    expect(hiddenInput.name).toBe("avatar");
  });

  // ── File selection event ─────────────────────────────────────────────────

  it("dispatches change event when files are selected", () => {
    let detail: { files: FileList } | null = null;
    el.addEventListener("change", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
    expect(detail).toBeTruthy();
    expect(detail!.files).toBeDefined();
  });

  it("change event bubbles and is composed", () => {
    let event: CustomEvent | null = null;
    el.addEventListener("change", ((e: CustomEvent) => {
      event = e;
    }) as EventListener);
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
    expect(event).toBeTruthy();
    expect(event!.bubbles).toBe(true);
    expect(event!.composed).toBe(true);
  });

  // ── Reset method ─────────────────────────────────────────────────────────

  it("reset clears the hidden input value", () => {
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    // We can't programmatically set files, but we can verify reset clears value
    (el as unknown as { reset: () => void }).reset();
    expect(hiddenInput.value).toBe("");
  });

  it("reset restores placeholder text", () => {
    (el as unknown as { reset: () => void }).reset();
    const displayText = el.shadowRoot!.querySelector(".display-text");
    expect(displayText!.textContent).toBe("Choose files to upload");
    expect(displayText!.classList.contains("placeholder")).toBe(true);
  });

  // ── Shadow DOM structure ─────────────────────────────────────────────────

  it("has .wrapper element", () => {
    expect(el.shadowRoot!.querySelector(".wrapper")).toBeTruthy();
  });

  it("has .display-area element", () => {
    expect(el.shadowRoot!.querySelector(".display-area")).toBeTruthy();
  });

  it("has .display-text element", () => {
    expect(el.shadowRoot!.querySelector(".display-text")).toBeTruthy();
  });

  it("has .browse-btn element", () => {
    expect(el.shadowRoot!.querySelector(".browse-btn")).toBeTruthy();
  });

  it("has .hidden-input element", () => {
    expect(el.shadowRoot!.querySelector(".hidden-input")).toBeTruthy();
  });

  it("hidden input is type file", () => {
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    expect(hiddenInput.type).toBe("file");
  });

  // ── Accessibility ────────────────────────────────────────────────────────

  it("sets role='button' on connected", () => {
    expect(el.getAttribute("role")).toBe("button");
  });

  it("sets tabindex='0' on connected", () => {
    expect(el.getAttribute("tabindex")).toBe("0");
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

  it("hidden input has aria-hidden='true'", () => {
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    expect(hiddenInput.getAttribute("aria-hidden")).toBe("true");
  });

  // ── Click behavior ───────────────────────────────────────────────────────

  it("opens file picker when browse button is clicked", () => {
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    const spy = vi.spyOn(hiddenInput, "click");
    const btn = el.shadowRoot!.querySelector(
      ".browse-btn",
    ) as HTMLButtonElement;
    btn.click();
    expect(spy).toHaveBeenCalled();
  });

  it("opens file picker when display area is clicked", () => {
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    const spy = vi.spyOn(hiddenInput, "click");
    const displayArea = el.shadowRoot!.querySelector(
      ".display-area",
    ) as HTMLDivElement;
    displayArea.click();
    expect(spy).toHaveBeenCalled();
  });

  // ── Keyboard behavior ────────────────────────────────────────────────────

  it("opens file picker on Enter key", () => {
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    const spy = vi.spyOn(hiddenInput, "click");
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(spy).toHaveBeenCalled();
  });

  it("opens file picker on Space key", () => {
    const hiddenInput = el.shadowRoot!.querySelector(
      ".hidden-input",
    ) as HTMLInputElement;
    const spy = vi.spyOn(hiddenInput, "click");
    el.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(spy).toHaveBeenCalled();
  });

  // ── Property accessors roundtrip ─────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      size: string;
      placeholder: string;
      buttonText: string;
      accept: string;
      multiple: boolean;
      disabled: boolean;
      name: string;
    };

    component.size = "l";
    expect(component.size).toBe("l");

    component.placeholder = "Pick a file";
    expect(component.placeholder).toBe("Pick a file");

    component.buttonText = "Select";
    expect(component.buttonText).toBe("Select");

    component.accept = ".png";
    expect(component.accept).toBe(".png");

    component.multiple = true;
    expect(component.multiple).toBe(true);

    component.disabled = true;
    expect(component.disabled).toBe(true);

    component.name = "upload";
    expect(component.name).toBe("upload");
  });
});
