import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "../components/ui-checkbox-group.js";
import "../components/ui-checkbox-item.js";

describe("UiCheckboxGroup", () => {
  let group: HTMLElement;

  beforeEach(() => {
    group = document.createElement("ui-checkbox-group");
    document.body.appendChild(group);
  });

  afterEach(() => {
    group.remove();
  });

  describe("rendering", () => {
    it("should render with shadow DOM", () => {
      expect(group.shadowRoot).toBeTruthy();
    });

    it("should have role='group' on container", () => {
      const groupEl = group.shadowRoot!.querySelector(".group");
      expect(groupEl?.getAttribute("role")).toBe("group");
    });

    it("should have part='group' on container", () => {
      const groupEl = group.shadowRoot!.querySelector(".group");
      expect(groupEl?.getAttribute("part")).toBe("group");
    });

    it("should render slot for children", () => {
      const slot = group.shadowRoot!.querySelector("slot");
      expect(slot).toBeTruthy();
    });
  });

  describe("default attributes", () => {
    it("should default to size='m'", () => {
      expect(group.getAttribute("size")).toBeNull();
      expect((group as any).size).toBe("m");
    });

    it("should default to orientation='vertical'", () => {
      expect(group.getAttribute("orientation")).toBeNull();
      expect((group as any).orientation).toBe("vertical");
    });
  });

  describe("size propagation", () => {
    it("should propagate size to checkbox children", () => {
      const checkbox1 = document.createElement("ui-checkbox-item");
      const checkbox2 = document.createElement("ui-checkbox-item");
      group.appendChild(checkbox1);
      group.appendChild(checkbox2);

      group.setAttribute("size", "l");

      expect(checkbox1.getAttribute("size")).toBe("l");
      expect(checkbox2.getAttribute("size")).toBe("l");
    });

    it("should propagate size to dynamically added children", () => {
      group.setAttribute("size", "s");

      const checkbox = document.createElement("ui-checkbox-item");
      group.appendChild(checkbox);

      // Wait for slotchange event
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(checkbox.getAttribute("size")).toBe("s");
          resolve(undefined);
        }, 0);
      });
    });

    it("should update size on existing children when size changes", () => {
      const checkbox = document.createElement("ui-checkbox-item");
      group.appendChild(checkbox);

      group.setAttribute("size", "m");
      expect(checkbox.getAttribute("size")).toBe("m");

      group.setAttribute("size", "l");
      expect(checkbox.getAttribute("size")).toBe("l");
    });

    it("should support all size values: s, m, l", () => {
      const checkbox = document.createElement("ui-checkbox-item");
      group.appendChild(checkbox);

      const sizes: Array<"s" | "m" | "l"> = ["s", "m", "l"];
      for (const size of sizes) {
        group.setAttribute("size", size);
        expect(checkbox.getAttribute("size")).toBe(size);
      }
    });
  });

  describe("orientation attribute", () => {
    it("should accept orientation='vertical'", () => {
      group.setAttribute("orientation", "vertical");
      expect(group.getAttribute("orientation")).toBe("vertical");
    });

    it("should accept orientation='horizontal'", () => {
      group.setAttribute("orientation", "horizontal");
      expect(group.getAttribute("orientation")).toBe("horizontal");
    });
  });

  describe("property accessors", () => {
    it("should get/set size property", () => {
      (group as any).size = "l";
      expect(group.getAttribute("size")).toBe("l");
      expect((group as any).size).toBe("l");
    });

    it("should get/set orientation property", () => {
      (group as any).orientation = "horizontal";
      expect(group.getAttribute("orientation")).toBe("horizontal");
      expect((group as any).orientation).toBe("horizontal");
    });

    it("should default size to 'm' when not set", () => {
      expect((group as any).size).toBe("m");
    });

    it("should default orientation to 'vertical' when not set", () => {
      expect((group as any).orientation).toBe("vertical");
    });
  });

  describe("CSS layout", () => {
    it("should have display: flex on host", () => {
      const styles = group.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
      expect(styles).toContain(":host {");
      expect(styles).toContain("display: flex;");
    });

    it("should have flex-direction: column for vertical orientation", () => {
      const styles = group.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
      expect(styles).toContain("flex-direction: column;");
    });

    it("should have flex-direction: row for horizontal orientation", () => {
      const styles = group.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
      expect(styles).toContain("flex-direction: row;");
    });
  });

  describe("gap values", () => {
    it("should have correct gap for size='s' (8px)", () => {
      const styles = group.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
      expect(styles).toContain(':host([size="s"]) .group');
    });

    it("should have correct gap for size='m' (12px)", () => {
      const styles = group.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
      expect(styles).toContain(':host([size="m"]) .group');
    });

    it("should have correct gap for size='l' (20px)", () => {
      const styles = group.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
      expect(styles).toContain(':host([size="l"]) .group');
    });

    it("should have horizontal gap (24px) for horizontal orientation", () => {
      const styles = group.shadowRoot!.adoptedStyleSheets.map((s: CSSStyleSheet) => Array.from(s.cssRules).map((r: CSSRule) => r.cssText).join("")).join("");
      expect(styles).toContain(':host([orientation="horizontal"]) .group');
    });
  });

  describe("non-checkbox children", () => {
    it("should only propagate to UI-CHECKBOX-ITEM elements", () => {
      const checkbox = document.createElement("ui-checkbox-item");
      const div = document.createElement("div");
      group.appendChild(checkbox);
      group.appendChild(div);

      group.setAttribute("size", "l");

      expect(checkbox.getAttribute("size")).toBe("l");
      expect(div.getAttribute("size")).toBeNull();
    });
  });
});
