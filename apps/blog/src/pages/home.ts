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
    <section class="mb-6">
      <h1 class="display-03">Hey, I'm <strong>Kien Nguyen</strong></h1>
      <p class="body-01 text-secondary mt-2">Senior Software Engineer. Distributed systems, micro-frontends, and design systems.</p>
    </section>

    <section class="mb-6">
      <div class="row items-center" style="justify-content:space-between;">
        <h2 class="heading-05">Recent posts</h2>
        <a href="/blog" class="body-02 text-link" style="text-decoration:none;">View all \u2192</a>
      </div>
      <div class="stack mt-3">
        ${posts.slice(0, 3).map((post) => `
          <div class="post-card">
            <a class="post-card-title" href="/post/${post.slug}">${post.title}</a>
            <div class="post-meta">${formatDate(post.date)} \u00b7 ${post.readTime}</div>
            <p class="post-excerpt">${post.excerpt}</p>
          </div>
        `).join("")}
      </div>
    </section>

    <section>
      <div class="row items-center" style="justify-content:space-between;">
        <h2 class="heading-05">Featured projects</h2>
        <a href="/portfolio" class="body-02 text-link" style="text-decoration:none;">View all \u2192</a>
      </div>
      <div class="project-grid mt-3">
        ${pinnedProjects.map((project: any) => `
          <a href="/project/${project.slug}" style="text-decoration:none;color:inherit;">
            <ui-card size="m" bordered>
              <div class="stack gap-1" style="padding:20px;">
                <h3 class="heading-05">${project.title}</h3>
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
          </a>
        `).join("")}
      </div>
    </section>
  `,
};
