
import {
  BORDER_MINIMAL,
  BW_SM,
  FONT_PRIMARY,
  SP_1,
  SP_1_5,
  SP_2,
  SP_2_5,
  SP_3,
  SP_4,
  SP_5,
  SP_7,
  SP_8,
  SURFACE_PRIMARY,
  SURFACE_SECONDARY,
  TEXT_PRIMARY,
  TYPE_BODY_02,
  TYPE_HEADING_04,
} from "@maneki/foundation";
import "./ui-step-group.js";
import "./ui-step-item.js";
import "./ui-button.js";
import "./ui-separator.js";
// ─── Types ───────────────────────────────────────────────────────────────────

export type WizardLayout = "horizontal" | "vertical";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: flex;
    flex-direction: column;
    font-family: ${FONT_PRIMARY};
    width: 100%;
    height: 100%;
    background: ${SURFACE_PRIMARY};
    overflow: hidden;
  }

  /* Hide the steps slot - we clone into bar/sidebar */
  slot[name="steps"] {
    display: none;
  }

  /* ── Header ──────────────────────────────────────────────────────────────── */

  .header {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    background: ${SURFACE_PRIMARY};
  }

  .header-title {
    font-weight: 500;
    color: ${TEXT_PRIMARY};
    white-space: nowrap;
  }

  /* ── Body ─────────────────────────────────────────────────────────────────── */

  .body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* ── Steps sidebar (vertical) ────────────────────────────────────────────── */

  .steps-sidebar {
    display: none;
    flex-direction: column;
    background: ${SURFACE_SECONDARY};
    flex-shrink: 0;
    position: relative;
  }

  :host([layout="vertical"]) .steps-sidebar {
    display: flex;
  }

  .steps-sidebar::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 1px;
    background: ${BORDER_MINIMAL};
  }

  /* ── Steps bar (horizontal) ──────────────────────────────────────────────── */

  .steps-bar {
    display: none;
    align-items: center;
    justify-content: center;
    background: ${SURFACE_PRIMARY};
    flex-shrink: 0;
    border-bottom: ${BW_SM} solid ${BORDER_MINIMAL};
  }

  :host([layout="horizontal"]) .steps-bar {
    display: flex;
  }

  /* ── Content ─────────────────────────────────────────────────────────────── */

  .content {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    background: ${SURFACE_PRIMARY};
  }

  :host([layout="horizontal"]) .content {
    background: ${SURFACE_SECONDARY};
  }

  /* ── Footer ──────────────────────────────────────────────────────────────── */

  .footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: ${SP_1};
    flex-shrink: 0;
    background: ${SURFACE_PRIMARY};
  }

  /* ── Horizontal layout ───────────────────────────────────────────────────── */

  :host([layout="horizontal"]) .header {
    height: ${SP_4};
    padding: 0 ${SP_2};
  }

  :host([layout="horizontal"]) .header-title {
    ${TYPE_BODY_02}
  }

  :host([layout="horizontal"]) .steps-bar {
    height: ${SP_8};
    padding: ${SP_2_5} ${SP_5};
  }

  :host([layout="horizontal"]) .footer {
    height: ${SP_7};
    padding: 0 ${SP_1_5};
  }

  /* ── Vertical layout ─────────────────────────────────────────────────────── */

  :host([layout="vertical"]) .header {
    height: ${SP_7};
    padding: 0 ${SP_3};
  }

  :host([layout="vertical"]) .header-title {
    ${TYPE_HEADING_04}
  }

  :host([layout="vertical"]) .steps-sidebar {
    width: 220px;
    padding: ${SP_2} ${SP_3};
  }

  :host([layout="vertical"]) .footer {
    height: ${SP_7};
    padding: 0 ${SP_1_5};
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiWizard extends HTMLElement {
  static readonly observedAttributes = ["layout", "title", "current-step", "loading"];

  #headerTitle!: HTMLElement;
  #stepsSidebar!: HTMLElement;
  #stepsBar!: HTMLElement;
  #content!: HTMLElement;
  #prevBtn!: HTMLElement;
  #nextBtn!: HTMLElement;
  #stepsSlot!: HTMLSlotElement;
  #cachedStepCount = 0;
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Header
    const header = document.createElement("div");
    header.className = "header";
    this.#headerTitle = document.createElement("span");
    this.#headerTitle.className = "header-title";
    header.appendChild(this.#headerTitle);

    const headerSep = document.createElement("ui-separator");
    headerSep.setAttribute("emphasis", "minimal");

    // Steps bar (horizontal)
    this.#stepsBar = document.createElement("div");
    this.#stepsBar.className = "steps-bar";

    const stepsBarSep = document.createElement("ui-separator");
    stepsBarSep.setAttribute("emphasis", "minimal");

    // Body
    const body = document.createElement("div");
    body.className = "body";

    // Steps sidebar (vertical)
    this.#stepsSidebar = document.createElement("div");
    this.#stepsSidebar.className = "steps-sidebar";

    // Content
    this.#content = document.createElement("div");
    this.#content.className = "content";
    const contentSlot = document.createElement("slot");
    this.#content.appendChild(contentSlot);

    // Steps slot
    this.#stepsSlot = document.createElement("slot") as HTMLSlotElement;
    this.#stepsSlot.name = "steps";

    body.append(this.#stepsSidebar, this.#content);

    // Footer
    const footerSep = document.createElement("ui-separator");
    footerSep.setAttribute("emphasis", "minimal");

    const footer = document.createElement("div");
    footer.className = "footer";

    this.#prevBtn = document.createElement("ui-button");
    this.#prevBtn.setAttribute("action", "secondary");
    this.#prevBtn.setAttribute("emphasis", "bold");
    this.#prevBtn.setAttribute("size", "m");
    this.#prevBtn.textContent = "Previous";

    this.#nextBtn = document.createElement("ui-button");
    this.#nextBtn.setAttribute("action", "primary");
    this.#nextBtn.setAttribute("emphasis", "bold");
    this.#nextBtn.setAttribute("size", "m");
    this.#nextBtn.textContent = "Next";

    footer.append(this.#prevBtn, this.#nextBtn);

    shadow.append(header, headerSep, this.#stepsBar, body, footerSep, footer, this.#stepsSlot);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) this.setAttribute("role", "group");
    if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "Wizard");
    if (!this.hasAttribute("layout")) this.setAttribute("layout", "horizontal");
    if (!this.hasAttribute("current-step")) this.setAttribute("current-step", "1");
    this._syncAll();

    this.#stepsSlot.addEventListener("slotchange", () => { this.#cachedStepCount = this._getStepCount(); this._syncSteps(); this._syncButtons(); });

    this.#prevBtn.addEventListener("click", () => {
      const current = this.currentStep;
      if (current <= 1) return;
      const event = new CustomEvent("wizard-previous", {
        detail: { step: current },
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      const allowed = this.dispatchEvent(event);
      if (allowed) {
        this.currentStep = current - 1;
      }
    });

    this.#nextBtn.addEventListener("click", () => {
      const current = this.currentStep;
      const total = this._getStepCount();
      if (current >= total) {
        // Last step — fire wizard-finish
        const event = new CustomEvent("wizard-finish", {
          detail: { step: current },
          bubbles: true,
          composed: true,
          cancelable: true,
        });
        this.dispatchEvent(event);
        return;
      }
      const event = new CustomEvent("wizard-next", {
        detail: { step: current },
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      const allowed = this.dispatchEvent(event);
      if (allowed) {
        this.currentStep = current + 1;
      }
    });
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this._syncAll();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get layout(): WizardLayout {
    return (this.getAttribute("layout") as WizardLayout) ?? "horizontal";
  }
  set layout(v: WizardLayout) {
    this.setAttribute("layout", v);
  }

  get wizardTitle(): string {
    return this.getAttribute("title") ?? "";
  }
  set wizardTitle(v: string) {
    this.setAttribute("title", v);
  }

  get currentStep(): number {
    return parseInt(this.getAttribute("current-step") ?? "1", 10) || 1;
  }
  set currentStep(v: number) {
    this.setAttribute("current-step", String(v));
  }

  get loading(): boolean {
    return this.hasAttribute("loading");
  }
  set loading(v: boolean) {
    if (v) this.setAttribute("loading", "");
    else this.removeAttribute("loading");
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncAll(): void {
    this.#headerTitle.textContent = this.getAttribute("title") ?? "";
    this._syncSteps();
    this._syncButtons();
  }

  private _syncSteps(): void {
    const stepGroup = this._getStepGroup();
    if (!stepGroup) return;

    const layout = this.layout;
    stepGroup.setAttribute("current-step", String(this.currentStep));
    stepGroup.setAttribute("labels", "");

    if (layout === "horizontal") {
      stepGroup.setAttribute("size", "s");
      stepGroup.setAttribute("orientation", "horizontal");
      // Move to steps bar
      this.#stepsBar.innerHTML = "";
      this.#stepsBar.appendChild(stepGroup.cloneNode(true));
      // Also keep in sidebar for vertical
      this.#stepsSidebar.innerHTML = "";
    } else {
      stepGroup.setAttribute("size", "m");
      stepGroup.setAttribute("orientation", "vertical");
      // Move to sidebar
      this.#stepsSidebar.innerHTML = "";
      this.#stepsSidebar.appendChild(stepGroup.cloneNode(true));
      // Clear bar
      this.#stepsBar.innerHTML = "";
    }
  }

  private _syncButtons(): void {
    const current = this.currentStep;
    const total = this.#cachedStepCount || this._getStepCount();
    const isLoading = this.hasAttribute("loading");

    // Disable prev on first step or when loading
    if (current <= 1 || isLoading) this.#prevBtn.setAttribute("disabled", "");
    else this.#prevBtn.removeAttribute("disabled");

    // Next/Finish button — only show Finish when total is known and current is at last step
    if (total > 0 && current >= total) {
      this.#nextBtn.textContent = "Finish";
    } else {
      this.#nextBtn.textContent = "Next";
    }

    // Loading state on next button
    if (isLoading) {
      this.#nextBtn.setAttribute("status", "loading");
      this.#nextBtn.setAttribute("disabled", "");
    } else {
      this.#nextBtn.removeAttribute("status");
      this.#nextBtn.removeAttribute("disabled");
    }
  }

  private _getStepGroup(): HTMLElement | null {
    const assigned = this.#stepsSlot.assignedElements();
    return (assigned.find((el) => el.tagName === "UI-STEP-GROUP") as HTMLElement) ?? null;
  }

  private _getStepCount(): number {
    const stepGroup = this._getStepGroup();
    if (!stepGroup) return 0;
    return stepGroup.querySelectorAll("ui-step-item").length;
  }

  private _dispatchStepChange(): void {
    this.dispatchEvent(
      new CustomEvent("wizard-step-change", {
        detail: { step: this.currentStep },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define("ui-wizard", UiWizard);
