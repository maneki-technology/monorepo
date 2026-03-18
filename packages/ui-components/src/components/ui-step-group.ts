import "./ui-step-item.js";
import type { StepSize, StepOrientation } from "./ui-step-item.styles.js";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  :host {
    display: flex;
    align-items: flex-start;
    width: 100%;
    font-family: "Geist", sans-serif;
  }

  :host([orientation="vertical"]) {
    flex-direction: column;
    height: 100%;
  }

  .group {
    display: flex;
    flex: 1 0 0;
    align-items: flex-start;
    min-width: 0;
    min-height: 0;
  }

  ::slotted(ui-step-item) {
    flex: 1 0 0;
  }

  :host([orientation="vertical"]) .group {
    flex-direction: column;
    height: 100%;
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiStepGroup extends HTMLElement {
  static readonly observedAttributes = ["size", "orientation", "current-step", "labels"];

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const group = document.createElement("div");
    group.className = "group";
    const slot = document.createElement("slot");
    group.appendChild(slot);
    shadow.appendChild(group);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) this.setAttribute("size", "m");
    if (!this.hasAttribute("orientation")) this.setAttribute("orientation", "horizontal");

    this.shadowRoot!.querySelector("slot")!.addEventListener("slotchange", () => this._syncSteps());
    this._syncSteps();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this._syncSteps();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): StepSize {
    return (this.getAttribute("size") as StepSize) ?? "m";
  }
  set size(v: StepSize) {
    this.setAttribute("size", v);
  }

  get orientation(): StepOrientation {
    return (this.getAttribute("orientation") as StepOrientation) ?? "horizontal";
  }
  set orientation(v: StepOrientation) {
    this.setAttribute("orientation", v);
  }

  get currentStep(): number {
    return parseInt(this.getAttribute("current-step") ?? "0", 10) || 0;
  }
  set currentStep(v: number) {
    this.setAttribute("current-step", String(v));
  }

  get labels(): boolean {
    return this.hasAttribute("labels");
  }
  set labels(v: boolean) {
    if (v) this.setAttribute("labels", "");
    else this.removeAttribute("labels");
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncSteps(): void {
    const slot = this.shadowRoot!.querySelector("slot") as HTMLSlotElement;
    const items = slot.assignedElements().filter((el) => el.tagName === "UI-STEP-ITEM");
    const size = this.getAttribute("size");
    const orientation = this.getAttribute("orientation");
    const hasLabels = this.hasAttribute("labels");
    const current = this.currentStep;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Propagate size, orientation, labels
      if (size) item.setAttribute("size", size);
      if (orientation) item.setAttribute("orientation", orientation);
      if (hasLabels) item.setAttribute("labels", "");
      else item.removeAttribute("labels");

      // First/last
      if (i === 0) item.setAttribute("first", "");
      else item.removeAttribute("first");
      if (i === items.length - 1) item.setAttribute("last", "");
      else item.removeAttribute("last");

      // Auto-set status based on current-step if no explicit status
      if (current > 0) {
        const step = i + 1;
        if (step < current) {
          item.setAttribute("status", "complete");
        } else if (step === current) {
          item.setAttribute("status", "active");
        } else {
          // Only set incomplete if not explicitly set to error/warning/disabled
          const existing = item.getAttribute("status");
          if (!existing || existing === "complete" || existing === "active" || existing === "incomplete") {
            item.setAttribute("status", "incomplete");
          }
        }
      }
    }
  }
}

customElements.define("ui-step-group", UiStepGroup);
