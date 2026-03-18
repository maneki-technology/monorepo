import { STEP_ITEM_STYLES } from "./ui-step-item.styles.js";
import { ICON_CHECK, ICON_CLOSE, ICON_PRIORITY_HIGH } from "@maneki/foundation";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type { StepSize, StepStatus, StepOrientation } from "./ui-step-item.styles.js";
// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STEP_ITEM_STYLES);

export class UiStepItem extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "status",
    "orientation",
    "label",
    "sublabel",
    "labels",
    "first",
    "last",
    "clickable",
  ];

  #lineLeft!: HTMLElement;
  #lineLeftInner!: HTMLElement;
  #lineRight!: HTMLElement;
  #lineRightInner!: HTMLElement;
  #dot!: HTMLElement;
  #dotIcon!: HTMLElement;
  #labelEl!: HTMLElement;
  #sublabelEl!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Progress row
    const progress = document.createElement("div");
    progress.className = "progress";

    // Left line
    this.#lineLeft = document.createElement("div");
    this.#lineLeft.className = "line";
    this.#lineLeftInner = document.createElement("div");
    this.#lineLeftInner.className = "line-inner";
    this.#lineLeft.appendChild(this.#lineLeftInner);

    // Dot
    this.#dot = document.createElement("div");
    this.#dot.className = "dot";
    this.#dotIcon = document.createElement("div");
    this.#dotIcon.className = "dot-icon";
    this.#dot.appendChild(this.#dotIcon);

    // Right line
    this.#lineRight = document.createElement("div");
    this.#lineRight.className = "line";
    this.#lineRightInner = document.createElement("div");
    this.#lineRightInner.className = "line-inner";
    this.#lineRight.appendChild(this.#lineRightInner);

    progress.append(this.#lineLeft, this.#dot, this.#lineRight);

    // Labels
    const labels = document.createElement("div");
    labels.className = "labels";
    this.#labelEl = document.createElement("span");
    this.#labelEl.className = "label";
    this.#sublabelEl = document.createElement("span");
    this.#sublabelEl.className = "sublabel";
    labels.append(this.#labelEl, this.#sublabelEl);

    shadow.append(progress, labels);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) this.setAttribute("size", "m");
    if (!this.hasAttribute("status")) this.setAttribute("status", "incomplete");
    if (!this.hasAttribute("orientation")) this.setAttribute("orientation", "horizontal");
    this._syncAll();

    this.addEventListener("click", () => {
      if (!this.hasAttribute("clickable") || this.status === "disabled") return;
      this.dispatchEvent(
        new CustomEvent("step-click", {
          detail: { label: this.label, status: this.status },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this._syncAll();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): string {
    return this.getAttribute("size") ?? "m";
  }
  set size(v: string) {
    this.setAttribute("size", v);
  }

  get status(): string {
    return this.getAttribute("status") ?? "incomplete";
  }
  set status(v: string) {
    this.setAttribute("status", v);
  }

  get orientation(): string {
    return this.getAttribute("orientation") ?? "horizontal";
  }
  set orientation(v: string) {
    this.setAttribute("orientation", v);
  }

  get label(): string {
    return this.getAttribute("label") ?? "";
  }
  set label(v: string) {
    this.setAttribute("label", v);
  }

  get sublabel(): string {
    return this.getAttribute("sublabel") ?? "";
  }
  set sublabel(v: string) {
    this.setAttribute("sublabel", v);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncAll(): void {
    const status = this.status;
    const isFirst = this.hasAttribute("first");
    const isLast = this.hasAttribute("last");

    // Labels
    this.#labelEl.textContent = this.getAttribute("label") ?? "";
    this.#sublabelEl.textContent = this.getAttribute("sublabel") ?? "";

    // Hide first/last lines
    if (isFirst) this.#lineLeft.classList.add("hidden");
    else this.#lineLeft.classList.remove("hidden");

    if (isLast) this.#lineRight.classList.add("hidden");
    else this.#lineRight.classList.remove("hidden");

    // Line colors: left line is "completed" if this step is complete or active
    const leftCompleted = ["complete", "active", "error", "warning"].includes(status);
    if (leftCompleted) this.#lineLeftInner.classList.add("completed");
    else this.#lineLeftInner.classList.remove("completed");

    // Right line is "completed" only if this step is complete
    const rightCompleted = status === "complete";
    if (rightCompleted) this.#lineRightInner.classList.add("completed");
    else this.#lineRightInner.classList.remove("completed");

    // Dot icon (M size) — use Material Symbols font
    if (status === "complete") {
      this.#dotIcon.textContent = ICON_CHECK;
    } else if (status === "error") {
      this.#dotIcon.textContent = ICON_CLOSE;
    } else if (status === "warning") {
      this.#dotIcon.textContent = ICON_PRIORITY_HIGH;
    } else {
      this.#dotIcon.textContent = "";
    }
  }
}

customElements.define("ui-step-item", UiStepItem);
