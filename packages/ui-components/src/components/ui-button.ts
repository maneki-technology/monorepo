import { semanticVar, spaceVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type ButtonAction = "primary" | "secondary" | "destructive" | "info" | "contrast";
export type ButtonEmphasis = "bold" | "subtle" | "minimal";
export type ButtonSize = "s" | "m" | "l" | "xl";
export type ButtonShape = "basic" | "rounded";
export type ButtonIcon = "text-only" | "leading-icon" | "trailing-icon" | "icon-only";
export type ButtonStatus = "none" | "error" | "loading" | "success";

import "./ui-icon.js";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_ACTION = semanticVar("surface", "action");
const SURFACE_TERTIARY = semanticVar("surface", "tertiary");
const TEXT_PRIMARY = semanticVar("text", "primary");
const SURFACE_DESTRUCTIVE = semanticVar("surface", "destructive");
const SURFACE_ACTION_CONTRAST = semanticVar("surface", "actionContrast");
const SURFACE_SUCCESS = semanticVar("surface", "success");
const BORDER_FOCUS = semanticVar("border", "focus");

const SP_05 = spaceVar("0.5");
const SP_075 = spaceVar("0.75");
const SP_1 = spaceVar("1");
const SP_15 = spaceVar("1.5");
const SP_2 = spaceVar("2");
const SP_25 = spaceVar("2.5");
const SP_3 = spaceVar("3");
const SP_4 = spaceVar("4");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-block;
  }

  /* ── Base button ─────────────────────────────────────────────────────────── */

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${SP_1};
    border: 1px solid transparent;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    font-family: var(--ui-btn-font-family, "Inter", sans-serif);
    font-weight: var(--ui-btn-font-weight, 500);
    transition:
      background var(--ui-btn-transition-duration, 0.15s) ease,
      border-color var(--ui-btn-transition-duration, 0.15s) ease,
      box-shadow var(--ui-btn-transition-duration, 0.15s) ease,
      opacity var(--ui-btn-transition-duration, 0.15s) ease;
  }

  /* ── Size: m (default) ───────────────────────────────────────────────────── */

  :host button,
  :host([size="m"]) button {
    font-size: 14px;
    line-height: 20px;
    padding: ${SP_075} ${SP_2};
  }

  :host([shape="rounded"]) button,
  :host([shape="rounded"][size="m"]) button {
    padding: ${SP_075} ${SP_25};
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) button {
    font-size: 12px;
    line-height: 16px;
    padding: ${SP_05} ${SP_15};
  }

  :host([size="s"][shape="rounded"]) button {
    padding: ${SP_05} ${SP_15};
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) button {
    font-size: 16px;
    line-height: 24px;
    padding: ${SP_1} ${SP_3};
  }

  :host([size="l"][shape="rounded"]) button {
    padding: ${SP_1} ${SP_3};
  }

  /* ── Size: xl ────────────────────────────────────────────────────────────── */

  :host([size="xl"]) button {
    font-size: 16px;
    line-height: 24px;
    padding: ${SP_15} ${SP_4};
  }

  :host([size="xl"][shape="rounded"]) button {
    padding: ${SP_15} ${SP_4};
  }

  /* ── Icon-only padding (square) ──────────────────────────────────────────── */

  :host([icon="icon-only"]) button,
  :host([icon="icon-only"][size="m"]) button {
    padding: ${SP_075};
  }

  :host([icon="icon-only"][size="s"]) button {
    padding: ${SP_05};
  }

  :host([icon="icon-only"][size="l"]) button {
    padding: ${SP_1};
  }

  :host([icon="icon-only"][size="xl"]) button {
    padding: ${SP_15};
  }

  /* ── Shape ───────────────────────────────────────────────────────────────── */

  :host button {
    border-radius: var(--ui-btn-radius, 2px);
  }

  :host([shape="rounded"]) button {
    border-radius: var(--ui-btn-radius, 999px);
  }

  /* ── Action × Emphasis: PRIMARY ──────────────────────────────────────────── */

  /* bold (default) */
  :host button,
  :host([action="primary"]) button,
  :host([action="primary"][emphasis="bold"]) button {
    background-color: var(--ui-btn-bg, ${SURFACE_ACTION});
    color: var(--ui-btn-color, #ffffff);
    border-color: var(--ui-btn-border-color, ${SURFACE_ACTION});
  }

  /* subtle */
  :host([emphasis="subtle"]) button,
  :host([action="primary"][emphasis="subtle"]) button {
    background-color: transparent;
    color: var(--ui-btn-color, ${SURFACE_ACTION});
    border-color: var(--ui-btn-border-color, ${SURFACE_ACTION});
  }

  /* minimal */
  :host([emphasis="minimal"]) button,
  :host([action="primary"][emphasis="minimal"]) button {
    background-color: transparent;
    color: var(--ui-btn-color, ${SURFACE_ACTION});
    border-color: transparent;
  }

  /* ── Action × Emphasis: SECONDARY ────────────────────────────────────────── */

  :host([action="secondary"]) button,
  :host([action="secondary"][emphasis="bold"]) button {
    background-color: var(--ui-btn-bg, ${SURFACE_TERTIARY});
    color: var(--ui-btn-color, ${TEXT_PRIMARY});
    border-color: var(--ui-btn-border-color, ${SURFACE_TERTIARY});
  }

  :host([action="secondary"][emphasis="subtle"]) button {
    background-color: transparent;
    color: var(--ui-btn-color, ${TEXT_PRIMARY});
    border-color: var(--ui-btn-border-color, ${TEXT_PRIMARY});
  }

  :host([action="secondary"][emphasis="minimal"]) button {
    background-color: transparent;
    color: var(--ui-btn-color, ${TEXT_PRIMARY});
    border-color: transparent;
  }

  /* ── Action × Emphasis: DESTRUCTIVE ──────────────────────────────────────── */

  :host([action="destructive"]) button,
  :host([action="destructive"][emphasis="bold"]) button {
    background-color: var(--ui-btn-bg, ${SURFACE_DESTRUCTIVE});
    color: var(--ui-btn-color, #ffffff);
    border-color: var(--ui-btn-border-color, ${SURFACE_DESTRUCTIVE});
  }

  :host([action="destructive"][emphasis="subtle"]) button {
    background-color: transparent;
    color: var(--ui-btn-color, ${SURFACE_DESTRUCTIVE});
    border-color: var(--ui-btn-border-color, ${SURFACE_DESTRUCTIVE});
  }

  :host([action="destructive"][emphasis="minimal"]) button {
    background-color: transparent;
    color: var(--ui-btn-color, ${SURFACE_DESTRUCTIVE});
    border-color: transparent;
  }

  /* ── Action × Emphasis: INFO ─────────────────────────────────────────────── */

  :host([action="info"]) button,
  :host([action="info"][emphasis="bold"]) button {
    background-color: var(--ui-btn-bg, ${SURFACE_ACTION_CONTRAST});
    color: var(--ui-btn-color, #ffffff);
    border-color: var(--ui-btn-border-color, ${SURFACE_ACTION_CONTRAST});
  }

  :host([action="info"][emphasis="subtle"]) button {
    background-color: transparent;
    color: var(--ui-btn-color, ${SURFACE_ACTION_CONTRAST});
    border-color: var(--ui-btn-border-color, ${SURFACE_ACTION_CONTRAST});
  }

  :host([action="info"][emphasis="minimal"]) button {
    background-color: transparent;
    color: var(--ui-btn-color, ${SURFACE_ACTION_CONTRAST});
    border-color: transparent;
  }

  /* ── Action × Emphasis: CONTRAST ─────────────────────────────────────────── */

  :host([action="contrast"]) button,
  :host([action="contrast"][emphasis="bold"]) button {
    background-color: var(--ui-btn-bg, #ffffff);
    color: var(--ui-btn-color, ${TEXT_PRIMARY});
    border-color: var(--ui-btn-border-color, #ffffff);
  }

  :host([action="contrast"][emphasis="subtle"]) button {
    background-color: transparent;
    color: var(--ui-btn-color, #ffffff);
    border-color: var(--ui-btn-border-color, #ffffff);
  }

  :host([action="contrast"][emphasis="minimal"]) button {
    background-color: transparent;
    color: var(--ui-btn-color, #ffffff);
    border-color: transparent;
  }

  /* ── Hover state ─────────────────────────────────────────────────────────── */

  button:hover {
    background-image: linear-gradient(rgba(14, 23, 31, 0.1), rgba(14, 23, 31, 0.1));
  }

  /* subtle/minimal hover — add a light fill */
  :host([emphasis="subtle"]) button:hover,
  :host([emphasis="minimal"]) button:hover {
    background-image: none;
    background-color: rgba(14, 23, 31, 0.06);
  }

  /* ── Active state ────────────────────────────────────────────────────────── */

  button:active {
    background-image: linear-gradient(rgba(14, 23, 31, 0.2), rgba(14, 23, 31, 0.2));
  }

  :host([emphasis="subtle"]) button:active,
  :host([emphasis="minimal"]) button:active {
    background-image: none;
    background-color: rgba(14, 23, 31, 0.12);
  }

  /* ── Focus-visible (double ring) ─────────────────────────────────────────── */

  button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px #ffffff, 0 0 0 2px ${BORDER_FOCUS};
  }

  :host([action="secondary"]) button:focus-visible {
    box-shadow: 0 0 0 1px #ffffff, 0 0 0 2px ${TEXT_PRIMARY};
  }

  :host([action="destructive"]) button:focus-visible {
    box-shadow: 0 0 0 1px #ffffff, 0 0 0 2px ${SURFACE_DESTRUCTIVE};
  }

  :host([action="info"]) button:focus-visible {
    box-shadow: 0 0 0 1px #ffffff, 0 0 0 2px ${SURFACE_ACTION_CONTRAST};
  }

  :host([action="contrast"]) button:focus-visible {
    box-shadow: 0 0 0 1px ${TEXT_PRIMARY}, 0 0 0 2px #ffffff;
  }

  /* ── Disabled ────────────────────────────────────────────────────────────── */

  :host([disabled]) button {
    cursor: not-allowed;
    pointer-events: none;
  }

  :host([disabled]) button {
    opacity: 0.3;
  }

  :host([disabled]) button ::slotted(*),
  :host([disabled]) button .status-icon {
    opacity: 0.8;
  }

  /* ── Icon slot visibility ────────────────────────────────────────────────── */

  .slot-icon-start,
  .slot-icon-end {
    display: none;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }

  :host([icon="leading-icon"]) .slot-icon-start,
  :host([icon="icon-only"]) .slot-icon-start {
    display: inline-flex;
  }

  :host([icon="trailing-icon"]) .slot-icon-end {
    display: inline-flex;
  }

  /* Hide default text slot for icon-only */
  :host([icon="icon-only"]) .slot-text {
    display: none;
  }

  /* ── Status indicator ────────────────────────────────────────────────────── */

  .content-wrapper {
    display: contents;
  }

  .status-icon {
    display: none;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    line-height: 0;
    --ui-icon-size: 20px;
  }


  :host([size="s"]) .status-icon {
    width: 16px;
    height: 16px;
    --ui-icon-size: 16px;
  }

  :host([size="l"]) .status-icon,
  :host([size="xl"]) .status-icon {
    width: 24px;
    height: 24px;
  }

  /* When status is active, hide content and show status icon */
  :host([status="error"]) .content-wrapper,
  :host([status="success"]) .content-wrapper,
  :host([status="loading"]) .content-wrapper {
    display: none;
  }

  :host([status="error"]) .status-icon,
  :host([status="success"]) .status-icon,
  :host([status="loading"]) .status-icon {
    display: inline-flex;
  }

  /* Status colors override action */
  :host([status="error"]) button {
    background-color: ${SURFACE_DESTRUCTIVE};
    color: #ffffff;
    border-color: ${SURFACE_DESTRUCTIVE};
  }

  :host([status="success"]) button {
    background-color: ${SURFACE_SUCCESS};
    color: #ffffff;
    border-color: ${SURFACE_SUCCESS};
  }

  /* Loading spinner animation */
  @keyframes ui-btn-spin {
    to { transform: rotate(360deg); }
  }

  :host([status="loading"]) .status-icon ui-icon {
    animation: ui-btn-spin 0.7s linear infinite;
  }

  /* ── Reduced motion ──────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    button {
      transition-duration: 0.01ms !important;
    }

    :host([status="loading"]) .status-icon ui-icon {
      animation-duration: 2s;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiButton extends HTMLElement {
  static readonly observedAttributes = [
    "action",
    "emphasis",
    "size",
    "shape",
    "icon",
    "status",
    "disabled",
  ];

  private _button: HTMLButtonElement;
  private _contentWrapper: HTMLElement;
  private _statusIcon: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    const button = document.createElement("button");
    button.setAttribute("part", "button");

    // Icon start slot
    const iconStartWrapper = document.createElement("span");
    iconStartWrapper.className = "slot-icon-start";
    const iconStartSlot = document.createElement("slot");
    iconStartSlot.name = "icon-start";
    iconStartWrapper.appendChild(iconStartSlot);

    // Content wrapper (holds slots, hidden during status)
    const contentWrapper = document.createElement("span");
    contentWrapper.className = "content-wrapper";

    contentWrapper.appendChild(iconStartWrapper);

    // Default text slot
    const textWrapper = document.createElement("span");
    textWrapper.className = "slot-text";
    const textSlot = document.createElement("slot");
    textWrapper.appendChild(textSlot);
    contentWrapper.appendChild(textWrapper);

    // Icon end slot
    const iconEndWrapper = document.createElement("span");
    iconEndWrapper.className = "slot-icon-end";
    const iconEndSlot = document.createElement("slot");
    iconEndSlot.name = "icon-end";
    iconEndWrapper.appendChild(iconEndSlot);
    contentWrapper.appendChild(iconEndWrapper);

    button.appendChild(contentWrapper);

    // Status icon container
    const statusIcon = document.createElement("span");
    statusIcon.className = "status-icon";
    statusIcon.setAttribute("aria-hidden", "true");
    button.appendChild(statusIcon);

    shadow.appendChild(button);

    this._button = button;
    this._contentWrapper = contentWrapper;
    this._statusIcon = statusIcon;
  }

  connectedCallback(): void {
    this._syncDisabled();
    this._syncStatus();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (name === "disabled") {
      this._syncDisabled();
    }
    if (name === "status") {
      this._syncStatus();
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get action(): ButtonAction {
    return (this.getAttribute("action") as ButtonAction) ?? "primary";
  }

  set action(value: ButtonAction) {
    this.setAttribute("action", value);
  }

  get emphasis(): ButtonEmphasis {
    return (this.getAttribute("emphasis") as ButtonEmphasis) ?? "bold";
  }

  set emphasis(value: ButtonEmphasis) {
    this.setAttribute("emphasis", value);
  }

  get size(): ButtonSize {
    return (this.getAttribute("size") as ButtonSize) ?? "m";
  }

  set size(value: ButtonSize) {
    this.setAttribute("size", value);
  }

  get shape(): ButtonShape {
    return (this.getAttribute("shape") as ButtonShape) ?? "basic";
  }

  set shape(value: ButtonShape) {
    this.setAttribute("shape", value);
  }

  get icon(): ButtonIcon {
    return (this.getAttribute("icon") as ButtonIcon) ?? "text-only";
  }

  set icon(value: ButtonIcon) {
    this.setAttribute("icon", value);
  }

  get status(): ButtonStatus {
    return (this.getAttribute("status") as ButtonStatus) ?? "none";
  }

  set status(value: ButtonStatus) {
    this.setAttribute("status", value);
  }

  get disabled(): boolean {
    return this.hasAttribute("disabled");
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncDisabled(): void {
    this._button.disabled = this.disabled;
  }

  private _syncStatus(): void {
    const status = this.status;
    switch (status) {
      case "error": {
        this._statusIcon.innerHTML = "";
        const icon = document.createElement("ui-icon") as HTMLElement;
        icon.setAttribute("name", "error");
        icon.setAttribute("filled", "");
        this._statusIcon.appendChild(icon);
        this._button.setAttribute("aria-label", "Error");
        break;
      }
      case "success": {
        this._statusIcon.innerHTML = "";
        const icon = document.createElement("ui-icon") as HTMLElement;
        icon.setAttribute("name", "check_circle");
        icon.setAttribute("filled", "");
        this._statusIcon.appendChild(icon);
        this._button.setAttribute("aria-label", "Success");
        break;
      }
      case "loading": {
        this._statusIcon.innerHTML = "";
        const icon = document.createElement("ui-icon") as HTMLElement;
        icon.setAttribute("name", "progress_activity");
        this._statusIcon.appendChild(icon);
        this._button.setAttribute("aria-label", "Loading");
        this._button.setAttribute("aria-busy", "true");
        break;
      }
      default:
        this._statusIcon.innerHTML = "";
        this._button.removeAttribute("aria-label");
        this._button.removeAttribute("aria-busy");
        break;
    }
  }
}

customElements.define("ui-button", UiButton);
