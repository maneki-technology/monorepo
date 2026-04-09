import { posts } from "virtual:posts";
import { pinnedProjects } from "virtual:projects";
import type { Route } from "../router.js";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const homeRoute: Route = {
  id: "home",
  meta: { title: "Home", description: "Senior Software Engineer. Distributed systems, micro-frontend architecture, and design systems." },
  render: () => `
    <section class="mb-6 reveal">
      <h1 class="display-03" style="margin-bottom:var(--fd-space-3);">Hey, I'm <strong class="hero-accent">Kien Nguyen<svg class="sig-underline" viewBox="0 0 200 18" preserveAspectRatio="none"><path d="M0 16 C25 14, 45 15, 70 12 S110 8, 140 9 S175 4, 200 3 L200 1.5 C175 2.5, 140 6, 110 5 S70 8, 45 11 S25 9, 0 11 Z"/></svg></strong></h1>
      <p class="body-01 text-secondary mt-2">Senior Software Engineer. Distributed systems, micro-frontends, and design systems.</p>
    </section>

    <section class="mb-6 reveal">
      <div class="row items-center" style="justify-content:space-between;">
        <h2 class="heading-05">Recent posts</h2>
        <a href="/blog" class="body-02 text-link" style="text-decoration:none;">View all \u2192</a>
      </div>
      <div class="stack mt-3 reveal-stagger">
        ${posts.slice(0, 3).map((post) => `
          <div class="post-card reveal">
            <a class="post-card-title" href="/post/${post.slug}">${post.title}</a>
            <div class="post-meta">${formatDate(post.date)} \u00b7 ${post.readTime}</div>
            <p class="post-excerpt">${post.excerpt}</p>
          </div>
        `).join("")}
      </div>
    </section>

    <section class="reveal">
      <div class="row items-center" style="justify-content:space-between;">
        <h2 class="heading-05">Featured projects</h2>
        <a href="/portfolio" class="body-02 text-link" style="text-decoration:none;">View all \u2192</a>
      </div>
      <div class="project-grid mt-3 reveal-stagger">
        ${pinnedProjects.map((project: any) => `
          <div class="reveal">
            <ui-card size="m" bordered>
              ${project.image ? `<ui-image src="${project.image}" alt="${project.title}" slot="image" style="width:100%;height:180px;--ui-image-fit:cover;"></ui-image>` : ""}
              <div class="stack gap-1" style="padding:20px;">
                <a href="/project/${project.slug}" class="heading-05" style="text-decoration:none;color:inherit;">${project.title}</a>
                <p class="body-02 text-secondary">${project.description}</p>
                <div class="tags">
                  ${project.tech.map((t: string) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
                </div>
                <div class="row gap-2 mt-1">
                  ${project.url ? `<ui-link size="s" href="${project.url}" external>Live</ui-link>` : ""}
                  ${project.repo ? `<ui-link size="s" href="${project.repo}" external>Source</ui-link>` : ""}
                </div>
              </div>
            </ui-card>
          </div>
        `).join("")}
      </div>
    </section>
  `,
};
