import { PANEL_STYLES } from "./calendar-panel.styles.js";

// ─── Styles ──────────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(PANEL_STYLES);

// ─── Component ───────────────────────────────────────────────────────────────

export class ManekiCalendarPanel extends HTMLElement {
  static readonly observedAttributes = ["show-actions"];

  #actions!: HTMLDivElement;
  #okBtn!: HTMLButtonElement;
  #cancelBtn!: HTMLButtonElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const panel = document.createElement("div");
    panel.className = "panel";

    // slot="top"
    const slotTop = document.createElement("div");
    slotTop.className = "slot-top";
    const topSlot = document.createElement("slot");
    topSlot.name = "top";
    slotTop.appendChild(topSlot);

    // default slot (calendar)
    const slotCalendar = document.createElement("div");
    slotCalendar.className = "slot-calendar";
    const defaultSlot = document.createElement("slot");
    slotCalendar.appendChild(defaultSlot);

    // slot="time"
    const slotTime = document.createElement("div");
    slotTime.className = "slot-time";
    const timeSlot = document.createElement("slot");
    timeSlot.name = "time";
    slotTime.appendChild(timeSlot);

    // slot="bottom"
    const slotBottom = document.createElement("div");
    slotBottom.className = "slot-bottom";
    const bottomSlot = document.createElement("slot");
    bottomSlot.name = "bottom";
    slotBottom.appendChild(bottomSlot);

    // Actions bar
    this.#actions = document.createElement("div");
    this.#actions.className = "actions";
    this.#actions.style.display = "none";

    this.#cancelBtn = document.createElement("button");
    this.#cancelBtn.className = "action-btn";
    this.#cancelBtn.type = "button";
    this.#cancelBtn.textContent = "Cancel";

    this.#okBtn = document.createElement("button");
    this.#okBtn.className = "action-btn";
    this.#okBtn.type = "button";
    this.#okBtn.dataset.primary = "";
    this.#okBtn.textContent = "OK";

    this.#actions.append(this.#cancelBtn, this.#okBtn);

    panel.append(slotTop, slotCalendar, slotTime, slotBottom, this.#actions);
    shadow.appendChild(panel);
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  connectedCallback(): void {
    this.#syncActions();
    this.#okBtn.addEventListener("click", this.#onOk);
    this.#cancelBtn.addEventListener("click", this.#onCancel);
  }

  disconnectedCallback(): void {
    this.#okBtn.removeEventListener("click", this.#onOk);
    this.#cancelBtn.removeEventListener("click", this.#onCancel);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (name === "show-actions") this.#syncActions();
  }

  // ─── Properties ──────────────────────────────────────────────────────────

  get showActions(): boolean {
    return this.hasAttribute("show-actions");
  }

  set showActions(v: boolean) {
    if (v) this.setAttribute("show-actions", "");
    else this.removeAttribute("show-actions");
  }

  // ─── Internal ────────────────────────────────────────────────────────────

  #syncActions(): void {
    this.#actions.style.display = this.showActions ? "" : "none";
  }

  #onOk = (): void => {
    this.dispatchEvent(
      new CustomEvent("panel-ok", {
        bubbles: true,
        composed: true,
      }),
    );
  };

  #onCancel = (): void => {
    this.dispatchEvent(
      new CustomEvent("panel-cancel", {
        bubbles: true,
        composed: true,
      }),
    );
  };
}

customElements.define("maneki-calendar-panel", ManekiCalendarPanel);
