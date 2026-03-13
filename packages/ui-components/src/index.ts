// ─── Primitives ──────────────────────────────────────────────────────────────

export { UiBadge } from "./components/ui-badge.js";
export type { BadgeSize, BadgeEmphasis, BadgeShape, BadgeColor, BadgeStatus } from "./components/ui-badge.js";
export { UiImage } from "./components/ui-image.js";
export type { ImageRatio, ImageFit } from "./components/ui-image.js";
export { UiButton } from "./components/ui-button.js";
export type {
  ButtonAction,
  ButtonEmphasis,
  ButtonSize,
  ButtonShape,
  ButtonIcon,
  ButtonStatus,
} from "./components/ui-button.js";
export { UiAvatar } from "./components/ui-avatar.js";
export type {
  AvatarSize,
  AvatarType,
  AvatarEmphasis,
  AvatarShape,
  AvatarStatus,
  AvatarColor,
} from "./components/ui-avatar.js";
export { UiAlert } from "./components/ui-alert.js";
export type {
  AlertSize,
  AlertEmphasis,
  AlertStatus,
} from "./components/ui-alert.js";
export { UiTag } from "./components/ui-tag.js";
export type { TagSize, TagType, TagEmphasis, TagState, TagColor } from "./components/ui-tag.js";

// ─── Form Controls ──────────────────────────────────────────────────────────

export { UiLabel } from "./components/ui-label.js";
export type { LabelSize, LabelEmphasis } from "./components/ui-label.js";
export { UiCheckboxItem } from "./components/ui-checkbox-item.js";
export type { CheckboxSize, CheckboxLabel } from "./components/ui-checkbox-item.js";
export { UiCheckboxGroup } from "./components/ui-checkbox-group.js";
export type { CheckboxGroupOrientation } from "./components/ui-checkbox-group.js";
export { UiRadioItem } from "./components/ui-radio-item.js";
export type { RadioSize, RadioLabel } from "./components/ui-radio-item.js";
export { UiRadioGroup } from "./components/ui-radio-group.js";
export type { RadioGroupOrientation } from "./components/ui-radio-group.js";
export { UiInput } from "./components/ui-input.js";
export type { InputSize, InputType, InputStatus } from "./components/ui-input.js";
export { UiInputGroup } from "./components/ui-input-group.js";
export type { InputGroupSize } from "./components/ui-input-group.js";
export { UiFileUpload } from "./components/ui-file-upload.js";
export type { FileUploadSize } from "./components/ui-file-upload.js";
export { UiSelect } from "./components/ui-select.js";
export type { SelectSize, SelectStatus } from "./components/ui-select.js";
export { UiTextarea } from "./components/ui-textarea.js";
export type { TextareaSize, TextareaStatus } from "./components/ui-textarea.js";

// ─── Containers ─────────────────────────────────────────────────────────────

export { UiCard } from "./components/ui-card.js";
export type { CardSize, CardElevation } from "./components/ui-card.js";
export { UiButtonGroup } from "./components/ui-button-group.js";

// ─── Navigation ─────────────────────────────────────────────────────────────

export { UiBreadcrumbItem } from "./components/ui-breadcrumb-item.js";
export type { BreadcrumbSize } from "./components/ui-breadcrumb-item.js";
export { UiBreadcrumbGroup } from "./components/ui-breadcrumb-group.js";
export { UiSidePanelMenu } from "./components/ui-side-panel-menu.js";
export type { SidePanelMenuState } from "./components/ui-side-panel-menu.js";
export { UiSidePanelMenuItem } from "./components/ui-side-panel-menu-item.js";
export type { SidePanelMenuItemLevel, SidePanelMenuItemType } from "./components/ui-side-panel-menu-item.js";

// ─── Disclosure ─────────────────────────────────────────────────────────────

export { UiAccordionItem } from "./components/ui-accordion-item.js";
export type {
  AccordionSize,
  AccordionEmphasis,
  AccordionStatus,
} from "./components/ui-accordion-item.js";
export { UiAccordionGroup } from "./components/ui-accordion-group.js";

// ─── Menus & Dropdowns ──────────────────────────────────────────────────────

export { UiDropdown } from "./components/ui-dropdown.js";
export type { DropdownSize, DropdownAction, DropdownEmphasis, DropdownShape } from "./components/ui-dropdown.js";
export { UiDropdownItem } from "./components/ui-dropdown-item.js";
export type { DropdownItemSize, DropdownItemLeading } from "./components/ui-dropdown-item.js";
export { UiDropdownHeading } from "./components/ui-dropdown-heading.js";
export { UiDropdownSeparator } from "./components/ui-dropdown-separator.js";
export { UiDropdownSplit } from "./components/ui-dropdown-split.js";
export type { DropdownSplitSize, DropdownSplitAction, DropdownSplitEmphasis, DropdownSplitShape, DropdownSplitIcon } from "./components/ui-dropdown-split.js";
export { UiMenu } from "./components/ui-menu.js";
export type { MenuSize } from "./components/ui-menu.js";

// ─── Overlays ───────────────────────────────────────────────────────────────

export { UiModal } from "./components/ui-modal.js";
export type { ModalSize, ModalLayout } from "./components/ui-modal.js";

// ─── Tabs ──────────────────────────────────────────────────────────────────

export { UiTabItem } from "./components/ui-tab-item.js";
export type { TabItemSize, TabItemOrientation } from "./components/ui-tab-item.js";
export { UiTabGroup } from "./components/ui-tab-group.js";
export type { TabGroupOverflow } from "./components/ui-tab-group.js";

// ─── Icons ──────────────────────────────────────────────────────────────────

export { UiIcon } from "./components/ui-icon.js";
export type { IconSize, IconState } from "./components/ui-icon.js";

// ─── Data Display ────────────────────────────────────────────────────────────

export { UiTable } from "./components/ui-table.js";
export type { TableSize, TableSeparator } from "./components/ui-table.js";
export { UiTableRow } from "./components/ui-table-row.js";
export { UiTableCell } from "./components/ui-table-cell.js";
export type { TableCellAlign } from "./components/ui-table-cell.js";

// ─── Carousel ────────────────────────────────────────────────────────────────

export { UiCarousel } from "./components/ui-carousel.js";
export { UiCarouselItem } from "./components/ui-carousel-item.js";

// ─── Calendar ────────────────────────────────────────────────────────────────

export { UiCalendar } from "./components/ui-calendar.js";
export type { CalendarSize, CalendarMode, CalendarView, CalendarEvent } from "./components/ui-calendar.js";

// ─── Date Picker Input ───────────────────────────────────────────────────────

export { UiDatetimePickerInput } from "./components/ui-datetime-picker-input.js";
export type { DatetimePickerInputSize, DatetimePickerInputType, DatetimePickerInputStatus } from "./components/ui-datetime-picker-input.js";

// ─── Date Picker ───────────────────────────────────────────────────────────

export { UiDatetimePicker } from "./components/ui-datetime-picker.js";
export type { DatetimePickerSize, DatetimePickerType } from "./components/ui-datetime-picker.js";

// ─── Clock ─────────────────────────────────────────────────────────────────

export { UiClock } from "./components/ui-clock.js";
export type { ClockSize, ClockMode } from "./components/ui-clock.js";

// ─── Calendar Composables ────────────────────────────────────────────────────

export { UiCalendarQuicklinks } from "./components/ui-calendar-quicklinks.js";
export type { QuicklinksSize, QuicklinksOrientation, QuicklinkItem } from "./components/ui-calendar-quicklinks.js";
export { UiCalendarTime } from "./components/ui-calendar-time.js";
export type { CalendarTimeSize } from "./components/ui-calendar-time.js";
