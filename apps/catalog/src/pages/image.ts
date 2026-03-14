import { registerPage } from "../registry.js";
import { landscapeSvg, createLandscapePng } from "../shared.js";

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
  `,
  setup: () => {
    const png = createLandscapePng();
    const container = document.getElementById("object-fit-demo");
    if (!container) return;
    for (const f of ["cover", "contain", "fill", "none"]) {
      const col = document.createElement("div");
      col.className = "flex-1";
      col.innerHTML = `<p class="mono-label">${f}</p><ui-image ratio="1:1" fit="${f}" src="${png}" alt="landscape"></ui-image>`;
      container.appendChild(col);
    }
  },
});
