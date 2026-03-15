import { registerPage } from "../registry.js";
import { landscapeSvg } from "../shared.js";

registerPage("card", {
  title: "Card",
  section: "Containers",
  render: () => `
    <h3>Sizes</h3>
    <div class="variant-row row-start gap-24">
      <ui-card size="s" class="flex-1">
        <div class="card-content">
          <h4 class="card-title">Small</h4>
          <p class="card-text">Size s card content.</p>
        </div>
      </ui-card>
      <ui-card size="m" class="flex-1">
        <div class="card-content">
          <h4 class="card-title">Medium</h4>
          <p class="card-text">Size m card content.</p>
        </div>
      </ui-card>
      <ui-card size="l" class="flex-1">
        <div class="card-content">
          <h4 class="card-title">Large</h4>
          <p class="card-text">Size l card content.</p>
        </div>
      </ui-card>
    </div>

    <h3>Elevations</h3>
    <div class="variant-row row-start gap-24">
      <ui-card elevation="00" class="flex-1">
        <div class="card-content">
          <h4 class="card-title">Elevation 00</h4>
          <p class="card-text">No shadow.</p>
        </div>
      </ui-card>
      <ui-card elevation="01" class="flex-1">
        <div class="card-content">
          <h4 class="card-title">Elevation 01</h4>
          <p class="card-text">Subtle shadow.</p>
        </div>
      </ui-card>
      <ui-card elevation="02" class="flex-1">
        <div class="card-content">
          <h4 class="card-title">Elevation 02</h4>
          <p class="card-text">Default shadow.</p>
        </div>
      </ui-card>
      <ui-card elevation="04" class="flex-1">
        <div class="card-content">
          <h4 class="card-title">Elevation 04</h4>
          <p class="card-text">Strong shadow.</p>
        </div>
      </ui-card>
    </div>

    <h3>Bordered</h3>
    <div class="variant-row row-start gap-24">
      <ui-card bordered elevation="00" class="w-320">
        <div class="card-content">
          <h4 class="card-title">Bordered Card</h4>
          <p class="card-text">A card with a border and no elevation shadow.</p>
        </div>
      </ui-card>
      <ui-card bordered elevation="02" class="w-320">
        <div class="card-content">
          <h4 class="card-title">Bordered + Elevation</h4>
          <p class="card-text">Border combined with elevation 02.</p>
        </div>
      </ui-card>
    </div>

    <h3>With Image</h3>
    <div class="variant-row row-start gap-24">
      <ui-card class="w-320">
        <ui-image slot="image" ratio="16:9" src="${landscapeSvg}" alt="card image"></ui-image>
        <div class="card-content">
          <h4 class="card-title">Card Title</h4>
          <p class="card-text">Card content below the image area.</p>
        </div>
      </ui-card>
    </div>

    <h3>With Footer</h3>
    <div class="variant-row row-start gap-24">
      <ui-card class="w-320">
        <div class="card-content">
          <h4 class="card-title">Card Title</h4>
          <p class="card-text">Card body content goes here.</p>
        </div>
        <div slot="footer" style="display:flex;gap:8px;padding:0 16px 16px">
          <ui-button action="primary" emphasis="bold" size="s">Confirm</ui-button>
          <ui-button action="secondary" emphasis="subtle" size="s">Cancel</ui-button>
        </div>
      </ui-card>
    </div>

    <h3>Full Card (Image + Footer)</h3>
    <div class="variant-row row-start gap-24">
      <ui-card class="w-320">
        <ui-image slot="image" ratio="16:9" src="${landscapeSvg}" alt="featured"></ui-image>
        <div class="card-content">
          <h4 class="card-title">Featured Article</h4>
          <p class="card-text">A full card example with image, heading, body text, and an action button.</p>
        </div>
        <div slot="footer" style="padding:0 16px 16px">
          <ui-button action="primary" emphasis="bold" size="s">Read More</ui-button>
        </div>
      </ui-card>
      <ui-card class="w-320">
        <ui-image slot="image" ratio="16:9" src="${landscapeSvg}" alt="article"></ui-image>
        <div class="card-content">
          <h4 class="card-title">Article Headline</h4>
          <p class="card-text">Brief summary of the article content that gives readers a preview.</p>
        </div>
        <div slot="footer" style="display:flex;justify-content:space-between;align-items:center;padding:0 16px 16px">
          <span class="text-secondary">5 min read</span>
          <ui-icon name="share" size="m" style="--ui-icon-color:#5b7282"></ui-icon>
        </div>
      </ui-card>
    </div>
  `,
});
