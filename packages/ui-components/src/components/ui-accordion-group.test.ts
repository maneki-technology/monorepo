import { describe, it, expect, beforeEach } from "vitest";
import "./ui-accordion-item.js";
import "./ui-accordion-group.js";

describe("ui-accordion-group", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  function createGroup(attrs: Record<string, string> = {}): HTMLElement {
    const group = document.createElement("ui-accordion-group");
    for (const [k, v] of Object.entries(attrs)) {
      group.setAttribute(k, v);
    }
    for (let i = 0; i < 3; i++) {
      const item = document.createElement("ui-accordion-item");
      item.textContent = `Item ${i + 1}`;
      group.appendChild(item);
    }
    document.body.appendChild(group);
    // happy-dom may not fire slotchange, so call propagate manually
    (group as any)._propagateAttributes();
    return group;
  }

  it("registers as a custom element", () => {
    expect(customElements.get("ui-accordion-group")).toBeDefined();
  });

  it("has default attributes: size null, emphasis null, exclusive false", () => {
    el = document.createElement("ui-accordion-group");
    document.body.appendChild(el);

    expect((el as any).size).toBeNull();
    expect((el as any).emphasis).toBeNull();
    expect((el as any).exclusive).toBe(false);
  });

  it("has observedAttributes for size, emphasis, exclusive", () => {
    const Ctor = customElements.get("ui-accordion-group") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes).toEqual(["size", "emphasis", "exclusive"]);
  });

  // ── Size propagation ──────────────────────────────────────────────────

  it("propagates size to child accordion items", () => {
    el = createGroup();
    const items = el.querySelectorAll("ui-accordion-item");

    (el as any).size = "s";
    (el as any)._propagateAttributes();

    expect(items[0].getAttribute("size")).toBe("s");
    expect(items[1].getAttribute("size")).toBe("s");
    expect(items[2].getAttribute("size")).toBe("s");
  });

  // ── Emphasis propagation ──────────────────────────────────────────────

  it("propagates emphasis to child accordion items", () => {
    el = createGroup();
    const items = el.querySelectorAll("ui-accordion-item");

    (el as any).emphasis = "bold";
    (el as any)._propagateAttributes();

    expect(items[0].getAttribute("emphasis")).toBe("bold");
    expect(items[1].getAttribute("emphasis")).toBe("bold");
    expect(items[2].getAttribute("emphasis")).toBe("bold");
  });

  // ── Attribute removal propagation ─────────────────────────────────────

  it("removes propagated attributes from children when group attribute removed", () => {
    el = createGroup({ size: "l" });
    const items = el.querySelectorAll("ui-accordion-item");

    expect(items[0].getAttribute("size")).toBe("l");

    (el as any).size = null;
    (el as any)._propagateAttributes();

    expect(items[0].getAttribute("size")).toBeNull();
    expect(items[1].getAttribute("size")).toBeNull();
    expect(items[2].getAttribute("size")).toBeNull();
  });

  // ── Size property accessor ────────────────────────────────────────────

  it("exposes size property getter/setter", () => {
    el = document.createElement("ui-accordion-group");
    document.body.appendChild(el);

    (el as any).size = "m";
    expect(el.getAttribute("size")).toBe("m");
    expect((el as any).size).toBe("m");

    (el as any).size = null;
    expect(el.getAttribute("size")).toBeNull();
    expect((el as any).size).toBeNull();
  });

  // ── Emphasis property accessor ────────────────────────────────────────

  it("exposes emphasis property getter/setter", () => {
    el = document.createElement("ui-accordion-group");
    document.body.appendChild(el);

    (el as any).emphasis = "bold";
    expect(el.getAttribute("emphasis")).toBe("bold");
    expect((el as any).emphasis).toBe("bold");

    (el as any).emphasis = null;
    expect(el.getAttribute("emphasis")).toBeNull();
    expect((el as any).emphasis).toBeNull();
  });

  // ── Exclusive property accessor ───────────────────────────────────────

  it("exposes exclusive property getter/setter (boolean attribute)", () => {
    el = document.createElement("ui-accordion-group");
    document.body.appendChild(el);

    (el as any).exclusive = true;
    expect(el.hasAttribute("exclusive")).toBe(true);
    expect((el as any).exclusive).toBe(true);

    (el as any).exclusive = false;
    expect(el.hasAttribute("exclusive")).toBe(false);
    expect((el as any).exclusive).toBe(false);
  });

  // ── Exclusive mode: one item expanded, others collapse ────────────────

  it("collapses other items when one expands in exclusive mode", () => {
    el = createGroup({ exclusive: "" });
    const items = el.querySelectorAll("ui-accordion-item");

    // Expand first item
    items[0].setAttribute("expanded", "");
    items[0].dispatchEvent(
      new CustomEvent("toggle", {
        detail: { expanded: true },
        bubbles: true,
        composed: true,
      })
    );

    expect(items[0].hasAttribute("expanded")).toBe(true);

    // Expand second item
    items[1].setAttribute("expanded", "");
    items[1].dispatchEvent(
      new CustomEvent("toggle", {
        detail: { expanded: true },
        bubbles: true,
        composed: true,
      })
    );

    // First should be collapsed, second expanded
    expect(items[0].hasAttribute("expanded")).toBe(false);
    expect(items[1].hasAttribute("expanded")).toBe(true);
    expect(items[2].hasAttribute("expanded")).toBe(false);
  });

  // ── Non-exclusive mode: multiple items can be expanded ────────────────

  it("allows multiple items expanded simultaneously in non-exclusive mode", () => {
    el = createGroup();
    const items = el.querySelectorAll("ui-accordion-item");

    // Expand first item
    items[0].setAttribute("expanded", "");
    items[0].dispatchEvent(
      new CustomEvent("toggle", {
        detail: { expanded: true },
        bubbles: true,
        composed: true,
      })
    );

    // Expand second item
    items[1].setAttribute("expanded", "");
    items[1].dispatchEvent(
      new CustomEvent("toggle", {
        detail: { expanded: true },
        bubbles: true,
        composed: true,
      })
    );

    // Both should remain expanded
    expect(items[0].hasAttribute("expanded")).toBe(true);
    expect(items[1].hasAttribute("expanded")).toBe(true);
    expect(items[2].hasAttribute("expanded")).toBe(false);
  });

  // ── attributeChangedCallback re-propagates ────────────────────────────

  it("re-propagates attributes when group attribute changes", () => {
    el = createGroup();
    const items = el.querySelectorAll("ui-accordion-item");

    // Initial state: no size
    expect(items[0].getAttribute("size")).toBeNull();

    // Change size via setAttribute (triggers attributeChangedCallback)
    el.setAttribute("size", "l");

    // Should propagate to children
    expect(items[0].getAttribute("size")).toBe("l");
    expect(items[1].getAttribute("size")).toBe("l");
    expect(items[2].getAttribute("size")).toBe("l");
  });
});
