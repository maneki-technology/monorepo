import { STYLES } from "./ui-popover.styles.js";
import { ICON_CLOSE } from "@maneki/foundation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PopoverSize = "s" | "m";
export type PopoverPlacement =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "left-top"
  | "left-center"
  | "left-bottom"
  | "right-top"
  | "right-center"
  | "right-bottom";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiPopover extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "placement",
    "dismissable",
    "open",
    "title-text",
    "description",
  ];

  #titleEl!: HTMLElement;
  #descriptionEl!: HTMLElement;
  #closeBtn!: HTMLButtonElement;
  #panel!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    // Trigger slot
    const triggerSlot = document.createElement("slot");
    triggerSlot.name = "trigger";

    // Panel
    this.#panel = document.createElement("div");
    this.#panel.className = "panel";
    this.#panel.setAttribute("role", "dialog");

    // Arrow
    const arrow = document.createElement("div");
    arrow.className = "arrow";

    // Base
    const base = document.createElement("div");
    base.className = "base";

    // Content
    const content = document.createElement("div");
    content.className = "content";

    this.#titleEl = document.createElement("div");
    this.#titleEl.className = "title-text";

    this.#descriptionEl = document.createElement("div");
    this.#descriptionEl.className = "description-text";

    // Default slot for custom content
    const defaultSlot = document.createElement("slot");

    content.append(this.#titleEl, this.#descriptionEl, defaultSlot);

    // Close button
    this.#closeBtn = document.createElement("button");
    this.#closeBtn.className = "close";
    this.#closeBtn.type = "button";
    this.#closeBtn.setAttribute("aria-label", "Close");
    const closeIcon = document.createElement("span");
    closeIcon.className = "material-symbols-outlined";
    closeIcon.textContent = ICON_CLOSE;
    this.#closeBtn.appendChild(closeIcon);

    base.append(content, this.#closeBtn);
    this.#panel.append(arrow, base);

    shadow.append(triggerSlot, this.#panel);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("placement")) {
      this.setAttribute("placement", "top-center");
    }
    // Link panel to title for screen readers
    const panelId = `popover-${Math.random().toString(36).slice(2, 8)}`;
    this.#panel.id = panelId;
    if (this.titleText) {
      this.#titleEl.id = `${panelId}-title`;
      this.#panel.setAttribute("aria-labelledby", `${panelId}-title`);
    }

    this.#closeBtn.addEventListener("click", (e) => { e.stopPropagation(); this._close(); });

    // Click on trigger toggles popover
    this.addEventListener("click", (e) => {
      const trigger = (e.target as HTMLElement).closest("[slot='trigger']");
      if (trigger) {
        e.stopPropagation();
        this._toggle();
      }
    });

    // Close on outside click
    this._onDocumentClick = this._onDocumentClick.bind(this);
    document.addEventListener("click", this._onDocumentClick);

    // Close on Escape
    this._onKeyDown = this._onKeyDown.bind(this);
    document.addEventListener("keydown", this._onKeyDown);
  }

  disconnectedCallback(): void {
    document.removeEventListener("click", this._onDocumentClick);
    document.removeEventListener("keydown", this._onKeyDown);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    switch (name) {
      case "title-text":
        this.#titleEl.textContent = newValue ?? "";
        break;
      case "description":
        this.#descriptionEl.textContent = newValue ?? "";
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): PopoverSize {
    return (this.getAttribute("size") as PopoverSize) ?? "m";
  }
  set size(v: PopoverSize) {
    this.setAttribute("size", v);
  }

  get placement(): PopoverPlacement {
    return (this.getAttribute("placement") as PopoverPlacement) ?? "top-center";
  }
  set placement(v: PopoverPlacement) {
    this.setAttribute("placement", v);
  }

  get dismissable(): boolean {
    return this.hasAttribute("dismissable");
  }
  set dismissable(v: boolean) {
    if (v) this.setAttribute("dismissable", "");
    else this.removeAttribute("dismissable");
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }
  set open(v: boolean) {
    if (v) this.setAttribute("open", "");
    else this.removeAttribute("open");
  }

  get titleText(): string {
    return this.getAttribute("title-text") ?? "";
  }
  set titleText(v: string) {
    this.setAttribute("title-text", v);
  }

  get description(): string {
    return this.getAttribute("description") ?? "";
  }
  set description(v: string) {
    this.setAttribute("description", v);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _toggle(): void {
    if (this.open) this._close();
    else this._open();
  }

  private _open(): void {
    this.setAttribute("open", "");
    // Move focus into the panel
    requestAnimationFrame(() => {
      const firstFocusable = this.#panel.querySelector<HTMLElement>('button, [tabindex="0"]');
      if (firstFocusable) firstFocusable.focus();
      else this.#panel.setAttribute("tabindex", "-1"), this.#panel.focus();
    });
    this.dispatchEvent(
      new CustomEvent("popover-open", { bubbles: true, composed: true }),
    );
  }

  private _close(): void {
    this.removeAttribute("open");
    // Return focus to trigger
    const trigger = this.querySelector<HTMLElement>('[slot="trigger"]');
    if (trigger) trigger.focus();
    this.dispatchEvent(
      new CustomEvent("popover-close", { bubbles: true, composed: true }),
    );
  }

  private _onDocumentClick(e: MouseEvent): void {
    if (!this.open) return;
    if (this.contains(e.target as Node)) return;
    this._close();
  }

  private _onKeyDown(e: KeyboardEvent): void {
    if (!this.open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      this._close();
    }
  }
}

customElements.define("ui-popover", UiPopover);
