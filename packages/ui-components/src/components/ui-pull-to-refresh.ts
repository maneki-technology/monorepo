import { STYLES } from "./ui-pull-to-refresh.styles.js";
import { ICON_PROGRESS_ACTIVITY } from "@maneki/foundation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PullToRefreshVariant = "light" | "dark";
export type PullToRefreshSize = "s" | "m" | "l";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiPullToRefresh extends HTMLElement {
  static readonly observedAttributes = ["active", "variant", "text", "size"];

  #spinner!: HTMLElement;
  #textEl!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const loadingInfo = document.createElement("div");
    loadingInfo.className = "loading-info";

    // Spinner
    this.#spinner = document.createElement("span");
    this.#spinner.className = "spinner";
    const icon = document.createElement("span");
    icon.className = "material-symbols-outlined";
    icon.textContent = ICON_PROGRESS_ACTIVITY;
    this.#spinner.appendChild(icon);

    // Text
    this.#textEl = document.createElement("span");
    this.#textEl.className = "text";
    this.#textEl.textContent = "Refreshing content";

    loadingInfo.append(this.#spinner, this.#textEl);
    shadow.appendChild(loadingInfo);
  }

  connectedCallback(): void {
    this.setAttribute("role", "status");
    this.setAttribute("aria-live", "polite");
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    switch (name) {
      case "text":
        this.#textEl.textContent = newValue ?? "Refreshing content";
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get active(): boolean {
    return this.hasAttribute("active");
  }
  set active(v: boolean) {
    if (v) this.setAttribute("active", "");
    else this.removeAttribute("active");
  }

  get variant(): PullToRefreshVariant {
    return (this.getAttribute("variant") as PullToRefreshVariant) ?? "light";
  }
  set variant(v: PullToRefreshVariant) {
    this.setAttribute("variant", v);
  }

  get text(): string {
    return this.getAttribute("text") ?? "Refreshing content";
  }
  set text(v: string) {
    this.setAttribute("text", v);
  }

  get size(): PullToRefreshSize {
    return (this.getAttribute("size") as PullToRefreshSize) ?? "m";
  }
  set size(v: PullToRefreshSize) {
    this.setAttribute("size", v);
  }
}

customElements.define("ui-pull-to-refresh", UiPullToRefresh);
