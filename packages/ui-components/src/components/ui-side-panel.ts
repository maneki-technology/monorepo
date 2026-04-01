import { STYLES } from "./ui-side-panel.styles.js";
import { ICON_KEYBOARD_DOUBLE_ARROW_LEFT, ICON_KEYBOARD_DOUBLE_ARROW_RIGHT, ICON_MENU } from "@maneki/foundation";
import "./ui-scrollbar.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SidePanelState = "expanded" | "collapsed";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

const MOBILE_QUERY = "(max-width: 767px)";

export class UiSidePanel extends HTMLElement {
  static readonly observedAttributes = ["state", "overlay", "mobile", "no-collapse", "scrollbar-emphasis", "position", "open", "dismissible"];

  #header!: HTMLElement;
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


    this.#toggleBtn = document.createElement("button");
    this.#toggleBtn.className = "header-toggle";
    this.#toggleBtn.type = "button";
    this.#toggleBtn.setAttribute("aria-label", "Toggle panel");

    this.#toggleIcon = document.createElement("span");
    this.#toggleIcon.className = "material-symbols-outlined";
    this.#toggleIcon.textContent = ICON_KEYBOARD_DOUBLE_ARROW_LEFT;
    this.#toggleBtn.appendChild(this.#toggleIcon);

    // Header slot (optional extra content between title and toggle)
    const headerSlot = document.createElement("slot");
    headerSlot.name = "header";

    this.#header.append(headerSlot, this.#toggleBtn);

    // Separator
    const separator = document.createElement("div");
    separator.className = "separator";

    // Body (wrapped in ui-scrollbar)
    this.#body = document.createElement("ui-scrollbar");
    this.#body.className = "body";
    this.#body.setAttribute("emphasis", "minimal");
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
    triggerIcon.textContent = ICON_MENU;
    this.#mobileTrigger.appendChild(triggerIcon);
    this.#mobileTrigger.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

    shadow.append(container, this.#mobileTrigger);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("state")) this.setAttribute("state", "expanded");
    if (this.hasAttribute("no-collapse")) this.#toggleBtn.style.display = "none";

    this.#toggleBtn.addEventListener("click", () => this.toggle());
    this.#mobileTrigger.addEventListener("click", () => this.toggle());
    this._syncToggleIcon();
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
      case "no-collapse":
        break;
      case "scrollbar-emphasis":
        this.#body.setAttribute("emphasis", newValue ?? "minimal");
        break;
      case "open":
        if (newValue !== null) {
          this._onOpen();
        } else {
          this._onClose();
        }
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

  get position(): "left" | "right" {
    return (this.getAttribute("position") as "left" | "right") ?? "left";
  }
  set position(v: "left" | "right") {
    this.setAttribute("position", v);
  }

  get mobile(): boolean {
    return this.hasAttribute("mobile");
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

  show(): void {
    // 1. Make visible off-screen
    this.classList.add("panel-visible");
    // 2. Force reflow so browser registers off-screen position
    this.offsetHeight;
    // 3. Set open — triggers transform transition
    this.setAttribute("open", "");
  }

  hide(): void {
    this.removeAttribute("open");
  }

  // ── Private ───────────────────────────────────────────────────────────────────────

  #outsideClickHandler: ((e: MouseEvent) => void) | null = null;

  private _onOpen(): void {
    // Outside click handler (delayed to avoid catching the opening click)
    setTimeout(() => {
      this.#outsideClickHandler = (e: MouseEvent) => {
        if (this.hasAttribute("dismissible") && !this.contains(e.target as Node)) {
          this.hide();
        }
      };
      document.addEventListener("click", this.#outsideClickHandler);
    }, 0);

    this.dispatchEvent(new CustomEvent("open", { bubbles: true, composed: true }));
  }

  private _onClose(): void {
    if (this.#outsideClickHandler) {
      document.removeEventListener("click", this.#outsideClickHandler);
      this.#outsideClickHandler = null;
    }

    // Wait for slide-out transition, then hide
    const onEnd = (): void => {
      this.removeEventListener("transitionend", onEnd);
      this.classList.remove("panel-visible");
    };
    this.addEventListener("transitionend", onEnd);
    setTimeout(() => this.classList.remove("panel-visible"), 250);

    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
  }

  private _syncToggleIcon(): void {
    const isCollapsed = this.getAttribute("state") === "collapsed";
    this.#toggleIcon.textContent = isCollapsed ? ICON_KEYBOARD_DOUBLE_ARROW_RIGHT : ICON_KEYBOARD_DOUBLE_ARROW_LEFT;
    this.#toggleBtn.setAttribute(
      "aria-label",
      isCollapsed ? "Expand panel" : "Collapse panel",
    );
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
