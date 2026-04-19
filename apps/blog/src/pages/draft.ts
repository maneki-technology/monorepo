import { drafts } from "virtual:drafts";
import type { Route } from "../router.js";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const draftRoutes: Route[] = drafts.map((draft) => ({
  id: `draft/${draft.slug}`,
  render: () => `
    <article>
      <ui-alert status="warning" emphasis="subtle" size="m" class="mb-3">This is an unpublished draft shared for review.</ui-alert>
      <a href="/blog" class="inline-link body-02 arrow-link"><span class="arrow-left">←</span> <span class="link-text">Back to blog</span></a>
      <h1 class="heading-02 mt-3">${draft.title}</h1>
      <div class="post-meta mt-1">${formatDate(draft.date)} · ${draft.readTime}</div>
      <div class="tags mt-2">
        ${draft.tags.map((t: string) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
      </div>
      <div class="post-content mt-4 reveal">
        ${draft.content}
      </div>
    </article>
  `,
  meta: {
    title: `[Draft] ${draft.title}`,
    description: draft.excerpt,
  },
  showProgress: true,
}));

/** Lookup a single draft route by ID — used by lazy router. */
export function findDraftRoute(id: string): Route | undefined {
  return draftRoutes.find((r) => r.id === id);
}
