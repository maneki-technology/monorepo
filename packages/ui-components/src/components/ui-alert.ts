import { semanticVar } from "@maneki/foundation";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type AlertSize = "s" | "m" | "l";
export type AlertEmphasis = "bold" | "subtle";
export type AlertStatus =
  | "none"
  | "information"
  | "success"
  | "error"
  | "warning";

import { ICON_CLOSE } from "../assets/icons.js";

// ─── Token constants ─────────────────────────────────────────────────────────

// Bold surfaces
const SURF_NONE_BOLD = semanticVar("statusSurface", "noneBold");
const SURF_INFO_BOLD = semanticVar("statusSurface", "informationBold");
const SURF_SUCCESS_BOLD = semanticVar("statusSurface", "successBold");
const SURF_ERROR_BOLD = semanticVar("statusSurface", "errorBold");
const SURF_WARNING_BOLD = semanticVar("statusSurface", "warningBold");

// Bold text
const TEXT_NONE_BOLD = semanticVar("statusText", "noneBoldText");
const TEXT_INFO_BOLD = semanticVar("statusText", "informationBoldText");
const TEXT_SUCCESS_BOLD = semanticVar("statusText", "successBoldText");
const TEXT_ERROR_BOLD = semanticVar("statusText", "errorBoldText");
const TEXT_WARNING_BOLD = semanticVar("statusText", "warningBoldText");

// Bold icon
const ICON_NONE_BOLD = semanticVar("statusIcon", "noneBoldIcon");
const ICON_INFO_BOLD = semanticVar("statusIcon", "informationBoldIcon");
const ICON_SUCCESS_BOLD = semanticVar("statusIcon", "successBoldIcon");
const ICON_ERROR_BOLD = semanticVar("statusIcon", "errorBoldIcon");
const ICON_WARNING_BOLD = semanticVar("statusIcon", "warningBoldIcon");

// Subtle surfaces
const SURF_NONE_SUBTLE = semanticVar("statusSurface", "noneSubtle");
const SURF_INFO_SUBTLE = semanticVar("statusSurface", "informationSubtle");
const SURF_SUCCESS_SUBTLE = semanticVar("statusSurface", "successSubtle");
const SURF_ERROR_SUBTLE = semanticVar("statusSurface", "errorSubtle");
const SURF_WARNING_SUBTLE = semanticVar("statusSurface", "warningSubtle");

// Subtle text
const TEXT_NONE_SUBTLE = semanticVar("statusText", "noneSubtleText");
const TEXT_INFO_SUBTLE = semanticVar("statusText", "informationSubtleText");
const TEXT_SUCCESS_SUBTLE = semanticVar("statusText", "successSubtleText");
const TEXT_ERROR_SUBTLE = semanticVar("statusText", "errorSubtleText");
const TEXT_WARNING_SUBTLE = semanticVar("statusText", "warningSubtleText");

// Subtle icon
const ICON_NONE_SUBTLE = semanticVar("statusIcon", "noneSubtleIcon");
const ICON_INFO_SUBTLE = semanticVar("statusIcon", "informationSubtleIcon");
const ICON_SUCCESS_SUBTLE = semanticVar("statusIcon", "successSubtleIcon");
const ICON_ERROR_SUBTLE = semanticVar("statusIcon", "errorSubtleIcon");
const ICON_WARNING_SUBTLE = semanticVar("statusIcon", "warningSubtleIcon");

// ─── Styles ──────────────────────────────────────────────────────────────────

const STYLES = /* css */ `
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    opacity: 1;
    transition: opacity 0.2s ease;
  }
  :host([dismissed]) {
    opacity: 0;
    pointer-events: none;
  }

  /* ── Base ─────────────────────────────────────────────────────────────────── */

  .base {
    display: flex;
    flex-direction: column;
    border-radius: 2px;
    font-family: "Inter", sans-serif;
  }

  /* ── Top content ─────────────────────────────────────────────────────────── */

  .top-content {
    display: flex;
    flex-direction: row;
    gap: 16px;
    align-items: start;
  }

  .top-left {
    display: flex;
    flex-direction: row;
    flex: 1;
    align-items: center;
    gap: 8px;
  }

  .top-right {
    display: flex;
    flex-direction: row;
    align-items: start;
  }

  /* ── Leading icon ────────────────────────────────────────────────────────── */

  .leading-icon {
    display: none;
    align-items: center;
    justify-content: center;
    line-height: 0;
    flex-shrink: 0;
  }

  :host([leading-icon]) .leading-icon {
    display: inline-flex;
  }

  .leading-icon ::slotted(*) {
    width: 100%;
    height: 100%;
  }

  /* ── Title ───────────────────────────────────────────────────────────────── */

  .title {
    flex: 1;
    font-weight: 400;
  }

  :host([has-description]) .title {
    font-weight: 500;
  }

  /* ── Description ─────────────────────────────────────────────────────────── */

  .description {
    display: none;
  }

  :host([has-description]) .description {
    display: block;
  }

  :host([has-description]) .base {
    gap: 12px;
  }

  /* ── Footer ──────────────────────────────────────────────────────────────── */

  .footer {
    display: none;
  }

  :host([has-footer]) .footer {
    display: block;
  }

  /* ── Close button ────────────────────────────────────────────────────────── */

  .close-btn {
    display: none;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    color: inherit;
    line-height: 0;
  }

  .close-btn svg {
    width: 100%;
    height: 100%;
  }

  :host([dismissable]) .close-btn {
    display: inline-flex;
  }

  /* ── Size: m (default) ───────────────────────────────────────────────────── */

  :host .base,
  :host([size="m"]) .base {
    padding: 12px;
  }

  :host .title,
  :host([size="m"]) .title {
    font-size: 14px;
    line-height: 20px;
  }

  :host .description,
  :host([size="m"]) .description {
    font-size: 14px;
    line-height: 20px;
  }

  :host .leading-icon,
  :host([size="m"]) .leading-icon {
    width: 20px;
    height: 20px;
  }

  :host .close-btn,
  :host([size="m"]) .close-btn {
    width: 20px;
    height: 20px;
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .base {
    padding: 8px;
  }

  :host([size="s"]) .title {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .description {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .leading-icon {
    width: 16px;
    height: 16px;
  }

  :host([size="s"]) .close-btn {
    width: 16px;
    height: 16px;
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .base {
    padding: 16px;
  }

  :host([size="l"]) .title {
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .description {
    font-size: 16px;
    line-height: 24px;
  }

  :host([size="l"]) .leading-icon {
    width: 24px;
    height: 24px;
  }

  :host([size="l"]) .close-btn {
    width: 24px;
    height: 24px;
  }

  /* ── Status + Emphasis: bold (default) ───────────────────────────────────── */

  :host .base,
  :host([status="none"]) .base,
  :host([status="none"][emphasis="bold"]) .base {
    background-color: var(--ui-alert-bg, ${SURF_NONE_BOLD});
    color: var(--ui-alert-text, ${TEXT_NONE_BOLD});
  }

  :host .leading-icon,
  :host([status="none"]) .leading-icon,
  :host([status="none"][emphasis="bold"]) .leading-icon {
    color: var(--ui-alert-icon, ${ICON_NONE_BOLD});
  }

  :host([status="information"]) .base,
  :host([status="information"][emphasis="bold"]) .base {
    background-color: var(--ui-alert-bg, ${SURF_INFO_BOLD});
    color: var(--ui-alert-text, ${TEXT_INFO_BOLD});
  }

  :host([status="information"]) .leading-icon,
  :host([status="information"][emphasis="bold"]) .leading-icon {
    color: var(--ui-alert-icon, ${ICON_INFO_BOLD});
  }

  :host([status="success"]) .base,
  :host([status="success"][emphasis="bold"]) .base {
    background-color: var(--ui-alert-bg, ${SURF_SUCCESS_BOLD});
    color: var(--ui-alert-text, ${TEXT_SUCCESS_BOLD});
  }

  :host([status="success"]) .leading-icon,
  :host([status="success"][emphasis="bold"]) .leading-icon {
    color: var(--ui-alert-icon, ${ICON_SUCCESS_BOLD});
  }

  :host([status="error"]) .base,
  :host([status="error"][emphasis="bold"]) .base {
    background-color: var(--ui-alert-bg, ${SURF_ERROR_BOLD});
    color: var(--ui-alert-text, ${TEXT_ERROR_BOLD});
  }

  :host([status="error"]) .leading-icon,
  :host([status="error"][emphasis="bold"]) .leading-icon {
    color: var(--ui-alert-icon, ${ICON_ERROR_BOLD});
  }

  :host([status="warning"]) .base,
  :host([status="warning"][emphasis="bold"]) .base {
    background-color: var(--ui-alert-bg, ${SURF_WARNING_BOLD});
    color: var(--ui-alert-text, ${TEXT_WARNING_BOLD});
  }

  :host([status="warning"]) .leading-icon,
  :host([status="warning"][emphasis="bold"]) .leading-icon {
    color: var(--ui-alert-icon, ${ICON_WARNING_BOLD});
  }

  /* ── Status + Emphasis: subtle ───────────────────────────────────────────── */

  :host([emphasis="subtle"]) .base,
  :host([status="none"][emphasis="subtle"]) .base {
    background-color: var(--ui-alert-bg, ${SURF_NONE_SUBTLE});
    color: var(--ui-alert-text, ${TEXT_NONE_SUBTLE});
  }

  :host([emphasis="subtle"]) .leading-icon,
  :host([status="none"][emphasis="subtle"]) .leading-icon {
    color: var(--ui-alert-icon, ${ICON_NONE_SUBTLE});
  }

  :host([status="information"][emphasis="subtle"]) .base {
    background-color: var(--ui-alert-bg, ${SURF_INFO_SUBTLE});
    color: var(--ui-alert-text, ${TEXT_INFO_SUBTLE});
  }

  :host([status="information"][emphasis="subtle"]) .leading-icon {
    color: var(--ui-alert-icon, ${ICON_INFO_SUBTLE});
  }

  :host([status="success"][emphasis="subtle"]) .base {
    background-color: var(--ui-alert-bg, ${SURF_SUCCESS_SUBTLE});
    color: var(--ui-alert-text, ${TEXT_SUCCESS_SUBTLE});
  }

  :host([status="success"][emphasis="subtle"]) .leading-icon {
    color: var(--ui-alert-icon, ${ICON_SUCCESS_SUBTLE});
  }

  :host([status="error"][emphasis="subtle"]) .base {
    background-color: var(--ui-alert-bg, ${SURF_ERROR_SUBTLE});
    color: var(--ui-alert-text, ${TEXT_ERROR_SUBTLE});
  }

  :host([status="error"][emphasis="subtle"]) .leading-icon {
    color: var(--ui-alert-icon, ${ICON_ERROR_SUBTLE});
  }

  :host([status="warning"][emphasis="subtle"]) .base {
    background-color: var(--ui-alert-bg, ${SURF_WARNING_SUBTLE});
    color: var(--ui-alert-text, ${TEXT_WARNING_SUBTLE});
  }

  :host([status="warning"][emphasis="subtle"]) .leading-icon {
    color: var(--ui-alert-icon, ${ICON_WARNING_SUBTLE});
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export class UiAlert extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "emphasis",
    "status",
    "dismissable",
    "leading-icon",
  ];

  private _descriptionSlot: HTMLSlotElement;
  private _footerSlot: HTMLSlotElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

    // .base
    const base = document.createElement("div");
    base.className = "base";

    // .top-content
    const topContent = document.createElement("div");
    topContent.className = "top-content";

    // .top-left
    const topLeft = document.createElement("div");
    topLeft.className = "top-left";

    // Leading icon
    const leadingIcon = document.createElement("span");
    leadingIcon.className = "leading-icon";
    const iconSlot = document.createElement("slot");
    iconSlot.name = "icon";
    leadingIcon.appendChild(iconSlot);
    topLeft.appendChild(leadingIcon);

    // Title (default slot)
    const title = document.createElement("span");
    title.className = "title";
    const titleSlot = document.createElement("slot");
    title.appendChild(titleSlot);
    topLeft.appendChild(title);

    topContent.appendChild(topLeft);

    // .top-right
    const topRight = document.createElement("div");
    topRight.className = "top-right";

    // Action slot
    const actionSlot = document.createElement("slot");
    actionSlot.name = "action";
    topRight.appendChild(actionSlot);

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.setAttribute("aria-label", "Dismiss");
    closeBtn.innerHTML = ICON_CLOSE;
    closeBtn.addEventListener("click", () => this._dismiss());
    topRight.appendChild(closeBtn);

    topContent.appendChild(topRight);
    base.appendChild(topContent);

    // Description slot
    const description = document.createElement("div");
    description.className = "description";
    const descriptionSlot = document.createElement("slot");
    descriptionSlot.name = "description";
    description.appendChild(descriptionSlot);
    base.appendChild(description);

    // Footer slot
    const footer = document.createElement("div");
    footer.className = "footer";
    const footerSlot = document.createElement("slot");
    footerSlot.name = "footer";
    footer.appendChild(footerSlot);
    base.appendChild(footer);

    shadow.appendChild(base);

    this._descriptionSlot = descriptionSlot;
    this._footerSlot = footerSlot;

    // Listen for slotchange to toggle has-description attribute
    descriptionSlot.addEventListener("slotchange", () =>
      this._syncDescription(),
    );

    // Listen for slotchange to toggle has-footer attribute
    footerSlot.addEventListener("slotchange", () =>
      this._syncFooter(),
    );
  }

  connectedCallback(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "alert");
    }
    this._syncDescription();
    this._syncFooter();
    document.addEventListener("keydown", this._handleKeydown);
  }
  disconnectedCallback(): void {
    document.removeEventListener("keydown", this._handleKeydown);
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    // All styling is handled via :host([attr]) CSS selectors — no JS sync needed
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): AlertSize {
    return (this.getAttribute("size") as AlertSize) ?? "m";
  }

  set size(value: AlertSize) {
    this.setAttribute("size", value);
  }

  get emphasis(): AlertEmphasis {
    return (this.getAttribute("emphasis") as AlertEmphasis) ?? "bold";
  }

  set emphasis(value: AlertEmphasis) {
    this.setAttribute("emphasis", value);
  }

  get status(): AlertStatus {
    return (this.getAttribute("status") as AlertStatus) ?? "none";
  }

  set status(value: AlertStatus) {
    this.setAttribute("status", value);
  }

  get dismissable(): boolean {
    return this.hasAttribute("dismissable");
  }

  set dismissable(value: boolean) {
    if (value) {
      this.setAttribute("dismissable", "");
    } else {
      this.removeAttribute("dismissable");
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

  // ── Private ─────────────────────────────────────────────────────────────

  private _dismiss(): void {
    const event = new CustomEvent("dismiss", {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    const dispatched = this.dispatchEvent(event);
    if (dispatched && !event.defaultPrevented) {
      this.setAttribute("dismissed", "");
      this.addEventListener(
        "transitionend",
        () => {
          this.remove();
        },
        { once: true },
      );
    }
  }

  private _syncDescription(): void {
    const nodes = this._descriptionSlot.assignedNodes({ flatten: true });
    if (nodes.length > 0) {
      this.setAttribute("has-description", "");
    } else {
      this.removeAttribute("has-description");
    }
  }

  private _syncFooter(): void {
    const nodes = this._footerSlot.assignedNodes({ flatten: true });
    if (nodes.length > 0) {
      this.setAttribute("has-footer", "");
    } else {
      this.removeAttribute("has-footer");
    }
  }
  private _handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Escape" && this.dismissable && !this.hasAttribute("dismissed")) {
      this._dismiss();
    }
  };
}

customElements.define("ui-alert", UiAlert);
