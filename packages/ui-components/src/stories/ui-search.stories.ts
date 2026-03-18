import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "../components/ui-search.js";

const categories = [
  {
    label: "SUGGESTIONS",
    results: [
      { type: "basic" as const, title: "finance" },
      { type: "basic" as const, title: "financial markets" },
    ],
  },
  {
    label: "COMPANIES",
    results: [
      { type: "basic" as const, title: "Generic Finance Inc." },
    ],
  },
  {
    label: "ARTICLES",
    results: [
      {
        type: "article" as const,
        title: "Financial Report Quarterly",
        info: "01 Sep 2020",
        description: "A deep dive into quarterly financial results and market trends",
      },
    ],
  },
  {
    label: "RECENT",
    results: [
      { type: "with-icon" as const, title: "Recent Search Finance Inc.", icon: "search" },
    ],
  },
  {
    label: "PEOPLE",
    results: [
      { type: "with-avatar" as const, title: "Lorem Financial Corp.", avatarText: "LF" },
    ],
  },
];

function setupSearch(el: Element, value: string): void {
  const search = el as HTMLElement & { value: string; categories: typeof categories };
  search.categories = categories;
  search.value = value;
  // Open the dropdown by setting the attribute directly
  search.setAttribute("open", "");
}

const meta: Meta = {
  title: "Components/Search",
  component: "ui-search",
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["s", "m", "l"],
    },
    placeholder: {
      control: { type: "text" },
    },
    disabled: {
      control: { type: "boolean" },
    },
    value: {
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    size: "m",
    placeholder: "Type to search...",
    disabled: false,
  },
  render: (args) => html`
    <ui-search
      size=${args.size}
      placeholder=${args.placeholder}
      ?disabled=${args.disabled}
    ></ui-search>
  `,
};

export const WithResults: Story = {
  render: () => html`
    <ui-search
      size="m"
      value="fin"
      id="search-with-results"
    ></ui-search>
    <script>
      requestAnimationFrame(() => {
        const el = document.getElementById("search-with-results");
        if (el) {
          el.categories = ${JSON.stringify(categories)};
          el.setAttribute("open", "");
        }
      });
    </script>
  `,
};

export const AllSizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 32px; align-items: flex-start;">
      <div style="flex: 1; position: relative;">
        <p style="margin: 0 0 8px; font-family: Geist, sans-serif; font-size: 12px; color: #666;">Size S</p>
        <ui-search size="s" value="fin" id="search-size-s"></ui-search>
      </div>
      <div style="flex: 1; position: relative;">
        <p style="margin: 0 0 8px; font-family: Geist, sans-serif; font-size: 12px; color: #666;">Size M</p>
        <ui-search size="m" value="fin" id="search-size-m"></ui-search>
      </div>
      <div style="flex: 1; position: relative;">
        <p style="margin: 0 0 8px; font-family: Geist, sans-serif; font-size: 12px; color: #666;">Size L</p>
        <ui-search size="l" value="fin" id="search-size-l"></ui-search>
      </div>
    </div>
    <script>
      requestAnimationFrame(() => {
        const cats = ${JSON.stringify(categories)};
        ["search-size-s", "search-size-m", "search-size-l"].forEach((id) => {
          const el = document.getElementById(id);
          if (el) {
            el.categories = cats;
            el.setAttribute("open", "");
          }
        });
      });
    </script>
  `,
};

export const Empty: Story = {
  render: () => html`
    <ui-search
      size="m"
      value="xyz-no-match"
      id="search-empty"
    ></ui-search>
    <script>
      requestAnimationFrame(() => {
        const el = document.getElementById("search-empty");
        if (el) {
          el.categories = ${JSON.stringify(categories)};
          el.setAttribute("open", "");
        }
      });
    </script>
  `,
};
