import { STYLES } from "./ui-side-panel.styles.js";
import { ICON_KEYBOARD_DOUBLE_ARROW_LEFT, ICON_KEYBOARD_DOUBLE_ARROW_RIGHT } from "@maneki/foundation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SidePanelState = "expanded" | "collapsed";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

const MOBILE_QUERY = "(max-width: 767px)";

export class UiSidePanel extends HTMLElement {
  static readonly observedAttributes = ["state", "overlay", "mobile", "title", "no-collapse"];

  #header!: HTMLElement;
  #titleEl!: HTMLElement;
  #toggleBtn!: HTMLButtonElement;
  #toggleIcon!: HTMLElement;
  #body!: HTMLElement;
  #mql: MediaQueryList | null = null;
  #mqlHandler: ((e: MediaQueryListEvent) => void) | null = null;
  #userExplicitState = false;
  #mobileTrigger!: HTMLButtonElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const container = document.createElement("div");
    container.className = "container";

    // Header
    this.#header = document.createElement("div");
    this.#header.className = "header";

    this.#titleEl = document.createElement("span");
    this.#titleEl.className = "header-title";

    this.#toggleBtn = document.createElement("button");
    this.#toggleBtn.className = "header-toggle";
    this.#toggleBtn.type = "button";
    this.#toggleBtn.setAttribute("aria-label", "Toggle panel");

    this.#toggleIcon = document.createElement("span");
    this.#toggleIcon.className = "material-symbols-outlined";
    this.#toggleIcon.textContent = ICON_KEYBOARD_DOUBLE_ARROW_LEFT;
    this.#toggleBtn.appendChild(this.#toggleIcon);

    this.#header.append(this.#titleEl, this.#toggleBtn);

    // Separator
    const separator = document.createElement("div");
    separator.className = "separator";

    // Body (generic slot)
    this.#body = document.createElement("div");
    this.#body.className = "body";
    const slot = document.createElement("slot");
    this.#body.appendChild(slot);

    // Footer (named slot)
    const footer = document.createElement("div");
    footer.className = "footer";
    const footerSlot = document.createElement("slot");
    footerSlot.name = "footer";
    footer.appendChild(footerSlot);

    container.append(this.#header, separator, this.#body, footer);

    // Mobile floating trigger (outside container, shown only when mobile+collapsed)
    this.#mobileTrigger = document.createElement("button");
    this.#mobileTrigger.className = "mobile-trigger";
    this.#mobileTrigger.type = "button";
    this.#mobileTrigger.setAttribute("aria-label", "Open navigation");
    const triggerIcon = document.createElement("span");
    triggerIcon.className = "material-symbols-outlined";
    triggerIcon.textContent = "menu";
    this.#mobileTrigger.appendChild(triggerIcon);

    shadow.append(container, this.#mobileTrigger);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("state")) this.setAttribute("state", "expanded");
    if (this.hasAttribute("no-collapse")) this.#toggleBtn.style.display = "none";
    if (!this.hasAttribute("state")) this.setAttribute("state", "expanded");

    this.#toggleBtn.addEventListener("click", () => this.toggle());
    this.#mobileTrigger.addEventListener("click", () => this.toggle());
    this._syncToggleIcon();
    this._syncTitle();
    this._setupMobileDetection();
  }

  disconnectedCallback(): void {
    this._teardownMobileDetection();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    switch (name) {
      case "state":
        this._syncToggleIcon();
        break;
      case "title":
        this._syncTitle();
        break;
      case "no-collapse":
        // no-collapse only hides desktop toggle; CSS handles via :host([no-collapse]:not([mobile]))
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get state(): SidePanelState {
    return (this.getAttribute("state") as SidePanelState) ?? "expanded";
  }
  set state(v: SidePanelState) {
    this.setAttribute("state", v);
  }

  get overlay(): boolean {
    return this.hasAttribute("overlay");
  }
  set overlay(v: boolean) {
    if (v) this.setAttribute("overlay", "");
    else this.removeAttribute("overlay");
  }

  get mobile(): boolean {
    return this.hasAttribute("mobile");
  }

  get panelTitle(): string {
    return this.getAttribute("title") ?? "";
  }
  set panelTitle(v: string) {
    this.setAttribute("title", v);
  }

  // ── Public API ──────────────────────────────────────────────────────────

  toggle(): void {
    this.#userExplicitState = true;
    const next = this.state === "expanded" ? "collapsed" : "expanded";
    this.setAttribute("state", next);

    // On mobile, toggle overlay when expanding
    if (this.hasAttribute("mobile")) {
      if (next === "expanded") this.setAttribute("overlay", "");
      else this.removeAttribute("overlay");
    }

    this.dispatchEvent(
      new CustomEvent("toggle", {
        detail: { state: next },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncToggleIcon(): void {
    const isCollapsed = this.getAttribute("state") === "collapsed";
    this.#toggleIcon.textContent = isCollapsed ? ICON_KEYBOARD_DOUBLE_ARROW_RIGHT : ICON_KEYBOARD_DOUBLE_ARROW_LEFT;
    this.#toggleBtn.setAttribute(
      "aria-label",
      isCollapsed ? "Expand panel" : "Collapse panel",
    );
  }

  private _syncTitle(): void {
    this.#titleEl.textContent = this.getAttribute("title") ?? "";
  }

  private _setupMobileDetection(): void {
    if (typeof window.matchMedia !== "function") return;
    this.#mql = window.matchMedia(MOBILE_QUERY);
    this.#mqlHandler = (e: MediaQueryListEvent) => this._syncMobileState(e.matches);
    this.#mql.addEventListener("change", this.#mqlHandler);
    this._syncMobileState(this.#mql.matches);
  }

  private _teardownMobileDetection(): void {
    if (this.#mql && this.#mqlHandler) {
      this.#mql.removeEventListener("change", this.#mqlHandler);
    }
    this.#mql = null;
    this.#mqlHandler = null;
  }

  private _syncMobileState(isMobile: boolean): void {
    // Reset explicit state on mobile/desktop transition so defaults apply
    this.#userExplicitState = false;
    if (isMobile) {
      this.setAttribute("mobile", "");
      this.setAttribute("state", "collapsed");
    } else {
      this.removeAttribute("mobile");
      this.removeAttribute("overlay");
      this.setAttribute("state", "expanded");
    }
    this.dispatchEvent(
      new CustomEvent("mobilechange", {
        detail: { mobile: isMobile, state: this.state },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define("ui-side-panel", UiSidePanel);
