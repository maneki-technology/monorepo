import { describe, it, expect, beforeEach } from "vitest";
import "./ui-metric.js";
import type { MetricSize, MetricOrientation, MetricDelta } from "./ui-metric.js";
import { STYLES } from "./ui-metric.styles.js";

describe("ui-metric", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-metric");
    document.body.appendChild(el);
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-metric")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).not.toBeNull();
  });

  it("applies adoptedStyleSheets", () => {
    expect(el.shadowRoot!.adoptedStyleSheets.length).toBe(1);
  });

  // ── Default rendering ─────────────────────────────────────────────────────

  it("renders a .base wrapper", () => {
    expect(el.shadowRoot!.querySelector(".base")).not.toBeNull();
  });

  it("renders a .label element", () => {
    expect(el.shadowRoot!.querySelector(".label")).not.toBeNull();
  });

  it("renders a .value element", () => {
    expect(el.shadowRoot!.querySelector(".value")).not.toBeNull();
  });

  it("renders a .legend element", () => {
    expect(el.shadowRoot!.querySelector(".legend")).not.toBeNull();
  });

  it("renders a .delta-arrow element", () => {
    expect(el.shadowRoot!.querySelector(".delta-arrow")).not.toBeNull();
  });

  it("renders a .delta-text element", () => {
    expect(el.shadowRoot!.querySelector(".delta-text")).not.toBeNull();
  });

  it("renders a .secondary-label element", () => {
    expect(el.shadowRoot!.querySelector(".secondary-label")).not.toBeNull();
  });

  it("renders a .content wrapper", () => {
    expect(el.shadowRoot!.querySelector(".content")).not.toBeNull();
  });

  it("renders a .value-container wrapper", () => {
    expect(el.shadowRoot!.querySelector(".value-container")).not.toBeNull();
  });

  it("renders a .delta-content wrapper", () => {
    expect(el.shadowRoot!.querySelector(".delta-content")).not.toBeNull();
  });

  // ── Label attribute ───────────────────────────────────────────────────────

  it("sets label text from attribute", () => {
    el.setAttribute("label", "Revenue");
    expect(el.shadowRoot!.querySelector(".label")!.textContent).toBe("Revenue");
  });

  it("clears label text when attribute removed", () => {
    el.setAttribute("label", "Revenue");
    el.removeAttribute("label");
    expect(el.shadowRoot!.querySelector(".label")!.textContent).toBe("");
  });

  // ── Value attribute ───────────────────────────────────────────────────────

  it("sets value text from attribute", () => {
    el.setAttribute("value", "$12,345");
    expect(el.shadowRoot!.querySelector(".value")!.textContent).toBe("$12,345");
  });

  it("clears value text when attribute removed", () => {
    el.setAttribute("value", "100");
    el.removeAttribute("value");
    expect(el.shadowRoot!.querySelector(".value")!.textContent).toBe("");
  });

  // ── Delta attribute ───────────────────────────────────────────────────────

  it("defaults delta to 'none'", () => {
    expect((el as unknown as { delta: MetricDelta }).delta).toBe("none");
  });

  it("sets delta='up' attribute", () => {
    el.setAttribute("delta", "up");
    expect(el.getAttribute("delta")).toBe("up");
  });

  it("sets delta='down' attribute", () => {
    el.setAttribute("delta", "down");
    expect(el.getAttribute("delta")).toBe("down");
  });

  it("CSS shows delta-arrow for delta='up'", () => {
    expect(STYLES).toContain(':host([delta="up"]) .delta-arrow');
  });

  it("CSS shows delta-arrow for delta='down'", () => {
    expect(STYLES).toContain(':host([delta="down"]) .delta-arrow');
  });

  it("CSS colors delta='up' arrow green", () => {
    expect(STYLES).toContain(':host([delta="up"]) .delta-arrow');
  });

  it("CSS colors delta='down' arrow red", () => {
    expect(STYLES).toContain(':host([delta="down"]) .delta-arrow');
  });

  it("CSS rotates delta='down' arrow 180deg", () => {
    expect(STYLES).toContain(':host([delta="down"]) .delta-arrow .arrow');
    expect(STYLES).toContain("rotate(180deg)");
  });

  // ── Delta-text attribute ──────────────────────────────────────────────────

  it("sets delta-text from attribute", () => {
    el.setAttribute("delta-text", "+12%");
    expect(el.shadowRoot!.querySelector(".delta-text")!.textContent).toBe("+12%");
  });

  it("clears delta-text when attribute removed", () => {
    el.setAttribute("delta-text", "+12%");
    el.removeAttribute("delta-text");
    expect(el.shadowRoot!.querySelector(".delta-text")!.textContent).toBe("");
  });

  it("CSS shows delta-text for delta='up'", () => {
    expect(STYLES).toContain(':host([delta="up"]) .delta-text');
  });

  it("CSS shows delta-text for delta='down'", () => {
    expect(STYLES).toContain(':host([delta="down"]) .delta-text');
  });

  // ── Secondary-label attribute ─────────────────────────────────────────────

  it("sets secondary-label text from attribute", () => {
    el.setAttribute("secondary-label", "vs last month");
    expect(el.shadowRoot!.querySelector(".secondary-label")!.textContent).toBe(
      "vs last month",
    );
  });

  it("clears secondary-label when attribute removed", () => {
    el.setAttribute("secondary-label", "vs last month");
    el.removeAttribute("secondary-label");
    expect(el.shadowRoot!.querySelector(".secondary-label")!.textContent).toBe("");
  });

  it("CSS shows secondary-label when attribute present", () => {
    expect(STYLES).toContain(":host([secondary-label]) .secondary-label");
  });

  // ── Legend-color attribute ────────────────────────────────────────────────

  it("sets legend background-color from attribute", () => {
    el.setAttribute("legend-color", "#ff0000");
    const legend = el.shadowRoot!.querySelector(".legend") as HTMLElement;
    expect(legend.style.backgroundColor).toBe("#ff0000");
  });

  it("clears legend background-color when attribute removed", () => {
    el.setAttribute("legend-color", "#ff0000");
    el.removeAttribute("legend-color");
    const legend = el.shadowRoot!.querySelector(".legend") as HTMLElement;
    expect(legend.style.backgroundColor).toBe("");
  });

  it("CSS shows legend when legend-color attribute present", () => {
    expect(STYLES).toContain(":host([legend-color]) .legend");
  });

  // ── Clickable attribute ───────────────────────────────────────────────────

  it("adds role='button' when clickable", () => {
    el.setAttribute("clickable", "");
    expect(el.getAttribute("role")).toBe("button");
  });

  it("adds tabindex='0' when clickable", () => {
    el.setAttribute("clickable", "");
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  it("sets cursor pointer when clickable", () => {
    el.setAttribute("clickable", "");
    expect(el.style.cursor).toBe("pointer");
  });

  it("removes role when clickable removed", () => {
    el.setAttribute("clickable", "");
    el.removeAttribute("clickable");
    expect(el.getAttribute("role")).toBeNull();
  });

  it("removes tabindex when clickable removed", () => {
    el.setAttribute("clickable", "");
    el.removeAttribute("clickable");
    expect(el.getAttribute("tabindex")).toBeNull();
  });

  it("clears cursor when clickable removed", () => {
    el.setAttribute("clickable", "");
    el.removeAttribute("clickable");
    expect(el.style.cursor).toBe("");
  });

  // ── Size attribute ────────────────────────────────────────────────────────

  it("defaults size to 's'", () => {
    expect((el as unknown as { size: MetricSize }).size).toBe("s");
  });

  it("reflects size='xs' to attribute", () => {
    (el as unknown as { size: MetricSize }).size = "xs";
    expect(el.getAttribute("size")).toBe("xs");
  });

  it("reflects size='s' to attribute", () => {
    (el as unknown as { size: MetricSize }).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("reflects size='m' to attribute", () => {
    (el as unknown as { size: MetricSize }).size = "m";
    expect(el.getAttribute("size")).toBe("m");
  });

  it("reflects size='l' to attribute", () => {
    (el as unknown as { size: MetricSize }).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  // ── Size CSS: xs ──────────────────────────────────────────────────────────

  it("CSS sets xs value typography token (body-02)", () => {
    expect(STYLES).toContain(':host([size="xs"]) .value');
    expect(STYLES).toMatch(/\:host\(\[size="xs"\]\) \.value\s*\{[^}]*var\(--fd-type-body-02-font-size\)/);
  });

  // ── Size CSS: s ───────────────────────────────────────────────────────────

  it("CSS sets s value typography token (body-01)", () => {
    expect(STYLES).toMatch(/\:host\(\[size="s"\]\) \.value\s*\{[^}]*var\(--fd-type-body-01-font-size\)/);
  });

  // ── Size CSS: m ───────────────────────────────────────────────────────────

  it("CSS sets m value typography token (heading-04)", () => {
    expect(STYLES).toMatch(/\:host\(\[size="m"\]\) \.value\s*\{[^}]*var\(--fd-type-heading-04-font-size\)/);
  });

  // ── Size CSS: l ───────────────────────────────────────────────────────────

  it("CSS sets l value typography token (heading-02)", () => {
    expect(STYLES).toMatch(/\:host\(\[size="l"\]\) \.value\s*\{[^}]*var\(--fd-type-heading-02-font-size\)/);
  });

  // ── Orientation attribute ─────────────────────────────────────────────────

  it("defaults orientation to 'vertical'", () => {
    expect((el as unknown as { orientation: MetricOrientation }).orientation).toBe(
      "vertical",
    );
  });

  it("reflects orientation='horizontal' to attribute", () => {
    (el as unknown as { orientation: MetricOrientation }).orientation = "horizontal";
    expect(el.getAttribute("orientation")).toBe("horizontal");
  });

  it("CSS applies horizontal layout", () => {
    expect(STYLES).toContain(':host([orientation="horizontal"]) .base');
  });

  // ── Property accessors ────────────────────────────────────────────────────

  it("get/set label property", () => {
    const typed = el as unknown as { label: string };
    typed.label = "Users";
    expect(typed.label).toBe("Users");
    expect(el.getAttribute("label")).toBe("Users");
  });

  it("get/set value property", () => {
    const typed = el as unknown as { value: string };
    typed.value = "42";
    expect(typed.value).toBe("42");
    expect(el.getAttribute("value")).toBe("42");
  });

  it("get/set delta property", () => {
    const typed = el as unknown as { delta: MetricDelta };
    typed.delta = "up";
    expect(typed.delta).toBe("up");
    expect(el.getAttribute("delta")).toBe("up");
  });

  it("get/set deltaText property", () => {
    const typed = el as unknown as { deltaText: string };
    typed.deltaText = "+5%";
    expect(typed.deltaText).toBe("+5%");
    expect(el.getAttribute("delta-text")).toBe("+5%");
  });

  it("get/set secondaryLabel property", () => {
    const typed = el as unknown as { secondaryLabel: string };
    typed.secondaryLabel = "vs last week";
    expect(typed.secondaryLabel).toBe("vs last week");
    expect(el.getAttribute("secondary-label")).toBe("vs last week");
  });

  it("get/set legendColor property", () => {
    const typed = el as unknown as { legendColor: string | null };
    typed.legendColor = "#00ff00";
    expect(typed.legendColor).toBe("#00ff00");
    expect(el.getAttribute("legend-color")).toBe("#00ff00");
  });

  it("legendColor property removes attribute when set to null", () => {
    const typed = el as unknown as { legendColor: string | null };
    typed.legendColor = "#00ff00";
    typed.legendColor = null;
    expect(el.hasAttribute("legend-color")).toBe(false);
  });

  it("get/set clickable property", () => {
    const typed = el as unknown as { clickable: boolean };
    typed.clickable = true;
    expect(typed.clickable).toBe(true);
    expect(el.hasAttribute("clickable")).toBe(true);
  });

  it("clickable property removes attribute when set to false", () => {
    const typed = el as unknown as { clickable: boolean };
    typed.clickable = true;
    typed.clickable = false;
    expect(typed.clickable).toBe(false);
    expect(el.hasAttribute("clickable")).toBe(false);
  });

  it("get/set size property", () => {
    const typed = el as unknown as { size: MetricSize };
    typed.size = "l";
    expect(typed.size).toBe("l");
    expect(el.getAttribute("size")).toBe("l");
  });

  it("get/set orientation property", () => {
    const typed = el as unknown as { orientation: MetricOrientation };
    typed.orientation = "horizontal";
    expect(typed.orientation).toBe("horizontal");
    expect(el.getAttribute("orientation")).toBe("horizontal");
  });

  // ── observedAttributes ────────────────────────────────────────────────────

  it("observes all expected attributes", () => {
    const Ctor = customElements.get("ui-metric") as unknown as {
      observedAttributes: string[];
    };
    expect(Ctor.observedAttributes).toEqual(
      expect.arrayContaining([
        "size",
        "orientation",
        "label",
        "value",
        "delta",
        "delta-text",
        "secondary-label",
        "legend-color",
        "clickable",
      ]),
    );
  });

  // ── CSS structure ─────────────────────────────────────────────────────────

  it("CSS sets host display to inline-flex", () => {
    expect(STYLES).toContain("display: inline-flex");
  });

  it("CSS includes clickable hover styles", () => {
    expect(STYLES).toContain(":host([clickable]) .base:hover");
  });

  it("CSS includes clickable active styles", () => {
    expect(STYLES).toContain(":host([clickable]) .base:active");
  });

  it("CSS hides delta-content when no delta and no secondary-label", () => {
    expect(STYLES).toContain(
      ":host(:not([delta=\"up\"]):not([delta=\"down\"]):not([secondary-label])) .delta-content",
    );
  });
});
