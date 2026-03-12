import { describe, it, expect, beforeEach } from "vitest";
import "./ui-table.js";
import "./ui-table-row.js";
import "./ui-table-cell.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ui-table
// ═══════════════════════════════════════════════════════════════════════════════

describe("ui-table", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-table");
    document.body.appendChild(el);
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-table")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  // ── Defaults ──────────────────────────────────────────────────────────────

  it("defaults size to 'm'", () => {
    expect((el as unknown as { size: string }).size).toBe("m");
  });

  it("defaults separator to 'minimal'", () => {
    expect((el as unknown as { separator: string }).separator).toBe("minimal");
  });

  it("defaults zebra to false", () => {
    expect((el as unknown as { zebra: boolean }).zebra).toBe(false);
  });

  it("defaults bordered to false", () => {
    expect((el as unknown as { bordered: boolean }).bordered).toBe(false);
  });

  // ── Size attribute ────────────────────────────────────────────────────────

  it("reflects size='s' to attribute", () => {
    (el as unknown as { size: string }).size = "s";
    expect(el.getAttribute("size")).toBe("s");
  });

  it("reflects size='m' to attribute", () => {
    (el as unknown as { size: string }).size = "m";
    expect(el.getAttribute("size")).toBe("m");
  });

  it("reflects size='l' to attribute", () => {
    (el as unknown as { size: string }).size = "l";
    expect(el.getAttribute("size")).toBe("l");
  });

  it("reads size from attribute", () => {
    el.setAttribute("size", "l");
    expect((el as unknown as { size: string }).size).toBe("l");
  });

  // ── Separator attribute ───────────────────────────────────────────────────

  it("reflects separator='minimal' to attribute", () => {
    (el as unknown as { separator: string }).separator = "minimal";
    expect(el.getAttribute("separator")).toBe("minimal");
  });

  it("reflects separator='moderate' to attribute", () => {
    (el as unknown as { separator: string }).separator = "moderate";
    expect(el.getAttribute("separator")).toBe("moderate");
  });

  it("reads separator from attribute", () => {
    el.setAttribute("separator", "moderate");
    expect((el as unknown as { separator: string }).separator).toBe("moderate");
  });

  // ── Zebra boolean attribute ───────────────────────────────────────────────

  it("sets zebra attribute when property is true", () => {
    (el as unknown as { zebra: boolean }).zebra = true;
    expect(el.hasAttribute("zebra")).toBe(true);
  });

  it("removes zebra attribute when property is false", () => {
    (el as unknown as { zebra: boolean }).zebra = true;
    (el as unknown as { zebra: boolean }).zebra = false;
    expect(el.hasAttribute("zebra")).toBe(false);
  });

  it("reads zebra from attribute", () => {
    el.setAttribute("zebra", "");
    expect((el as unknown as { zebra: boolean }).zebra).toBe(true);
  });

  // ── Bordered boolean attribute ────────────────────────────────────────────

  it("sets bordered attribute when property is true", () => {
    (el as unknown as { bordered: boolean }).bordered = true;
    expect(el.hasAttribute("bordered")).toBe(true);
  });

  it("removes bordered attribute when property is false", () => {
    (el as unknown as { bordered: boolean }).bordered = true;
    (el as unknown as { bordered: boolean }).bordered = false;
    expect(el.hasAttribute("bordered")).toBe(false);
  });

  it("reads bordered from attribute", () => {
    el.setAttribute("bordered", "");
    expect((el as unknown as { bordered: boolean }).bordered).toBe(true);
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it("sets role='table' on connected", () => {
    expect(el.getAttribute("role")).toBe("table");
  });

  it("does not override existing role", () => {
    document.body.innerHTML = "";
    const el2 = document.createElement("ui-table");
    el2.setAttribute("role", "grid");
    document.body.appendChild(el2);
    expect(el2.getAttribute("role")).toBe("grid");
  });

  // ── Shadow DOM structure ──────────────────────────────────────────────────

  it("has .table-wrapper element", () => {
    expect(el.shadowRoot!.querySelector(".table-wrapper")).toBeTruthy();
  });

  it("has a slot element", () => {
    expect(el.shadowRoot!.querySelector("slot")).toBeTruthy();
  });

  // ── Property accessors roundtrip ──────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      size: string;
      separator: string;
      zebra: boolean;
      bordered: boolean;
    };

    component.size = "l";
    expect(component.size).toBe("l");

    component.separator = "moderate";
    expect(component.separator).toBe("moderate");

    component.zebra = true;
    expect(component.zebra).toBe(true);

    component.bordered = true;
    expect(component.bordered).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ui-table-row
// ═══════════════════════════════════════════════════════════════════════════════

describe("ui-table-row", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-table-row");
    document.body.appendChild(el);
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-table-row")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  // ── Defaults ──────────────────────────────────────────────────────────────

  it("defaults header to false", () => {
    expect((el as unknown as { header: boolean }).header).toBe(false);
  });

  it("defaults selected to false", () => {
    expect((el as unknown as { selected: boolean }).selected).toBe(false);
  });

  it("defaults disabled to false", () => {
    expect((el as unknown as { disabled: boolean }).disabled).toBe(false);
  });

  // ── Header boolean attribute ──────────────────────────────────────────────

  it("sets header attribute when property is true", () => {
    (el as unknown as { header: boolean }).header = true;
    expect(el.hasAttribute("header")).toBe(true);
  });

  it("removes header attribute when property is false", () => {
    (el as unknown as { header: boolean }).header = true;
    (el as unknown as { header: boolean }).header = false;
    expect(el.hasAttribute("header")).toBe(false);
  });

  it("reads header from attribute", () => {
    el.setAttribute("header", "");
    expect((el as unknown as { header: boolean }).header).toBe(true);
  });

  // ── Selected boolean attribute ────────────────────────────────────────────

  it("sets selected attribute when property is true", () => {
    (el as unknown as { selected: boolean }).selected = true;
    expect(el.hasAttribute("selected")).toBe(true);
  });

  it("removes selected attribute when property is false", () => {
    (el as unknown as { selected: boolean }).selected = true;
    (el as unknown as { selected: boolean }).selected = false;
    expect(el.hasAttribute("selected")).toBe(false);
  });

  it("reads selected from attribute", () => {
    el.setAttribute("selected", "");
    expect((el as unknown as { selected: boolean }).selected).toBe(true);
  });

  // ── Disabled boolean attribute ────────────────────────────────────────────

  it("sets disabled attribute when property is true", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("removes disabled attribute when property is false", () => {
    (el as unknown as { disabled: boolean }).disabled = true;
    (el as unknown as { disabled: boolean }).disabled = false;
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("reads disabled from attribute", () => {
    el.setAttribute("disabled", "");
    expect((el as unknown as { disabled: boolean }).disabled).toBe(true);
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it("sets role='row' on connected", () => {
    expect(el.getAttribute("role")).toBe("row");
  });

  it("does not override existing role", () => {
    document.body.innerHTML = "";
    const el2 = document.createElement("ui-table-row");
    el2.setAttribute("role", "presentation");
    document.body.appendChild(el2);
    expect(el2.getAttribute("role")).toBe("presentation");
  });

  // ── Shadow DOM structure ──────────────────────────────────────────────────

  it("has a slot element", () => {
    expect(el.shadowRoot!.querySelector("slot")).toBeTruthy();
  });

  // ── Property accessors roundtrip ──────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      header: boolean;
      selected: boolean;
      disabled: boolean;
    };

    component.header = true;
    expect(component.header).toBe(true);

    component.selected = true;
    expect(component.selected).toBe(true);

    component.disabled = true;
    expect(component.disabled).toBe(true);
  });

  // ── Observed attributes ───────────────────────────────────────────────────

  it("observes header attribute", () => {
    const observed = (customElements.get("ui-table-row") as unknown as { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("header");
  });

  it("observes selected attribute", () => {
    const observed = (customElements.get("ui-table-row") as unknown as { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("selected");
  });

  it("observes disabled attribute", () => {
    const observed = (customElements.get("ui-table-row") as unknown as { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("disabled");
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// ui-table-cell
// ═══════════════════════════════════════════════════════════════════════════════

describe("ui-table-cell", () => {
  let el: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    el = document.createElement("ui-table-cell");
    document.body.appendChild(el);
  });

  // ── Registration ──────────────────────────────────────────────────────────

  it("registers as a custom element", () => {
    expect(customElements.get("ui-table-cell")).toBeDefined();
  });

  it("creates a shadow root", () => {
    expect(el.shadowRoot).toBeTruthy();
  });

  // ── Defaults ──────────────────────────────────────────────────────────────

  it("defaults header to false", () => {
    expect((el as unknown as { header: boolean }).header).toBe(false);
  });

  it("defaults align to 'left'", () => {
    expect((el as unknown as { align: string }).align).toBe("left");
  });

  // ── Header boolean attribute ──────────────────────────────────────────────

  it("sets header attribute when property is true", () => {
    (el as unknown as { header: boolean }).header = true;
    expect(el.hasAttribute("header")).toBe(true);
  });

  it("removes header attribute when property is false", () => {
    (el as unknown as { header: boolean }).header = true;
    (el as unknown as { header: boolean }).header = false;
    expect(el.hasAttribute("header")).toBe(false);
  });

  it("reads header from attribute", () => {
    el.setAttribute("header", "");
    expect((el as unknown as { header: boolean }).header).toBe(true);
  });

  // ── Align attribute ───────────────────────────────────────────────────────

  it("reflects align='left' to attribute", () => {
    (el as unknown as { align: string }).align = "left";
    expect(el.getAttribute("align")).toBe("left");
  });

  it("reflects align='center' to attribute", () => {
    (el as unknown as { align: string }).align = "center";
    expect(el.getAttribute("align")).toBe("center");
  });

  it("reflects align='right' to attribute", () => {
    (el as unknown as { align: string }).align = "right";
    expect(el.getAttribute("align")).toBe("right");
  });

  it("reads align from attribute", () => {
    el.setAttribute("align", "center");
    expect((el as unknown as { align: string }).align).toBe("center");
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it("sets role='cell' by default", () => {
    expect(el.getAttribute("role")).toBe("cell");
  });

  it("sets role='columnheader' when header is true", () => {
    (el as unknown as { header: boolean }).header = true;
    expect(el.getAttribute("role")).toBe("columnheader");
  });

  it("reverts role to 'cell' when header is removed", () => {
    (el as unknown as { header: boolean }).header = true;
    expect(el.getAttribute("role")).toBe("columnheader");
    (el as unknown as { header: boolean }).header = false;
    expect(el.getAttribute("role")).toBe("cell");
  });

  it("sets role='columnheader' via attribute", () => {
    el.setAttribute("header", "");
    expect(el.getAttribute("role")).toBe("columnheader");
  });

  it("reverts role to 'cell' when header attribute removed", () => {
    el.setAttribute("header", "");
    el.removeAttribute("header");
    expect(el.getAttribute("role")).toBe("cell");
  });

  // ── Shadow DOM structure ──────────────────────────────────────────────────

  it("has a slot element", () => {
    expect(el.shadowRoot!.querySelector("slot")).toBeTruthy();
  });

  // ── Slot content rendering ────────────────────────────────────────────────

  it("renders slotted text content", () => {
    document.body.innerHTML = "";
    const cell = document.createElement("ui-table-cell");
    cell.textContent = "Hello";
    document.body.appendChild(cell);
    expect(cell.textContent).toBe("Hello");
  });

  // ── Property accessors roundtrip ──────────────────────────────────────────

  it("exposes all typed property accessors", () => {
    const component = el as unknown as {
      header: boolean;
      align: string;
    };

    component.header = true;
    expect(component.header).toBe(true);

    component.align = "right";
    expect(component.align).toBe("right");
  });

  // ── Observed attributes ───────────────────────────────────────────────────

  it("observes header attribute", () => {
    const observed = (customElements.get("ui-table-cell") as unknown as { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("header");
  });

  it("observes align attribute", () => {
    const observed = (customElements.get("ui-table-cell") as unknown as { observedAttributes: string[] }).observedAttributes;
    expect(observed).toContain("align");
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// Composition
// ═══════════════════════════════════════════════════════════════════════════════

describe("Composition", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  function buildTable(): HTMLElement {
    const table = document.createElement("ui-table");

    // Header row
    const headerRow = document.createElement("ui-table-row");
    headerRow.setAttribute("header", "");
    const h1 = document.createElement("ui-table-cell");
    h1.setAttribute("header", "");
    h1.textContent = "Name";
    const h2 = document.createElement("ui-table-cell");
    h2.setAttribute("header", "");
    h2.textContent = "Age";
    headerRow.appendChild(h1);
    headerRow.appendChild(h2);

    // Data row 1
    const row1 = document.createElement("ui-table-row");
    const c1 = document.createElement("ui-table-cell");
    c1.textContent = "Alice";
    const c2 = document.createElement("ui-table-cell");
    c2.textContent = "30";
    row1.appendChild(c1);
    row1.appendChild(c2);

    // Data row 2
    const row2 = document.createElement("ui-table-row");
    const c3 = document.createElement("ui-table-cell");
    c3.textContent = "Bob";
    const c4 = document.createElement("ui-table-cell");
    c4.textContent = "25";
    row2.appendChild(c3);
    row2.appendChild(c4);

    table.appendChild(headerRow);
    table.appendChild(row1);
    table.appendChild(row2);

    return table;
  }

  // ── Full table rendering ──────────────────────────────────────────────────

  it("renders a full table with header and data rows", () => {
    const table = buildTable();
    document.body.appendChild(table);
    const rows = table.querySelectorAll("ui-table-row");
    expect(rows.length).toBe(3);
  });

  it("header row has header attribute", () => {
    const table = buildTable();
    document.body.appendChild(table);
    const rows = table.querySelectorAll("ui-table-row");
    expect(rows[0].hasAttribute("header")).toBe(true);
    expect(rows[1].hasAttribute("header")).toBe(false);
    expect(rows[2].hasAttribute("header")).toBe(false);
  });

  it("header cells have role='columnheader'", () => {
    const table = buildTable();
    document.body.appendChild(table);
    const headerRow = table.querySelector("ui-table-row[header]")!;
    const cells = headerRow.querySelectorAll("ui-table-cell");
    for (const cell of cells) {
      expect(cell.getAttribute("role")).toBe("columnheader");
    }
  });

  it("data cells have role='cell'", () => {
    const table = buildTable();
    document.body.appendChild(table);
    const rows = table.querySelectorAll("ui-table-row:not([header])");
    for (const row of rows) {
      const cells = row.querySelectorAll("ui-table-cell");
      for (const cell of cells) {
        expect(cell.getAttribute("role")).toBe("cell");
      }
    }
  });

  it("table has role='table'", () => {
    const table = buildTable();
    document.body.appendChild(table);
    expect(table.getAttribute("role")).toBe("table");
  });

  it("rows have role='row'", () => {
    const table = buildTable();
    document.body.appendChild(table);
    const rows = table.querySelectorAll("ui-table-row");
    for (const row of rows) {
      expect(row.getAttribute("role")).toBe("row");
    }
  });

  // ── Size propagation ──────────────────────────────────────────────────────

  it("table size='s' reflects to attribute for CSS propagation", () => {
    const table = buildTable();
    (table as unknown as { size: string }).size = "s";
    document.body.appendChild(table);
    expect(table.getAttribute("size")).toBe("s");
  });

  it("table size='l' reflects to attribute for CSS propagation", () => {
    const table = buildTable();
    (table as unknown as { size: string }).size = "l";
    document.body.appendChild(table);
    expect(table.getAttribute("size")).toBe("l");
  });

  it("table size defaults to 'm' for CSS propagation", () => {
    const table = buildTable();
    document.body.appendChild(table);
    expect((table as unknown as { size: string }).size).toBe("m");
  });

  it("updating size property updates attribute for CSS cascade", () => {
    const table = buildTable();
    document.body.appendChild(table);
    (table as unknown as { size: string }).size = "l";
    expect(table.getAttribute("size")).toBe("l");
    (table as unknown as { size: string }).size = "s";
    expect(table.getAttribute("size")).toBe("s");
  });

  // ── Separator propagation ─────────────────────────────────────────────────

  it("table separator='moderate' reflects to attribute for CSS propagation", () => {
    const table = buildTable();
    (table as unknown as { separator: string }).separator = "moderate";
    document.body.appendChild(table);
    expect(table.getAttribute("separator")).toBe("moderate");
  });

  it("table separator defaults to 'minimal' for CSS propagation", () => {
    const table = buildTable();
    document.body.appendChild(table);
    expect((table as unknown as { separator: string }).separator).toBe("minimal");
  });

  // ── Zebra propagation ─────────────────────────────────────────────────────

  it("table zebra attribute is present when zebra is true", () => {
    const table = buildTable();
    (table as unknown as { zebra: boolean }).zebra = true;
    document.body.appendChild(table);
    expect(table.hasAttribute("zebra")).toBe(true);
  });

  it("table zebra attribute is removed when zebra is false", () => {
    const table = buildTable();
    (table as unknown as { zebra: boolean }).zebra = true;
    document.body.appendChild(table);
    expect(table.hasAttribute("zebra")).toBe(true);
    (table as unknown as { zebra: boolean }).zebra = false;
    expect(table.hasAttribute("zebra")).toBe(false);
  });

  it("toggling zebra off and on reflects correctly", () => {
    const table = buildTable();
    document.body.appendChild(table);
    (table as unknown as { zebra: boolean }).zebra = true;
    expect(table.hasAttribute("zebra")).toBe(true);
    (table as unknown as { zebra: boolean }).zebra = false;
    expect(table.hasAttribute("zebra")).toBe(false);
    (table as unknown as { zebra: boolean }).zebra = true;
    expect(table.hasAttribute("zebra")).toBe(true);
  });

  // ── Combined propagation ──────────────────────────────────────────────────

  it("size + separator + zebra attributes all reflect for CSS cascade", () => {
    const table = buildTable();
    (table as unknown as { size: string }).size = "l";
    (table as unknown as { separator: string }).separator = "moderate";
    (table as unknown as { zebra: boolean }).zebra = true;
    document.body.appendChild(table);

    expect(table.getAttribute("size")).toBe("l");
    expect(table.getAttribute("separator")).toBe("moderate");
    expect(table.hasAttribute("zebra")).toBe(true);
  });

  it("bordered attribute does not affect child propagation", async () => {
    const table = buildTable();
    (table as unknown as { bordered: boolean }).bordered = true;
    document.body.appendChild(table);
    await new Promise((r) => setTimeout(r, 0));
    expect(table.hasAttribute("bordered")).toBe(true);
    // bordered is CSS-only, no propagation to children
    const rows = table.querySelectorAll("ui-table-row");
    for (const row of rows) {
      expect(row.hasAttribute("bordered")).toBe(false);
    }
  });

  // ── Cell alignment in composition ─────────────────────────────────────────

  it("cells retain align attribute in composed table", () => {
    const table = buildTable();
    const cells = table.querySelectorAll("ui-table-cell");
    (cells[1] as unknown as { align: string }).align = "right";
    document.body.appendChild(table);
    expect(cells[1].getAttribute("align")).toBe("right");
  });

  it("selected row does not affect cell roles", () => {
    const table = buildTable();
    document.body.appendChild(table);
    const rows = table.querySelectorAll("ui-table-row");
    (rows[1] as unknown as { selected: boolean }).selected = true;
    const cells = rows[1].querySelectorAll("ui-table-cell");
    for (const cell of cells) {
      expect(cell.getAttribute("role")).toBe("cell");
    }
  });

  it("disabled row does not affect cell roles", () => {
    const table = buildTable();
    document.body.appendChild(table);
    const rows = table.querySelectorAll("ui-table-row");
    (rows[1] as unknown as { disabled: boolean }).disabled = true;
    const cells = rows[1].querySelectorAll("ui-table-cell");
    for (const cell of cells) {
      expect(cell.getAttribute("role")).toBe("cell");
    }
  });
});
