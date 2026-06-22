import { posts } from "virtual:posts";
import type { Route } from "../router.js";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const blogRoute: Route = {
  id: "blog",
  meta: { title: "Blog", description: "Posts about fullstack development, design systems, and the web." },
  render: () => `
    <h1 class="heading-02 mb-2">Blog</h1>
    ${
      posts.length === 0
        ? `
    <div class="empty-state reveal">
      <p class="empty-state-kicker body-03">Writing desk</p>
      <h2 class="heading-04">I have not published any posts here yet.</h2>
      <p class="body-01 text-secondary">I use this space for engineering notes, design-system lessons, and longer write-ups once they are ready. For now, the best way to understand my work is through the projects I have shipped.</p>
      <div class="row gap-2 empty-state-actions">
        <a href="/portfolio" class="inline-link body-02 arrow-link"><span class="link-text">View my portfolio</span> <span class="arrow-right">→</span></a>
        <a href="/resume" class="inline-link body-02 arrow-link"><span class="link-text">Read my resume</span> <span class="arrow-right">→</span></a>
      </div>
    </div>`
        : `
    <ui-search id="post-search" placeholder="Search posts..." size="m" class="mb-4"></ui-search>
    <div id="post-list" class="stack reveal-stagger">
      ${posts
        .map(
          (post) => `
        <div class="post-card reveal" data-title="${post.title.toLowerCase()}" data-tags="${post.tags.join(",").toLowerCase()}" data-excerpt="${post.excerpt.toLowerCase()}">
          <a class="post-card-title" href="/post/${post.slug}">${post.title}</a>
          <div class="post-meta">${formatDate(post.date)} \u00b7 ${post.readTime}</div>
          <p class="post-excerpt">${post.excerpt}</p>
          <div class="tags">
            ${post.tags.map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
    <p id="no-results" class="body-01 text-secondary" style="display:none;">No posts found.</p>`
    }
  `,
  setup: () => {
    const search = document.getElementById("post-search") as HTMLElement;
    const list = document.getElementById("post-list")!;
    const noResults = document.getElementById("no-results")!;
    if (!search) return;

    search.addEventListener("search-input", (e: Event) => {
      const query = ((e as CustomEvent).detail?.value ?? "").toLowerCase().trim();
      const cards = list.querySelectorAll(".post-card");
      let visible = 0;

      cards.forEach((card) => {
        const el = card as HTMLElement;
        const title = el.dataset.title ?? "";
        const tags = el.dataset.tags ?? "";
        const excerpt = el.dataset.excerpt ?? "";
        const match = !query || title.includes(query) || tags.includes(query) || excerpt.includes(query);
        el.style.display = match ? "" : "none";
        if (match) visible++;
      });

      noResults.style.display = visible === 0 ? "" : "none";
    });

    search.addEventListener("search-clear", () => {
      list.querySelectorAll(".post-card").forEach((card) => {
        (card as HTMLElement).style.display = "";
      });
      noResults.style.display = "none";
    });
  },
};
