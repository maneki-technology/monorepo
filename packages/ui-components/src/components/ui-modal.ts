import { semanticVar, elevationVar, spaceVar, colorVar } from "@maneki/foundation";
import { ICON_CLOSE } from "../assets/icons.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type ModalSize = "s" | "m" | "l";
export type ModalLayout = "auto" | "fluid";

// ─── Token constants ─────────────────────────────────────────────────────────

const SURFACE_PRIMARY = semanticVar("surface", "primary");
const SURFACE_OVERLAY = semanticVar("surface", "overlay");
const TEXT_PRIMARY = semanticVar("text", "primary");
const TEXT_SECONDARY = semanticVar("text", "secondary");
const ICON_PRIMARY = semanticVar("icon", "primary");
const ELEVATION_06 = elevationVar("06");
const SP_1 = spaceVar("1");       // 8px
const SP_15 = spaceVar("1.5");    // 12px
const SP_2 = spaceVar("2");       // 16px
const SP_25 = spaceVar("2.5");    // 20px
const SP_3 = spaceVar("3");       // 24px

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

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--ui-modal-backdrop, ${SURFACE_OVERLAY});
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;
  }

  .backdrop.visible {
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
  }



  /* ── Dialog ──────────────────────────────────────────────────────────────── */

  .dialog {
    display: flex;
    flex-direction: column;
    background-color: var(--ui-modal-bg, ${SURFACE_PRIMARY});
    box-shadow: var(--ui-modal-shadow, ${ELEVATION_06});
    border-radius: 2px;
    font-family: "Inter", sans-serif;
    color: ${TEXT_PRIMARY};
    width: var(--ui-modal-width, 441px);
    opacity: 0;
    transform: translateY(-8px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .backdrop.visible .dialog {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── Fluid layout ────────────────────────────────────────────────────────── */

  :host([layout="fluid"]) .dialog {
    width: var(--ui-modal-width, 630px);
    height: var(--ui-modal-height, 405px);
    display: flex;
    flex-direction: column;
  }

  :host([layout="fluid"]) .body {
    flex: 1;
    overflow-y: auto;
  }

  /* ── Scrollbar styling ───────────────────────────────────────────────────── */

  .body::-webkit-scrollbar {
    width: 12px;
  }

  .body::-webkit-scrollbar-thumb {
    background-color: var(--ui-modal-scrollbar, ${colorVar("gray", 40)});
    border-radius: 12px;
    border: 3.5px solid transparent;
    background-clip: padding-box;
  }

  /* ── Content wrapper (header + body) ────────────────────────────────────── */

  .content {
    display: flex;
    flex-direction: column;
  }

  /* ── Header ──────────────────────────────────────────────────────────────── */

  .header {
    display: flex;
    gap: ${SP_1};
    align-items: start;
    justify-content: flex-end;
  }

  .title-group {
    flex: 1;
  }

  .title {
    color: ${TEXT_PRIMARY};
    font-weight: 500;
  }

  .subtitle {
    display: none;
    color: ${TEXT_SECONDARY};
    font-weight: 400;
    font-size: 11px;
    line-height: 16px;
  }

  :host([has-subtitle]) .subtitle {
    display: block;
  }

  /* ── Close button ────────────────────────────────────────────────────────── */

  .close-btn {
    display: none;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    color: ${ICON_PRIMARY};
    line-height: 0;
    flex-shrink: 0;
  }

  .close-btn svg {
    width: 100%;
    height: 100%;
  }

  :host([dismissible]) .close-btn {
    display: inline-flex;
  }

  /* ── Body ─────────────────────────────────────────────────────────────────── */

  .body {
    color: ${TEXT_PRIMARY};
  }

  /* ── Footer ──────────────────────────────────────────────────────────────── */

  .footer {
    display: none;
    align-items: center;
    justify-content: space-between;
  }

  :host([has-footer]) .footer {
    display: flex;
  }

  .footer-start {
    display: flex;
    align-items: center;
  }

  .footer-end {
    display: flex;
    gap: ${SP_1};
    align-items: center;
    margin-left: auto;
  }

  /* ── Size: m (default) ───────────────────────────────────────────────────── */

  :host .dialog,
  :host([size="m"]) .dialog {
    padding: ${SP_2};
    gap: ${SP_3};
  }

  :host .content,
  :host([size="m"]) .content {
    gap: ${SP_2};
  }

  :host .title,
  :host([size="m"]) .title {
    font-size: 16px;
    line-height: 24px;
  }

  :host .body,
  :host([size="m"]) .body {
    font-size: 14px;
    line-height: 20px;
  }

  :host .close-btn,
  :host([size="m"]) .close-btn {
    width: 20px;
    height: 20px;
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .dialog {
    padding: ${SP_15};
    gap: ${SP_25};
  }

  :host([size="s"]) .content {
    gap: ${SP_15};
  }

  :host([size="s"]) .title {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="s"]) .body {
    font-size: 12px;
    line-height: 16px;
  }

  :host([size="s"]) .close-btn {
    width: 16px;
    height: 16px;
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .dialog {
    padding: ${SP_25};
    gap: ${SP_3};
  }

  :host([size="l"]) .content {
    gap: ${SP_25};
  }

  :host([size="l"]) .title {
    font-size: 20px;
    line-height: 28px;
  }

  :host([size="l"]) .body {
    font-size: 14px;
    line-height: 20px;
  }

  :host([size="l"]) .close-btn {
    width: 20px;
    height: 20px;
  }

  /* ── Fluid layout overrides ──────────────────────────────────────────────── */

  :host([layout="fluid"]) .dialog {
    width: var(--ui-modal-width, 630px);
    height: var(--ui-modal-height, 405px);
  }

  :host([layout="fluid"]) .content {
    flex: 1;
    min-height: 0;
  }

  :host([layout="fluid"]) .body {
    flex: 1;
    overflow-y: auto;
  }
  /* ── Reduced motion ──────────────────────────────────────────────────────── */

  @media (prefers-reduced-motion: reduce) {
    .backdrop {
      transition-duration: 0.01ms !important;
    }
    .dialog {
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export class UiModal extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "open",
    "dismissible",
    "layout",
  ];

  private _backdrop!: HTMLElement;
  private _dialog!: HTMLElement;
  private _subtitleSlot!: HTMLSlotElement;
  private _footerStartSlot!: HTMLSlotElement;
  private _footerEndSlot!: HTMLSlotElement;
  private _previouslyFocused: Element | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = STYLES;
    shadow.appendChild(style);

    // Backdrop
    const backdrop = document.createElement("div");
    backdrop.className = "backdrop";

    // Dialog
    const dialog = document.createElement("div");
    dialog.className = "dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "modal-title");
    dialog.setAttribute("tabindex", "-1");

    // Header
    const header = document.createElement("div");
    header.className = "header";

    const titleGroup = document.createElement("div");
    titleGroup.className = "title-group";

    const subtitle = document.createElement("div");
    subtitle.className = "subtitle";
    const subtitleSlot = document.createElement("slot");
    subtitleSlot.name = "subtitle";
    subtitle.appendChild(subtitleSlot);
    titleGroup.appendChild(subtitle);

    const title = document.createElement("div");
    title.className = "title";
    title.id = "modal-title";
    const titleSlot = document.createElement("slot");
    title.appendChild(titleSlot);
    titleGroup.appendChild(title);

    header.appendChild(titleGroup);

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.innerHTML = ICON_CLOSE;
    closeBtn.addEventListener("click", () => this.close());
    header.appendChild(closeBtn);

    // Body
    const body = document.createElement("div");
    body.className = "body";
    const bodySlot = document.createElement("slot");
    bodySlot.name = "body";
    body.appendChild(bodySlot);

    // Content wrapper (header + body)
    const content = document.createElement("div");
    content.className = "content";
    content.appendChild(header);
    content.appendChild(body);
    dialog.appendChild(content);

    // Footer
    const footer = document.createElement("div");
    footer.className = "footer";

    const footerStart = document.createElement("div");
    footerStart.className = "footer-start";
    const footerStartSlot = document.createElement("slot");
    footerStartSlot.name = "footer-start";
    footerStart.appendChild(footerStartSlot);
    footer.appendChild(footerStart);

    const footerEnd = document.createElement("div");
    footerEnd.className = "footer-end";
    const footerEndSlot = document.createElement("slot");
    footerEndSlot.name = "footer-end";
    footerEnd.appendChild(footerEndSlot);
    footer.appendChild(footerEnd);

    dialog.appendChild(footer);
    backdrop.appendChild(dialog);
    shadow.appendChild(backdrop);

    this._backdrop = backdrop;
    this._dialog = dialog;
    this._subtitleSlot = subtitleSlot;
    this._footerStartSlot = footerStartSlot;
    this._footerEndSlot = footerEndSlot;

    // Backdrop click
    backdrop.addEventListener("click", (e: Event) => {
      if (e.target === backdrop && this.dismissible) {
        this.close();
      }
    });

    // Slot change listeners
    subtitleSlot.addEventListener("slotchange", () => this._syncSubtitle());
    footerStartSlot.addEventListener("slotchange", () => this._syncFooter());
    footerEndSlot.addEventListener("slotchange", () => this._syncFooter());
  }

  connectedCallback(): void {
    document.addEventListener("keydown", this._handleKeydown);
    this._syncSubtitle();
    this._syncFooter();
  }

  disconnectedCallback(): void {
    document.removeEventListener("keydown", this._handleKeydown);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    switch (name) {
      case "open":
        this._syncOpen();
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): ModalSize {
    return (this.getAttribute("size") as ModalSize) ?? "m";
  }

  set size(value: ModalSize) {
    this.setAttribute("size", value);
  }

  get layout(): ModalLayout {
    return (this.getAttribute("layout") as ModalLayout) ?? "auto";
  }

  set layout(value: ModalLayout) {
    this.setAttribute("layout", value);
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(value: boolean) {
    if (value) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
    }
  }

  get dismissible(): boolean {
    return this.hasAttribute("dismissible");
  }

  set dismissible(value: boolean) {
    if (value) {
      this.setAttribute("dismissible", "");
    } else {
      this.removeAttribute("dismissible");
    }
  }

  // ── Public methods ─────────────────────────────────────────────────────

  show(): void {
    this.open = true;
  }

  close(): void {
    const event = new CustomEvent("close", {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    this.dispatchEvent(event);
    if (!event.defaultPrevented) {
      this._animateOut();
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncOpen(): void {
    if (this.open) {
      this._previouslyFocused = document.activeElement;
      // Double-raf for animation trigger
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this._backdrop.classList.add("visible");
          this._dialog.focus();
        });
      });
    } else {
      // Direct attribute removal — clean up immediately
      this._backdrop.classList.remove("visible");
      if (this._previouslyFocused && this._previouslyFocused instanceof HTMLElement) {
        this._previouslyFocused.focus();
        this._previouslyFocused = null;
      }
    }
  }

  private _animateOut(): void {
    this._backdrop.classList.remove("visible");
    const onEnd = () => {
      this._backdrop.removeEventListener("transitionend", onEnd);
      this.removeAttribute("open");
      // Return focus to previously focused element
      if (this._previouslyFocused && this._previouslyFocused instanceof HTMLElement) {
        this._previouslyFocused.focus();
        this._previouslyFocused = null;
      }
    };
    this._backdrop.addEventListener("transitionend", onEnd, { once: true });
    // Fallback if transitionend doesn't fire (e.g. reduced motion, no transition)
    setTimeout(onEnd, 250);
  }

  private _syncSubtitle(): void {
    const nodes = this._subtitleSlot.assignedNodes({ flatten: true });
    if (nodes.length > 0) {
      this.setAttribute("has-subtitle", "");
    } else {
      this.removeAttribute("has-subtitle");
    }
  }

  private _syncFooter(): void {
    const startNodes = this._footerStartSlot.assignedNodes({ flatten: true });
    const endNodes = this._footerEndSlot.assignedNodes({ flatten: true });
    if (startNodes.length > 0 || endNodes.length > 0) {
      this.setAttribute("has-footer", "");
    } else {
      this.removeAttribute("has-footer");
    }
  }

  private _handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Escape" && this.open && this.dismissible) {
      this.close();
    }
  };
}

customElements.define("ui-modal", UiModal);
