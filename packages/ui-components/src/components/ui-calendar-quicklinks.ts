import { STYLES } from "./ui-calendar-quicklinks.styles.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type QuicklinksSize = "s" | "m" | "l";
export type QuicklinksOrientation = "side" | "bottom";

export interface QuicklinkItem {
  label: string;
  value: string;
  /** If true, this is a section heading, not a clickable link. */
  section?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiCalendarQuicklinks extends HTMLElement {
  static readonly observedAttributes = ["size", "orientation"];

#items: QuicklinkItem[] = [];
#selectedValue: string | null = null;
  #menu!: HTMLElement;
  #fadeLeft!: HTMLElement;
  #fadeRight!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    this.#menu = document.createElement("div");
    this.#menu.className = "menu";
    this.#menu.setAttribute("role", "listbox");

    // Scroll fade overlays (bottom orientation)
    this.#fadeLeft = document.createElement("div");
    this.#fadeLeft.className = "fade fade-left";
    this.#fadeRight = document.createElement("div");
    this.#fadeRight.className = "fade fade-right";

    shadow.appendChild(this.#fadeLeft);
    shadow.appendChild(this.#menu);
    shadow.appendChild(this.#fadeRight);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) {
      this.setAttribute("size", "m");
    }
    if (!this.hasAttribute("orientation")) {
      this.setAttribute("orientation", "side");
    }
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "navigation");
    }

    this.#menu.addEventListener("click", this.#onClick);
    this.#menu.addEventListener("scroll", this.#onScroll, { passive: true });
    this.#render();
  }

  disconnectedCallback(): void {
    this.#menu.removeEventListener("click", this.#onClick);
    this.#menu.removeEventListener("scroll", this.#onScroll);
  }

  attributeChangedCallback(): void {
    if (!this.isConnected) return;
    this.#render();
  }

  // ─── Properties ────────────────────────────────────────────────────────

  get size(): QuicklinksSize {
    return (this.getAttribute("size") as QuicklinksSize) || "m";
  }

  set size(value: QuicklinksSize) {
    this.setAttribute("size", value);
  }

  get orientation(): QuicklinksOrientation {
    return (this.getAttribute("orientation") as QuicklinksOrientation) || "side";
  }

  set orientation(value: QuicklinksOrientation) {
    this.setAttribute("orientation", value);
  }

  get selectedValue(): string | null {
    return this.#selectedValue;
  }

  set selectedValue(value: string | null) {
    this.#selectedValue = value;
    this.#render();
  }

  // ─── Data API ──────────────────────────────────────────────────────────

  /** Set the quicklinks items. */
  setItems(items: QuicklinkItem[]): void {
    this.#items = items;
    this.#render();
  }

  /** Get the current items. */
  getItems(): QuicklinkItem[] {
    return [...this.#items];
  }

  // ─── Events ────────────────────────────────────────────────────────────

  #onClick = (e: Event): void => {
    const target = (e.target as HTMLElement).closest(".link") as HTMLElement | null;
    if (!target) return;
    const value = target.dataset.value;
    if (!value) return;

    this.#selectedValue = value;
    this.#render();

    this.dispatchEvent(
      new CustomEvent("quicklink-select", {
        detail: { value },
        bubbles: true,
      }),
    );
  };

  #onScroll = (): void => {
    this.#updateFades();
  };

  #updateFades(): void {
    if (this.orientation !== "bottom") {
      this.#fadeLeft.removeAttribute("data-visible");
      this.#fadeRight.removeAttribute("data-visible");
      return;
    }
    const el = this.#menu;
    const scrollLeft = el.scrollLeft;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (scrollLeft > 2) {
      this.#fadeLeft.setAttribute("data-visible", "");
    } else {
      this.#fadeLeft.removeAttribute("data-visible");
    }

    if (maxScroll - scrollLeft > 2) {
      this.#fadeRight.setAttribute("data-visible", "");
    } else {
      this.#fadeRight.removeAttribute("data-visible");
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────

  #render(): void {
    this.#menu.innerHTML = "";

    for (const item of this.#items) {
      if (item.section) {
        const section = document.createElement("div");
        section.className = "section";
        section.textContent = item.label;
        section.setAttribute("role", "presentation");
        this.#menu.appendChild(section);
      } else {
        const link = document.createElement("div");
        link.className = "link";
        link.textContent = item.label;
        link.dataset.value = item.value;
        link.setAttribute("role", "option");
        link.setAttribute("tabindex", "0");

        if (this.#selectedValue === item.value) {
          link.setAttribute("data-selected", "");
          link.setAttribute("aria-selected", "true");
        }

        this.#menu.appendChild(link);
      }
    }

    // Update fades after render
    requestAnimationFrame(() => this.#updateFades());
  }
}

customElements.define("ui-calendar-quicklinks", UiCalendarQuicklinks);
