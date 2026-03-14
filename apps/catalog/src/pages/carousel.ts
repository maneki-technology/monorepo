import { registerPage } from "../registry.js";

registerPage("carousel", {
  title: "Carousel",
  section: "Containers",
  render: () => `
    <h3>Basic Carousel</h3>
    <div class="w-600">
      <ui-carousel>
        ${[
          { bg: "#D4E4FA", label: "Slide 1" },
          { bg: "#DCE3E8", label: "Slide 2" },
          { bg: "#FDDDB3", label: "Slide 3" },
          { bg: "#C4DFD2", label: "Slide 4" },
        ].map(s => `
          <ui-carousel-item style="width:280px">
            <div style="height:200px;background:${s.bg};border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600;color:#1C2B36">${s.label}</div>
          </ui-carousel-item>
        `).join("")}
      </ui-carousel>
    </div>

    <h3>With Loop</h3>
    <div class="w-600">
      <ui-carousel loop>
        ${[
          { bg: "#D4E4FA", label: "Slide 1" },
          { bg: "#DCE3E8", label: "Slide 2" },
          { bg: "#FDDDB3", label: "Slide 3" },
          { bg: "#C4DFD2", label: "Slide 4" },
        ].map(s => `
          <ui-carousel-item style="width:280px">
            <div style="height:200px;background:${s.bg};border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600;color:#1C2B36">${s.label}</div>
          </ui-carousel-item>
        `).join("")}
      </ui-carousel>
    </div>

    <h3>Custom Gap (32px)</h3>
    <div class="w-600">
      <ui-carousel gap="32">
        ${[
          { bg: "#D4E4FA", label: "Slide 1" },
          { bg: "#DCE3E8", label: "Slide 2" },
          { bg: "#FDDDB3", label: "Slide 3" },
        ].map(s => `
          <ui-carousel-item style="width:280px">
            <div style="height:200px;background:${s.bg};border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600;color:#1C2B36">${s.label}</div>
          </ui-carousel-item>
        `).join("")}
      </ui-carousel>
    </div>

    <h3>No Arrows</h3>
    <div class="w-600">
      <ui-carousel hide-arrows>
        ${[
          { bg: "#D4E4FA", label: "Slide 1" },
          { bg: "#DCE3E8", label: "Slide 2" },
          { bg: "#FDDDB3", label: "Slide 3" },
        ].map(s => `
          <ui-carousel-item style="width:280px">
            <div style="height:200px;background:${s.bg};border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600;color:#1C2B36">${s.label}</div>
          </ui-carousel-item>
        `).join("")}
      </ui-carousel>
    </div>

    <h3>No Indicators</h3>
    <div class="w-600">
      <ui-carousel hide-indicators>
        ${[
          { bg: "#D4E4FA", label: "Slide 1" },
          { bg: "#DCE3E8", label: "Slide 2" },
          { bg: "#FDDDB3", label: "Slide 3" },
        ].map(s => `
          <ui-carousel-item style="width:280px">
            <div style="height:200px;background:${s.bg};border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600;color:#1C2B36">${s.label}</div>
          </ui-carousel-item>
        `).join("")}
      </ui-carousel>
    </div>

    <h3>Single Full-Width Slide</h3>
    <div class="w-600">
      <ui-carousel>
        <ui-carousel-item style="width:100%">
          <div style="height:240px;background:#D4E4FA;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600;color:#1C2B36">Single Full-Width Slide</div>
        </ui-carousel-item>
      </ui-carousel>
    </div>
  `,
});
