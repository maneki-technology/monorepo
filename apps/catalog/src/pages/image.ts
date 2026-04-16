import { registerPage } from "../registry.js";
import { landscapeSvg, createLandscapePng } from "../shared.js";
import "@maneki/ui-components/components/ui-card.js";
import "@maneki/ui-components/components/ui-image.js";

registerPage("image", {
  title: "Image",
  section: "Primitives",
  render: () => `
    <h3>Aspect Ratios</h3>
    <div class="stack-l w-600">
      ${["16:9", "3:2", "1:1", "3:1", "21:9"].map(r => `<div>
        <p class="mono-label">${r}</p>
        <ui-image ratio="${r}" src="${landscapeSvg}" alt="landscape"></ui-image>
      </div>`).join("")}
    </div>

    <h3>Object Fit</h3>
    <div id="object-fit-demo" class="variant-row gap-24"></div>

    <h3>Placeholder (blur-up)</h3>
    <div class="variant-row gap-24">
      <div class="flex-1">
        <p class="mono-label">No src (default bg)</p>
        <ui-image ratio="16:9"></ui-image>
      </div>
      <div class="flex-1">
        <p class="mono-label">Custom fallback slot</p>
        <ui-image ratio="16:9">
          <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#5b7282;font-size:14px">No image available</div>
        </ui-image>
      </div>
    </div>

    <h3>Placeholder with data URL</h3>
    <div id="placeholder-demo" class="variant-row gap-24"></div>

    <h3>In Card</h3>
    <div class="w-320">
      <ui-card>
        <ui-image slot="image" ratio="16:9" src="${landscapeSvg}" alt="card image"></ui-image>
        <div class="card-content">
          <p class="card-title">Card with Image</p>
          <p class="card-text">Using ui-image inside a card's image slot.</p>
        </div>
      </ui-card>
    </div>

    <h3>Caption Slot</h3>
    <div class="variant-row gap-24">
      <div class="flex-1">
        <span class="variant-label">With caption</span>
        <ui-image ratio="16:9" src="${landscapeSvg}" alt="landscape">
          <span slot="caption">Figure 1: A beautiful landscape scene</span>
        </ui-image>
      </div>
      <div class="flex-1">
        <span class="variant-label">Without caption</span>
        <ui-image ratio="16:9" src="${landscapeSvg}" alt="landscape"></ui-image>
      </div>
    </div>

    <h3>Caption with custom styling</h3>
    <div class="variant-row gap-24">
      <div class="flex-1">
        <ui-image ratio="3:2" src="${landscapeSvg}" alt="landscape" style="--ui-image-caption-color:var(--fd-text-primary);">
          <span slot="caption"><strong>Figure 2:</strong> Caption with primary text color</span>
        </ui-image>
      </div>
    </div>
  `,
  setup: () => {
    const png = createLandscapePng();

    // Object fit demo
    const container = document.getElementById("object-fit-demo");
    if (container) {
      container.innerHTML = "";
      for (const f of ["cover", "contain", "fill", "none"]) {
        const col = document.createElement("div");
        col.className = "flex-1";
        col.innerHTML = `<p class="mono-label">${f}</p><ui-image ratio="1:1" fit="${f}" src="${png}" alt="landscape"></ui-image>`;
        container.appendChild(col);
      }
    }

    // Placeholder blur-up demo — generate a tiny blurred placeholder from canvas
    const phDemo = document.getElementById("placeholder-demo");
    if (phDemo) {
      const c = document.createElement("canvas");
      c.width = 4; c.height = 2;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, 4, 2);
      ctx.fillStyle = "#228B22"; ctx.fillRect(0, 1, 4, 1);
      const placeholder = c.toDataURL("image/png");

      // With placeholder + real image (shows blur then crossfade)
      const col1 = document.createElement("div");
      col1.className = "flex-1";
      col1.innerHTML = `<p class="mono-label">placeholder + src (blur-up)</p><ui-image ratio="16:9" placeholder="${placeholder}" src="${png}" alt="landscape"></ui-image>`;
      phDemo.appendChild(col1);

      // With placeholder only (no src — stays blurred)
      const col2 = document.createElement("div");
      col2.className = "flex-1";
      col2.innerHTML = `<p class="mono-label">placeholder only (no src)</p><ui-image ratio="16:9" placeholder="${placeholder}"></ui-image>`;
      phDemo.appendChild(col2);

      // Delayed load — shows placeholder then fades in after 1s
      const col3 = document.createElement("div");
      col3.className = "flex-1";
      col3.innerHTML = `<p class="mono-label">delayed load (1s)</p><ui-image id="delayed-placeholder" ratio="16:9" placeholder="${placeholder}"></ui-image>`;
      phDemo.appendChild(col3);
      setTimeout(() => {
        const delayed = document.getElementById("delayed-placeholder");
        if (delayed) delayed.setAttribute("src", png);
      }, 1000);
    }
  },
});
