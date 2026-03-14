import { registerPage } from "../registry.js";

registerPage("accordion", {
  title: "Accordion",
  section: "Disclosure",
  render: () => `
    <h3>Sizes</h3>
    <div class="stack-l">
      <div>
        <span class="variant-label">S</span>
        <ui-accordion-group size="s">
          <ui-accordion-item expanded>
            <span slot="label">Small Item One</span>
            Content for small item one.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Small Item Two</span>
            Content for small item two.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Small Item Three</span>
            Content for small item three.
          </ui-accordion-item>
        </ui-accordion-group>
      </div>
      <div>
        <span class="variant-label">M</span>
        <ui-accordion-group size="m">
          <ui-accordion-item expanded>
            <span slot="label">Medium Item One</span>
            Content for medium item one.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Medium Item Two</span>
            Content for medium item two.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Medium Item Three</span>
            Content for medium item three.
          </ui-accordion-item>
        </ui-accordion-group>
      </div>
      <div>
        <span class="variant-label">L</span>
        <ui-accordion-group size="l">
          <ui-accordion-item expanded>
            <span slot="label">Large Item One</span>
            Content for large item one.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Large Item Two</span>
            Content for large item two.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Large Item Three</span>
            Content for large item three.
          </ui-accordion-item>
        </ui-accordion-group>
      </div>
    </div>

    <h3>Emphases</h3>
    <div class="grid-2">
      <div>
        <span class="variant-label">Bold</span>
        <ui-accordion-group size="m" emphasis="bold">
          <ui-accordion-item expanded>
            <span slot="label">Bold Item One</span>
            Bold emphasis content.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Bold Item Two</span>
            More content.
          </ui-accordion-item>
        </ui-accordion-group>
      </div>
      <div>
        <span class="variant-label">Subtle</span>
        <ui-accordion-group size="m" emphasis="subtle">
          <ui-accordion-item expanded>
            <span slot="label">Subtle Item One</span>
            Subtle emphasis content.
          </ui-accordion-item>
          <ui-accordion-item>
            <span slot="label">Subtle Item Two</span>
            More content.
          </ui-accordion-item>
        </ui-accordion-group>
      </div>
    </div>

    <h3>Statuses</h3>
    <ui-accordion-group size="m">
      <ui-accordion-item status="error" expanded>
        <span slot="label">Error Status</span>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </ui-accordion-item>
      <ui-accordion-item status="warning" expanded>
        <span slot="label">Warning Status</span>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </ui-accordion-item>
      <ui-accordion-item status="success" expanded>
        <span slot="label">Success Status</span>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </ui-accordion-item>
    </ui-accordion-group>

    <h3>Disabled</h3>
    <div class="variant-row">
      <ui-accordion-item disabled>
        <span slot="label">Disabled Accordion</span>
        This content is not accessible.
      </ui-accordion-item>
    </div>

    <h3>Exclusive Mode</h3>
    <ui-accordion-group size="m" exclusive>
      <ui-accordion-item expanded>
        <span slot="label">Section One</span>
        Only one section can be open at a time.
      </ui-accordion-item>
      <ui-accordion-item>
        <span slot="label">Section Two</span>
        Content for section two.
      </ui-accordion-item>
      <ui-accordion-item>
        <span slot="label">Section Three</span>
        Content for section three.
      </ui-accordion-item>
    </ui-accordion-group>
  `,
});
