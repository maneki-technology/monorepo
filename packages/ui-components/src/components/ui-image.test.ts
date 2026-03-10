import { describe, it, expect, beforeEach } from "vitest";
import "./ui-image.js";

describe("ui-image", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-image");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-image")).toBeDefined();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults src to empty string", () => {
    expect((el as unknown as { src: string }).src).toBe("");
  });

  it("defaults alt to empty string", () => {
    expect((el as unknown as { alt: string }).alt).toBe("");
  });

  it("defaults ratio to empty string", () => {
    expect((el as unknown as { ratio: string }).ratio).toBe("");
  });

  it("defaults fit to 'cover'", () => {
    expect((el as unknown as { fit: string }).fit).toBe("cover");
  });

  // ── Shadow DOM structure ─────────────────────────────────────────────────

  it("has shadow DOM", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  it("has a container div", () => {
    const container = el.shadowRoot!.querySelector(".container");
    expect(container).toBeTruthy();
  });

  it("has an img element", () => {
    const img = el.shadowRoot!.querySelector("img");
    expect(img).toBeTruthy();
  });

  it("has a fallback slot", () => {
    const fallback = el.shadowRoot!.querySelector(".fallback slot");
    expect(fallback).toBeTruthy();
  });

  it("hides img when no src", () => {
    const img = el.shadowRoot!.querySelector("img") as HTMLImageElement;
    expect(img.style.display).toBe("none");
  });

  // ── src attribute ────────────────────────────────────────────────────────

  it("shows img when src is set", () => {
    el.setAttribute("src", "https://example.com/photo.jpg");
    const img = el.shadowRoot!.querySelector("img") as HTMLImageElement;
    expect(img.style.display).toBe("");
    expect(img.src).toContain("photo.jpg");
  });

  it("reflects src property to attribute", () => {
    (el as unknown as { src: string }).src = "https://example.com/photo.jpg";
    expect(el.getAttribute("src")).toBe("https://example.com/photo.jpg");
  });

  it("removes src attribute when set to empty", () => {
    el.setAttribute("src", "https://example.com/photo.jpg");
    (el as unknown as { src: string }).src = "";
    expect(el.hasAttribute("src")).toBe(false);
  });

  // ── alt attribute ────────────────────────────────────────────────────────

  it("passes alt to img element", () => {
    el.setAttribute("alt", "A landscape photo");
    const img = el.shadowRoot!.querySelector("img") as HTMLImageElement;
    expect(img.alt).toBe("A landscape photo");
  });

  it("reflects alt property to attribute", () => {
    (el as unknown as { alt: string }).alt = "Photo";
    expect(el.getAttribute("alt")).toBe("Photo");
  });

  // ── ratio attribute ──────────────────────────────────────────────────────

  it("adds has-ratio class when ratio is set", () => {
    el.setAttribute("ratio", "16:9");
    const container = el.shadowRoot!.querySelector(".container")!;
    expect(container.classList.contains("has-ratio")).toBe(true);
  });

  it("sets padding-bottom for 16:9", () => {
    el.setAttribute("ratio", "16:9");
    const container = el.shadowRoot!.querySelector(".container") as HTMLDivElement;
    expect(container.style.paddingBottom).toBe("56.25%");
  });

  it("sets padding-bottom for 3:2", () => {
    el.setAttribute("ratio", "3:2");
    const container = el.shadowRoot!.querySelector(".container") as HTMLDivElement;
    expect(container.style.paddingBottom).toBe("66.6667%");
  });

  it("sets padding-bottom for 1:1", () => {
    el.setAttribute("ratio", "1:1");
    const container = el.shadowRoot!.querySelector(".container") as HTMLDivElement;
    expect(container.style.paddingBottom).toBe("100%");
  });

  it("sets padding-bottom for 3:1", () => {
    el.setAttribute("ratio", "3:1");
    const container = el.shadowRoot!.querySelector(".container") as HTMLDivElement;
    expect(container.style.paddingBottom).toBe("33.3333%");
  });

  it("sets padding-bottom for 21:9", () => {
    el.setAttribute("ratio", "21:9");
    const container = el.shadowRoot!.querySelector(".container") as HTMLDivElement;
    expect(container.style.paddingBottom).toBe("42.8571%");
  });

  it("removes has-ratio class when ratio is removed", () => {
    el.setAttribute("ratio", "16:9");
    el.removeAttribute("ratio");
    const container = el.shadowRoot!.querySelector(".container")!;
    expect(container.classList.contains("has-ratio")).toBe(false);
  });

  it("clears padding-bottom when ratio is removed", () => {
    el.setAttribute("ratio", "16:9");
    el.removeAttribute("ratio");
    const container = el.shadowRoot!.querySelector(".container") as HTMLDivElement;
    expect(container.style.paddingBottom).toBe("");
  });

  it("reflects ratio property to attribute", () => {
    (el as unknown as { ratio: string }).ratio = "3:2";
    expect(el.getAttribute("ratio")).toBe("3:2");
  });

  it("removes ratio attribute when set to empty", () => {
    el.setAttribute("ratio", "16:9");
    (el as unknown as { ratio: string }).ratio = "";
    expect(el.hasAttribute("ratio")).toBe(false);
  });

  // ── fit attribute ────────────────────────────────────────────────────────

  it("reflects fit property to attribute", () => {
    (el as unknown as { fit: string }).fit = "contain";
    expect(el.getAttribute("fit")).toBe("contain");
  });

  it("sets --ui-image-fit CSS var when fit changes", () => {
    el.setAttribute("fit", "contain");
    const container = el.shadowRoot!.querySelector(".container") as HTMLDivElement;
    expect(container.style.getPropertyValue("--ui-image-fit")).toBe("contain");
  });

  // ── Placeholder background ───────────────────────────────────────────────

  it("has container with part attribute", () => {
    const container = el.shadowRoot!.querySelector(".container");
    expect(container?.getAttribute("part")).toBe("container");
  });

  // ── Combined: src + ratio ────────────────────────────────────────────────

  it("works with both src and ratio", () => {
    el.setAttribute("src", "https://example.com/photo.jpg");
    el.setAttribute("ratio", "16:9");
    const img = el.shadowRoot!.querySelector("img") as HTMLImageElement;
    const container = el.shadowRoot!.querySelector(".container") as HTMLDivElement;
    expect(img.style.display).toBe("");
    expect(container.classList.contains("has-ratio")).toBe(true);
    expect(container.style.paddingBottom).toBe("56.25%");
  });
});
