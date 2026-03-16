import { registerPage } from "../registry.js";

registerPage("menu", {
  title: "Menu",
  section: "Menus & Dropdowns",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row" style="position:relative;min-height:200px;gap:48px">
      ${["s", "m", "l"].map(size =>
        `<div class="variant-col">
          <span class="variant-label">${size.toUpperCase()}</span>
          <ui-menu size="${size}" open class="pos-relative">
            <ui-dropdown-item value="a">Option A</ui-dropdown-item>
            <ui-dropdown-item value="b">Option B</ui-dropdown-item>
            <ui-dropdown-item value="c">Option C</ui-dropdown-item>
          </ui-menu>
        </div>`
      ).join("")}
    </div>

    <h3>With Headings &amp; Separators</h3>
    <div class="variant-row" style="position:relative;min-height:320px">
      <ui-menu size="m" open class="pos-relative">
        <ui-dropdown-heading>Edit</ui-dropdown-heading>
        <ui-dropdown-item value="cut">Cut</ui-dropdown-item>
        <ui-dropdown-item value="copy">Copy</ui-dropdown-item>
        <ui-dropdown-item value="paste">Paste</ui-dropdown-item>
        <ui-dropdown-separator></ui-dropdown-separator>
        <ui-dropdown-heading>File</ui-dropdown-heading>
        <ui-dropdown-item value="save">Save</ui-dropdown-item>
        <ui-dropdown-item value="save-as">Save as…</ui-dropdown-item>
        <ui-dropdown-item value="export">Export</ui-dropdown-item>
      </ui-menu>
    </div>

    <h3>With Disabled Items</h3>
    <div class="variant-row" style="position:relative;min-height:220px">
      <ui-menu size="m" open class="pos-relative">
        <ui-dropdown-item value="cut">Cut</ui-dropdown-item>
        <ui-dropdown-item value="copy">Copy</ui-dropdown-item>
        <ui-dropdown-item value="paste" disabled>Paste</ui-dropdown-item>
        <ui-dropdown-separator></ui-dropdown-separator>
        <ui-dropdown-item value="delete" disabled>Delete</ui-dropdown-item>
      </ui-menu>
    </div>

    <h3>Single Select</h3>
    <div class="variant-row" style="position:relative;min-height:240px">
      <ui-menu size="m" open selectable class="pos-relative">
        <ui-dropdown-heading>Sort by</ui-dropdown-heading>
        <ui-dropdown-item value="name" selected>Name</ui-dropdown-item>
        <ui-dropdown-item value="date">Date modified</ui-dropdown-item>
        <ui-dropdown-item value="size">Size</ui-dropdown-item>
        <ui-dropdown-item value="type">Type</ui-dropdown-item>
      </ui-menu>
    </div>

    <h3>Multi Select</h3>
    <div class="variant-row" style="position:relative;min-height:260px">
      <ui-menu size="m" open selectable multiple class="pos-relative">
        <ui-dropdown-heading>Show columns</ui-dropdown-heading>
        <ui-dropdown-item value="name" selected>Name</ui-dropdown-item>
        <ui-dropdown-item value="date" selected>Date</ui-dropdown-item>
        <ui-dropdown-item value="size">Size</ui-dropdown-item>
        <ui-dropdown-item value="type">Type</ui-dropdown-item>
        <ui-dropdown-item value="tags">Tags</ui-dropdown-item>
      </ui-menu>
    </div>

    <h3>With Secondary Labels</h3>
    <div class="variant-row" style="position:relative;min-height:260px">
      <ui-menu size="m" open class="pos-relative">
        <ui-dropdown-item secondary="Ctrl+N">New File</ui-dropdown-item>
        <ui-dropdown-item secondary="Ctrl+O">Open File</ui-dropdown-item>
        <ui-dropdown-item secondary="Ctrl+S">Save</ui-dropdown-item>
        <ui-dropdown-item secondary="Ctrl+Shift+S">Save As</ui-dropdown-item>
        <ui-dropdown-separator></ui-dropdown-separator>
        <ui-dropdown-item secondary="Ctrl+Q">Quit</ui-dropdown-item>
      </ui-menu>
    </div>

    <h3>With Descriptions</h3>
    <div class="variant-row" style="position:relative;min-height:260px">
      <ui-menu size="m" open class="pos-relative" style="--ui-menu-min-width:300px">
        <ui-dropdown-item description="Create a new empty document">New File</ui-dropdown-item>
        <ui-dropdown-item description="Open an existing file from disk">Open File</ui-dropdown-item>
        <ui-dropdown-item description="Save changes to current file" disabled>Save</ui-dropdown-item>
      </ui-menu>
    </div>

    <h3>With Checkboxes</h3>
    <div class="variant-row" style="position:relative;min-height:220px">
      <ui-menu size="m" open selectable multiple class="pos-relative">
        <ui-dropdown-item leading="checkbox" value="bold" selected>Bold</ui-dropdown-item>
        <ui-dropdown-item leading="checkbox" value="italic">Italic</ui-dropdown-item>
        <ui-dropdown-item leading="checkbox" value="underline">Underline</ui-dropdown-item>
        <ui-dropdown-item leading="checkbox" value="strike" disabled>Strikethrough</ui-dropdown-item>
      </ui-menu>
    </div>

    <h3>With Radios</h3>
    <div class="variant-row" style="position:relative;min-height:260px">
      <ui-menu size="m" open selectable class="pos-relative">
        <ui-dropdown-heading>Sort By</ui-dropdown-heading>
        <ui-dropdown-item leading="radio" value="name" selected>Name</ui-dropdown-item>
        <ui-dropdown-item leading="radio" value="date">Date Modified</ui-dropdown-item>
        <ui-dropdown-item leading="radio" value="size">Size</ui-dropdown-item>
        <ui-dropdown-item leading="radio" value="type">Type</ui-dropdown-item>
      </ui-menu>
    </div>
  `,
});
