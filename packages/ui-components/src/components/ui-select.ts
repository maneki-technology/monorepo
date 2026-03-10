import { STYLES, STATUS_ICON_MAP } from "./ui-select.styles.js";
import "./ui-label.js";

// ─── Type-safe property unions ───────────────────────────────────────────────

export type SelectSize = "s" | "m" | "l";
export type SelectStatus = "none" | "warning" | "error" | "success" | "loading";

// ─── Component ───────────────────────────────────────────────────────────────

const sheet = new CSSStyleSheet();
sheet.replaceSync(STYLES);

export class UiSelect extends HTMLElement {
  static readonly observedAttributes = [
    "size",
    "label",
    "secondary-label",
    "supportive",
    "placeholder",
    "disabled",
    "readonly",
    "open",
    "multiple",
    "status",
    "error",
    "value",
    "name",
  ];

  private _trigger: HTMLDivElement;
  private _displayValue: HTMLSpanElement;
  private _clearBtn: HTMLButtonElement;
  private _statusIconEl: HTMLSpanElement;
  private _statusIconInner: HTMLSpanElement;
  private _chevron: HTMLSpanElement;
  private _panel: HTMLDivElement;
  private _slot: HTMLSlotElement;
  private _labelTextEl: HTMLElement;
  private _secondaryLabelEl: HTMLElement;
  private _supportiveTextEl: HTMLDivElement;
  private _supportiveId: string;
  private _panelId: string;
  private _selectedValues: Set<string> = new Set();

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    shadow.adoptedStyleSheets = [sheet];

    // ── Label row ──────────────────────────────────────────────────────
    const labelRow = document.createElement("div");
    labelRow.className = "label-row";

    this._labelTextEl = document.createElement("ui-label");
    this._labelTextEl.setAttribute("emphasis", "bold");
    labelRow.appendChild(this._labelTextEl);

    this._secondaryLabelEl = document.createElement("ui-label");
    this._secondaryLabelEl.setAttribute("emphasis", "subtle");
    labelRow.appendChild(this._secondaryLabelEl);

    shadow.appendChild(labelRow);

    // ── Trigger ────────────────────────────────────────────────────────
    this._panelId = "panel-" + Math.random().toString(36).slice(2, 8);

    const trigger = document.createElement("div");
    trigger.className = "trigger";
    trigger.setAttribute("role", "combobox");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", this._panelId);
    trigger.setAttribute("tabindex", "0");

    // Leading slot
    const leadingSlot = document.createElement("span");
    leadingSlot.className = "leading-slot";
    const leadingSlotEl = document.createElement("slot");
    leadingSlotEl.name = "leading";
    leadingSlot.appendChild(leadingSlotEl);
    leadingSlotEl.addEventListener("slotchange", () => {
      const hasContent = leadingSlotEl.assignedElements().length > 0;
      leadingSlot.classList.toggle("has-content", hasContent);
    });
    trigger.appendChild(leadingSlot);

    // Display value
    this._displayValue = document.createElement("span");
    this._displayValue.className = "display-value placeholder";
    trigger.appendChild(this._displayValue);

    // Content right
    const contentRight = document.createElement("span");
    contentRight.className = "content-right";

    // Clear button
    this._clearBtn = document.createElement("button");
    this._clearBtn.className = "clear-btn";
    this._clearBtn.type = "button";
    this._clearBtn.setAttribute("aria-label", "Clear selection");
    this._clearBtn.setAttribute("tabindex", "-1");
    const clearIcon = document.createElement("span");
    clearIcon.className = "material-symbols-outlined";
    clearIcon.textContent = "cancel";
    this._clearBtn.appendChild(clearIcon);
    contentRight.appendChild(this._clearBtn);

    // Status icon
    this._statusIconEl = document.createElement("span");
    this._statusIconEl.className = "status-icon";
    this._statusIconEl.setAttribute("aria-hidden", "true");
    this._statusIconInner = document.createElement("span");
    this._statusIconInner.className = "material-symbols-outlined";
    this._statusIconEl.appendChild(this._statusIconInner);
    contentRight.appendChild(this._statusIconEl);

    // Chevron
    this._chevron = document.createElement("span");
    this._chevron.className = "chevron";
    this._chevron.setAttribute("aria-hidden", "true");
    const chevronIcon = document.createElement("span");
    chevronIcon.className = "material-symbols-outlined";
    chevronIcon.textContent = "expand_more";
    this._chevron.appendChild(chevronIcon);
    contentRight.appendChild(this._chevron);

    trigger.appendChild(contentRight);

    // Trigger wrapper (positioning context for panel)
    const triggerWrapper = document.createElement("div");
    triggerWrapper.className = "trigger-wrapper";
    triggerWrapper.appendChild(trigger);
    this._trigger = trigger;

    // ── Panel ──────────────────────────────────────────────────────────
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.setAttribute("role", "listbox");
    panel.id = this._panelId;

    this._slot = document.createElement("slot");
    panel.appendChild(this._slot);
    triggerWrapper.appendChild(panel);
    shadow.appendChild(triggerWrapper);
    this._panel = panel;

    // ── Supportive text ────────────────────────────────────────────────
    this._supportiveId = "supportive-" + Math.random().toString(36).slice(2, 8);
    this._supportiveTextEl = document.createElement("div");
    this._supportiveTextEl.className = "supportive-text";
    this._supportiveTextEl.id = this._supportiveId;
    shadow.appendChild(this._supportiveTextEl);

    // ── Event listeners ────────────────────────────────────────────────
    trigger.addEventListener("click", this._handleTriggerClick);
    trigger.addEventListener("keydown", this._handleTriggerKeydown);
    this._clearBtn.addEventListener("click", this._handleClear);
    this._slot.addEventListener("slotchange", this._handleSlotChange);
    this.addEventListener("select", this._handleItemSelect as EventListener);
  }

  connectedCallback(): void {
    document.addEventListener("click", this._handleOutsideClick);
    this._syncLabels();
    this._syncSupportive();
    this._syncStatusIcon();
    this._syncPlaceholder();
    this._syncAria();
    this._syncClearVisibility();
    this._syncOpen();
    this._propagateSize();
    this._syncValueFromAttr();
  }

  disconnectedCallback(): void {
    document.removeEventListener("click", this._handleOutsideClick);
    this.removeEventListener("select", this._handleItemSelect as EventListener);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ): void {
    switch (name) {
      case "value":
        this._syncValueFromAttr();
        this._syncClearVisibility();
        break;
      case "placeholder":
        this._syncPlaceholder();
        break;
      case "disabled":
        this._syncAria();
        this._syncClearVisibility();
        this._syncLabels();
        break;
      case "readonly":
        this._syncAria();
        this._syncClearVisibility();
        break;
      case "open":
        this._syncOpen();
        break;
      case "size":
        this._syncLabels();
        this._propagateSize();
        break;
      case "status":
      case "error":
        this._syncStatusIcon();
        this._syncAria();
        break;
      case "label":
      case "secondary-label":
        this._syncLabels();
        this._syncAria();
        break;
      case "supportive":
        this._syncSupportive();
        this._syncAria();
        break;
      case "multiple":
        this._renderDisplayValue();
        break;
    }
  }

  // ── Property accessors ──────────────────────────────────────────────────

  get size(): SelectSize {
    return (this.getAttribute("size") as SelectSize) ?? "m";
  }
  set size(value: SelectSize) {
    this.setAttribute("size", value);
  }

  get label(): string {
    return this.getAttribute("label") ?? "";
  }
  set label(value: string) {
    if (value) {
      this.setAttribute("label", value);
    } else {
      this.removeAttribute("label");
    }
  }

  get secondaryLabel(): string {
    return this.getAttribute("secondary-label") ?? "";
  }
  set secondaryLabel(value: string) {
    if (value) {
      this.setAttribute("secondary-label", value);
    } else {
      this.removeAttribute("secondary-label");
    }
  }

  get supportive(): string {
    return this.getAttribute("supportive") ?? "";
  }
  set supportive(value: string) {
    if (value) {
      this.setAttribute("supportive", value);
    } else {
      this.removeAttribute("supportive");
    }
  }

  get placeholder(): string {
    return this.getAttribute("placeholder") ?? "Select an option";
  }
  set placeholder(value: string) {
    this.setAttribute("placeholder", value);
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

  get readonly(): boolean {
    return this.hasAttribute("readonly");
  }
  set readonly(value: boolean) {
    if (value) {
      this.setAttribute("readonly", "");
    } else {
      this.removeAttribute("readonly");
    }
  }

  get open(): boolean {
    return this.hasAttribute("open");
  }
  set open(value: boolean) {
    if (value && !this.disabled && !this.readonly) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
    }
  }

  get multiple(): boolean {
    return this.hasAttribute("multiple");
  }
  set multiple(value: boolean) {
    if (value) {
      this.setAttribute("multiple", "");
    } else {
      this.removeAttribute("multiple");
    }
  }

  get status(): SelectStatus {
    return (this.getAttribute("status") as SelectStatus) ?? "none";
  }
  set status(value: SelectStatus) {
    this.setAttribute("status", value);
  }

  get error(): boolean {
    return this.hasAttribute("error");
  }
  set error(value: boolean) {
    if (value) {
      this.setAttribute("error", "");
    } else {
      this.removeAttribute("error");
    }
  }

  get name(): string {
    return this.getAttribute("name") ?? "";
  }
  set name(value: string) {
    this.setAttribute("name", value);
  }

  get value(): string | string[] {
    if (this.multiple) {
      return Array.from(this._selectedValues);
    }
    const vals = Array.from(this._selectedValues);
    return vals.length > 0 ? vals[0] : "";
  }
  set value(v: string | string[]) {
    if (Array.isArray(v)) {
      this._selectedValues = new Set(v);
    } else {
      this._selectedValues = v ? new Set([v]) : new Set();
    }
    this._syncItemSelection();
    this._renderDisplayValue();
    this._syncClearVisibility();
  }

  // ── Private sync methods ───────────────────────────────────────────────

  private _syncLabels(): void {
    this._labelTextEl.textContent = this.label;
    this._secondaryLabelEl.textContent = this.secondaryLabel;
    const size = this.getAttribute("size") || "m";
    this._labelTextEl.setAttribute("size", size);
    this._secondaryLabelEl.setAttribute("size", size);
    if (this.disabled) {
      this._labelTextEl.setAttribute("disabled", "");
      this._secondaryLabelEl.setAttribute("disabled", "");
    } else {
      this._labelTextEl.removeAttribute("disabled");
      this._secondaryLabelEl.removeAttribute("disabled");
    }
  }

  private _syncSupportive(): void {
    this._supportiveTextEl.textContent = this.supportive;
  }

  private _syncStatusIcon(): void {
    const effectiveStatus = this.error ? "error" : this.status;
    const iconName = STATUS_ICON_MAP[effectiveStatus];
    if (iconName) {
      this._statusIconInner.textContent = iconName;
    } else {
      this._statusIconInner.textContent = "";
    }
  }

  private _syncPlaceholder(): void {
    if (this._selectedValues.size === 0) {
      this._displayValue.textContent = this.placeholder;
      this._displayValue.classList.add("placeholder");
    }
  }

  private _syncOpen(): void {
    const isOpen = this.open;
    this._trigger.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      this._panel.setAttribute("aria-multiselectable", String(this.multiple));
    }
    this.dispatchEvent(
      new CustomEvent("toggle", {
        bubbles: true,
        composed: true,
        detail: { open: isOpen },
      }),
    );
  }

  private _syncClearVisibility(): void {
    const hasValue = this._selectedValues.size > 0;
    const canClear = hasValue && !this.disabled && !this.readonly;
    if (canClear) {
      this._clearBtn.classList.add("visible");
    } else {
      this._clearBtn.classList.remove("visible");
    }
  }

  private _syncAria(): void {
    const effectiveStatus = this.error ? "error" : this.status;
    if (effectiveStatus === "error") {
      this._trigger.setAttribute("aria-invalid", "true");
    } else {
      this._trigger.removeAttribute("aria-invalid");
    }
    if (this.disabled) {
      this.setAttribute("aria-disabled", "true");
      this._trigger.setAttribute("tabindex", "-1");
    } else {
      this.removeAttribute("aria-disabled");
      this._trigger.setAttribute("tabindex", "0");
    }
    if (this.readonly) {
      this.setAttribute("aria-readonly", "true");
    } else {
      this.removeAttribute("aria-readonly");
    }
    if (this.supportive) {
      this._trigger.setAttribute("aria-describedby", this._supportiveId);
    } else {
      this._trigger.removeAttribute("aria-describedby");
    }
    if (this.label) {
      this._trigger.setAttribute("aria-label", this.label);
      this.setAttribute("aria-label", this.label);
    } else {
      const hostAriaLabel = this.getAttribute("aria-label");
      if (hostAriaLabel) {
        this._trigger.setAttribute("aria-label", hostAriaLabel);
      }
    }
  }

  private _syncValueFromAttr(): void {
    const attrVal = this.getAttribute("value");
    if (attrVal === null) return;
    if (this.multiple) {
      const vals = attrVal.split(",").map((s) => s.trim()).filter(Boolean);
      this._selectedValues = new Set(vals);
    } else {
      this._selectedValues = attrVal ? new Set([attrVal]) : new Set();
    }
    this._syncItemSelection();
    this._renderDisplayValue();
  }

  private _syncItemSelection(): void {
    const items = this._getSlottedItems();
    for (const item of items) {
      const itemValue = item.getAttribute("value") ?? item.textContent?.trim() ?? "";
      if (this._selectedValues.has(itemValue)) {
        item.setAttribute("selected", "");
        item.setAttribute("aria-selected", "true");
      } else {
        item.removeAttribute("selected");
        item.setAttribute("aria-selected", "false");
      }
    }
  }

  private _propagateSize(): void {
    const size = this.size;
    const children = this._slot
      .assignedElements({ flatten: true })
      .filter((el) => ["UI-DROPDOWN-ITEM", "UI-DROPDOWN-HEADING"].includes(el.tagName));
    for (const child of children) {
      child.setAttribute("size", size);
      if (child.tagName === "UI-DROPDOWN-ITEM") {
        child.setAttribute("role", "option");
      }
    }
  }

  private _renderDisplayValue(): void {
    while (this._displayValue.firstChild) {
      this._displayValue.removeChild(this._displayValue.firstChild);
    }

    if (this._selectedValues.size === 0) {
      this._displayValue.textContent = this.placeholder;
      this._displayValue.classList.add("placeholder");
      return;
    }

    this._displayValue.classList.remove("placeholder");

    if (this.multiple) {
      const items = this._getSlottedItems();
      for (const val of this._selectedValues) {
        const matchItem = items.find(
          (el) => (el.getAttribute("value") ?? el.textContent?.trim() ?? "") === val,
        );
        const displayText = matchItem?.textContent?.trim() ?? val;

        const tag = document.createElement("span");
        tag.className = "tag";

        const tagLabel = document.createElement("span");
        tagLabel.className = "tag-label";
        tagLabel.textContent = displayText;
        tag.appendChild(tagLabel);

        const dismiss = document.createElement("button");
        dismiss.className = "tag-dismiss";
        dismiss.type = "button";
        dismiss.setAttribute("aria-label", "Remove " + displayText);
        dismiss.setAttribute("tabindex", "-1");
        const dismissIcon = document.createElement("span");
        dismissIcon.className = "material-symbols-outlined";
        dismissIcon.textContent = "close";
        dismiss.appendChild(dismissIcon);
        tag.appendChild(dismiss);

        dismiss.addEventListener("click", (e: Event) => {
          e.stopPropagation();
          if (this.disabled || this.readonly) return;
          this._selectedValues.delete(val);
          this._syncItemSelection();
          this._renderDisplayValue();
          this._syncClearVisibility();
          this._fireChange();
        });

        this._displayValue.appendChild(tag);
      }
    } else {
      const items = this._getSlottedItems();
      const val = Array.from(this._selectedValues)[0];
      const matchItem = items.find(
        (el) => (el.getAttribute("value") ?? el.textContent?.trim() ?? "") === val,
      );
      this._displayValue.textContent = matchItem?.textContent?.trim() ?? val;
    }
  }

  private _getSlottedItems(): Element[] {
    return this._slot
      .assignedElements({ flatten: true })
      .filter((el) => el.tagName === "UI-DROPDOWN-ITEM");
  }

  private _fireChange(): void {
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: { value: this.value },
      }),
    );
  }

  // ── Event handlers ─────────────────────────────────────────────────────

  private _handleTriggerClick = (e: Event): void => {
    if ((e.target as HTMLElement).closest?.(".clear-btn")) return;
    if (this.disabled || this.readonly) return;
    this.open = !this.open;
  };

  private _handleTriggerKeydown = (e: Event): void => {
    const ke = e as KeyboardEvent;

    if (ke.key === "Escape" && this.open) {
      ke.preventDefault();
      this.open = false;
      this._trigger.focus();
      return;
    }

    if (ke.key === "Tab" && this.open) {
      this.open = false;
      return;
    }

    if (!this.open) {
      if (ke.key === "ArrowDown" || ke.key === "ArrowUp" || ke.key === "Enter" || ke.key === " ") {
        if (this.disabled || this.readonly) return;
        ke.preventDefault();
        this.open = true;
        this._focusItem(ke.key === "ArrowUp" ? -1 : 0);
      }
      return;
    }

    // Panel is open — navigate items
    const items = this._getSlottedItems().filter(
      (el) => !el.hasAttribute("disabled"),
    ) as HTMLElement[];
    if (items.length === 0) return;

    const active = items.findIndex(
      (el) => el === document.activeElement || el.matches(":focus"),
    );
    let next: number | null = null;

    switch (ke.key) {
      case "ArrowDown":
        next = active < 0 ? 0 : (active + 1) % items.length;
        break;
      case "ArrowUp":
        next = active < 0 ? items.length - 1 : (active - 1 + items.length) % items.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = items.length - 1;
        break;
      case "Enter":
      case " ":
        ke.preventDefault();
        if (active >= 0) {
          items[active].click();
        }
        return;
      default:
        return;
    }

    ke.preventDefault();
    items[next].focus();
  };

  private _handleOutsideClick = (e: Event): void => {
    if (this.open && !e.composedPath().includes(this)) {
      this.open = false;
    }
  };

  private _handleClear = (e: Event): void => {
    e.stopPropagation();
    this._selectedValues.clear();
    this._syncItemSelection();
    this._renderDisplayValue();
    this._syncClearVisibility();
    this.dispatchEvent(
      new CustomEvent("clear", { bubbles: true, composed: true }),
    );
    this._fireChange();
    this._trigger.focus();
  };

  private _handleSlotChange = (): void => {
    this._propagateSize();
    this._syncItemSelection();
    this._renderDisplayValue();
    this._syncClearVisibility();
  };

  private _handleItemSelect = (e: Event): void => {
    const item = e.target as HTMLElement;
    if (item.tagName !== "UI-DROPDOWN-ITEM") return;

    const itemValue = item.getAttribute("value") ?? item.textContent?.trim() ?? "";

    if (this.multiple) {
      if (this._selectedValues.has(itemValue)) {
        this._selectedValues.delete(itemValue);
      } else {
        this._selectedValues.add(itemValue);
      }
    } else {
      this._selectedValues.clear();
      this._selectedValues.add(itemValue);
      this.open = false;
      this._trigger.focus();
    }

    this._syncItemSelection();
    this._renderDisplayValue();
    this._syncClearVisibility();
    this._fireChange();
  };

  private _focusItem(index: number): void {
    requestAnimationFrame(() => {
      const items = this._getSlottedItems().filter(
        (el) => !el.hasAttribute("disabled"),
      ) as HTMLElement[];
      if (items.length === 0) return;
      const target = index < 0 ? items.length - 1 : Math.min(index, items.length - 1);
      items[target].focus();
    });
  }
}

customElements.define("ui-select", UiSelect);
