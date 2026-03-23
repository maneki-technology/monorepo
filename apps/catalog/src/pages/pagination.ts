import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-pagination.js";

registerPage("pagination", {
  title: "Pagination",
  section: "Navigation",
  render: () => `
    <h3>Data Grid (Default)</h3>
    <div class="stack-l">
      <div class="variant-col">
        <span class="variant-label">Page 4 of 20</span>
        <ui-pagination type="data-grid" current-page="4" total-pages="20" page-size="10" total-items="200"></ui-pagination>
      </div>
      <div class="variant-col">
        <span class="variant-label">First Page (First/Prev disabled)</span>
        <ui-pagination type="data-grid" current-page="1" total-pages="20" page-size="10" total-items="200"></ui-pagination>
      </div>
      <div class="variant-col">
        <span class="variant-label">Last Page (Next/Last disabled)</span>
        <ui-pagination type="data-grid" current-page="20" total-pages="20" page-size="10" total-items="200"></ui-pagination>
      </div>
    </div>

    <h3>Basic</h3>
    <div class="stack-l">
      <div class="variant-col">
        <span class="variant-label">With page status</span>
        <ui-pagination type="basic" current-page="1" total-pages="13" page-size="10" total-items="124"></ui-pagination>
      </div>
    </div>

    <h3>Minimal</h3>
    <div class="stack-l">
      <div class="variant-col">
        <span class="variant-label">Prev/Next + Goto</span>
        <ui-pagination type="minimal" current-page="1" total-pages="20"></ui-pagination>
      </div>
    </div>

    <h3>Sizes — Data Grid</h3>
    <div class="stack-l">
      <div class="variant-col">
        <span class="variant-label">XS</span>
        <ui-pagination size="xs" type="data-grid" current-page="3" total-pages="10" page-size="10" total-items="100"></ui-pagination>
      </div>
      <div class="variant-col">
        <span class="variant-label">S</span>
        <ui-pagination size="s" type="data-grid" current-page="3" total-pages="10" page-size="10" total-items="100"></ui-pagination>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <ui-pagination size="m" type="data-grid" current-page="3" total-pages="10" page-size="10" total-items="100"></ui-pagination>
      </div>
    </div>

    <h3>Sizes — Minimal</h3>
    <div class="stack-l">
      <div class="variant-col">
        <span class="variant-label">XS</span>
        <ui-pagination size="xs" type="minimal" current-page="5" total-pages="20"></ui-pagination>
      </div>
      <div class="variant-col">
        <span class="variant-label">S</span>
        <ui-pagination size="s" type="minimal" current-page="5" total-pages="20"></ui-pagination>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <ui-pagination size="m" type="minimal" current-page="5" total-pages="20"></ui-pagination>
      </div>
    </div>

    <h3>Sizes — Basic</h3>
    <div class="stack-l">
      <div class="variant-col">
        <span class="variant-label">XS</span>
        <ui-pagination size="xs" type="basic" current-page="1" total-pages="10" page-size="10" total-items="100"></ui-pagination>
      </div>
      <div class="variant-col">
        <span class="variant-label">S</span>
        <ui-pagination size="s" type="basic" current-page="1" total-pages="10" page-size="10" total-items="100"></ui-pagination>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <ui-pagination size="m" type="basic" current-page="1" total-pages="10" page-size="10" total-items="100"></ui-pagination>
      </div>
    </div>

    <h3>Custom Page Size Options</h3>
    <div class="stack-l">
      <div class="variant-col">
        <span class="variant-label">5, 10, 25, 50, 100</span>
        <ui-pagination type="data-grid" current-page="1" total-pages="20" page-size="25" total-items="500" page-size-options="5,10,25,50,100"></ui-pagination>
      </div>
    </div>
  `,
});
