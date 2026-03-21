import {
  BLUE_30,
  BLUE_60,
  BORDER_FOCUS,
  FONT_PRIMARY,
  GRAY_30,
  GRAY_40,
  RADIUS_PILL,
  RED_20,
  SP_1,
  STATUS_SURFACE_ERROR_BOLD,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
} from "@maneki/foundation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SwitchSize = "s" | "m" | "l";
export type SwitchLabelPosition = "none" | "left" | "right" | "top";
export type SwitchStatus = "none" | "error";

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-flex;
    align-items: center;
    font-family: ${FONT_PRIMARY};
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
  }

  /* ── Switch container (track + handle) ───────────────────────────────────── */

  .switch {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .switch:focus-visible {
    outline: 2px solid ${BORDER_FOCUS};
    outline-offset: 2px;
    border-radius: ${RADIUS_PILL};
  }

  /* ── Track (thin bar behind handle) ──────────────────────────────────────── */

  .track {
    position: absolute;
    left: 0;
    right: 0;
    border-radius: ${RADIUS_PILL};
    background: ${GRAY_30};
    transition: background 0.2s ease;
  }

  :host([checked]) .track {
    background: ${BLUE_30};
  }

  :host([status="error"]) .track {
    background: ${RED_20};
  }

  /* ── Handle (circle that slides) ─────────────────────────────────────────── */

  .handle {
    position: absolute;
    left: 0;
    border-radius: ${RADIUS_PILL};
    background: ${GRAY_40};
    transition: left 0.2s ease, background 0.2s ease;
  }

  :host([checked]) .handle {
    background: ${BLUE_60};
  }

  :host([status="error"]) .handle {
    background: ${STATUS_SURFACE_ERROR_BOLD};
  }

  /* ── Label ───────────────────────────────────────────────────────────────── */

  .label {
    display: none;
    color: ${TEXT_PRIMARY};
    white-space: nowrap;
  }

  :host([label-position="left"]) .label,
  :host([label-position="right"]) .label,
  :host([label-position="top"]) .label {
    display: inline;
  }

  :host([label-position="top"]) {
    flex-direction: column;
    align-items: flex-start;
  }

  :host([label-position="top"]) .label {
    font-weight: 500;
    color: ${TEXT_SECONDARY};
  }

  /* ── Disabled ────────────────────────────────────────────────────────────── */

  :host([disabled]) {
    cursor: default;
    pointer-events: none;
    opacity: 0.5;
  }

  /* ── Size: S ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) {
    gap: ${SP_1};
  }

  :host([size="s"]) .switch {
    width: 20px;
    height: 12px;
  }

  :host([size="s"]) .track {
    height: 2px;
    top: 5px;
  }

  :host([size="s"]) .handle {
    width: 12px;
    height: 12px;
    top: 0;
  }

  :host([size="s"][checked]) .handle {
    left: 8px;
  }

  :host([size="s"]) .label {
    ${TYPE_BODY_03}
  }

  /* ── Size: M (default) ───────────────────────────────────────────────────── */

  :host,
  :host([size="m"]) {
    gap: ${SP_1};
  }

  :host .switch,
  :host([size="m"]) .switch {
    width: 28px;
    height: 16px;
  }

  :host .track,
  :host([size="m"]) .track {
    height: 4px;
    top: 6px;
  }

  :host .handle,
  :host([size="m"]) .handle {
    width: 16px;
    height: 16px;
    top: 0;
  }

  :host([checked]) .handle,
  :host([size="m"][checked]) .handle {
    left: 12px;
  }

  :host .label,
  :host([size="m"]) .label {
    ${TYPE_BODY_02}
  }

  /* ── Size: L ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) {
    gap: ${SP_1};
  }

  :host([size="l"]) .switch {
    width: 36px;
    height: 20px;
  }

  :host([size="l"]) .track {
    height: 6px;
    top: 7px;
  }

  :host([size="l"]) .handle {
    width: 20px;
    height: 20px;
    top: 0;
  }

  :host([size="l"][checked]) .handle {
    left: 16px;
  }

  :host([size="l"]) .label {
    ${TYPE_BODY_01}
  }

  @media (prefers-reduced-motion: reduce) {
    .track,
    .handle {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiSwitch extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "checked",
    "disabled",
    "label",
    "label-position",
    "status",
  ];

  #switchEl!: HTMLElement;
  #track!: HTMLElement;
  #handle!: HTMLElement;
  #labelEl!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Label
    this.#labelEl = document.createElement("span");
    this.#labelEl.className = "label";

    // Switch container
    this.#switchEl = document.createElement("div");
    this.#switchEl.className = "switch";
    this.#switchEl.setAttribute("role", "switch");
    this.#switchEl.setAttribute("tabindex", "0");

    // Track
    this.#track = document.createElement("div");
    this.#track.className = "track";

    // Handle
    this.#handle = document.createElement("div");
    this.#handle.className = "handle";

    this.#switchEl.append(this.#track, this.#handle);
    shadow.append(this.#labelEl, this.#switchEl);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) this.setAttribute("size", "m");
    if (!this.hasAttribute("label-position")) this.setAttribute("label-position", "none");
    if (!this.hasAttribute("status")) this.setAttribute("status", "none");
    this._syncAll();

    this.addEventListener("click", () => {
      if (this.disabled) return;
      this.toggle();
    });

    this.#switchEl.addEventListener("keydown", (e) => {
      if (this.disabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this._syncAll();
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): SwitchSize {
    return (this.getAttribute("size") as SwitchSize) ?? "m";
  }
  set size(v: SwitchSize) {
    this.setAttribute("size", v);
  }

  get checked(): boolean {
    return this.hasAttribute("checked");
  }
  set checked(v: boolean) {
    if (v) this.setAttribute("checked", "");
    else this.removeAttribute("checked");
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }
  set disabled(v: boolean) {
    if (v) this.setAttribute("disabled", "");
    else this.removeAttribute("disabled");
  }

  get label(): string {
    return this.getAttribute("label") ?? "";
  }
  set label(v: string) {
    this.setAttribute("label", v);
  }

  get labelPosition(): SwitchLabelPosition {
    return (this.getAttribute("label-position") as SwitchLabelPosition) ?? "none";
  }
  set labelPosition(v: SwitchLabelPosition) {
    this.setAttribute("label-position", v);
  }

  get status(): SwitchStatus {
    return (this.getAttribute("status") as SwitchStatus) ?? "none";
  }
  set status(v: SwitchStatus) {
    this.setAttribute("status", v);
  }

  // ── Public API ──────────────────────────────────────────────────────────

  toggle(): void {
    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent("switch-change", {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncAll(): void {
    // Label
    this.#labelEl.textContent = this.getAttribute("label") ?? "";

    // Label position: reorder DOM
    const pos = this.getAttribute("label-position");
    if (pos === "left" || pos === "top") {
      this.#labelEl.remove();
      this.shadowRoot!.insertBefore(this.#labelEl, this.#switchEl);
    } else if (pos === "right") {
      this.#labelEl.remove();
      this.shadowRoot!.appendChild(this.#labelEl);
    }

    // ARIA
    this.#switchEl.setAttribute("aria-checked", String(this.checked));
    if (this.label) this.#switchEl.setAttribute("aria-label", this.label);
  }
}

customElements.define("ui-switch", UiSwitch);
