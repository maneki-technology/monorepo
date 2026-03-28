import { describe, it, expect, beforeEach, afterEach } from "vitest";
import "./ui-person-item.js";
import type { PersonItemSize } from "./ui-person-item.js";
import { STYLES } from "./ui-person-item.styles.js";

describe("ui-person-item", () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement("ui-person-item");
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-person-item")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .wrapper element", () => {
    expect(el.shadowRoot!.querySelector(".wrapper")).not.toBeNull();
  });

  it("renders a .contents element", () => {
    expect(el.shadowRoot!.querySelector(".contents")).not.toBeNull();
  });

  it("renders a .name element", () => {
    expect(el.shadowRoot!.querySelector(".name")).not.toBeNull();
  });

  it("renders a .title element", () => {
    expect(el.shadowRoot!.querySelector(".title")).not.toBeNull();
  });

  it("renders a .location element", () => {
    expect(el.shadowRoot!.querySelector(".location")).not.toBeNull();
  });

  it("renders a .separator element", () => {
    expect(el.shadowRoot!.querySelector(".separator")).not.toBeNull();
  });

  it("renders a .labels element", () => {
    expect(el.shadowRoot!.querySelector(".labels")).not.toBeNull();
  });

  it("renders a .avatar-slot element", () => {
    expect(el.shadowRoot!.querySelector(".avatar-slot")).not.toBeNull();
  });

  it("renders a .actions element", () => {
    expect(el.shadowRoot!.querySelector(".actions")).not.toBeNull();
  });

  it("renders an avatar slot element", () => {
    const slot = el.shadowRoot!.querySelector(
      '.avatar-slot slot[name="avatar"]',
    );
    expect(slot).not.toBeNull();
  });

  it("renders an actions slot element", () => {
    const slot = el.shadowRoot!.querySelector(
      '.actions slot[name="actions"]',
    );
    expect(slot).not.toBeNull();
  });

  // ── Attributes ────────────────────────────────────────────────────────────

  it("reflects name attribute to .name text", () => {
    el.setAttribute("name", "Alice");
    expect(el.shadowRoot!.querySelector(".name")!.textContent).toBe("Alice");
  });

  it("reflects title attribute to .title text", () => {
    el.setAttribute("title", "Engineer");
    expect(el.shadowRoot!.querySelector(".title")!.textContent).toBe(
      "Engineer",
    );
  });

  it("reflects location attribute to .location text", () => {
    el.setAttribute("location", "Tokyo");
    expect(el.shadowRoot!.querySelector(".location")!.textContent).toBe(
      "Tokyo",
    );
  });

  it("clears name text when attribute removed", () => {
    el.setAttribute("name", "Alice");
    el.removeAttribute("name");
    expect(el.shadowRoot!.querySelector(".name")!.textContent).toBe("");
  });

  it("clears title text when attribute removed", () => {
    el.setAttribute("title", "Engineer");
    el.removeAttribute("title");
    expect(el.shadowRoot!.querySelector(".title")!.textContent).toBe("");
  });

  it("clears location text when attribute removed", () => {
    el.setAttribute("location", "Tokyo");
    el.removeAttribute("location");
    expect(el.shadowRoot!.querySelector(".location")!.textContent).toBe("");
  });

  it("defaults size to s on connect", () => {
    expect(el.getAttribute("size")).toBe("s");
  });

  it("does not override existing size attribute on connect", () => {
    document.body.innerHTML = "";
    const item = document.createElement("ui-person-item");
    item.setAttribute("size", "l");
    document.body.appendChild(item);
    expect(item.getAttribute("size")).toBe("l");
  });

  it("accepts size xs", () => {
    el.setAttribute("size", "xs");
    expect(el.getAttribute("size")).toBe("xs");
  });

  it("accepts size m", () => {
    el.setAttribute("size", "m");
    expect(el.getAttribute("size")).toBe("m");
  });

  it("accepts size l", () => {
    el.setAttribute("size", "l");
    expect(el.getAttribute("size")).toBe("l");
  });

  it("sets name-only attribute", () => {
    el.setAttribute("name-only", "");
    expect(el.hasAttribute("name-only")).toBe(true);
  });

  it("sets avatar-text attribute", () => {
    el.setAttribute("avatar-text", "AB");
    expect(el.getAttribute("avatar-text")).toBe("AB");
  });

  // ── Sizes — avatar-slot dimensions in CSS ─────────────────────────────────

  it("styles define xs avatar-slot as 24×24", () => {
    expect(STYLES).toContain(':host([size="xs"]) .avatar-slot');
    expect(STYLES).toMatch(
      /:host\(\[size="xs"\]\) \.avatar-slot\s*\{[^}]*width:\s*24px/,
    );
    expect(STYLES).toMatch(
      /:host\(\[size="xs"\]\) \.avatar-slot\s*\{[^}]*height:\s*24px/,
    );
  });

  it("styles define s avatar-slot as 24×24", () => {
    expect(STYLES).toContain(':host([size="s"]) .avatar-slot');
    expect(STYLES).toMatch(
      /:host\(\[size="s"\]\) \.avatar-slot\s*\{[^}]*width:\s*24px/,
    );
    expect(STYLES).toMatch(
      /:host\(\[size="s"\]\) \.avatar-slot\s*\{[^}]*height:\s*24px/,
    );
  });

  it("styles define m avatar-slot as 32×32", () => {
    expect(STYLES).toContain(':host([size="m"]) .avatar-slot');
    expect(STYLES).toMatch(
      /:host\(\[size="m"\]\) \.avatar-slot\s*\{[^}]*width:\s*32px/,
    );
    expect(STYLES).toMatch(
      /:host\(\[size="m"\]\) \.avatar-slot\s*\{[^}]*height:\s*32px/,
    );
  });

  it("styles define l avatar-slot as 40×40", () => {
    expect(STYLES).toContain(':host([size="l"]) .avatar-slot');
    expect(STYLES).toMatch(
      /:host\(\[size="l"\]\) \.avatar-slot\s*\{[^}]*width:\s*40px/,
    );
    expect(STYLES).toMatch(
      /:host\(\[size="l"\]\) \.avatar-slot\s*\{[^}]*height:\s*40px/,
    );
  });

  // ── Name-only mode ────────────────────────────────────────────────────────

  it("styles hide .title in name-only mode", () => {
    expect(STYLES).toMatch(
      /:host\(\[name-only\]\)\s+\.title[\s,][^{]*\{[^}]*display:\s*none/,
    );
  });

  it("styles hide .location in name-only mode", () => {
    expect(STYLES).toMatch(
      /:host\(\[name-only\]\)\s+\.location[\s,][^{]*\{[^}]*display:\s*none/,
    );
  });

  it("styles hide .actions in name-only mode", () => {
    expect(STYLES).toMatch(
      /:host\(\[name-only\]\)\s+\.actions\s*\{[^}]*display:\s*none/,
    );
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("size getter returns current size", () => {
    el.setAttribute("size", "m");
    expect((el as unknown as { size: PersonItemSize }).size).toBe("m");
  });

  it("size setter updates attribute", () => {
    (el as unknown as { size: PersonItemSize }).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  it("personName getter returns name attribute", () => {
    el.setAttribute("name", "Bob");
    expect((el as unknown as { personName: string }).personName).toBe("Bob");
  });

  it("personName setter updates attribute and text", () => {
    (el as unknown as { personName: string }).personName = "Carol";
    expect(el.getAttribute("name")).toBe("Carol");
    expect(el.shadowRoot!.querySelector(".name")!.textContent).toBe("Carol");
  });

  it("personTitle getter returns title attribute", () => {
    el.setAttribute("title", "Manager");
    expect((el as unknown as { personTitle: string }).personTitle).toBe(
      "Manager",
    );
  });

  it("personTitle setter updates attribute and text", () => {
    (el as unknown as { personTitle: string }).personTitle = "Director";
    expect(el.getAttribute("title")).toBe("Director");
    expect(el.shadowRoot!.querySelector(".title")!.textContent).toBe(
      "Director",
    );
  });

  it("location getter returns location attribute", () => {
    el.setAttribute("location", "NYC");
    expect((el as unknown as { location: string }).location).toBe("NYC");
  });

  it("location setter updates attribute and text", () => {
    (el as unknown as { location: string }).location = "London";
    expect(el.getAttribute("location")).toBe("London");
    expect(el.shadowRoot!.querySelector(".location")!.textContent).toBe(
      "London",
    );
  });

  it("nameOnly getter returns false by default", () => {
    expect((el as unknown as { nameOnly: boolean }).nameOnly).toBe(false);
  });

  it("nameOnly setter adds attribute when true", () => {
    (el as unknown as { nameOnly: boolean }).nameOnly = true;
    expect(el.hasAttribute("name-only")).toBe(true);
  });

  it("nameOnly setter removes attribute when false", () => {
    el.setAttribute("name-only", "");
    (el as unknown as { nameOnly: boolean }).nameOnly = false;
    expect(el.hasAttribute("name-only")).toBe(false);
  });

  it("avatarText getter returns avatar-text attribute", () => {
    el.setAttribute("avatar-text", "JD");
    expect((el as unknown as { avatarText: string }).avatarText).toBe("JD");
  });

  it("avatarText setter updates attribute", () => {
    (el as unknown as { avatarText: string }).avatarText = "XY";
    expect(el.getAttribute("avatar-text")).toBe("XY");
  });

  // ── Default action icons ──────────────────────────────────────────────────

  it("creates 3 default action icons on connect", () => {
    const icons = el.shadowRoot!.querySelectorAll(".action-icon");
    expect(icons.length).toBe(3);
  });

  it("creates mail action icon", () => {
    const icon = el.shadowRoot!.querySelector('[data-action="mail"]');
    expect(icon).not.toBeNull();
  });

  it("creates phone action icon", () => {
    const icon = el.shadowRoot!.querySelector('[data-action="phone"]');
    expect(icon).not.toBeNull();
  });

  it("creates message action icon", () => {
    const icon = el.shadowRoot!.querySelector('[data-action="message"]');
    expect(icon).not.toBeNull();
  });

  it("action icons contain ui-icon element", () => {
    const icon = el.shadowRoot!.querySelector('[data-action="mail"]');
    expect(icon!.querySelector("ui-icon")).not.toBeNull();
  });

  // ── Default avatar ────────────────────────────────────────────────────────

  it("creates a default ui-avatar in avatar-slot on connect", () => {
    const avatar = el.shadowRoot!.querySelector(".avatar-slot ui-avatar");
    expect(avatar).not.toBeNull();
  });

  it("default avatar has type=icon", () => {
    const avatar = el.shadowRoot!.querySelector(".avatar-slot ui-avatar");
    expect(avatar!.getAttribute("type")).toBe("icon");
  });

  it("default avatar has emphasis=bold", () => {
    const avatar = el.shadowRoot!.querySelector(".avatar-slot ui-avatar");
    expect(avatar!.getAttribute("emphasis")).toBe("bold");
  });

  it("default avatar size maps s → s", () => {
    const avatar = el.shadowRoot!.querySelector(".avatar-slot ui-avatar");
    expect(avatar!.getAttribute("size")).toBe("s");
  });

  it("avatar-text switches default avatar to text type", () => {
    el.setAttribute("avatar-text", "AB");
    const avatar = el.shadowRoot!.querySelector(".avatar-slot ui-avatar");
    expect(avatar!.getAttribute("type")).toBe("text");
    expect(avatar!.textContent).toBe("AB");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observedAttributes includes all expected attributes", () => {
    const Ctor = customElements.get("ui-person-item") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes).toEqual(
      expect.arrayContaining([
        "size",
        "name",
        "title",
        "location",
        "name-only",
        "avatar-text",
      ]),
    );
  });

  it("observedAttributes has exactly 6 entries", () => {
    const Ctor = customElements.get("ui-person-item") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes.length).toBe(6);
  });
});
