import { semanticVar } from "@maneki/foundation";
import "./ui-icon.js";

// ─── Token constants ─────────────────────────────────────────────────────────

const ICON_PRIMARY = semanticVar("icon", "primary");
const ICON_SECONDARY = semanticVar("icon", "secondary");
const SELECTED_BOLD = semanticVar("stateSelected", "surfaceBold");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    position: relative;
  }

  /* ── Arrow group: top right ──────────────────────────────────────────── */

  .arrow-group {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 8px;
  }
  .arrow-group[hidden] {
    display: none;
  }

  .arrow-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: ${ICON_PRIMARY};
    --ui-icon-size: 20px;
  }

  .arrow-btn:disabled {
    color: ${ICON_SECONDARY};
    cursor: default;
  }

  /* ── Track ──────────────────────────────────────────────────────────── */

  .track {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .track::-webkit-scrollbar {
    display: none;
  }

  /* ── Indicators: centered below track ────────────────────────────────── */

  .indicators {
    display: flex;
    justify-content: center;
    gap: 8px;
    align-items: center;
    margin-top: 16px;
  }
  .indicators[hidden] {
    display: none;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    padding: 0;
    cursor: pointer;
    background: ${ICON_SECONDARY};
    transition: background 0.2s ease;
  }

  .dot[aria-selected="true"] {
    background: ${SELECTED_BOLD};
  }
  @media (prefers-reduced-motion: reduce) {
    .track {
      scroll-behavior: auto;
    }
    .dot {
      transition: none;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiCarousel extends HTMLElement {
  static readonly observedAttributes = [
    "gap",
    "loop",
    "auto-play",
    "auto-play-interval",
    "hide-arrows",
    "hide-indicators",
    "aria-label",
  ];

  #track: HTMLDivElement;
  #actionsBar: HTMLDivElement;
  #indicators: HTMLDivElement;
  #arrowGroup: HTMLDivElement;
  #prevBtn: HTMLButtonElement;
  #nextBtn: HTMLButtonElement;
  #defaultSlot: HTMLSlotElement;
  #observer: IntersectionObserver | null = null;
  #autoPlayTimer: number | null = null;
  #activeIndex = 0;
  #pausedByInteraction = false;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Header slot
    const headerSlot = document.createElement("slot");
    headerSlot.name = "header";

    // Actions bar
    const actionsBar = document.createElement("div");
    actionsBar.className = "actions";
    this.#actionsBar = actionsBar;

    // Dot indicators container
    const indicators = document.createElement("div");
    indicators.className = "indicators";
    this.#indicators = indicators;

    // Arrow group
    const arrowGroup = document.createElement("div");
    arrowGroup.className = "arrow-group";
    this.#arrowGroup = arrowGroup;

    // Prev button
    const prevBtn = document.createElement("button");
    prevBtn.className = "arrow-btn";
    prevBtn.setAttribute("aria-label", "Previous slide");
    prevBtn.type = "button";
    const prevIcon = document.createElement("ui-icon");
    prevIcon.setAttribute("name", "arrow_back_ios");
    prevBtn.appendChild(prevIcon);
    this.#prevBtn = prevBtn;

    // Next button
    const nextBtn = document.createElement("button");
    nextBtn.className = "arrow-btn";
    nextBtn.setAttribute("aria-label", "Next slide");
    nextBtn.type = "button";
    const nextIcon = document.createElement("ui-icon");
    nextIcon.setAttribute("name", "arrow_forward_ios");
    nextBtn.appendChild(nextIcon);
    this.#nextBtn = nextBtn;

    arrowGroup.appendChild(prevBtn);
    arrowGroup.appendChild(nextBtn);

    actionsBar.appendChild(indicators);
    actionsBar.appendChild(arrowGroup);

    // Track
    const track = document.createElement("div");
    track.className = "track";
    this.#track = track;

    const defaultSlot = document.createElement("slot");
    this.#defaultSlot = defaultSlot;
    track.appendChild(defaultSlot);

    shadow.appendChild(headerSlot);
    shadow.appendChild(arrowGroup);
    shadow.appendChild(track);
    shadow.appendChild(indicators);

    // Event listeners
    prevBtn.addEventListener("click", this.#onPrevClick);
    nextBtn.addEventListener("click", this.#onNextClick);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "region");
    }
    if (!this.hasAttribute("aria-roledescription")) {
      this.setAttribute("aria-roledescription", "carousel");
    }

    this._upgradeProperty("gap");
    this._upgradeProperty("loop");
    this._upgradeProperty("autoPlay");
    this._upgradeProperty("autoPlayInterval");
    this._upgradeProperty("hideArrows");
    this._upgradeProperty("hideIndicators");

    this.#applyGap();
    this.#updateActionsVisibility();

    this.#defaultSlot.addEventListener("slotchange", this.#onSlotChange);
    this.addEventListener("mouseenter", this.#onPauseAutoPlay);
    this.addEventListener("mouseleave", this.#onResumeAutoPlay);
    this.addEventListener("focusin", this.#onPauseAutoPlay);
    this.addEventListener("focusout", this.#onResumeAutoPlay);

    // Set up observer and dots for any items already slotted
    this.#setupObserver();
    this.#buildDots();
    this.#updateArrowStates();
    this.#startAutoPlay();
  }

  disconnectedCallback(): void {
    this.#destroyObserver();
    this.#stopAutoPlay();
    this.#defaultSlot.removeEventListener("slotchange", this.#onSlotChange);
    this.removeEventListener("mouseenter", this.#onPauseAutoPlay);
    this.removeEventListener("mouseleave", this.#onResumeAutoPlay);
    this.removeEventListener("focusin", this.#onPauseAutoPlay);
    this.removeEventListener("focusout", this.#onResumeAutoPlay);
  }

  attributeChangedCallback(
    attrName: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    switch (attrName) {
      case "gap":
        this.#applyGap();
        break;
      case "loop":
        this.#updateArrowStates();
        break;
      case "auto-play":
      case "auto-play-interval":
        this.#stopAutoPlay();
        this.#startAutoPlay();
        break;
      case "hide-arrows":
      case "hide-indicators":
        this.#updateActionsVisibility();
        break;
    }
  }

  private _upgradeProperty(prop: string): void {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const value = (this as Record<string, unknown>)[prop];
      delete (this as Record<string, unknown>)[prop];
      (this as Record<string, unknown>)[prop] = value;
    }
  }

  // ── Slot change ──────────────────────────────────────────────────────────

  #onSlotChange = (): void => {
    this.#destroyObserver();
    this.#setupObserver();
    this.#buildDots();
    this.#updateArrowStates();
  };

  // ── Items helper ─────────────────────────────────────────────────────────

  #getItems(): Element[] {
    return this.#defaultSlot
      .assignedElements()
      .filter((el) => el.tagName === "UI-CAROUSEL-ITEM");
  }

  // ── Gap ──────────────────────────────────────────────────────────────────

  #applyGap(): void {
    const gap = this.gap;
    this.#track.style.gap = `${gap}px`;
  }

  // ── Actions visibility ───────────────────────────────────────────────────

  #updateActionsVisibility(): void {
    this.#arrowGroup.hidden = this.hideArrows;
    this.#indicators.hidden = this.hideIndicators;
  }

  // ── IntersectionObserver ─────────────────────────────────────────────────

  #setupObserver(): void {
    // Use scroll event to determine active slide based on scroll position
    this.#track.addEventListener("scroll", this.#onTrackScroll, { passive: true });
    // Set initial active index
    this.#computeActiveFromScroll();
  }

  #destroyObserver(): void {
    this.#track.removeEventListener("scroll", this.#onTrackScroll);
  }

  // ── Dot indicators ───────────────────────────────────────────────────────

  #isProgrammaticScroll = false;
  #programmaticScrollTimer: ReturnType<typeof setTimeout> | null = null;

  #onTrackScroll = (): void => {
    if (!this.#isProgrammaticScroll) {
      this.#computeActiveFromScroll();
    }
    this.#updateArrowStates();
  };

  #computeActiveFromScroll(): void {
    const items = this.#getItems();
    if (items.length === 0) return;

    const trackLeft = this.#track.getBoundingClientRect().left;
    let closestIdx = 0;
    let closestDist = Infinity;

    for (let i = 0; i < items.length; i++) {
      const itemLeft = items[i].getBoundingClientRect().left;
      const dist = Math.abs(itemLeft - trackLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    if (this.#activeIndex !== closestIdx) {
      this.#activeIndex = closestIdx;
      this.#syncDots();
    }
  }
  #buildDots(): void {
    // Clear existing dots
    while (this.#indicators.firstChild) {
      this.#indicators.removeChild(this.#indicators.firstChild);
    }

    const items = this.#getItems();
    for (let i = 0; i < items.length; i++) {
      const dot = document.createElement("button");
      dot.className = "dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.setAttribute(
        "aria-selected",
        i === this.#activeIndex ? "true" : "false",
      );
      dot.addEventListener("click", () => this.#goToSlide(i));
      this.#indicators.appendChild(dot);
    }
  }

  #syncDots(): void {
    const dots = this.#indicators.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].setAttribute(
        "aria-selected",
        i === this.#activeIndex ? "true" : "false",
      );
    }
  }

  // ── Arrow states ─────────────────────────────────────────────────────────

  #updateArrowStates(): void {
    const items = this.#getItems();
    if (items.length === 0) {
      this.#prevBtn.disabled = true;
      this.#nextBtn.disabled = true;
      return;
    }
    if (this.loop) {
      this.#prevBtn.disabled = false;
      this.#nextBtn.disabled = false;
    } else {
      this.#prevBtn.disabled = this.#activeIndex <= 0;
      this.#nextBtn.disabled = this.#activeIndex >= items.length - 1;
    }
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  #goToSlide(index: number): void {
    const items = this.#getItems();
    if (items.length === 0) return;
    let target = index;
    if (this.loop) {
      target = ((index % items.length) + items.length) % items.length;
    } else {
      target = Math.max(0, Math.min(index, items.length - 1));
    }
    const gap = this.gap;
    let scrollLeft = 0;
    for (let i = 0; i < target; i++) {
      scrollLeft += (items[i] as HTMLElement).offsetWidth + gap;
    }
    const max = this.#track.scrollWidth - this.#track.clientWidth;
    scrollLeft = Math.min(scrollLeft, max);

    // Flag programmatic scroll so scroll handler doesn't override activeIndex
    this.#isProgrammaticScroll = true;
    if (this.#programmaticScrollTimer) {
      clearTimeout(this.#programmaticScrollTimer);
    }
    this.#track.scrollTo({ left: scrollLeft, behavior: "smooth" });
    // Release flag after scroll animation completes (~500ms)
    this.#programmaticScrollTimer = setTimeout(() => {
      this.#isProgrammaticScroll = false;
    }, 500);

    // Update activeIndex immediately (intent-based tracking)
    this.#activeIndex = target;
    this.#syncDots();
    this.#updateArrowStates();
  }

  #onPrevClick = (): void => {
    this.#goToSlide(this.#activeIndex - 1);
  };

  #onNextClick = (): void => {
    this.#goToSlide(this.#activeIndex + 1);
  };

  // ── Auto-play ────────────────────────────────────────────────────────────

  #startAutoPlay(): void {
    if (!this.autoPlay) return;
    this.#stopAutoPlay();
    this.#autoPlayTimer = window.setInterval(() => {
      if (!this.#pausedByInteraction) {
        this.#onNextClick();
      }
    }, this.autoPlayInterval);
  }

  #stopAutoPlay(): void {
    if (this.#autoPlayTimer !== null) {
      clearInterval(this.#autoPlayTimer);
      this.#autoPlayTimer = null;
    }
  }

  #onPauseAutoPlay = (): void => {
    this.#pausedByInteraction = true;
  };

  #onResumeAutoPlay = (): void => {
    this.#pausedByInteraction = false;
  };

  // ── Property accessors ─────────────────────────────────────────────────

  get gap(): number {
    const val = this.getAttribute("gap");
    return val !== null ? Number(val) : 16;
  }

  set gap(value: number) {
    this.setAttribute("gap", String(value));
  }

  get loop(): boolean {
    return this.hasAttribute("loop");
  }

  set loop(value: boolean) {
    if (value) {
      this.setAttribute("loop", "");
    } else {
      this.removeAttribute("loop");
    }
  }

  get autoPlay(): boolean {
    return this.hasAttribute("auto-play");
  }

  set autoPlay(value: boolean) {
    if (value) {
      this.setAttribute("auto-play", "");
    } else {
      this.removeAttribute("auto-play");
    }
  }

  get autoPlayInterval(): number {
    const val = this.getAttribute("auto-play-interval");
    return val !== null ? Number(val) : 5000;
  }

  set autoPlayInterval(value: number) {
    this.setAttribute("auto-play-interval", String(value));
  }

  get hideArrows(): boolean {
    return this.hasAttribute("hide-arrows");
  }

  set hideArrows(value: boolean) {
    if (value) {
      this.setAttribute("hide-arrows", "");
    } else {
      this.removeAttribute("hide-arrows");
    }
  }

  get hideIndicators(): boolean {
    return this.hasAttribute("hide-indicators");
  }

  set hideIndicators(value: boolean) {
    if (value) {
      this.setAttribute("hide-indicators", "");
    } else {
      this.removeAttribute("hide-indicators");
    }
  }
}

customElements.define("ui-carousel", UiCarousel);
