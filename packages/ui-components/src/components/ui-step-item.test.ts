import { describe, it, expect, beforeEach } from "vitest";
import "./ui-step-item.js";
import type { StepSize, StepStatus, StepOrientation } from "./ui-step-item.styles.js";
import { STEP_ITEM_STYLES } from "./ui-step-item.styles.js";

describe("ui-step-item", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-step-item");
    document.body.appendChild(el);
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-step-item")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .progress wrapper", () => {
    expect(el.shadowRoot!.querySelector(".progress")).not.toBeNull();
  });

  it("renders left and right .line elements", () => {
    const lines = el.shadowRoot!.querySelectorAll(".line");
    expect(lines.length).toBe(2);
  });

  it("renders .line-inner inside each line", () => {
    const inners = el.shadowRoot!.querySelectorAll(".line-inner");
    expect(inners.length).toBe(2);
  });

  it("renders a .dot element", () => {
    expect(el.shadowRoot!.querySelector(".dot")).not.toBeNull();
  });

  it("renders a .dot-icon element inside dot", () => {
    const dot = el.shadowRoot!.querySelector(".dot");
    expect(dot!.querySelector(".dot-icon")).not.toBeNull();
  });

  it("renders a .labels wrapper", () => {
    expect(el.shadowRoot!.querySelector(".labels")).not.toBeNull();
  });

  it("renders .label and .sublabel spans", () => {
    expect(el.shadowRoot!.querySelector(".label")).not.toBeNull();
    expect(el.shadowRoot!.querySelector(".sublabel")).not.toBeNull();
  });

  // ── Default attributes ────────────────────────────────────────────────────

  it("defaults size to m", () => {
    expect(el.getAttribute("size")).toBe("m");
  });

  it("defaults status to incomplete", () => {
    expect(el.getAttribute("status")).toBe("incomplete");
  });

  it("defaults orientation to horizontal", () => {
    expect(el.getAttribute("orientation")).toBe("horizontal");
  });

  // ── Size attribute ────────────────────────────────────────────────────────

  it("accepts size=s", () => {
    el.setAttribute("size", "s");
    expect(el.getAttribute("size")).toBe("s");
  });

  it("accepts size=m", () => {
    el.setAttribute("size", "m");
    expect(el.getAttribute("size")).toBe("m");
  });

  // ── Status attribute ──────────────────────────────────────────────────────

  const statuses: StepStatus[] = ["complete", "active", "incomplete", "disabled", "error", "warning"];

  for (const status of statuses) {
    it(`accepts status=${status}`, () => {
      el.setAttribute("status", status);
      expect(el.getAttribute("status")).toBe(status);
    });
  }

  // ── Orientation attribute ─────────────────────────────────────────────────

  it("accepts orientation=horizontal", () => {
    el.setAttribute("orientation", "horizontal");
    expect(el.getAttribute("orientation")).toBe("horizontal");
  });

  it("accepts orientation=vertical", () => {
    el.setAttribute("orientation", "vertical");
    expect(el.getAttribute("orientation")).toBe("vertical");
  });

  // ── Label / sublabel attributes ───────────────────────────────────────────

  it("renders label text from attribute", () => {
    el.setAttribute("label", "Step 1");
    const label = el.shadowRoot!.querySelector(".label") as HTMLElement;
    expect(label.textContent).toBe("Step 1");
  });

  it("renders sublabel text from attribute", () => {
    el.setAttribute("sublabel", "Description");
    const sublabel = el.shadowRoot!.querySelector(".sublabel") as HTMLElement;
    expect(sublabel.textContent).toBe("Description");
  });

  // ── Labels (boolean) attribute ────────────────────────────────────────────

  it("does not have labels attribute by default", () => {
    expect(el.hasAttribute("labels")).toBe(false);
  });

  it("accepts labels boolean attribute", () => {
    el.setAttribute("labels", "");
    expect(el.hasAttribute("labels")).toBe(true);
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size property getter returns attribute value", () => {
    el.setAttribute("size", "s");
    expect((el as any).size).toBe("s");
  });

  it("size property setter updates attribute", () => {
    (el as any).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("status property getter returns attribute value", () => {
    el.setAttribute("status", "active");
    expect((el as any).status).toBe("active");
  });

  it("status property setter updates attribute", () => {
    (el as any).status = "error";
    expect(el.getAttribute("status")).toBe("error");
  });

  it("orientation property getter returns attribute value", () => {
    el.setAttribute("orientation", "vertical");
    expect((el as any).orientation).toBe("vertical");
  });

  it("orientation property setter updates attribute", () => {
    (el as any).orientation = "vertical";
    expect(el.getAttribute("orientation")).toBe("vertical");
  });

  it("label property getter returns attribute value", () => {
    el.setAttribute("label", "Hello");
    expect((el as any).label).toBe("Hello");
  });

  it("label property setter updates attribute", () => {
    (el as any).label = "World";
    expect(el.getAttribute("label")).toBe("World");
  });

  it("sublabel property getter returns attribute value", () => {
    el.setAttribute("sublabel", "Sub");
    expect((el as any).sublabel).toBe("Sub");
  });

  it("sublabel property setter updates attribute", () => {
    (el as any).sublabel = "Info";
    expect(el.getAttribute("sublabel")).toBe("Info");
  });

  // ── First / Last ──────────────────────────────────────────────────────────

  it("hides left line when first attribute is set", () => {
    el.setAttribute("first", "");
    const lines = el.shadowRoot!.querySelectorAll(".line");
    expect(lines[0].classList.contains("hidden")).toBe(true);
  });

  it("shows left line when first attribute is removed", () => {
    el.setAttribute("first", "");
    el.removeAttribute("first");
    const lines = el.shadowRoot!.querySelectorAll(".line");
    expect(lines[0].classList.contains("hidden")).toBe(false);
  });

  it("hides right line when last attribute is set", () => {
    el.setAttribute("last", "");
    const lines = el.shadowRoot!.querySelectorAll(".line");
    expect(lines[1].classList.contains("hidden")).toBe(true);
  });

  it("shows right line when last attribute is removed", () => {
    el.setAttribute("last", "");
    el.removeAttribute("last");
    const lines = el.shadowRoot!.querySelectorAll(".line");
    expect(lines[1].classList.contains("hidden")).toBe(false);
  });

  // ── Line colors ───────────────────────────────────────────────────────────

  it("left line is completed for status=complete", () => {
    el.setAttribute("status", "complete");
    const inners = el.shadowRoot!.querySelectorAll(".line-inner");
    expect(inners[0].classList.contains("completed")).toBe(true);
  });

  it("left line is completed for status=active", () => {
    el.setAttribute("status", "active");
    const inners = el.shadowRoot!.querySelectorAll(".line-inner");
    expect(inners[0].classList.contains("completed")).toBe(true);
  });

  it("left line is completed for status=error", () => {
    el.setAttribute("status", "error");
    const inners = el.shadowRoot!.querySelectorAll(".line-inner");
    expect(inners[0].classList.contains("completed")).toBe(true);
  });

  it("left line is completed for status=warning", () => {
    el.setAttribute("status", "warning");
    const inners = el.shadowRoot!.querySelectorAll(".line-inner");
    expect(inners[0].classList.contains("completed")).toBe(true);
  });

  it("left line is NOT completed for status=incomplete", () => {
    el.setAttribute("status", "incomplete");
    const inners = el.shadowRoot!.querySelectorAll(".line-inner");
    expect(inners[0].classList.contains("completed")).toBe(false);
  });

  it("left line is NOT completed for status=disabled", () => {
    el.setAttribute("status", "disabled");
    const inners = el.shadowRoot!.querySelectorAll(".line-inner");
    expect(inners[0].classList.contains("completed")).toBe(false);
  });

  it("right line is completed only for status=complete", () => {
    el.setAttribute("status", "complete");
    const inners = el.shadowRoot!.querySelectorAll(".line-inner");
    expect(inners[1].classList.contains("completed")).toBe(true);
  });

  it("right line is NOT completed for status=active", () => {
    el.setAttribute("status", "active");
    const inners = el.shadowRoot!.querySelectorAll(".line-inner");
    expect(inners[1].classList.contains("completed")).toBe(false);
  });

  it("right line is NOT completed for status=incomplete", () => {
    el.setAttribute("status", "incomplete");
    const inners = el.shadowRoot!.querySelectorAll(".line-inner");
    expect(inners[1].classList.contains("completed")).toBe(false);
  });

  // ── Dot icon ──────────────────────────────────────────────────────────────

  it("shows check icon for status=complete", () => {
    el.setAttribute("status", "complete");
    const dotIcon = el.shadowRoot!.querySelector(".dot-icon") as HTMLElement;
    expect(dotIcon.textContent!.length).toBe(1);
  });

  it("shows close icon for status=error", () => {
    el.setAttribute("status", "error");
    const dotIcon = el.shadowRoot!.querySelector(".dot-icon") as HTMLElement;
    expect(dotIcon.textContent!.length).toBe(1);
  });

  it("shows warning icon for status=warning", () => {
    el.setAttribute("status", "warning");
    const dotIcon = el.shadowRoot!.querySelector(".dot-icon") as HTMLElement;
    expect(dotIcon.textContent!.length).toBe(1);
  });

  it("clears dot icon for status=active", () => {
    el.setAttribute("status", "active");
    const dotIcon = el.shadowRoot!.querySelector(".dot-icon") as HTMLElement;
    expect(dotIcon.innerHTML).toBe("");
  });

  it("clears dot icon for status=incomplete", () => {
    el.setAttribute("status", "incomplete");
    const dotIcon = el.shadowRoot!.querySelector(".dot-icon") as HTMLElement;
    expect(dotIcon.innerHTML).toBe("");
  });

  it("clears dot icon for status=disabled", () => {
    el.setAttribute("status", "disabled");
    const dotIcon = el.shadowRoot!.querySelector(".dot-icon") as HTMLElement;
    expect(dotIcon.innerHTML).toBe("");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("has correct observedAttributes list", () => {
    const Ctor = customElements.get("ui-step-item") as any;
    expect(Ctor.observedAttributes).toEqual([
      "size",
      "status",
      "orientation",
      "label",
      "sublabel",
      "labels",
      "first",
      "last",
      "clickable",
    ]);
  });
});
