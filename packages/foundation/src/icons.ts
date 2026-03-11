/**
 * Material Symbols icon codepoint map.
 *
 * The design system ships a subsetted woff2 (~24 KB) containing only the
 * glyphs listed here.  Components reference icons by their codepoint
 * constant (e.g. `ICON_CLOSE`) rather than ligature text so the font
 * file can stay small.
 *
 * To add a new icon see the SOP in `packages/foundation/AGENTS.md`.
 */

// ── Icon codepoint constants ────────────────────────────────────────
// Each value is the Unicode character for the icon glyph.

/** warning — U+E002 */
export const ICON_WARNING = "\uE002";
/** error — U+E000 */
export const ICON_ERROR = "\uE000";
/** check_circle — U+E86C */
export const ICON_CHECK_CIRCLE = "\uE86C";
/** progress_activity (spinner) — U+E9D0 */
export const ICON_PROGRESS_ACTIVITY = "\uE9D0";
/** close — U+E5CD */
export const ICON_CLOSE = "\uE5CD";
/** cancel (filled circled X) — U+E5C9 */
export const ICON_CANCEL = "\uE5C9";
/** expand_more (chevron down) — U+E5CF */
export const ICON_EXPAND_MORE = "\uE5CF";
/** visibility — U+E8F4 */
export const ICON_VISIBILITY = "\uE8F4";
/** visibility_off — U+E8F5 */
export const ICON_VISIBILITY_OFF = "\uE8F5";
/** arrow_drop_up — U+E5C7 */
export const ICON_ARROW_DROP_UP = "\uE5C7";
/** arrow_drop_down — U+E5C5 */
export const ICON_ARROW_DROP_DOWN = "\uE5C5";
/** info — U+E88E */
export const ICON_INFO = "\uE88E";
/** notifications — U+E7F4 */
export const ICON_NOTIFICATIONS = "\uE7F4";
/** search — U+E8B6 */
export const ICON_SEARCH = "\uE8B6";
/** attach_money — U+E227 */
export const ICON_ATTACH_MONEY = "\uE227";
/** mail — U+E158 */
export const ICON_MAIL = "\uE158";
/** account_circle — U+E853 */
export const ICON_ACCOUNT_CIRCLE = "\uE853";
/** add_circle — U+E147 */
export const ICON_ADD_CIRCLE = "\uE147";
/** share — U+E80D */
export const ICON_SHARE = "\uE80D";
/** download — U+F090 */
export const ICON_DOWNLOAD = "\uF090";
/** upload — U+F09B */
export const ICON_UPLOAD = "\uF09B";
/** more_vert — U+E5D4 */
export const ICON_MORE_VERT = "\uE5D4";
/** more_horiz — U+E5D3 */
export const ICON_MORE_HORIZ = "\uE5D3";
/** home — U+E88A */
export const ICON_HOME = "\uE88A";
/** person — U+E7FD */
export const ICON_PERSON = "\uE7FD";
/** bar_chart — U+E26B */
export const ICON_BAR_CHART = "\uE26B";
/** settings — U+E8B8 */
export const ICON_SETTINGS = "\uE8B8";
/** group — U+E7EF */
export const ICON_GROUP = "\uE7EF";

// ── Reverse lookup (name → codepoint) ───────────────────────────────

/** All icon names included in the subset font. */
export const ICON_CODEPOINTS: Record<string, string> = {
  warning: ICON_WARNING,
  error: ICON_ERROR,
  check_circle: ICON_CHECK_CIRCLE,
  progress_activity: ICON_PROGRESS_ACTIVITY,
  close: ICON_CLOSE,
  cancel: ICON_CANCEL,
  expand_more: ICON_EXPAND_MORE,
  visibility: ICON_VISIBILITY,
  visibility_off: ICON_VISIBILITY_OFF,
  arrow_drop_up: ICON_ARROW_DROP_UP,
  arrow_drop_down: ICON_ARROW_DROP_DOWN,
  info: ICON_INFO,
  notifications: ICON_NOTIFICATIONS,
  search: ICON_SEARCH,
  attach_money: ICON_ATTACH_MONEY,
  mail: ICON_MAIL,
  account_circle: ICON_ACCOUNT_CIRCLE,
  add_circle: ICON_ADD_CIRCLE,
  share: ICON_SHARE,
  download: ICON_DOWNLOAD,
  upload: ICON_UPLOAD,
  more_vert: ICON_MORE_VERT,
  more_horiz: ICON_MORE_HORIZ,
  home: ICON_HOME,
  person: ICON_PERSON,
  bar_chart: ICON_BAR_CHART,
  settings: ICON_SETTINGS,
  group: ICON_GROUP,
};

// ── Font registration ───────────────────────────────────────────────

/**
 * Register the subset Material Symbols Outlined font on the document.
 *
 * Call once at app startup (or in Storybook preview).  Components in
 * Shadow DOM pick up the font via `@font-face { src: local(...) }`.
 *
 * @param fontUrl – URL to the subset woff2 file.  In Storybook this is
 *   typically an import with `?url` suffix; in production it depends on
 *   the bundler / asset pipeline.
 */
export function registerIconFont(fontUrl: string): Promise<FontFace> {
  const face = new FontFace(
    "Material Symbols Outlined",
    `url(${fontUrl}) format('woff2')`,
    { style: "normal", weight: "100 700" },
  );
  document.fonts.add(face);
  return face.load();
}
