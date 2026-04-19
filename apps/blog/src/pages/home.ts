import { posts } from "virtual:posts";
import { pinnedProjects } from "virtual:projects";
import { featuredPhotos } from "virtual:photos";
import { thumbHashBase64ToDataURL } from "../lib/thumbhash.js";
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
    <section class="mb-5 reveal">
      <h1 class="display-03" style="margin-bottom:var(--fd-space-3);">Hey, I'm <strong class="hero-accent">Kien Nguyen<svg class="sig-underline" viewBox="0 0 200 18" preserveAspectRatio="none"><path d="M0 16 C25 14, 45 15, 70 12 S110 8, 140 9 S175 4, 200 3 L200 1.5 C175 2.5, 140 6, 110 5 S70 8, 45 11 S25 9, 0 11 Z"/></svg></strong></h1>
      <p class="body-01 text-secondary mt-2">Senior Software Engineer. Distributed systems, micro-frontends, and design systems. Amateur photographer.</p>
    </section>

    ${featuredPhotos.length > 0 ? `
    <section class="mb-5 reveal">
      <div class="row items-center" style="justify-content:space-between;">
        <h2 class="heading-05">Photography</h2>
        <a href="/photography" class="body-02 text-link arrow-link" style="text-decoration:none;">View all <span class="arrow-right">→</span></a>
      </div>
      <a href="/photography" class="polaroid-stack mt-3" id="polaroid-stack" aria-label="View photography">
        ${(() => {
          const count = Math.min(featuredPhotos.length, 5);
          const angles = [-10, 3, 8, -6, 11];
          const defaultSpacing = 120;
          const fanSpacing = 460;
          return featuredPhotos.slice(0, count).map((p, i) => {
            const fanX = (i - (count - 1) / 2) * fanSpacing;
            const dx = (i - (count - 1) / 2) * defaultSpacing;
            const dy = [8, -14, 10, -8, 12][i] || 0;
            return `
            <div class="polaroid" data-photo-index="${i}" style="--rot:${angles[i]}deg;--ox:${dx}px;--oy:${dy}px;--fan-x:${fanX}px;">
              <ui-image src="${p.url}" alt="${p.title || ''}"
                   width="${p.width}" height="${p.height}"
                   ${p.thumbhash ? `placeholder="${(() => { try { return thumbHashBase64ToDataURL(p.thumbhash); } catch { return ''; } })()}"` : ''}
                   loading="lazy" decoding="async"></ui-image>
            </div>`;
          }).join("");
        })()}
      </a>
    </section>
    ` : ""}

    <section class="mb-5 reveal">
      <div class="row items-center" style="justify-content:space-between;">
        <h2 class="heading-05">Recent posts</h2>
        <a href="/blog" class="body-02 text-link arrow-link" style="text-decoration:none;">View all <span class="arrow-right">→</span></a>
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
        <a href="/portfolio" class="body-02 text-link arrow-link" style="text-decoration:none;">View all <span class="arrow-right">→</span></a>
      </div>
      <div class="project-grid mt-3 reveal-stagger">
        ${pinnedProjects.map((project: any) => `
          <div class="reveal">
            <ui-card size="m" bordered>
              ${project.image ? `<ui-image src="${project.image}" alt="${project.title}" slot="image" style="width:100%;height:180px;--ui-image-fit:cover;"></ui-image>` : ""}
              <div class="stack gap-1" style="padding:20px;">
                <a href="/project/${project.slug}" class="project-card-title heading-05">${project.title}</a>
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
  setup: () => {
    const stack = document.getElementById("polaroid-stack");
    if (!stack) return;
    const stackEl: HTMLElement = stack;
    const polaroids = Array.from(stack.querySelectorAll(".polaroid")) as HTMLElement[];
    if (polaroids.length < 2) return;

    function shuffle(): void {
      // Fisher-Yates to get random order
      const indices = polaroids.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      const count = polaroids.length;
      const w = window.innerWidth;
      const polaroidW = polaroids[0].offsetWidth;
      const maxFan = (w - polaroidW) / Math.max(count - 1, 1);
      const idealFan = w <= 480 ? 260 : w <= 768 ? 320 : 460;
      const fanSpacing = Math.min(idealFan, maxFan);
      const clampRatio = maxFan < idealFan ? 1 - maxFan / idealFan : 0;
      const defaultSpacing = w <= 480 ? 20 : w <= 768 ? 40 : 120;

      polaroids.forEach((el, i) => {
        const order = indices[i];
        const rot = (Math.random() * 12 - 6);
        const dx = (order - (count - 1) / 2) * defaultSpacing + (Math.random() * 6 - 3);
        const dy = Math.random() * 10 - 5;
        const fanX = (order - (count - 1) / 2) * fanSpacing;
        const eased = 1 - (1 - clampRatio) ** 3;
        const fanY = order % 2 === 0 ? Math.round(eased * -20) : Math.round(eased * 100);

        el.style.setProperty("--rot", `${rot}deg`);
        el.style.setProperty("--ox", `${dx}px`);
        el.style.setProperty("--oy", `${dy}px`);
        el.style.setProperty("--fan-x", `${fanX}px`);
        el.style.setProperty("--fan-y", `${fanY}px`);
        el.style.zIndex = `${count - order}`;
      });
    }

    // Shuffle on load
    shuffle();

    // Reshuffle every 30 seconds
    setInterval(shuffle, 30000);
  },
};
