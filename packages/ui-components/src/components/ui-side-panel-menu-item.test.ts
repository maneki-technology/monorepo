import { describe, it, expect, beforeEach } from "vitest";
import "./ui-side-panel-menu-item.js";

describe("ui-side-panel-menu-item", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-side-panel-menu-item");
    document.body.appendChild(el);
  });

  // ── Registration ─────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-side-panel-menu-item")).toBeDefined();
  });

  it("has a shadow root", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  // ── Default attributes ───────────────────────────────────────────────────

  it("defaults level to 'primary'", () => {
    expect((el as any).level).toBe("primary");
  });

  it("defaults type to 'basic'", () => {
    expect((el as any).type).toBe("basic");
  });

  it("defaults selected to false", () => {
    expect((el as any).selected).toBe(false);
  });

  it("defaults childParentSelected to false", () => {
    expect((el as any).childParentSelected).toBe(false);
  });

  it("defaults disabled to false", () => {
    expect((el as any).disabled).toBe(false);
  });

  it("defaults leadingIcon to false", () => {
    expect((el as any).leadingIcon).toBe(false);
  });

  it("defaults expandable to false", () => {
    expect((el as any).expandable).toBe(false);
  });

  it("defaults expanded to false", () => {
    expect((el as any).expanded).toBe(false);
  });

  // ── observedAttributes ───────────────────────────────────────────────────

  it("has correct observedAttributes", () => {
    const Ctor = customElements.get("ui-side-panel-menu-item") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes).toEqual([
      "level",
      "type",
      "selected",
      "child-parent-selected",
      "disabled",
      "leading-icon",
      "badge",
      "expandable",
      "expanded",
    ]);
  });

  // ── Level attribute ──────────────────────────────────────────────────────

  it("reflects level='primary' to attribute", () => {
    (el as any).level = "primary";
    expect(el.getAttribute("level")).toBe("primary");
  });

  it("reflects level='secondary' to attribute", () => {
    (el as any).level = "secondary";
    expect(el.getAttribute("level")).toBe("secondary");
  });

  it("reflects level='tertiary' to attribute", () => {
    (el as any).level = "tertiary";
    expect(el.getAttribute("level")).toBe("tertiary");
  });

  // ── Type attribute ───────────────────────────────────────────────────────

  it("reflects type='basic' to attribute", () => {
    (el as any).type = "basic";
    expect(el.getAttribute("type")).toBe("basic");
  });

  it("reflects type='icon-only' to attribute", () => {
    (el as any).type = "icon-only";
    expect(el.getAttribute("type")).toBe("icon-only");
  });

  // ── Boolean attributes ───────────────────────────────────────────────────

  it("reflects selected=true to attribute", () => {
    (el as any).selected = true;
    expect(el.hasAttribute("selected")).toBe(true);
  });

  it("removes selected attribute when set to false", () => {
    (el as any).selected = true;
    (el as any).selected = false;
    expect(el.hasAttribute("selected")).toBe(false);
  });

  it("reflects childParentSelected=true to attribute", () => {
    (el as any).childParentSelected = true;
    expect(el.hasAttribute("child-parent-selected")).toBe(true);
  });

  it("removes child-parent-selected attribute when set to false", () => {
    (el as any).childParentSelected = true;
    (el as any).childParentSelected = false;
    expect(el.hasAttribute("child-parent-selected")).toBe(false);
  });

  it("reflects disabled=true to attribute", () => {
    (el as any).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("reflects leadingIcon=true to attribute", () => {
    (el as any).leadingIcon = true;
    expect(el.hasAttribute("leading-icon")).toBe(true);
  });

  it("reflects expandable=true to attribute", () => {
    (el as any).expandable = true;
    expect(el.hasAttribute("expandable")).toBe(true);
  });

  it("reflects expanded=true to attribute", () => {
    (el as any).expanded = true;
    expect(el.hasAttribute("expanded")).toBe(true);
  });

  // ── Shadow DOM structure ─────────────────────────────────────────────────

  it("renders a .row element with role=treeitem", () => {
    const row = el.shadowRoot!.querySelector(".row");
    expect(row).toBeTruthy();
    expect(row!.getAttribute("role")).toBe("treeitem");
  });

  it("renders a .row element with tabindex=0", () => {
    const row = el.shadowRoot!.querySelector(".row");
    expect(row!.getAttribute("tabindex")).toBe("0");
  });

  it("renders a .label element", () => {
    const label = el.shadowRoot!.querySelector(".label");
    expect(label).toBeTruthy();
  });

  it("renders a .leading-icon element", () => {
    const icon = el.shadowRoot!.querySelector(".leading-icon");
    expect(icon).toBeTruthy();
  });

  it("renders a .badge element", () => {
    const badge = el.shadowRoot!.querySelector(".badge");
    expect(badge).toBeTruthy();
  });

  it("renders a .expand-icon element", () => {
    const expandIcon = el.shadowRoot!.querySelector(".expand-icon");
    expect(expandIcon).toBeTruthy();
  });

  it("renders a .children container with role=group", () => {
    const children = el.shadowRoot!.querySelector(".children");
    expect(children).toBeTruthy();
    expect(children!.getAttribute("role")).toBe("group");
  });

  // ── Slots ────────────────────────────────────────────────────────────────

  it("has a default slot for label text", () => {
    const slot = el.shadowRoot!.querySelector(".label slot");
    expect(slot).toBeTruthy();
    expect((slot as HTMLSlotElement).name).toBe("");
  });

  it("has an icon slot", () => {
    const slot = el.shadowRoot!.querySelector('.leading-icon slot[name="icon"]');
    expect(slot).toBeTruthy();
  });

  it("has a badge slot", () => {
    const slot = el.shadowRoot!.querySelector('.badge slot[name="badge"]');
    expect(slot).toBeTruthy();
  });

  it("has a children slot", () => {
    const slot = el.shadowRoot!.querySelector('.children-inner slot[name="children"]');
    expect(slot).toBeTruthy();
  });

  // ── Click behavior ───────────────────────────────────────────────────────

  it("dispatches select event on click", () => {
    let detail: any = null;
    el.addEventListener("select", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const row = el.shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();

    expect(detail).toEqual({ value: "" });
  });

  it("dispatches select event with value attribute", () => {
    el.setAttribute("value", "nav-home");
    let detail: any = null;
    el.addEventListener("select", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const row = el.shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();

    expect(detail).toEqual({ value: "nav-home" });
  });

  it("does not dispatch events when disabled", () => {
    (el as any).disabled = true;
    let fired = false;
    el.addEventListener("select", () => {
      fired = true;
    });

    const row = el.shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();

    expect(fired).toBe(false);
  });

  // ── Expandable behavior ──────────────────────────────────────────────────

  it("toggles expanded on click when expandable", () => {
    (el as any).expandable = true;
    expect((el as any).expanded).toBe(false);

    const row = el.shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();

    expect((el as any).expanded).toBe(true);
  });

  it("dispatches toggle event when expandable item is clicked", () => {
    (el as any).expandable = true;
    let detail: any = null;
    el.addEventListener("toggle", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const row = el.shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();

    expect(detail).toEqual({ expanded: true });
  });

  it("dispatches both toggle and select events when expandable", () => {
    (el as any).expandable = true;
    const events: string[] = [];
    el.addEventListener("toggle", () => events.push("toggle"));
    el.addEventListener("select", () => events.push("select"));

    const row = el.shadowRoot!.querySelector(".row") as HTMLElement;
    row.click();

    expect(events).toEqual(["toggle", "select"]);
  });

  it("shows expand_more icon when expandable and collapsed", () => {
    (el as any).expandable = true;
    const expandIcon = el.shadowRoot!.querySelector(".expand-icon");
    const icon = expandIcon!.querySelector("ui-icon");
    expect(icon).toBeTruthy();
    expect(icon!.getAttribute("name")).toBe("expand_more");
  });

  it("shows expand_less icon when expandable and expanded", () => {
    (el as any).expandable = true;
    (el as any).expanded = true;
    const expandIcon = el.shadowRoot!.querySelector(".expand-icon");
    const icon = expandIcon!.querySelector("ui-icon");
    expect(icon).toBeTruthy();
    expect(icon!.getAttribute("name")).toBe("expand_less");
  });

  // ── ARIA ─────────────────────────────────────────────────────────────────

  it("sets aria-selected=true when selected", () => {
    (el as any).selected = true;
    const row = el.shadowRoot!.querySelector(".row");
    expect(row!.getAttribute("aria-selected")).toBe("true");
  });

  it("sets aria-selected=false by default", () => {
    const row = el.shadowRoot!.querySelector(".row");
    expect(row!.getAttribute("aria-selected")).toBe("false");
  });

  it("sets aria-disabled=true when disabled", () => {
    (el as any).disabled = true;
    const row = el.shadowRoot!.querySelector(".row");
    expect(row!.getAttribute("aria-disabled")).toBe("true");
  });

  it("sets aria-expanded when expandable", () => {
    (el as any).expandable = true;
    const row = el.shadowRoot!.querySelector(".row");
    expect(row!.getAttribute("aria-expanded")).toBe("false");

    (el as any).expanded = true;
    expect(row!.getAttribute("aria-expanded")).toBe("true");
  });

  it("does not set aria-expanded when not expandable", () => {
    const row = el.shadowRoot!.querySelector(".row");
    expect(row!.hasAttribute("aria-expanded")).toBe(false);
  });

  // ── Keyboard ─────────────────────────────────────────────────────────────

  it("toggles expanded on Enter key when expandable", () => {
    (el as any).expandable = true;
    const row = el.shadowRoot!.querySelector(".row") as HTMLElement;

    row.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect((el as any).expanded).toBe(true);
  });

  it("toggles expanded on Space key when expandable", () => {
    (el as any).expandable = true;
    const row = el.shadowRoot!.querySelector(".row") as HTMLElement;

    row.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect((el as any).expanded).toBe(true);
  });

  it("dispatches select on Enter key", () => {
    let fired = false;
    el.addEventListener("select", () => {
      fired = true;
    });

    const row = el.shadowRoot!.querySelector(".row") as HTMLElement;
    row.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(fired).toBe(true);
  });
});
