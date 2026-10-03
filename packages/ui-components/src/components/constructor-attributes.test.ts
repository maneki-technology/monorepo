import { afterEach, describe, expect, it } from "vitest";

// Eagerly register every component entry point before testing native construction.
const components = import.meta.glob(["./ui-*.ts", "!./*.test.ts", "!./*.styles.ts"], { eager: true });
const tags = Object.keys(components)
  .filter((path) => /^\.\/ui-[^/.]+\.ts$/.test(path))
  .map((path) => path.slice(2, -3))
  .filter((tag) => customElements.get(tag));

afterEach(() => document.body.replaceChildren());

describe("custom element construction", () => {
  it.each(tags)("creates %s after registration", (tag) => {
    const element = document.createElement(tag);
    const constructor = customElements.get(tag);
    expect(constructor).toBeDefined();
    expect(element).toBeInstanceOf(constructor);
  });

  it("sets menu semantics when connected while preserving an author role", () => {
    const menu = document.createElement("ui-menu");
    expect(menu.hasAttribute("role")).toBe(false);
    document.body.append(menu);
    expect(menu.getAttribute("role")).toBe("menu");

    const custom = document.createElement("ui-menu");
    custom.setAttribute("role", "listbox");
    document.body.append(custom);
    expect(custom.getAttribute("role")).toBe("listbox");
  });

  it("sets separator semantics when connected while preserving author attributes", () => {
    const separator = document.createElement("ui-dropdown-separator");
    expect(separator.hasAttribute("role")).toBe(false);
    document.body.append(separator);
    expect(separator.getAttribute("role")).toBe("separator");
    expect(separator.getAttribute("aria-hidden")).toBe("true");

    const custom = document.createElement("ui-dropdown-separator");
    custom.setAttribute("role", "presentation");
    custom.setAttribute("aria-hidden", "false");
    document.body.append(custom);
    expect(custom.getAttribute("role")).toBe("presentation");
    expect(custom.getAttribute("aria-hidden")).toBe("false");
  });
});
