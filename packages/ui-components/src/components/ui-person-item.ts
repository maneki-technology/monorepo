import { STYLES } from "./ui-person-item.styles.js";
import { ICON_MAIL, ICON_PHONE, ICON_MESSAGE } from "@maneki/foundation";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PersonItemSize = "xs" | "s" | "m" | "l";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiPersonItem extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "name",
    "title",
    "location",
    "name-only",
    "avatar-text",
  ];

  #nameEl!: HTMLElement;
  #titleEl!: HTMLElement;
  #locationEl!: HTMLElement;
  #avatarSlot!: HTMLElement;
  #actionsEl!: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.adoptedStyleSheets = [sheet];

    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    // Contents row
    const contents = document.createElement("div");
    contents.className = "contents";

    // Avatar slot
    this.#avatarSlot = document.createElement("div");
    this.#avatarSlot.className = "avatar-slot";
    const avatarSlotEl = document.createElement("slot");
    avatarSlotEl.name = "avatar";
    this.#avatarSlot.appendChild(avatarSlotEl);

    // Labels
    const labels = document.createElement("div");
    labels.className = "labels";

    this.#nameEl = document.createElement("div");
    this.#nameEl.className = "name";

    this.#titleEl = document.createElement("div");
    this.#titleEl.className = "title";

    this.#locationEl = document.createElement("div");
    this.#locationEl.className = "location";

    // Actions
    this.#actionsEl = document.createElement("div");
    this.#actionsEl.className = "actions";
    const actionsSlot = document.createElement("slot");
    actionsSlot.name = "actions";
    this.#actionsEl.appendChild(actionsSlot);

    labels.append(this.#nameEl, this.#titleEl, this.#locationEl);
    contents.append(this.#avatarSlot, labels, this.#actionsEl);

    // Separator
    const separator = document.createElement("div");
    separator.className = "separator";

    wrapper.append(contents, separator);
    shadow.appendChild(wrapper);
  }

  connectedCallback(): void {
    if (!this.hasAttribute("size")) {
      this.setAttribute("size", "s");
    }
    this._syncDefaultAvatar();
    this._syncDefaultActions();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ): void {
    switch (name) {
      case "name":
        this.#nameEl.textContent = newValue ?? "";
        break;
      case "title":
        this.#titleEl.textContent = newValue ?? "";
        break;
      case "location":
        this.#locationEl.textContent = newValue ?? "";
        break;
      case "avatar-text":
        this._syncDefaultAvatar();
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): PersonItemSize {
    return (this.getAttribute("size") as PersonItemSize) ?? "s";
  }
  set size(v: PersonItemSize) {
    this.setAttribute("size", v);
  }

  get personName(): string {
    return this.getAttribute("name") ?? "";
  }
  set personName(v: string) {
    this.setAttribute("name", v);
  }

  get personTitle(): string {
    return this.getAttribute("title") ?? "";
  }
  set personTitle(v: string) {
    this.setAttribute("title", v);
  }

  get location(): string {
    return this.getAttribute("location") ?? "";
  }
  set location(v: string) {
    this.setAttribute("location", v);
  }

  get nameOnly(): boolean {
    return this.hasAttribute("name-only");
  }
  set nameOnly(v: boolean) {
    if (v) this.setAttribute("name-only", "");
    else this.removeAttribute("name-only");
  }

  get avatarText(): string {
    return this.getAttribute("avatar-text") ?? "";
  }
  set avatarText(v: string) {
    this.setAttribute("avatar-text", v);
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private _syncDefaultAvatar(): void {
    // Only create default avatar if no slotted avatar
    const slot = this.#avatarSlot.querySelector("slot") as HTMLSlotElement;
    if (!slot) return;

    // Check if user provided a slotted avatar
    const assigned = slot.assignedElements();
    if (assigned.length > 0) return;

    // Create default ui-avatar if not already present
    let defaultAvatar = this.#avatarSlot.querySelector("ui-avatar");
    if (!defaultAvatar) {
      defaultAvatar = document.createElement("ui-avatar");
      defaultAvatar.setAttribute("type", "icon");
      defaultAvatar.setAttribute("emphasis", "bold");
      this.#avatarSlot.appendChild(defaultAvatar);
    }

    // Sync size
    const sizeMap: Record<string, string> = { xs: "s", s: "s", m: "m", l: "l" };
    defaultAvatar.setAttribute("size", sizeMap[this.size] ?? "s");

    // If avatar-text is set, switch to text type
    const text = this.getAttribute("avatar-text");
    if (text) {
      defaultAvatar.setAttribute("type", "text");
      defaultAvatar.textContent = text;
    }
  }

  private _syncDefaultActions(): void {
    // Only create default actions if no slotted actions
    const slot = this.#actionsEl.querySelector("slot") as HTMLSlotElement;
    if (!slot) return;

    const assigned = slot.assignedElements();
    if (assigned.length > 0) return;

    const iconMap: Record<string, string> = {
      mail: ICON_MAIL,
      phone: ICON_PHONE,
      message: ICON_MESSAGE,
    };
    const iconNames = ["mail", "phone", "message"];
    for (const iconName of iconNames) {
      let existing = this.#actionsEl.querySelector(`[data-action="${iconName}"]`);
      if (!existing) {
        const iconEl = document.createElement("span");
        iconEl.className = "action-icon";
        iconEl.dataset.action = iconName;
        const i = document.createElement("span");
        i.className = "material-symbols-outlined";
        i.textContent = iconMap[iconName];
        iconEl.appendChild(i);
        this.#actionsEl.appendChild(iconEl);
      }
    }
  }
}

customElements.define("ui-person-item", UiPersonItem);
