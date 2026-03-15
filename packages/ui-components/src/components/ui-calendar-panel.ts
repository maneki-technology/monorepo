import { STYLES } from "./ui-calendar-panel.styles.js";
import "./ui-calendar.js";
import "./ui-calendar-quicklinks.js";
import "./ui-calendar-time.js";
import "./ui-button.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type CalendarPanelSize = "s" | "m" | "l";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiCalendarPanel extends HTMLElement {
  static readonly observedAttributes = ["size", "show-actions"];

  #cancelBtn!: HTMLButtonElement;
  #okBtn!: HTMLButtonElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Body: side slot + main column
    const body = document.createElement("div");
    body.className = "body";

    // Side slot (for quicklinks orientation="side")
    const sideSlot = document.createElement("slot");
    sideSlot.name = "side";
    body.appendChild(sideSlot);

    // Main column: default slot + bottom slot
    const main = document.createElement("div");
    main.className = "main";

    const defaultSlot = document.createElement("slot");
    main.appendChild(defaultSlot);

    const bottomSlot = document.createElement("slot");
    bottomSlot.name = "bottom";
    main.appendChild(bottomSlot);

    body.appendChild(main);
    shadow.appendChild(body);

    // Actions bar
    const actions = document.createElement("div");
    actions.className = "actions";

    this.#cancelBtn = document.createElement("button");
    this.#cancelBtn.className = "action-btn";
    this.#cancelBtn.type = "button";

    this.#okBtn = document.createElement("button");
    this.#okBtn.className = "action-btn";
    this.#okBtn.type = "button";

    // Use ui-button elements
    const cancelBtnEl = document.createElement("ui-button");
    cancelBtnEl.setAttribute("action", "secondary");
    cancelBtnEl.setAttribute("emphasis", "minimal");
    cancelBtnEl.setAttribute("size", "m");
    cancelBtnEl.textContent = "Cancel";

    const okBtnEl = document.createElement("ui-button");
    okBtnEl.setAttribute("action", "primary");
    okBtnEl.setAttribute("emphasis", "bold");
    okBtnEl.setAttribute("size", "m");
    okBtnEl.textContent = "OK";

    actions.append(cancelBtnEl, okBtnEl);
    shadow.appendChild(actions);

    // Events
    cancelBtnEl.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("cancel", { bubbles: true }));
    });
    okBtnEl.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("confirm", { bubbles: true }));
    });
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) {
      this.setAttribute("size", "m");
    }
    this.#propagateSize();
  }

  attributeChangedCallback(name: string): void {
    if (!this.isConnected) return;
    if (name === "size") {
      this.#propagateSize();
    }
  }

  // ─── Properties ────────────────────────────────────────────────────────

  get size(): CalendarPanelSize {
    return (this.getAttribute("size") as CalendarPanelSize) || "m";
  }

  set size(v: CalendarPanelSize) {
    this.setAttribute("size", v);
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  #propagateSize(): void {
    const size = this.size;
    for (const child of this.children) {
      if (
        child.tagName === "UI-CALENDAR" ||
        child.tagName === "UI-CALENDAR-QUICKLINKS" ||
        child.tagName === "UI-CALENDAR-TIME"
      ) {
        child.setAttribute("size", size);
      }
    }
  }
}

customElements.define("ui-calendar-panel", UiCalendarPanel);
