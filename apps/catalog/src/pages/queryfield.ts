import { registerPage } from "../registry.js";

registerPage("queryfield", {
  title: "Queryfield",
  section: "Form Controls",
  render: () => `
    <h3>Interactive (click input to try)</h3>
    <p style="font-size: 13px; color: var(--fd-text-tertiary, #7a909e); margin: 0 0 8px;">Pick from suggestions, type custom values + Enter, click tags to edit, X to dismiss</p>
    <div class="stack-m w-600">
      <ui-queryfield id="interactive-qf" size="m" placeholder="Click to add filters...">
        <ui-queryfield-tag slot="tags" category="CITY" expression="equals London or Mumbai" filter-name="city" operator="equals" values="London,Mumbai"></ui-queryfield-tag>
        <ui-queryfield-tag slot="tags" category="TITLE" expression="contains VP" filter-name="title" operator="contains" values="VP"></ui-queryfield-tag>
      </ui-queryfield>
    </div>

    <h3>Queryfield Tag — Sizes</h3>
    <div class="stack-m">
      <div class="variant-col">
        <span class="variant-label">S</span>
        <ui-queryfield-tag size="s" category="CITY" expression="equals London or Bengaluru"></ui-queryfield-tag>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <ui-queryfield-tag size="m" category="CITY" expression="equals London or Bengaluru"></ui-queryfield-tag>
      </div>
      <div class="variant-col">
        <span class="variant-label">L</span>
        <ui-queryfield-tag size="l" category="CITY" expression="equals London or Bengaluru"></ui-queryfield-tag>
      </div>
    </div>

    <h3>Queryfield — Sizes</h3>
    <div class="stack-m w-600">
      <div class="variant-col">
        <span class="variant-label">S</span>
        <ui-queryfield size="s" placeholder="Search...">
          <ui-queryfield-tag slot="tags" category="CITY" expression="equals London"></ui-queryfield-tag>
        </ui-queryfield>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <ui-queryfield size="m" placeholder="Search...">
          <ui-queryfield-tag slot="tags" category="CITY" expression="equals London or Bengaluru"></ui-queryfield-tag>
          <ui-queryfield-tag slot="tags" category="STATUS" expression="equals Active"></ui-queryfield-tag>
        </ui-queryfield>
      </div>
      <div class="variant-col">
        <span class="variant-label">L</span>
        <ui-queryfield size="l" placeholder="Search...">
          <ui-queryfield-tag slot="tags" category="CITY" expression="equals London or Bengaluru"></ui-queryfield-tag>
          <ui-queryfield-tag slot="tags" category="ROLE" expression="contains Manager"></ui-queryfield-tag>
        </ui-queryfield>
      </div>
    </div>

    <h3>Queryfield — Empty</h3>
    <div class="stack-m w-600">
      <ui-queryfield size="m" placeholder="Type to search or add filters..."></ui-queryfield>
    </div>

    <h3>Queryfield — Disabled</h3>
    <div class="stack-m w-600">
      <ui-queryfield size="m" placeholder="Search..." disabled>
        <ui-queryfield-tag slot="tags" category="CITY" expression="equals London"></ui-queryfield-tag>
      </ui-queryfield>
    </div>

    <h3>Queryfield — Multiple Tags</h3>
    <div class="stack-m w-600">
      <ui-queryfield size="m" placeholder="Add more filters...">
        <ui-queryfield-tag slot="tags" category="CITY" expression="equals London or Bengaluru"></ui-queryfield-tag>
        <ui-queryfield-tag slot="tags" category="STATUS" expression="equals Active"></ui-queryfield-tag>
        <ui-queryfield-tag slot="tags" category="ROLE" expression="contains Manager"></ui-queryfield-tag>
        <ui-queryfield-tag slot="tags" category="DEPT" expression="equals Engineering"></ui-queryfield-tag>
      </ui-queryfield>
    </div>
  `,
  setup: () => {
    const qf = document.getElementById("interactive-qf") as HTMLElement & { filters: Array<{ name: string; label: string; operators: string[]; values: string[] }> };
    if (!qf) return;
    qf.filters = [
      { name: "city", label: "City", operators: ["equals", "not", "contains"], values: ["London", "Bengaluru", "New York", "Tokyo"] },
      { name: "title", label: "Title", operators: ["equals", "contains", "starts with"], values: ["Vice President", "Managing Director", "Associate", "Analyst"] },
      { name: "age", label: "Age", operators: ["equals", "not"], values: ["25", "30", "35", "40", "45"] },
      { name: "name", label: "Name", operators: ["equals", "contains", "starts with"], values: ["Jess Smith", "John Doe", "Jane Roe"] },
    ];

    // Wire up dismiss on pre-existing tags
    qf.querySelectorAll("ui-queryfield-tag").forEach((tag) => {
      tag.addEventListener("dismiss", () => tag.remove());
    });

    qf.addEventListener("queryfield-filter-add", ((e: CustomEvent) => {
      const { filter, operator, values } = e.detail;
      const tag = document.createElement("ui-queryfield-tag");
      tag.setAttribute("slot", "tags");
      tag.setAttribute("category", filter.toUpperCase());
      tag.setAttribute("expression", `${operator} ${values.join(" or ")}`);
      tag.setAttribute("filter-name", filter);
      tag.setAttribute("operator", operator);
      tag.setAttribute("values", values.join(","));
      tag.addEventListener("dismiss", () => tag.remove());
      qf.appendChild(tag);
    }) as EventListener);
  },
});
