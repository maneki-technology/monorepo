import { semanticVar, spaceVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type AccordionSize = "s" | "m" | "l";
export type AccordionEmphasis = "bold" | "subtle";
export type AccordionStatus = "none" | "error" | "warning" | "success";

import { ICON_CHEVRON, ICON_ERROR, ICON_WARNING, ICON_SUCCESS } from "../assets/icons.js";

// ─── Token constants ─────────────────────────────────────────────────────────

const BORDER_MODERATE = semanticVar("border", "moderate");
const TEXT_PRIMARY = semanticVar("text", "primary");
const ICON_PRIMARY = semanticVar("icon", "primary");
const STATUS_ERROR = semanticVar("statusGeneral", "error");
const STATUS_WARNING = semanticVar("statusGeneral", "warning");
const STATUS_SUCCESS = semanticVar("statusGeneral", "success");
const BORDER_FOCUS = semanticVar("border", "focus");
const DISABLED_TEXT = semanticVar("stateDisabled", "text");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
  }

  /* ── Separator ──────────────────────────────────────────────────────────── */

  .separator {
    height: 1px;
    background: var(--ui-acc-separator-color, ${BORDER_MODERATE});
  }

  :host([emphasis="bold"]) .separator {
    height: 2px;
  }

  /* ── Header ─────────────────────────────────────────────────────────────── */

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    border: none;
    background: transparent;
    width: 100%;
    padding: 0;
    margin: 0;
    font-family: "Inter", sans-serif;
    color: var(--ui-acc-label-color, ${TEXT_PRIMARY});
    transition: background 0.15s ease;
  }

  .header:hover {
    background: var(--ui-acc-hover-bg, rgba(0, 0, 0, 0.04));
  }

  .header:focus-visible {
    outline: var(--ui-acc-focus-outline, 2px solid ${BORDER_FOCUS});
    outline-offset: -2px;
  }

  /* ── Content Left ───────────────────────────────────────────────────────── */

  .content-left {
    display: flex;
    align-items: center;
  }

  /* ── Leading icon slot ──────────────────────────────────────────────────── */

  .leading-icon {
    display: none;
    align-items: center;
    justify-content: center;
    line-height: 0;
    color: ${ICON_PRIMARY};
  }

  :host([leading-icon]) .leading-icon {
    display: inline-flex;
  }

  /* ── Label ──────────────────────────────────────────────────────────────── */

  .label {
    font-weight: 500;
  }

  :host([emphasis="bold"]) .label {
    font-weight: 700;
  }

  /* ── Content Right ──────────────────────────────────────────────────────── */

  .content-right {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 8px;
  }

  /* ── Status icon ────────────────────────────────────────────────────────── */

  .status-icon {
    display: none;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }

  .status-icon svg {
    width: 100%;
    height: 100%;
  }

  :host([status="error"]) .status-icon {
    display: inline-flex;
    color: ${STATUS_ERROR};
  }

  :host([status="warning"]) .status-icon {
    display: inline-flex;
    color: ${STATUS_WARNING};
  }

  :host([status="success"]) .status-icon {
    display: inline-flex;
    color: ${STATUS_SUCCESS};
  }

  /* ── Chevron ────────────────────────────────────────────────────────────── */

  .chevron {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    color: var(--ui-acc-chevron-color, ${ICON_PRIMARY});
    transition: transform 0.2s ease;
  }

  .chevron svg {
    width: 100%;
    height: 100%;
  }

  :host([expanded]) .chevron {
    transform: rotate(180deg);
  }

  /* ── Content panel ──────────────────────────────────────────────────────── */

  .content {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.2s ease;
    color: var(--ui-acc-content-color, ${TEXT_PRIMARY});
    font-family: "Inter", sans-serif;
    font-weight: 400;
  }
  :host([expanded]) .content {
    grid-template-rows: 1fr;
  }
  .content-inner {
    overflow: hidden;
    min-height: 0;
  }
  .content-body {
  }
  /* ── Size: m (default) ──────────────────────────────────────────────────── */

  :host .header,
  :host([size="m"]) .header {
    padding-top: 9px;
    padding-bottom: 10px;
  }

  :host .content-left,
  :host([size="m"]) .content-left {
    gap: 8px;
  }

  :host .label,
  :host([size="m"]) .label {
    font-size: 14px;
    line-height: 20px;
  }

  :host .leading-icon,
  :host([size="m"]) .leading-icon {
    width: 20px;
    height: 20px;
  }

  :host .chevron,
  :host([size="m"]) .chevron {
    width: 20px;
    height: 20px;
  }

  :host .status-icon,
  :host([size="m"]) .status-icon {
    width: 18px;
    height: 18px;
  }

  :host .content-body,
  :host([size="m"]) .content-body {
    padding-top: 12px;
    padding-bottom: 20px;
    font-size: 14px;
    line-height: 20px;
  }
  /* ── Size: s ────────────────────────────────────────────────────────────── */

  :host([size="s"]) .header {
    padding-top: 7px;
    padding-bottom: 8px;
  }

  :host([size="s"]) .content-left {
    gap: 8px;
  }

  :host([size="s"]) .label {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .leading-icon {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .chevron {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .status-icon {
    width: 14px;
    height: 14px;
  }

  :host([size="s"]) .content-body {
    padding-top: 8px;
    padding-bottom: 16px;
    font-size: 12px;
    line-height: 16px;
  }
  /* ── Size: l ────────────────────────────────────────────────────────────── */

  :host([size="l"]) .header {
    padding-top: 9px;
    padding-bottom: 10px;
  }

  :host([size="l"]) .content-left {
    gap: 12px;
  }

  :host([size="l"]) .label {
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .leading-icon {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .chevron {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .status-icon {
    width: 20px;
    height: 20px;
  }

  :host([size="l"]) .content-body {
    padding-top: 12px;
    padding-bottom: 24px;
    font-size: 16px;
    line-height: 24px;
  }
  /* ── Disabled ───────────────────────────────────────────────────────────── */

  :host([disabled]) {
    opacity: 1;
    pointer-events: none;
  }

  :host([disabled]) .header {
    color: var(--ui-acc-label-color, ${DISABLED_TEXT});
    cursor: default;
  }

  :host([disabled]) .chevron,
  :host([disabled]) .leading-icon {
    color: ${DISABLED_TEXT};
  }

  :host([disabled]) .content {
    color: ${DISABLED_TEXT};
  }

  /* ── Reduced motion ─────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .chevron,
    .content {
      transition-duration: 0.01ms !important;
    }
  }
`;


// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiAccordionItem extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "emphasis",
    "expanded",
    "leading-icon",
    "status",
    "disabled",
  ];

  private static _counter = 0;

  private _headerId: string;
  private _contentId: string;
  private _header: HTMLDivElement;
  private _contentPanel: HTMLDivElement;
  private _statusIcon: HTMLSpanElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const uid = `_acc_${UiAccordionItem._counter++}`;
    this._headerId = `${uid}_header`;
    this._contentId = `${uid}_content`;

    shadow.adoptedStyleSheets = [sheet];

    // Separator
    const separator = document.createElement("div");
    separator.className = "separator";
    shadow.appendChild(separator);

    // Header
    const header = document.createElement("div");
    header.className = "header";
    header.id = this._headerId;
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    header.setAttribute("aria-expanded", "false");
    header.setAttribute("aria-controls", this._contentId);

    // Content Left
    const contentLeft = document.createElement("div");
    contentLeft.className = "content-left";

    // Leading icon slot
    const leadingIcon = document.createElement("span");
    leadingIcon.className = "leading-icon";
    const iconSlot = document.createElement("slot");
    iconSlot.name = "icon";
    leadingIcon.appendChild(iconSlot);
    contentLeft.appendChild(leadingIcon);

    // Label slot
    const label = document.createElement("span");
    label.className = "label";
    const labelSlot = document.createElement("slot");
    labelSlot.name = "label";
    label.appendChild(labelSlot);
    contentLeft.appendChild(label);

    header.appendChild(contentLeft);

    // Content Right
    const contentRight = document.createElement("div");
    contentRight.className = "content-right";

    // Status icon
    const statusIcon = document.createElement("span");
    statusIcon.className = "status-icon";
    statusIcon.setAttribute("aria-hidden", "true");
    contentRight.appendChild(statusIcon);

    // Chevron
    const chevron = document.createElement("span");
    chevron.className = "chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.innerHTML = ICON_CHEVRON;
    contentRight.appendChild(chevron);

    header.appendChild(contentRight);
    shadow.appendChild(header);

    // Content panel
    const contentPanel = document.createElement("div");
    contentPanel.className = "content";
    contentPanel.id = this._contentId;
    contentPanel.setAttribute("role", "region");
    contentPanel.setAttribute("aria-labelledby", this._headerId);
    const contentInner = document.createElement("div");
    contentInner.className = "content-inner";
    const contentBody = document.createElement("div");
    contentBody.className = "content-body";
    const contentSlot = document.createElement("slot");
    contentBody.appendChild(contentSlot);
    contentInner.appendChild(contentBody);
    contentPanel.appendChild(contentInner);
    shadow.appendChild(contentPanel);

    this._header = header;
    this._contentPanel = contentPanel;
    this._statusIcon = statusIcon;

    // Event listeners
    header.addEventListener("click", () => this._toggle());
    header.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._toggle();
      }
    });
  }

  connectedCallback(): void {
    this._syncExpanded();
    this._syncStatus();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    if (name === "expanded") {
      this._syncExpanded();
    }
    if (name === "status") {
      this._syncStatus();
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): AccordionSize {
    return (this.getAttribute("size") as AccordionSize) ?? "m";
  }

  set size(value: AccordionSize) {
    this.setAttribute("size", value);
  }

  get emphasis(): AccordionEmphasis {
    return (this.getAttribute("emphasis") as AccordionEmphasis) ?? "subtle";
  }

  set emphasis(value: AccordionEmphasis) {
    this.setAttribute("emphasis", value);
  }

  get expanded(): boolean {
    return this.hasAttribute("expanded");
  }

  set expanded(value: boolean) {
    if (value) {
      this.setAttribute("expanded", "");
    } else {
      this.removeAttribute("expanded");
    }
  }

  get leadingIcon(): boolean {
    return this.hasAttribute("leading-icon");
  }

  set leadingIcon(value: boolean) {
    if (value) {
      this.setAttribute("leading-icon", "");
    } else {
      this.removeAttribute("leading-icon");
    }
  }

  get status(): AccordionStatus {
    return (this.getAttribute("status") as AccordionStatus) ?? "none";
  }

  set status(value: AccordionStatus) {
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

  private _toggle(): void {
    if (this.disabled) return;
    this.expanded = !this.expanded;
    this.dispatchEvent(
      new CustomEvent("toggle", {
        detail: { expanded: this.expanded },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _syncExpanded(): void {
    const expanded = this.expanded;
    this._header.setAttribute("aria-expanded", String(expanded));
  }

  private _syncStatus(): void {
    const status = this.status;
    switch (status) {
      case "error":
        this._statusIcon.innerHTML = ICON_ERROR;
        break;
      case "warning":
        this._statusIcon.innerHTML = ICON_WARNING;
        break;
      case "success":
        this._statusIcon.innerHTML = ICON_SUCCESS;
        break;
      default:
        this._statusIcon.innerHTML = "";
        break;
    }
  }
}

customElements.define("ui-accordion-item", UiAccordionItem);
