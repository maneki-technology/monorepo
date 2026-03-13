import { describe, it, expect, beforeEach } from "vitest";
import "./ui-data-toolbar.js";
import type { UiDataToolbar } from "./ui-data-toolbar.js";

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

describe("ui-data-toolbar", () => {
  let el: UiDataToolbar;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-data-toolbar") as UiDataToolbar;
    document.body.appendChild(el);
  });

  // ── Registration ────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-data-toolbar")).toBeDefined();
  });

  // ── Default rendering ──────────────────────────────────────────────

  describe("shadow DOM structure", () => {
    it("has a shadow root", () => {
      expect(el.shadowRoot).toBeTruthy();
    });

    it("renders a <style> element", () => {
      const style = el.shadowRoot!.querySelector("style");
      expect(style).toBeTruthy();
    });

    it("renders div.inner", () => {
      const inner = el.shadowRoot!.querySelector("div.inner");
      expect(inner).toBeTruthy();
    });

    it("renders div.fields with a default slot", () => {
      const fields = el.shadowRoot!.querySelector("div.fields");
      expect(fields).toBeTruthy();
      const slot = fields!.querySelector("slot:not([name])");
      expect(slot).toBeTruthy();
    });

    it("renders div.actions with a named actions slot", () => {
      const actions = el.shadowRoot!.querySelector("div.actions");
      expect(actions).toBeTruthy();
      const slot = actions!.querySelector('slot[name="actions"]');
      expect(slot).toBeTruthy();
    });

    it("has inner inside shadow root at top level", () => {
      const children = el.shadowRoot!.children;
      // style + div.inner
      const divs = Array.from(children).filter(
        (c) => c.tagName === "DIV",
      );
      expect(divs.length).toBe(1);
      expect(divs[0].classList.contains("inner")).toBe(true);
    });
  });

  // ── Default attributes ─────────────────────────────────────────────

  describe("default attributes", () => {
    it('sets role="toolbar" by default', () => {
      expect(el.getAttribute("role")).toBe("toolbar");
    });

    it('sets size="s" by default', () => {
      expect(el.getAttribute("size")).toBe("s");
    });

    it('sets density="compact" by default', () => {
      expect(el.getAttribute("density")).toBe("compact");
    });
  });

  // ── Size attribute ─────────────────────────────────────────────────

  describe("size attribute", () => {
    it('reflects size="xs" on the element', () => {
      el.setAttribute("size", "xs");
      expect(el.getAttribute("size")).toBe("xs");
    });

    it('reflects size="s" on the element', () => {
      el.setAttribute("size", "s");
      expect(el.getAttribute("size")).toBe("s");
    });

    it('reflects size="m" on the element', () => {
      el.setAttribute("size", "m");
      expect(el.getAttribute("size")).toBe("m");
    });
  });

  // ── Density attribute ──────────────────────────────────────────────

  describe("density attribute", () => {
    it('reflects density="ultra-compact"', () => {
      el.setAttribute("density", "ultra-compact");
      expect(el.getAttribute("density")).toBe("ultra-compact");
    });

    it('reflects density="compact"', () => {
      el.setAttribute("density", "compact");
      expect(el.getAttribute("density")).toBe("compact");
    });

    it('reflects density="standard"', () => {
      el.setAttribute("density", "standard");
      expect(el.getAttribute("density")).toBe("standard");
    });
  });

  // ── observedAttributes ─────────────────────────────────────────────

  it("observes size and density attributes", () => {
    const Ctor = customElements.get("ui-data-toolbar") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes).toEqual(["size", "density"]);
  });

  // ── Property accessors ─────────────────────────────────────────────

  describe("property accessors", () => {
    it("get size returns current attribute value", () => {
      expect(el.size).toBe("s");
    });

    it("set size updates the attribute", () => {
      el.size = "m";
      expect(el.getAttribute("size")).toBe("m");
    });

    it("get size defaults to 's' when attribute missing", () => {
      el.removeAttribute("size");
      expect(el.size).toBe("s");
    });

    it("set size to xs reflects correctly", () => {
      el.size = "xs";
      expect(el.getAttribute("size")).toBe("xs");
      expect(el.size).toBe("xs");
    });

    it("get density returns current attribute value", () => {
      expect(el.density).toBe("compact");
    });

    it("set density updates the attribute", () => {
      el.density = "standard";
      expect(el.getAttribute("density")).toBe("standard");
    });

    it("get density defaults to 'compact' when attribute missing", () => {
      el.removeAttribute("density");
      expect(el.density).toBe("compact");
    });

    it("set density to ultra-compact reflects correctly", () => {
      el.density = "ultra-compact";
      expect(el.getAttribute("density")).toBe("ultra-compact");
      expect(el.density).toBe("ultra-compact");
    });
  });

  // ── Size propagation (default slot) ────────────────────────────────

  describe("size propagation to default slot", () => {
    it('propagates size="s" to children when toolbar is xs', async () => {
      const child = document.createElement("div");
      el.appendChild(child);
      el.size = "xs";
      await tick();
      expect(child.getAttribute("size")).toBe("s");
    });

    it('propagates size="s" to children when toolbar is s', async () => {
      const child = document.createElement("div");
      el.appendChild(child);
      el.size = "s";
      await tick();
      expect(child.getAttribute("size")).toBe("s");
    });

    it('propagates size="m" to children when toolbar is m', async () => {
      const child = document.createElement("div");
      el.appendChild(child);
      el.size = "m";
      await tick();
      expect(child.getAttribute("size")).toBe("m");
    });

    it("propagates to multiple children in default slot", async () => {
      const child1 = document.createElement("div");
      const child2 = document.createElement("span");
      el.appendChild(child1);
      el.appendChild(child2);
      el.size = "m";
      await tick();
      expect(child1.getAttribute("size")).toBe("m");
      expect(child2.getAttribute("size")).toBe("m");
    });
  });

  // ── Size propagation (actions slot) ────────────────────────────────

  describe("size propagation to actions slot", () => {
    it('propagates size="s" to actions children when toolbar is xs', async () => {
      const action = document.createElement("div");
      action.setAttribute("slot", "actions");
      el.appendChild(action);
      el.size = "xs";
      await tick();
      expect(action.getAttribute("size")).toBe("s");
    });

    it('propagates size="s" to actions children when toolbar is s', async () => {
      const action = document.createElement("div");
      action.setAttribute("slot", "actions");
      el.appendChild(action);
      el.size = "s";
      await tick();
      expect(action.getAttribute("size")).toBe("s");
    });

    it('propagates size="m" to actions children when toolbar is m', async () => {
      const action = document.createElement("div");
      action.setAttribute("slot", "actions");
      el.appendChild(action);
      el.size = "m";
      await tick();
      expect(action.getAttribute("size")).toBe("m");
    });

    it("propagates to multiple actions children", async () => {
      const a1 = document.createElement("div");
      const a2 = document.createElement("div");
      a1.setAttribute("slot", "actions");
      a2.setAttribute("slot", "actions");
      el.appendChild(a1);
      el.appendChild(a2);
      el.size = "m";
      await tick();
      expect(a1.getAttribute("size")).toBe("m");
      expect(a2.getAttribute("size")).toBe("m");
    });
  });

  // ── Size propagation on attribute change ───────────────────────────

  describe("size propagation on attribute change", () => {
    it("updates children when size changes from s to m", async () => {
      const child = document.createElement("div");
      el.appendChild(child);
      el.size = "s";
      await tick();
      expect(child.getAttribute("size")).toBe("s");

      el.size = "m";
      await tick();
      expect(child.getAttribute("size")).toBe("m");
    });

    it("updates children when size changes from m to xs", async () => {
      const child = document.createElement("div");
      el.appendChild(child);
      el.size = "m";
      await tick();
      expect(child.getAttribute("size")).toBe("m");

      el.size = "xs";
      await tick();
      expect(child.getAttribute("size")).toBe("s");
    });

    it("updates both default and actions slot children on size change", async () => {
      const field = document.createElement("div");
      const action = document.createElement("div");
      action.setAttribute("slot", "actions");
      el.appendChild(field);
      el.appendChild(action);

      el.size = "xs";
      await tick();
      expect(field.getAttribute("size")).toBe("s");
      expect(action.getAttribute("size")).toBe("s");

      el.size = "m";
      await tick();
      expect(field.getAttribute("size")).toBe("m");
      expect(action.getAttribute("size")).toBe("m");
    });
  });

  // ── Slot change propagation ────────────────────────────────────────

  describe("slot change propagation", () => {
    it("propagates size to dynamically added default slot child", async () => {
      el.size = "m";
      await tick();

      const child = document.createElement("div");
      el.appendChild(child);
      await tick();

      expect(child.getAttribute("size")).toBe("m");
    });

    it("propagates size to dynamically added actions slot child", async () => {
      el.size = "m";
      await tick();

      const action = document.createElement("div");
      action.setAttribute("slot", "actions");
      el.appendChild(action);
      await tick();

      expect(action.getAttribute("size")).toBe("m");
    });

    it("propagates size when multiple children added dynamically", async () => {
      el.size = "xs";
      await tick();

      const c1 = document.createElement("div");
      const c2 = document.createElement("div");
      el.appendChild(c1);
      el.appendChild(c2);
      await tick();

      expect(c1.getAttribute("size")).toBe("s");
      expect(c2.getAttribute("size")).toBe("s");
    });
  });

  // ── ARIA ───────────────────────────────────────────────────────────

  describe("ARIA", () => {
    it('sets role="toolbar" by default on connect', () => {
      const toolbar = document.createElement(
        "ui-data-toolbar",
      ) as UiDataToolbar;
      document.body.appendChild(toolbar);
      expect(toolbar.getAttribute("role")).toBe("toolbar");
    });

    it("preserves custom role if set before connect", () => {
      const toolbar = document.createElement(
        "ui-data-toolbar",
      ) as UiDataToolbar;
      toolbar.setAttribute("role", "menubar");
      document.body.appendChild(toolbar);
      expect(toolbar.getAttribute("role")).toBe("menubar");
    });

    it("preserves custom role if set before connect (group)", () => {
      const toolbar = document.createElement(
        "ui-data-toolbar",
      ) as UiDataToolbar;
      toolbar.setAttribute("role", "group");
      document.body.appendChild(toolbar);
      expect(toolbar.getAttribute("role")).toBe("group");
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────

  describe("edge cases", () => {
    it("handles no children gracefully", () => {
      // Should not throw
      el.size = "m";
      expect(el.size).toBe("m");
    });

    it("handles empty default slot", async () => {
      el.size = "xs";
      await tick();
      const defaultSlot = el.shadowRoot!.querySelector(
        "slot:not([name])",
      ) as HTMLSlotElement;
      expect(defaultSlot.assignedElements().length).toBe(0);
    });

    it("handles empty actions slot", async () => {
      el.size = "xs";
      await tick();
      const actionsSlot = el.shadowRoot!.querySelector(
        'slot[name="actions"]',
      ) as HTMLSlotElement;
      expect(actionsSlot.assignedElements().length).toBe(0);
    });

    it("does not throw when density changes", () => {
      expect(() => {
        el.density = "ultra-compact";
        el.density = "standard";
        el.density = "compact";
      }).not.toThrow();
    });

    it("preserves size attribute if set before connect", () => {
      const toolbar = document.createElement(
        "ui-data-toolbar",
      ) as UiDataToolbar;
      toolbar.setAttribute("size", "m");
      document.body.appendChild(toolbar);
      expect(toolbar.getAttribute("size")).toBe("m");
    });

    it("preserves density attribute if set before connect", () => {
      const toolbar = document.createElement(
        "ui-data-toolbar",
      ) as UiDataToolbar;
      toolbar.setAttribute("density", "standard");
      document.body.appendChild(toolbar);
      expect(toolbar.getAttribute("density")).toBe("standard");
    });

    it("ignores non-HTMLElement nodes in slots", async () => {
      el.size = "m";
      const comment = document.createComment("test comment");
      el.appendChild(comment);
      await tick();
      // Should not throw — comment nodes are skipped
      expect(el.size).toBe("m");
    });

    it("propagates size via setAttribute as well as property", async () => {
      const child = document.createElement("div");
      el.appendChild(child);
      el.setAttribute("size", "m");
      await tick();
      expect(child.getAttribute("size")).toBe("m");
    });

    it("handles rapid size changes without error", async () => {
      const child = document.createElement("div");
      el.appendChild(child);
      el.size = "xs";
      el.size = "m";
      el.size = "s";
      await tick();
      expect(child.getAttribute("size")).toBe("s");
    });

    it("children in both slots get correct size simultaneously", async () => {
      const field1 = document.createElement("div");
      const field2 = document.createElement("div");
      const action1 = document.createElement("div");
      action1.setAttribute("slot", "actions");

      el.appendChild(field1);
      el.appendChild(field2);
      el.appendChild(action1);

      el.size = "m";
      await tick();

      expect(field1.getAttribute("size")).toBe("m");
      expect(field2.getAttribute("size")).toBe("m");
      expect(action1.getAttribute("size")).toBe("m");
    });
  });
});
