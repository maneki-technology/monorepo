import { registerPage } from "../registry.js";

registerPage("search", {
  title: "Search",
  section: "Form Controls",
  render: () => `
    <h3>Search Input — Sizes</h3>
    <div class="stack-m" style="max-width: 432px;">
      <div class="variant-col">
        <span class="variant-label">S</span>
        <ui-search size="s" placeholder="Type to search..."></ui-search>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <ui-search size="m" placeholder="Type to search..."></ui-search>
      </div>
      <div class="variant-col">
        <span class="variant-label">L</span>
        <ui-search size="l" placeholder="Type to search..."></ui-search>
      </div>
    </div>

    <h3>Search Dropdown — Interactive (type "fin" to try)</h3>
    <div class="stack-m" style="max-width: 432px;">
      <ui-search id="search-demo-m" size="m" placeholder="Type to search..."></ui-search>
    </div>

    <h3 style="margin-top: 320px;">Search Dropdown — Size L</h3>
    <div class="stack-m" style="max-width: 432px;">
      <ui-search id="search-demo-l" size="l" placeholder="Type to search..."></ui-search>
    </div>
  `,
  setup: () => {
    const categories = [
      { label: "SUGGESTIONS", results: [
        { type: "basic" as const, title: "finance" },
        { type: "basic" as const, title: "financial markets" },
      ]},
      { label: "COMPANIES", results: [
        { type: "basic" as const, title: "Generic Finance Inc." },
      ]},
      { label: "RESULTS WITH INFO", results: [
        { type: "with-info" as const, title: "Lorem Financial Corp.", info: "Extra Info Here" },
      ]},
      { label: "ARTICLES", results: [
        { type: "article" as const, title: "Financial Report Quarterly", info: "01 Sep 2020", description: "Quarterly financial report covering market trends and analysis." },
      ]},
      { label: "RECENT SEARCHES", results: [
        { type: "with-icon" as const, title: "Recent Search Finance Inc.", icon: "schedule" },
      ]},
      { label: "PEOPLE", results: [
        { type: "with-avatar" as const, title: "Lorem Financial Corp.", avatarText: "LF" },
      ]},
    ];

    const demoM = document.getElementById("search-demo-m") as HTMLElement & { categories: typeof categories };
    if (demoM) demoM.categories = categories;

    const demoL = document.getElementById("search-demo-l") as HTMLElement & { categories: typeof categories };
    if (demoL) demoL.categories = categories;
  },
});
