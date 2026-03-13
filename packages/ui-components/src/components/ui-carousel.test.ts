import { describe, it, expect, beforeEach } from "vitest";
import "./ui-carousel.js";
import "./ui-carousel-item.js";

// helper: flush microtasks
const tick = () => new Promise((r) => setTimeout(r, 0));

// ═══════════════════════════════════════════════════════════════════════════════
// ui-carousel
// ═══════════════════════════════════════════════════════════════════════════════

describe("ui-carousel", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-carousel");
    document.body.appendChild(el);
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-carousel")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  // ── Defaults ──────────────────────────────────────────────────────────────

  it("defaults gap to 16", () => {
    expect((el as unknown as { gap: number }).gap).toBe(16);
  });

  it("defaults loop to false", () => {
    expect((el as unknown as { loop: boolean }).loop).toBe(false);
  });

  it("defaults autoPlay to false", () => {
    expect((el as unknown as { autoPlay: boolean }).autoPlay).toBe(false);
  });

  it("defaults autoPlayInterval to 5000", () => {
    expect(
      (el as unknown as { autoPlayInterval: number }).autoPlayInterval,
    ).toBe(5000);
  });

  it("defaults hideArrows to false", () => {
    expect((el as unknown as { hideArrows: boolean }).hideArrows).toBe(false);
  });

  it("defaults hideIndicators to false", () => {
    expect(
      (el as unknown as { hideIndicators: boolean }).hideIndicators,
    ).toBe(false);
  });

  // ── gap attribute ─────────────────────────────────────────────────────────

  it("reflects gap to attribute", () => {
    (el as unknown as { gap: number }).gap = 24;
    expect(el.getAttribute("gap")).toBe("24");
  });

  it("reads gap from attribute", () => {
    el.setAttribute("gap", "32");
    expect((el as unknown as { gap: number }).gap).toBe(32);
  });

  it("applies gap to track style", () => {
    (el as unknown as { gap: number }).gap = 20;
    const track = el.shadowRoot!.querySelector(".track") as HTMLElement;
    expect(track.style.gap).toBe("20px");
  });

  it("returns 16 when gap attribute is absent", () => {
    expect((el as unknown as { gap: number }).gap).toBe(16);
  });

  // ── loop boolean attribute ────────────────────────────────────────────────

  it("sets loop attribute when property is true", () => {
    (el as unknown as { loop: boolean }).loop = true;
    expect(el.hasAttribute("loop")).toBe(true);
  });

  it("removes loop attribute when property is false", () => {
    (el as unknown as { loop: boolean }).loop = true;
    (el as unknown as { loop: boolean }).loop = false;
    expect(el.hasAttribute("loop")).toBe(false);
  });

  it("reads loop from attribute", () => {
    el.setAttribute("loop", "");
    expect((el as unknown as { loop: boolean }).loop).toBe(true);
  });

  // ── auto-play boolean attribute ───────────────────────────────────────────

  it("sets auto-play attribute when property is true", () => {
    (el as unknown as { autoPlay: boolean }).autoPlay = true;
    expect(el.hasAttribute("auto-play")).toBe(true);
  });

  it("removes auto-play attribute when property is false", () => {
    (el as unknown as { autoPlay: boolean }).autoPlay = true;
    (el as unknown as { autoPlay: boolean }).autoPlay = false;
    expect(el.hasAttribute("auto-play")).toBe(false);
  });

  it("reads autoPlay from attribute", () => {
    el.setAttribute("auto-play", "");
    expect((el as unknown as { autoPlay: boolean }).autoPlay).toBe(true);
  });

  // ── auto-play-interval attribute ──────────────────────────────────────────

  it("reflects autoPlayInterval to attribute", () => {
    (el as unknown as { autoPlayInterval: number }).autoPlayInterval = 3000;
    expect(el.getAttribute("auto-play-interval")).toBe("3000");
  });

  it("reads autoPlayInterval from attribute", () => {
    el.setAttribute("auto-play-interval", "7000");
    expect(
      (el as unknown as { autoPlayInterval: number }).autoPlayInterval,
    ).toBe(7000);
  });

  it("returns 5000 when auto-play-interval attribute is absent", () => {
    expect(
      (el as unknown as { autoPlayInterval: number }).autoPlayInterval,
    ).toBe(5000);
  });

  // ── hide-arrows boolean attribute ─────────────────────────────────────────

  it("sets hide-arrows attribute when property is true", () => {
    (el as unknown as { hideArrows: boolean }).hideArrows = true;
    expect(el.hasAttribute("hide-arrows")).toBe(true);
  });

  it("removes hide-arrows attribute when property is false", () => {
    (el as unknown as { hideArrows: boolean }).hideArrows = true;
    (el as unknown as { hideArrows: boolean }).hideArrows = false;
    expect(el.hasAttribute("hide-arrows")).toBe(false);
  });

  it("reads hideArrows from attribute", () => {
    el.setAttribute("hide-arrows", "");
    expect((el as unknown as { hideArrows: boolean }).hideArrows).toBe(true);
  });

  // ── hide-indicators boolean attribute ─────────────────────────────────────

  it("sets hide-indicators attribute when property is true", () => {
    (el as unknown as { hideIndicators: boolean }).hideIndicators = true;
    expect(el.hasAttribute("hide-indicators")).toBe(true);
  });

  it("removes hide-indicators attribute when property is false", () => {
    (el as unknown as { hideIndicators: boolean }).hideIndicators = true;
    (el as unknown as { hideIndicators: boolean }).hideIndicators = false;
    expect(el.hasAttribute("hide-indicators")).toBe(false);
  });

  it("reads hideIndicators from attribute", () => {
    el.setAttribute("hide-indicators", "");
    expect(
      (el as unknown as { hideIndicators: boolean }).hideIndicators,
    ).toBe(true);
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it("sets role='region' on connected", () => {
    expect(el.getAttribute("role")).toBe("region");
  });

  it("sets aria-roledescription='carousel' on connected", () => {
    expect(el.getAttribute("aria-roledescription")).toBe("carousel");
  });

  it("does not override existing role", () => {
    document.body.innerHTML = "";
    const el2 = document.createElement("ui-carousel");
    el2.setAttribute("role", "presentation");
    document.body.appendChild(el2);
    expect(el2.getAttribute("role")).toBe("presentation");
  });

  it("does not override existing aria-roledescription", () => {
    document.body.innerHTML = "";
    const el2 = document.createElement("ui-carousel");
    el2.setAttribute("aria-roledescription", "slider");
    document.body.appendChild(el2);
    expect(el2.getAttribute("aria-roledescription")).toBe("slider");
  });

  it("passes through aria-label attribute", () => {
    el.setAttribute("aria-label", "Product gallery");
    expect(el.getAttribute("aria-label")).toBe("Product gallery");
  });

  it("observes aria-label attribute", () => {
    const observed = (
      customElements.get("ui-carousel") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("aria-label");
  });

  // ── Property accessors roundtrip ──────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      gap: number;
      loop: boolean;
      autoPlay: boolean;
      autoPlayInterval: number;
      hideArrows: boolean;
      hideIndicators: boolean;
    };

    component.gap = 24;
    expect(component.gap).toBe(24);

    component.loop = true;
    expect(component.loop).toBe(true);

    component.autoPlay = true;
    expect(component.autoPlay).toBe(true);

    component.autoPlayInterval = 3000;
    expect(component.autoPlayInterval).toBe(3000);

    component.hideArrows = true;
    expect(component.hideArrows).toBe(true);

    component.hideIndicators = true;
    expect(component.hideIndicators).toBe(true);
  });

  // ── Shadow DOM structure ──────────────────────────────────────────────────

  it("has a .track element", () => {
    expect(el.shadowRoot!.querySelector(".track")).toBeTruthy();
  });

  it("has a default slot inside .track", () => {
    const track = el.shadowRoot!.querySelector(".track");
    expect(track!.querySelector("slot:not([name])")).toBeTruthy();
  });

  it("has a header slot", () => {
    expect(el.shadowRoot!.querySelector('slot[name="header"]')).toBeTruthy();
  });

  it("has an .arrow-group", () => {
    expect(el.shadowRoot!.querySelector(".arrow-group")).toBeTruthy();
  });

  it("has an .indicators container", () => {
    expect(el.shadowRoot!.querySelector(".indicators")).toBeTruthy();
  });

  it("has an .arrow-group container", () => {
    expect(el.shadowRoot!.querySelector(".arrow-group")).toBeTruthy();
  });

  it("has a prev arrow button", () => {
    const btn = el.shadowRoot!.querySelector(
      '.arrow-btn[aria-label="Previous slide"]',
    );
    expect(btn).toBeTruthy();
  });

  it("has a next arrow button", () => {
    const btn = el.shadowRoot!.querySelector(
      '.arrow-btn[aria-label="Next slide"]',
    );
    expect(btn).toBeTruthy();
  });

  it("prev button contains a ui-icon", () => {
    const btn = el.shadowRoot!.querySelector(
      '.arrow-btn[aria-label="Previous slide"]',
    );
    expect(btn!.querySelector("ui-icon")).toBeTruthy();
  });

  it("next button contains a ui-icon", () => {
    const btn = el.shadowRoot!.querySelector(
      '.arrow-btn[aria-label="Next slide"]',
    );
    expect(btn!.querySelector("ui-icon")).toBeTruthy();
  });

  it("prev button icon has name arrow_back_ios", () => {
    const btn = el.shadowRoot!.querySelector(
      '.arrow-btn[aria-label="Previous slide"]',
    );
    const icon = btn!.querySelector("ui-icon");
    expect(icon!.getAttribute("name")).toBe("arrow_back_ios");
  });

  it("next button icon has name arrow_forward_ios", () => {
    const btn = el.shadowRoot!.querySelector(
      '.arrow-btn[aria-label="Next slide"]',
    );
    const icon = btn!.querySelector("ui-icon");
    expect(icon!.getAttribute("name")).toBe("arrow_forward_ios");
  });

  it("arrow buttons have type='button'", () => {
    const buttons = el.shadowRoot!.querySelectorAll(".arrow-btn");
    for (const btn of buttons) {
      expect(btn.getAttribute("type")).toBe("button");
    }
  });

  // ── Observed attributes ───────────────────────────────────────────────────

  it("observes gap attribute", () => {
    const observed = (
      customElements.get("ui-carousel") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("gap");
  });

  it("observes loop attribute", () => {
    const observed = (
      customElements.get("ui-carousel") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("loop");
  });

  it("observes auto-play attribute", () => {
    const observed = (
      customElements.get("ui-carousel") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("auto-play");
  });

  it("observes auto-play-interval attribute", () => {
    const observed = (
      customElements.get("ui-carousel") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("auto-play-interval");
  });

  it("observes hide-arrows attribute", () => {
    const observed = (
      customElements.get("ui-carousel") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("hide-arrows");
  });

  it("observes hide-indicators attribute", () => {
    const observed = (
      customElements.get("ui-carousel") as unknown as {
        observedAttributes: string[];
      }
    ).observedAttributes;
    expect(observed).toContain("hide-indicators");
  });

  // ── _upgradeProperty ──────────────────────────────────────────────────────

  it("upgrades gap property set before connectedCallback", () => {
    document.body.innerHTML = "";
    const el2 = document.createElement("ui-carousel");
    (el2 as unknown as { gap: number }).gap = 40;
    document.body.appendChild(el2);
    expect((el2 as unknown as { gap: number }).gap).toBe(40);
    expect(el2.getAttribute("gap")).toBe("40");
  });

  it("upgrades loop property set before connectedCallback", () => {
    document.body.innerHTML = "";
    const el2 = document.createElement("ui-carousel");
    (el2 as unknown as { loop: boolean }).loop = true;
    document.body.appendChild(el2);
    expect((el2 as unknown as { loop: boolean }).loop).toBe(true);
    expect(el2.hasAttribute("loop")).toBe(true);
  });

  it("upgrades autoPlay property set before connectedCallback", () => {
    document.body.innerHTML = "";
    const el2 = document.createElement("ui-carousel");
    (el2 as unknown as { autoPlay: boolean }).autoPlay = true;
    document.body.appendChild(el2);
    expect((el2 as unknown as { autoPlay: boolean }).autoPlay).toBe(true);
  });

  it("upgrades autoPlayInterval property set before connectedCallback", () => {
    document.body.innerHTML = "";
    const el2 = document.createElement("ui-carousel");
    (el2 as unknown as { autoPlayInterval: number }).autoPlayInterval = 2000;
    document.body.appendChild(el2);
    expect(
      (el2 as unknown as { autoPlayInterval: number }).autoPlayInterval,
    ).toBe(2000);
  });

  it("upgrades hideArrows property set before connectedCallback", () => {
    document.body.innerHTML = "";
    const el2 = document.createElement("ui-carousel");
    (el2 as unknown as { hideArrows: boolean }).hideArrows = true;
    document.body.appendChild(el2);
    expect((el2 as unknown as { hideArrows: boolean }).hideArrows).toBe(true);
  });

  it("upgrades hideIndicators property set before connectedCallback", () => {
    document.body.innerHTML = "";
    const el2 = document.createElement("ui-carousel");
    (el2 as unknown as { hideIndicators: boolean }).hideIndicators = true;
    document.body.appendChild(el2);
    expect(
      (el2 as unknown as { hideIndicators: boolean }).hideIndicators,
    ).toBe(true);
  });

  // ── Actions visibility ────────────────────────────────────────────────────

  it("hides arrow-group when hideArrows is true", () => {
    (el as unknown as { hideArrows: boolean }).hideArrows = true;
    const arrowGroup = el.shadowRoot!.querySelector(
      ".arrow-group",
    ) as HTMLElement;
    expect(arrowGroup.hidden).toBe(true);
  });

  it("shows arrow-group when hideArrows is false", () => {
    (el as unknown as { hideArrows: boolean }).hideArrows = true;
    (el as unknown as { hideArrows: boolean }).hideArrows = false;
    const arrowGroup = el.shadowRoot!.querySelector(
      ".arrow-group",
    ) as HTMLElement;
    expect(arrowGroup.hidden).toBe(false);
  });

  it("hides indicators when hideIndicators is true", () => {
    (el as unknown as { hideIndicators: boolean }).hideIndicators = true;
    const indicators = el.shadowRoot!.querySelector(
      ".indicators",
    ) as HTMLElement;
    expect(indicators.hidden).toBe(true);
  });

  it("shows indicators when hideIndicators is false", () => {
    (el as unknown as { hideIndicators: boolean }).hideIndicators = true;
    (el as unknown as { hideIndicators: boolean }).hideIndicators = false;
    const indicators = el.shadowRoot!.querySelector(
      ".indicators",
    ) as HTMLElement;
    expect(indicators.hidden).toBe(false);
  });

  it("hides both arrow-group and indicators when both hidden", () => {
    (el as unknown as { hideArrows: boolean }).hideArrows = true;
    (el as unknown as { hideIndicators: boolean }).hideIndicators = true;
    const arrows = el.shadowRoot!.querySelector(".arrow-group") as HTMLElement;
    const indicators = el.shadowRoot!.querySelector(".indicators") as HTMLElement;
    expect(arrows.hidden).toBe(true);
    expect(indicators.hidden).toBe(true);
  });

  it("hides only arrows when hideArrows is true", () => {
    (el as unknown as { hideArrows: boolean }).hideArrows = true;
    (el as unknown as { hideIndicators: boolean }).hideIndicators = false;
    const arrows = el.shadowRoot!.querySelector(".arrow-group") as HTMLElement;
    const indicators = el.shadowRoot!.querySelector(".indicators") as HTMLElement;
    expect(arrows.hidden).toBe(true);
    expect(indicators.hidden).toBe(false);
  });

  it("hides only indicators when hideIndicators is true", () => {
    (el as unknown as { hideArrows: boolean }).hideArrows = false;
    (el as unknown as { hideIndicators: boolean }).hideIndicators = true;
    const arrows = el.shadowRoot!.querySelector(".arrow-group") as HTMLElement;
    const indicators = el.shadowRoot!.querySelector(".indicators") as HTMLElement;
    expect(arrows.hidden).toBe(false);
    expect(indicators.hidden).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ui-carousel-item
// ═══════════════════════════════════════════════════════════════════════════════

describe("ui-carousel-item", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-carousel-item");
    document.body.appendChild(el);
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-carousel-item")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it("sets role='group' on connected", () => {
    expect(el.getAttribute("role")).toBe("group");
  });

  it("sets aria-roledescription='slide' on connected", () => {
    expect(el.getAttribute("aria-roledescription")).toBe("slide");
  });

  it("does not override existing role", () => {
    document.body.innerHTML = "";
    const el2 = document.createElement("ui-carousel-item");
    el2.setAttribute("role", "listitem");
    document.body.appendChild(el2);
    expect(el2.getAttribute("role")).toBe("listitem");
  });

  it("does not override existing aria-roledescription", () => {
    document.body.innerHTML = "";
    const el2 = document.createElement("ui-carousel-item");
    el2.setAttribute("aria-roledescription", "card");
    document.body.appendChild(el2);
    expect(el2.getAttribute("aria-roledescription")).toBe("card");
  });

  // ── Shadow DOM structure ──────────────────────────────────────────────────

  it("has a slot element", () => {
    expect(el.shadowRoot!.querySelector("slot")).toBeTruthy();
  });

  // ── Slot content rendering ────────────────────────────────────────────────

  it("renders slotted text content", () => {
    document.body.innerHTML = "";
    const item = document.createElement("ui-carousel-item");
    item.textContent = "Slide content";
    document.body.appendChild(item);
    expect(item.textContent).toBe("Slide content");
  });

  it("renders slotted HTML content", () => {
    document.body.innerHTML = "";
    const item = document.createElement("ui-carousel-item");
    const img = document.createElement("img");
    img.src = "test.jpg";
    item.appendChild(img);
    document.body.appendChild(item);
    expect(item.querySelector("img")).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Composition
// ═══════════════════════════════════════════════════════════════════════════════

describe("Composition", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  function buildCarousel(count = 3): HTMLElement {
    const carousel = document.createElement("ui-carousel");
    for (let i = 0; i < count; i++) {
      const item = document.createElement("ui-carousel-item");
      item.textContent = `Slide ${i + 1}`;
      carousel.appendChild(item);
    }
    return carousel;
  }

  it("renders carousel with 3 items", () => {
    const carousel = buildCarousel(3);
    document.body.appendChild(carousel);
    const items = carousel.querySelectorAll("ui-carousel-item");
    expect(items.length).toBe(3);
  });

  it("creates 3 dot indicators for 3 items", async () => {
    const carousel = buildCarousel(3);
    document.body.appendChild(carousel);
    await tick();
    const dots = carousel.shadowRoot!.querySelectorAll(".dot");
    expect(dots.length).toBe(3);
  });

  it("creates 5 dot indicators for 5 items", async () => {
    const carousel = buildCarousel(5);
    document.body.appendChild(carousel);
    await tick();
    const dots = carousel.shadowRoot!.querySelectorAll(".dot");
    expect(dots.length).toBe(5);
  });

  it("creates 0 dot indicators for 0 items", async () => {
    const carousel = buildCarousel(0);
    document.body.appendChild(carousel);
    await tick();
    const dots = carousel.shadowRoot!.querySelectorAll(".dot");
    expect(dots.length).toBe(0);
  });

  it("dot indicators have type='button'", async () => {
    const carousel = buildCarousel(3);
    document.body.appendChild(carousel);
    await tick();
    const dots = carousel.shadowRoot!.querySelectorAll(".dot");
    for (const dot of dots) {
      expect(dot.getAttribute("type")).toBe("button");
    }
  });

  it("dot indicators have aria-label with slide number", async () => {
    const carousel = buildCarousel(3);
    document.body.appendChild(carousel);
    await tick();
    const dots = carousel.shadowRoot!.querySelectorAll(".dot");
    expect(dots[0].getAttribute("aria-label")).toBe("Go to slide 1");
    expect(dots[1].getAttribute("aria-label")).toBe("Go to slide 2");
    expect(dots[2].getAttribute("aria-label")).toBe("Go to slide 3");
  });

  it("first dot is selected by default", async () => {
    const carousel = buildCarousel(3);
    document.body.appendChild(carousel);
    await tick();
    const dots = carousel.shadowRoot!.querySelectorAll(".dot");
    expect(dots[0].getAttribute("aria-selected")).toBe("true");
    expect(dots[1].getAttribute("aria-selected")).toBe("false");
    expect(dots[2].getAttribute("aria-selected")).toBe("false");
  });

  it("arrow buttons have correct aria-labels", () => {
    const carousel = buildCarousel(3);
    document.body.appendChild(carousel);
    const prevBtn = carousel.shadowRoot!.querySelector(
      '.arrow-btn[aria-label="Previous slide"]',
    );
    const nextBtn = carousel.shadowRoot!.querySelector(
      '.arrow-btn[aria-label="Next slide"]',
    );
    expect(prevBtn).toBeTruthy();
    expect(nextBtn).toBeTruthy();
  });

  it("hide-arrows hides arrow buttons", () => {
    const carousel = buildCarousel(3);
    (carousel as unknown as { hideArrows: boolean }).hideArrows = true;
    document.body.appendChild(carousel);
    const arrowGroup = carousel.shadowRoot!.querySelector(
      ".arrow-group",
    ) as HTMLElement;
    expect(arrowGroup.hidden).toBe(true);
  });

  it("hide-indicators hides dot indicators", () => {
    const carousel = buildCarousel(3);
    (carousel as unknown as { hideIndicators: boolean }).hideIndicators = true;
    document.body.appendChild(carousel);
    const indicators = carousel.shadowRoot!.querySelector(
      ".indicators",
    ) as HTMLElement;
    expect(indicators.hidden).toBe(true);
  });

  it("carousel items have role='group'", () => {
    const carousel = buildCarousel(3);
    document.body.appendChild(carousel);
    const items = carousel.querySelectorAll("ui-carousel-item");
    for (const item of items) {
      expect(item.getAttribute("role")).toBe("group");
    }
  });

  it("carousel items have aria-roledescription='slide'", () => {
    const carousel = buildCarousel(3);
    document.body.appendChild(carousel);
    const items = carousel.querySelectorAll("ui-carousel-item");
    for (const item of items) {
      expect(item.getAttribute("aria-roledescription")).toBe("slide");
    }
  });

  it("carousel has role='region'", () => {
    const carousel = buildCarousel(3);
    document.body.appendChild(carousel);
    expect(carousel.getAttribute("role")).toBe("region");
  });

  it("carousel has aria-roledescription='carousel'", () => {
    const carousel = buildCarousel(3);
    document.body.appendChild(carousel);
    expect(carousel.getAttribute("aria-roledescription")).toBe("carousel");
  });

  it("carousel aria-label passes through in composition", () => {
    const carousel = buildCarousel(3);
    carousel.setAttribute("aria-label", "Featured products");
    document.body.appendChild(carousel);
    expect(carousel.getAttribute("aria-label")).toBe("Featured products");
  });

  it("gap applies to track in composition", () => {
    const carousel = buildCarousel(3);
    (carousel as unknown as { gap: number }).gap = 32;
    document.body.appendChild(carousel);
    const track = carousel.shadowRoot!.querySelector(".track") as HTMLElement;
    expect(track.style.gap).toBe("32px");
  });

  it("loop property reflects in composition", () => {
    const carousel = buildCarousel(3);
    (carousel as unknown as { loop: boolean }).loop = true;
    document.body.appendChild(carousel);
    expect(carousel.hasAttribute("loop")).toBe(true);
  });

  it("hide-arrows via attribute hides arrow group", () => {
    const carousel = buildCarousel(3);
    carousel.setAttribute("hide-arrows", "");
    document.body.appendChild(carousel);
    const arrowGroup = carousel.shadowRoot!.querySelector(
      ".arrow-group",
    ) as HTMLElement;
    expect(arrowGroup.hidden).toBe(true);
  });

  it("hide-indicators via attribute hides indicators", () => {
    const carousel = buildCarousel(3);
    carousel.setAttribute("hide-indicators", "");
    document.body.appendChild(carousel);
    const indicators = carousel.shadowRoot!.querySelector(
      ".indicators",
    ) as HTMLElement;
    expect(indicators.hidden).toBe(true);
  });

  it("both hide-arrows and hide-indicators hides both elements", () => {
    const carousel = buildCarousel(3);
    (carousel as unknown as { hideArrows: boolean }).hideArrows = true;
    (carousel as unknown as { hideIndicators: boolean }).hideIndicators = true;
    document.body.appendChild(carousel);
    const arrows = carousel.shadowRoot!.querySelector(".arrow-group") as HTMLElement;
    const indicators = carousel.shadowRoot!.querySelector(".indicators") as HTMLElement;
    expect(arrows.hidden).toBe(true);
    expect(indicators.hidden).toBe(true);
  });

  it("toggling hideArrows off and on reflects correctly", () => {
    const carousel = buildCarousel(3);
    document.body.appendChild(carousel);
    (carousel as unknown as { hideArrows: boolean }).hideArrows = true;
    const arrowGroup = carousel.shadowRoot!.querySelector(
      ".arrow-group",
    ) as HTMLElement;
    expect(arrowGroup.hidden).toBe(true);
    (carousel as unknown as { hideArrows: boolean }).hideArrows = false;
    expect(arrowGroup.hidden).toBe(false);
  });

  it("toggling hideIndicators off and on reflects correctly", () => {
    const carousel = buildCarousel(3);
    document.body.appendChild(carousel);
    (carousel as unknown as { hideIndicators: boolean }).hideIndicators = true;
    const indicators = carousel.shadowRoot!.querySelector(
      ".indicators",
    ) as HTMLElement;
    expect(indicators.hidden).toBe(true);
    (carousel as unknown as { hideIndicators: boolean }).hideIndicators = false;
    expect(indicators.hidden).toBe(false);
  });
});
