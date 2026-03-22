import { projects } from "../data.js";
import { registerRoute } from "../router.js";

registerRoute({
  id: "portfolio",
  render: () => `
    <h1 class="heading-02 mb-2">Portfolio</h1>
    <p class="body-01 text-secondary mb-4">Things I've built — from design systems to CLI tools.</p>
    <div class="project-grid">
      ${projects.map((project) => `
        <ui-card size="m" bordered>
          <div class="stack gap-1" style="padding:20px;">
            <h3 class="heading-05">${project.title}</h3>
            <p class="body-02 text-secondary">${project.description}</p>
            <div class="tags">
              ${project.tags.map((t) => `<ui-badge size="s" emphasis="subtle">${t}</ui-badge>`).join("")}
            </div>
            <div class="row gap-2 mt-1">
              ${project.url ? `<ui-link size="s" href="${project.url}" external>Live</ui-link>` : ""}
              ${project.repo ? `<ui-link size="s" href="${project.repo}" external>Source</ui-link>` : ""}
            </div>
          </div>
        </ui-card>
      `).join("")}
    </div>
  `,
});
