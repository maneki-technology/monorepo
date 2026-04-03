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

    <h3>Placeholder</h3>
    <div class="variant-row gap-24">
      <div class="flex-1">
        <p class="mono-label">No src (default bg)</p>
        <ui-image ratio="16:9"></ui-image>
      </div>
      <div class="flex-1">
        <p class="mono-label">Custom placeholder</p>
        <ui-image ratio="16:9">
          <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#5b7282;font-size:14px">No image available</div>
        </ui-image>
      </div>
    </div>

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
    const container = document.getElementById("object-fit-demo");
    if (!container) return;
    container.innerHTML = "";
    for (const f of ["cover", "contain", "fill", "none"]) {
      const col = document.createElement("div");
      col.className = "flex-1";
      col.innerHTML = `<p class="mono-label">${f}</p><ui-image ratio="1:1" fit="${f}" src="${png}" alt="landscape"></ui-image>`;
      container.appendChild(col);
    }
  },
});
