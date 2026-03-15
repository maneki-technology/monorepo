import { registerPage } from "../registry.js";

registerPage("table", {
  title: "Table",
  section: "Data Display",
  render: () => `
    <div class="stack-l w-720">
    ${["s", "m", "l"].map(size => `
      <div>
        <p class="section-label">Size ${size.toUpperCase()}</p>
        <ui-table size="${size}">
          <ui-table-row header>
            <ui-table-cell header>Name</ui-table-cell>
            <ui-table-cell header>Email</ui-table-cell>
            <ui-table-cell header>Role</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>John Doe</ui-table-cell>
            <ui-table-cell>john@example.com</ui-table-cell>
            <ui-table-cell>Admin</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Jane Smith</ui-table-cell>
            <ui-table-cell>jane@example.com</ui-table-cell>
            <ui-table-cell>Editor</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
    `).join("")}
    </div>

    <h3>Separators</h3>
    <div class="variant-row row-start gap-24">
      <div class="variant-col">
        <span class="variant-label">Minimal</span>
        <ui-table size="m" separator="minimal" class="w-360">
          <ui-table-row header>
            <ui-table-cell header>Name</ui-table-cell>
            <ui-table-cell header>Role</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Alice</ui-table-cell>
            <ui-table-cell>Admin</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Bob</ui-table-cell>
            <ui-table-cell>Editor</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Carol</ui-table-cell>
            <ui-table-cell>Viewer</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
      <div class="variant-col">
        <span class="variant-label">Moderate</span>
        <ui-table size="m" separator="moderate" class="w-360">
          <ui-table-row header>
            <ui-table-cell header>Name</ui-table-cell>
            <ui-table-cell header>Role</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Alice</ui-table-cell>
            <ui-table-cell>Admin</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Bob</ui-table-cell>
            <ui-table-cell>Editor</ui-table-cell>
          </ui-table-row>
          <ui-table-row>
            <ui-table-cell>Carol</ui-table-cell>
            <ui-table-cell>Viewer</ui-table-cell>
          </ui-table-row>
        </ui-table>
      </div>
    </div>

    <h3>Zebra Striping</h3>
    <ui-table size="m" zebra class="w-720">
      <ui-table-row header>
        <ui-table-cell header>Name</ui-table-cell>
        <ui-table-cell header>Email</ui-table-cell>
        <ui-table-cell header>Role</ui-table-cell>
        <ui-table-cell header>Status</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>John Doe</ui-table-cell>
        <ui-table-cell>john@example.com</ui-table-cell>
        <ui-table-cell>Admin</ui-table-cell>
        <ui-table-cell>Active</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>Jane Smith</ui-table-cell>
        <ui-table-cell>jane@example.com</ui-table-cell>
        <ui-table-cell>Editor</ui-table-cell>
        <ui-table-cell>Active</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>Bob Wilson</ui-table-cell>
        <ui-table-cell>bob@example.com</ui-table-cell>
        <ui-table-cell>Viewer</ui-table-cell>
        <ui-table-cell>Inactive</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>Alice Brown</ui-table-cell>
        <ui-table-cell>alice@example.com</ui-table-cell>
        <ui-table-cell>Editor</ui-table-cell>
        <ui-table-cell>Active</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>Charlie Lee</ui-table-cell>
        <ui-table-cell>charlie@example.com</ui-table-cell>
        <ui-table-cell>Admin</ui-table-cell>
        <ui-table-cell>Active</ui-table-cell>
      </ui-table-row>
    </ui-table>

    <h3>Bordered</h3>
    <ui-table size="m" bordered class="w-720">
      <ui-table-row header>
        <ui-table-cell header>Name</ui-table-cell>
        <ui-table-cell header>Email</ui-table-cell>
        <ui-table-cell header>Role</ui-table-cell>
        <ui-table-cell header>Status</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>John Doe</ui-table-cell>
        <ui-table-cell>john@example.com</ui-table-cell>
        <ui-table-cell>Admin</ui-table-cell>
        <ui-table-cell>Active</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>Jane Smith</ui-table-cell>
        <ui-table-cell>jane@example.com</ui-table-cell>
        <ui-table-cell>Editor</ui-table-cell>
        <ui-table-cell>Active</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>Bob Wilson</ui-table-cell>
        <ui-table-cell>bob@example.com</ui-table-cell>
        <ui-table-cell>Viewer</ui-table-cell>
        <ui-table-cell>Inactive</ui-table-cell>
      </ui-table-row>
    </ui-table>

    <h3>Row States</h3>
    <ui-table size="m" class="w-720">
      <ui-table-row header>
        <ui-table-cell header>Name</ui-table-cell>
        <ui-table-cell header>Email</ui-table-cell>
        <ui-table-cell header>Role</ui-table-cell>
        <ui-table-cell header>State</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>John Doe</ui-table-cell>
        <ui-table-cell>john@example.com</ui-table-cell>
        <ui-table-cell>Admin</ui-table-cell>
        <ui-table-cell>Default</ui-table-cell>
      </ui-table-row>
      <ui-table-row selected>
        <ui-table-cell>Bob Wilson</ui-table-cell>
        <ui-table-cell>bob@example.com</ui-table-cell>
        <ui-table-cell>Viewer</ui-table-cell>
        <ui-table-cell>Selected</ui-table-cell>
      </ui-table-row>
      <ui-table-row disabled>
        <ui-table-cell>Alice Brown</ui-table-cell>
        <ui-table-cell>alice@example.com</ui-table-cell>
        <ui-table-cell>Editor</ui-table-cell>
        <ui-table-cell>Disabled</ui-table-cell>
      </ui-table-row>
    </ui-table>

    <h3>Full Featured</h3>
    <ui-table size="m" bordered zebra separator="moderate" class="w-720">
      <ui-table-row header>
        <ui-table-cell header>Name</ui-table-cell>
        <ui-table-cell header>Email</ui-table-cell>
        <ui-table-cell header>Role</ui-table-cell>
        <ui-table-cell header>Status</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>John Doe</ui-table-cell>
        <ui-table-cell>john@example.com</ui-table-cell>
        <ui-table-cell>Admin</ui-table-cell>
        <ui-table-cell>Active</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>Jane Smith</ui-table-cell>
        <ui-table-cell>jane@example.com</ui-table-cell>
        <ui-table-cell>Editor</ui-table-cell>
        <ui-table-cell>Active</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>Bob Wilson</ui-table-cell>
        <ui-table-cell>bob@example.com</ui-table-cell>
        <ui-table-cell>Viewer</ui-table-cell>
        <ui-table-cell>Inactive</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>Alice Brown</ui-table-cell>
        <ui-table-cell>alice@example.com</ui-table-cell>
        <ui-table-cell>Editor</ui-table-cell>
        <ui-table-cell>Active</ui-table-cell>
      </ui-table-row>
      <ui-table-row>
        <ui-table-cell>Charlie Lee</ui-table-cell>
        <ui-table-cell>charlie@example.com</ui-table-cell>
        <ui-table-cell>Admin</ui-table-cell>
        <ui-table-cell>Active</ui-table-cell>
      </ui-table-row>
    </ui-table>
  `,
});
