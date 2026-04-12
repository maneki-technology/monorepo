import { describe, it, expect, beforeEach, vi } from "vitest";
import "./ui-dropzone.js";

describe("ui-dropzone", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-dropzone");
    document.body.appendChild(el);
  });

  // Helper: happy-dom doesn't pass dataTransfer through DragEvent constructor
  function createDropEvent(files: File[]): DragEvent {
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(f);
    const event = new DragEvent("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", { value: dt });
    return event;
  }

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-dropzone")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
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

  it("defaults text to 'Drag and drop files here, or '", () => {
    expect((el as unknown as { text: string }).text).toBe("Drag and drop files here, or ");
  });

  it("defaults hint to empty string", () => {
    expect((el as unknown as { hint: string }).hint).toBe("");
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

  // ── Text attribute ──────────────────────────────────────────────────────

  it("shows default text in zone", () => {
    const textEl = el.shadowRoot!.querySelector(".zone-text");
    expect(textEl!.textContent).toContain("Drag and drop files here, or ");
  });

  it("updates text via property", () => {
    (el as unknown as { text: string }).text = "Drop images here, or ";
    const textEl = el.shadowRoot!.querySelector(".zone-text");
    expect(textEl!.textContent).toContain("Drop images here, or ");
  });

  it("updates text via attribute", () => {
    el.setAttribute("text", "Upload files, or ");
    const textEl = el.shadowRoot!.querySelector(".zone-text");
    expect(textEl!.textContent).toContain("Upload files, or ");
  });

  it("always shows browse link inside text", () => {
    const linkEl = el.shadowRoot!.querySelector(".zone-link");
    expect(linkEl).toBeTruthy();
    expect(linkEl!.textContent).toBe("browse");
  });

  // ── Hint attribute ──────────────────────────────────────────────────────

  it("hides hint when empty", () => {
    const hintEl = el.shadowRoot!.querySelector(".zone-hint") as HTMLElement;
    expect(hintEl.style.display).toBe("none");
  });

  it("shows hint when set via property", () => {
    (el as unknown as { hint: string }).hint = "Max 10MB per file";
    const hintEl = el.shadowRoot!.querySelector(".zone-hint") as HTMLElement;
    expect(hintEl.textContent).toBe("Max 10MB per file");
    expect(hintEl.style.display).not.toBe("none");
  });

  it("shows hint when set via attribute", () => {
    el.setAttribute("hint", "PNG, JPG only");
    const hintEl = el.shadowRoot!.querySelector(".zone-hint") as HTMLElement;
    expect(hintEl.textContent).toBe("PNG, JPG only");
  });

  // ── Accept attribute ─────────────────────────────────────────────────────

  it("passes accept to hidden input", () => {
    (el as unknown as { accept: string }).accept = "image/*";
    const hiddenInput = el.shadowRoot!.querySelector(".hidden-input") as HTMLInputElement;
    expect(hiddenInput.accept).toBe("image/*");
  });

  it("sets accept via attribute", () => {
    el.setAttribute("accept", ".pdf,.doc");
    const hiddenInput = el.shadowRoot!.querySelector(".hidden-input") as HTMLInputElement;
    expect(hiddenInput.accept).toBe(".pdf,.doc");
  });

  // ── Multiple attribute ───────────────────────────────────────────────────

  it("passes multiple to hidden input", () => {
    (el as unknown as { multiple: boolean }).multiple = true;
    const hiddenInput = el.shadowRoot!.querySelector(".hidden-input") as HTMLInputElement;
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
    const hiddenInput = el.shadowRoot!.querySelector(".hidden-input") as HTMLInputElement;
    expect(hiddenInput.disabled).toBe(true);
  });

  it("does not open file picker when disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    const hiddenInput = el.shadowRoot!.querySelector(".hidden-input") as HTMLInputElement;
    const spy = vi.spyOn(hiddenInput, "click");
    (el as unknown as { _openPicker: () => void })._openPicker();
    expect(spy).not.toHaveBeenCalled();
  });

  // ── File selection event ─────────────────────────────────────────────────

  it("dispatches change event when files are selected", () => {
    let detail: { files: FileList } | null = null;
    el.addEventListener("change", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    const hiddenInput = el.shadowRoot!.querySelector(".hidden-input") as HTMLInputElement;
    hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
    expect(detail).toBeTruthy();
    expect(detail!.files).toBeDefined();
  });

  it("change event bubbles and is composed", () => {
    let event: CustomEvent | null = null;
    el.addEventListener("change", ((e: CustomEvent) => {
      event = e;
    }) as EventListener);
    const hiddenInput = el.shadowRoot!.querySelector(".hidden-input") as HTMLInputElement;
    hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
    expect(event).toBeTruthy();
    expect(event!.bubbles).toBe(true);
    expect(event!.composed).toBe(true);
  });

  // ── Reset method ─────────────────────────────────────────────────────────

  it("reset clears the hidden input value", () => {
    const hiddenInput = el.shadowRoot!.querySelector(".hidden-input") as HTMLInputElement;
    (el as unknown as { reset: () => void }).reset();
    expect(hiddenInput.value).toBe("");
  });

  it("reset hides file list", () => {
    (el as unknown as { reset: () => void }).reset();
    const fileList = el.shadowRoot!.querySelector(".file-list") as HTMLElement;
    expect(fileList.style.display).toBe("none");
  });

  // ── Shadow DOM structure ─────────────────────────────────────────────────

  it("has .zone element", () => {
    expect(el.shadowRoot!.querySelector(".zone")).toBeTruthy();
  });

  it("has .zone-icon element", () => {
    expect(el.shadowRoot!.querySelector(".zone-icon")).toBeTruthy();
  });

  it("has .zone-text element", () => {
    expect(el.shadowRoot!.querySelector(".zone-text")).toBeTruthy();
  });

  it("has .zone-link element", () => {
    expect(el.shadowRoot!.querySelector(".zone-link")).toBeTruthy();
  });

  it("has .zone-hint element", () => {
    expect(el.shadowRoot!.querySelector(".zone-hint")).toBeTruthy();
  });

  it("has .file-list element", () => {
    expect(el.shadowRoot!.querySelector(".file-list")).toBeTruthy();
  });

  it("has .hidden-input element", () => {
    expect(el.shadowRoot!.querySelector(".hidden-input")).toBeTruthy();
  });

  it("hidden input is type file", () => {
    const hiddenInput = el.shadowRoot!.querySelector(".hidden-input") as HTMLInputElement;
    expect(hiddenInput.type).toBe("file");
  });

  it("has upload icon", () => {
    const icon = el.shadowRoot!.querySelector(".material-symbols-outlined");
    expect(icon).toBeTruthy();
    expect(icon!.textContent).toBe("\uF09B"); // ICON_UPLOAD
  });

  // ── Accessibility ────────────────────────────────────────────────────────

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
    const hiddenInput = el.shadowRoot!.querySelector(".hidden-input") as HTMLInputElement;
    expect(hiddenInput.getAttribute("aria-hidden")).toBe("true");
  });

  it("zone has role='button'", () => {
    const zone = el.shadowRoot!.querySelector(".zone");
    expect(zone!.getAttribute("role")).toBe("button");
  });

  // ── Click behavior ───────────────────────────────────────────────────────

  it("opens file picker when zone is clicked", () => {
    const hiddenInput = el.shadowRoot!.querySelector(".hidden-input") as HTMLInputElement;
    const spy = vi.spyOn(hiddenInput, "click");
    const zone = el.shadowRoot!.querySelector(".zone") as HTMLDivElement;
    zone.click();
    expect(spy).toHaveBeenCalled();
  });

  // ── Keyboard behavior ────────────────────────────────────────────────────

  it("opens file picker on Enter key", () => {
    const hiddenInput = el.shadowRoot!.querySelector(".hidden-input") as HTMLInputElement;
    const spy = vi.spyOn(hiddenInput, "click");
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(spy).toHaveBeenCalled();
  });

  it("opens file picker on Space key", () => {
    const hiddenInput = el.shadowRoot!.querySelector(".hidden-input") as HTMLInputElement;
    const spy = vi.spyOn(hiddenInput, "click");
    el.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
    expect(spy).toHaveBeenCalled();
  });

  // ── Drag and drop ───────────────────────────────────────────────────────

  it("adds drag-over class on dragenter", () => {
    const zone = el.shadowRoot!.querySelector(".zone") as HTMLDivElement;
    zone.dispatchEvent(new DragEvent("dragenter", { bubbles: true }));
    expect(zone.classList.contains("drag-over")).toBe(true);
  });

  it("removes drag-over class on dragleave when leaving zone", () => {
    const zone = el.shadowRoot!.querySelector(".zone") as HTMLDivElement;
    zone.dispatchEvent(new DragEvent("dragenter", { bubbles: true }));
    expect(zone.classList.contains("drag-over")).toBe(true);
    // Simulate leaving the zone entirely (relatedTarget outside zone)
    zone.dispatchEvent(
      new DragEvent("dragleave", {
        bubbles: true,
        relatedTarget: document.body,
      }),
    );
    expect(zone.classList.contains("drag-over")).toBe(false);
  });

  it("removes drag-over class on drop", () => {
    const zone = el.shadowRoot!.querySelector(".zone") as HTMLDivElement;
    zone.classList.add("drag-over");
    zone.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true }));
    expect(zone.classList.contains("drag-over")).toBe(false);
  });

  it("dispatches drop-files event on drop with files", () => {
    let detail: { files: File[] } | null = null;
    el.addEventListener("drop-files", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const file = new File(["content"], "test.png", { type: "image/png" });
    const zone = el.shadowRoot!.querySelector(".zone") as HTMLDivElement;
    zone.dispatchEvent(createDropEvent([file]));

    expect(detail).toBeTruthy();
    expect(detail!.files).toHaveLength(1);
    expect(detail!.files[0].name).toBe("test.png");
  });

  it("drop-files event bubbles and is composed", () => {
    let event: CustomEvent | null = null;
    el.addEventListener("drop-files", ((e: CustomEvent) => {
      event = e;
    }) as EventListener);

    const file = new File(["content"], "test.png", { type: "image/png" });
    const zone = el.shadowRoot!.querySelector(".zone") as HTMLDivElement;
    zone.dispatchEvent(createDropEvent([file]));

    expect(event).toBeTruthy();
    expect(event!.bubbles).toBe(true);
    expect(event!.composed).toBe(true);
  });

  it("does not dispatch drop-files when disabled", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    let detail: { files: File[] } | null = null;
    el.addEventListener("drop-files", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const file = new File(["content"], "test.png", { type: "image/png" });
    const zone = el.shadowRoot!.querySelector(".zone") as HTMLDivElement;
    zone.dispatchEvent(createDropEvent([file]));

    expect(detail).toBeNull();
  });

  it("filters dropped files by accept attribute (mime wildcard)", () => {
    el.setAttribute("accept", "image/*");
    let detail: { files: File[] } | null = null;
    el.addEventListener("drop-files", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const img = new File(["img"], "photo.png", { type: "image/png" });
    const txt = new File(["txt"], "readme.txt", { type: "text/plain" });
    const zone = el.shadowRoot!.querySelector(".zone") as HTMLDivElement;
    zone.dispatchEvent(createDropEvent([img, txt]));

    expect(detail).toBeTruthy();
    expect(detail!.files).toHaveLength(1);
    expect(detail!.files[0].name).toBe("photo.png");
  });

  it("limits to single file when multiple is not set", () => {
    let detail: { files: File[] } | null = null;
    el.addEventListener("drop-files", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const file1 = new File(["a"], "a.png", { type: "image/png" });
    const file2 = new File(["b"], "b.png", { type: "image/png" });
    const zone = el.shadowRoot!.querySelector(".zone") as HTMLDivElement;
    zone.dispatchEvent(createDropEvent([file1, file2]));

    expect(detail).toBeTruthy();
    expect(detail!.files).toHaveLength(1);
  });

  it("allows multiple files when multiple is set", () => {
    (el as unknown as { multiple: boolean }).multiple = true;
    let detail: { files: File[] } | null = null;
    el.addEventListener("drop-files", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const file1 = new File(["a"], "a.png", { type: "image/png" });
    const file2 = new File(["b"], "b.png", { type: "image/png" });
    const zone = el.shadowRoot!.querySelector(".zone") as HTMLDivElement;
    zone.dispatchEvent(createDropEvent([file1, file2]));

    expect(detail).toBeTruthy();
    expect(detail!.files).toHaveLength(2);
  });

  // ── Property accessors roundtrip ─────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      size: string;
      accept: string;
      multiple: boolean;
      disabled: boolean;
      text: string;
      hint: string;
    };

    component.size = "l";
    expect(component.size).toBe("l");

    component.accept = ".png";
    expect(component.accept).toBe(".png");

    component.multiple = true;
    expect(component.multiple).toBe(true);

    component.disabled = true;
    expect(component.disabled).toBe(true);

    component.text = "Drop here, or ";
    expect(component.text).toBe("Drop here, or ");

    component.hint = "Max 5MB";
    expect(component.hint).toBe("Max 5MB");
  });

  // ── Label slot ──────────────────────────────────────────────────────────

  it("has a label slot", () => {
    const slot = el.shadowRoot!.querySelector('slot[name="label"]');
    expect(slot).toBeTruthy();
  });
});
