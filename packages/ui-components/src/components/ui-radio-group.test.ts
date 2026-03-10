import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "../components/ui-radio-group.js";
import "../components/ui-radio-item.js";

describe("UiRadioGroup", () => {
  let group: HTMLElement;

  beforeEach(() => {
    group = document.createElement("ui-radio-group");
    document.body.appendChild(group);
  });

  afterEach(() => {
    group.remove();
  });

  describe("rendering", () => {
    it("should render with shadow DOM", () => {
      expect(group.shadowRoot).toBeTruthy();
    });

    it("should have role='radiogroup' on container", () => {
      const groupEl = group.shadowRoot!.querySelector(".group");
      expect(groupEl?.getAttribute("role")).toBe("radiogroup");
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
    it("should propagate size to radio children", () => {
      const radio1 = document.createElement("ui-radio-item");
      const radio2 = document.createElement("ui-radio-item");
      group.appendChild(radio1);
      group.appendChild(radio2);

      group.setAttribute("size", "l");

      expect(radio1.getAttribute("size")).toBe("l");
      expect(radio2.getAttribute("size")).toBe("l");
    });

    it("should propagate size to dynamically added children", () => {
      group.setAttribute("size", "s");

      const radio = document.createElement("ui-radio-item");
      group.appendChild(radio);

      // Wait for slotchange event
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(radio.getAttribute("size")).toBe("s");
          resolve(undefined);
        }, 0);
      });
    });

    it("should update size on existing children when size changes", () => {
      const radio = document.createElement("ui-radio-item");
      group.appendChild(radio);

      group.setAttribute("size", "m");
      expect(radio.getAttribute("size")).toBe("m");

      group.setAttribute("size", "l");
      expect(radio.getAttribute("size")).toBe("l");
    });

    it("should support all size values: s, m, l", () => {
      const radio = document.createElement("ui-radio-item");
      group.appendChild(radio);

      const sizes: Array<"s" | "m" | "l"> = ["s", "m", "l"];
      for (const size of sizes) {
        group.setAttribute("size", size);
        expect(radio.getAttribute("size")).toBe(size);
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

  describe("non-radio children", () => {
    it("should only propagate to UI-RADIO-ITEM elements", () => {
      const radio = document.createElement("ui-radio-item");
      const div = document.createElement("div");
      group.appendChild(radio);
      group.appendChild(div);

      group.setAttribute("size", "l");

      expect(radio.getAttribute("size")).toBe("l");
      expect(div.getAttribute("size")).toBeNull();
    });
  });

  describe("mutual exclusion", () => {
    it("should uncheck siblings when one radio is checked via click", () => {
      const radio1 = document.createElement("ui-radio-item");
      const radio2 = document.createElement("ui-radio-item");
      const radio3 = document.createElement("ui-radio-item");
      radio1.setAttribute("checked", "");
      group.appendChild(radio1);
      group.appendChild(radio2);
      group.appendChild(radio3);

      radio2.click();

      expect(radio1.hasAttribute("checked")).toBe(false);
      expect(radio2.hasAttribute("checked")).toBe(true);
      expect(radio3.hasAttribute("checked")).toBe(false);
    });

    it("should allow only one checked radio at a time", () => {
      const radio1 = document.createElement("ui-radio-item");
      const radio2 = document.createElement("ui-radio-item");
      group.appendChild(radio1);
      group.appendChild(radio2);

      radio1.click();
      expect(radio1.hasAttribute("checked")).toBe(true);
      expect(radio2.hasAttribute("checked")).toBe(false);

      radio2.click();
      expect(radio1.hasAttribute("checked")).toBe(false);
      expect(radio2.hasAttribute("checked")).toBe(true);
    });
  });
});
