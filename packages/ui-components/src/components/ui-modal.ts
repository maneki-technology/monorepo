
import {
  ELEVATION_06,
  FONT_PRIMARY,
  ICON_PRIMARY,
  RADIUS_SM,
  SP_1,
  SP_1_5,
  SP_2,
  SP_2_5,
  SP_3,
  SURFACE_BOLD,
  SURFACE_OVERLAY,
  SURFACE_PRIMARY,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TYPE_BODY_01,
  TYPE_BODY_02,
  TYPE_BODY_03,
  TYPE_CAPTION_01,
  TYPE_HEADING_04,
} from "@maneki/foundation";
import "./ui-icon.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type ModalSize = "s" | "m" | "l";
export type ModalLayout = "auto" | "fluid";
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
    border-radius: var(--ui-modal-radius, ${RADIUS_SM});
    font-family: ${FONT_PRIMARY};
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
  }

  :host([layout="fluid"]) .content {
    flex: 1;
    min-height: 0;
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
    background-color: var(--ui-modal-scrollbar, ${SURFACE_BOLD});
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
    ${TYPE_CAPTION_01}
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
    border-radius: var(--ui-modal-close-radius, 0);
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
    border-top: var(--ui-modal-footer-border, none);
    padding-top: var(--ui-modal-footer-pt, 0);
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
    padding: var(--ui-modal-padding, ${SP_2});
    gap: var(--ui-modal-gap, ${SP_3});
  }

  :host .content,
  :host([size="m"]) .content {
    gap: ${SP_2};
  }

  :host .title,
  :host([size="m"]) .title {
    ${TYPE_BODY_01}
  }

  :host .body,
  :host([size="m"]) .body {
    ${TYPE_BODY_02}
  }

  :host .close-btn,
  :host([size="m"]) .close-btn {
    --ui-icon-size: 20px;
  }

  /* ── Size: s ─────────────────────────────────────────────────────────────── */

  :host([size="s"]) .dialog {
    padding: ${SP_1_5};
    gap: ${SP_2_5};
  }

  :host([size="s"]) .content {
    gap: ${SP_1_5};
  }

  :host([size="s"]) .title {
    ${TYPE_BODY_02}
  }

  :host([size="s"]) .body {
    ${TYPE_BODY_03}
  }

  :host([size="s"]) .close-btn {
    --ui-icon-size: 16px;
  }

  /* ── Size: l ─────────────────────────────────────────────────────────────── */

  :host([size="l"]) .dialog {
    padding: var(--ui-modal-padding-l, ${SP_2_5});
    gap: var(--ui-modal-gap, ${SP_3});
  }

  :host([size="l"]) .content {
    gap: ${SP_2_5};
  }

  :host([size="l"]) .title {
    ${TYPE_HEADING_04}
  }

  :host([size="l"]) .body {
    ${TYPE_BODY_02}
  }

  :host([size="l"]) .close-btn {
    --ui-icon-size: 20px;
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

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

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

    shadow.adoptedStyleSheets = [sheet];

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
    const closeIcon = document.createElement("ui-icon") as HTMLElement;
    closeIcon.setAttribute("name", "close");
    closeBtn.addEventListener("click", () => this.close());
    closeBtn.appendChild(closeIcon);
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

  private _getFocusableElements(): HTMLElement[] {
    const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const shadowEls = Array.from(this._dialog.querySelectorAll(selector)) as HTMLElement[];
    const slotEls: HTMLElement[] = [];
    for (const slot of Array.from(this._dialog.querySelectorAll('slot'))) {
      for (const node of (slot as HTMLSlotElement).assignedElements({ flatten: true })) {
        if (node instanceof HTMLElement && node.matches(selector)) {
          slotEls.push(node);
        }
        if (node instanceof HTMLElement) {
          slotEls.push(...Array.from(node.querySelectorAll(selector)) as HTMLElement[]);
        }
      }
    }
    return [...shadowEls, ...slotEls].filter((el) => el.offsetParent !== null || el.tagName === 'SUMMARY');
  }

  private _handleKeydown = (e: KeyboardEvent): void => {
    if (!this.open) return;
    if (e.key === "Escape" && this.dismissible) {
      this.close();
      return;
    }
    // Focus trap: cycle Tab/Shift+Tab within the dialog
    if (e.key === "Tab") {
      const focusable = this._getFocusableElements();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && this._getDeepActiveElement() === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && this._getDeepActiveElement() === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  /** Walk shadowRoot.activeElement chain to find the truly focused element. */
  private _getDeepActiveElement(): Element | null {
    let active: Element | null = document.activeElement;
    while (active?.shadowRoot?.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return active;
  }
}

customElements.define("ui-modal", UiModal);
