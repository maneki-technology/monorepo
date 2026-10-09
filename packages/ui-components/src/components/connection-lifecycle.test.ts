import { afterEach, describe, expect, it, vi } from "vitest";
import "../index.js";
import { UiSelect } from "./ui-select.js";

afterEach(() => document.body.replaceChildren());

describe("connection listeners", () => {
  it.each([
    { tag: "ui-switch", event: "switch-change", attributes: {} },
    { tag: "ui-step-item", event: "step-click", attributes: { clickable: "" } },
    { tag: "ui-tree-item", event: "tree-select", attributes: { arrow: "closed" } },
    { tag: "ui-queryfield-tag", event: "tag-edit", attributes: {} },
  ])("$tag emits one event when clicked after reparenting", ({ tag, event, attributes }) => {
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
    const parent = document.createElement("div");
    document.body.append(element, parent);
    parent.append(element);
    document.body.append(element);
    const changed = vi.fn();
    element.addEventListener(event, changed);

    element.click();

    expect(changed).toHaveBeenCalledTimes(1);
  });

  it.each([
    { tag: "ui-search", event: "search-input" },
    { tag: "ui-queryfield", event: "queryfield-input" },
  ])("$tag emits one input event after reparenting", ({ tag, event }) => {
    const element = document.createElement(tag);
    document.body.append(element);
    element.remove();
    document.body.append(element);
    const changed = vi.fn();
    element.addEventListener(event, changed);
    const input = element.shadowRoot?.querySelector("input");
    expect(input).toBeInstanceOf(HTMLInputElement);

    input?.dispatchEvent(new Event("input"));

    expect(changed).toHaveBeenCalledTimes(1);
  });

  it.each(["ui-dropdown", "ui-dropdown-split", "ui-select"])("%s keeps selection working after reconnecting", (tag) => {
    const element = document.createElement(tag);
    element.setAttribute("selectable", "");
    const item = document.createElement("ui-dropdown-item");
    item.setAttribute("value", "chosen");
    element.append(item);
    document.body.append(element);
    element.remove();
    document.body.append(element);

    item.shadowRoot?.querySelector("button")?.click();

    expect(item.hasAttribute("selected")).toBe(true);
    if (element instanceof UiSelect) expect(element.value).toBe("chosen");
  });

  it("advances the slider one step when pressing ArrowRight after reparenting", () => {
    const element = document.createElement("ui-slider");
    element.setAttribute("value", "30");
    document.body.append(element);
    element.remove();
    document.body.append(element);
    const handle = element.shadowRoot?.querySelector("[role=slider]");
    expect(handle).toBeTruthy();

    handle?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));

    expect(element.getAttribute("value")).toBe("31");
  });

  it("stops connection click handlers while a switch is detached", () => {
    const element = document.createElement("ui-switch");
    document.body.append(element);
    element.remove();

    element.click();

    expect(element.hasAttribute("checked")).toBe(false);
  });

  it.each([false, true])("stops slider drag handlers on removal (duringChange=%s)", (duringChange) => {
    const element = document.createElement("ui-slider");
    document.body.append(element);
    const track = element.shadowRoot?.querySelector<HTMLElement>(".track-area");
    if (!track) throw new TypeError("Missing slider track");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      width: 100,
      height: 20,
      right: 100,
      bottom: 20,
      toJSON: () => ({}),
    });
    if (duringChange) element.addEventListener("slider-change", () => element.remove(), { once: true });
    track.dispatchEvent(new PointerEvent("pointerdown", { clientX: 30 }));
    if (!duringChange) element.remove();
    const value = element.getAttribute("value");

    document.dispatchEvent(new PointerEvent("pointermove", { clientX: 80 }));

    expect(element.getAttribute("value")).toBe(value);
    expect(element.shadowRoot?.querySelector(".active")).toBeNull();
  });
});
