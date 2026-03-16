import { registerPage } from "../registry.js";

registerPage("person", {
  title: "Person",
  section: "Data Display",
  render: () => `
    <h3>Sizes — Full Details</h3>
    <div class="stack-l">
      <div class="variant-col">
        <span class="variant-label">XS</span>
        <ui-person-item size="xs" name="Jacob Walker" title="Managing Director" location="London, UK"></ui-person-item>
      </div>
      <div class="variant-col">
        <span class="variant-label">S</span>
        <ui-person-item size="s" name="Jacob Walker" title="Managing Director" location="London, UK"></ui-person-item>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <ui-person-item size="m" name="Jacob Walker" title="Managing Director" location="London, UK"></ui-person-item>
      </div>
      <div class="variant-col">
        <span class="variant-label">L</span>
        <ui-person-item size="l" name="Jacob Walker" title="Managing Director" location="London, UK"></ui-person-item>
      </div>
    </div>

    <h3>Name Only</h3>
    <div class="stack-l">
      <div class="variant-col">
        <span class="variant-label">XS</span>
        <ui-person-item size="xs" name="Jacob Walker" name-only></ui-person-item>
      </div>
      <div class="variant-col">
        <span class="variant-label">S</span>
        <ui-person-item size="s" name="Jacob Walker" name-only></ui-person-item>
      </div>
      <div class="variant-col">
        <span class="variant-label">M</span>
        <ui-person-item size="m" name="Jacob Walker" name-only></ui-person-item>
      </div>
      <div class="variant-col">
        <span class="variant-label">L</span>
        <ui-person-item size="l" name="Jacob Walker" name-only></ui-person-item>
      </div>
    </div>

    <h3>With Avatar Text</h3>
    <div class="stack-l">
      <div class="variant-col">
        <span class="variant-label">M — Text Avatar</span>
        <ui-person-item size="m" name="Jacob Walker" title="Managing Director" location="London, UK" avatar-text="JW"></ui-person-item>
      </div>
      <div class="variant-col">
        <span class="variant-label">L — Text Avatar</span>
        <ui-person-item size="l" name="Sarah Chen" title="Vice President" location="New York, US" avatar-text="SC"></ui-person-item>
      </div>
    </div>

    <h3>Person Group</h3>
    <div class="stack-l">
      <div class="variant-col">
        <span class="variant-label">Group — Size M</span>
        <ui-person-group size="m" title="Team Members">
          <ui-person-item name="Jacob Walker" title="Managing Director" location="London, UK"></ui-person-item>
          <ui-person-item name="Sarah Chen" title="Vice President" location="New York, US" avatar-text="SC"></ui-person-item>
          <ui-person-item name="Alex Kim" title="Associate" location="Hong Kong"></ui-person-item>
          <ui-person-item name="Maria Garcia" title="Analyst" location="Madrid, ES" avatar-text="MG"></ui-person-item>
        </ui-person-group>
      </div>

      <div class="variant-col">
        <span class="variant-label">Group — Size XS</span>
        <ui-person-group size="xs" title="Quick Contacts">
          <ui-person-item name="Jacob Walker"></ui-person-item>
          <ui-person-item name="Sarah Chen"></ui-person-item>
          <ui-person-item name="Alex Kim"></ui-person-item>
        </ui-person-group>
      </div>

      <div class="variant-col">
        <span class="variant-label">Group — Size L</span>
        <ui-person-group size="l" title="Leadership">
          <ui-person-item name="Jacob Walker" title="Managing Director" location="London, UK"></ui-person-item>
          <ui-person-item name="Sarah Chen" title="Vice President" location="New York, US" avatar-text="SC"></ui-person-item>
        </ui-person-group>
      </div>
    </div>
  `,
});
