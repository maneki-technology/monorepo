import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-checkbox-item.js";
import "@maneki/ui-components/components/ui-tree-group.js";
import "@maneki/ui-components/components/ui-tree-item.js";

registerPage("tree", {
  title: "Tree",
  section: "Navigation",
  render: () => `
    <h3>Variant</h3>
    <div class="variant-row gap-60">
      <div class="variant-col items-center">
        <span class="variant-label">S</span>
        <ui-tree-group size="s" class="w-fixed-300">
          <ui-tree-item arrow="open" label="Parent"></ui-tree-item>
          <ui-tree-item arrow="none" level="child-1" label="Child 1"></ui-tree-item>
          <ui-tree-item arrow="none" level="child-1" label="Child 2"></ui-tree-item>
        </ui-tree-group>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">M</span>
        <ui-tree-group size="m" class="w-fixed-300">
          <ui-tree-item arrow="open" label="Parent"></ui-tree-item>
          <ui-tree-item arrow="none" level="child-1" label="Child 1"></ui-tree-item>
          <ui-tree-item arrow="none" level="child-1" label="Child 2"></ui-tree-item>
        </ui-tree-group>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">L</span>
        <ui-tree-group size="l" class="w-fixed-300">
          <ui-tree-item arrow="open" label="Parent"></ui-tree-item>
          <ui-tree-item arrow="none" level="child-1" label="Child 1"></ui-tree-item>
          <ui-tree-item arrow="none" level="child-1" label="Child 2"></ui-tree-item>
        </ui-tree-group>
      </div>
    </div>

    <h3>Level</h3>
    <div class="variant-row gap-60">
      <div class="variant-col items-center">
        <span class="variant-label">Parent / Child 1</span>
        <ui-tree-group class="w-fixed-300">
          <ui-tree-item arrow="open" label="Parent"></ui-tree-item>
          <ui-tree-item arrow="none" level="child-1" label="Child 1 Item"></ui-tree-item>
          <ui-tree-item arrow="none" level="child-1" label="Child 1 Item"></ui-tree-item>
        </ui-tree-group>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Child 2 / Child 3</span>
        <div class="w-fixed-300">
          <ui-tree-item arrow="none" level="child-2" label="Child 2 Item"></ui-tree-item>
          <ui-tree-item arrow="none" level="child-3" label="Child 3 Item"></ui-tree-item>
        </div>
      </div>
    </div>

    <h3>Arrow</h3>
    <div class="variant-row gap-60">
      <div class="variant-col items-center">
        <span class="variant-label">None</span>
        <div class="w-fixed-300">
          <ui-tree-item arrow="none" label="Leaf Item"></ui-tree-item>
        </div>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Closed</span>
        <div class="w-fixed-300">
          <ui-tree-item arrow="closed" label="Collapsed"></ui-tree-item>
        </div>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Open</span>
        <div class="w-fixed-300">
          <ui-tree-item arrow="open" label="Expanded"></ui-tree-item>
        </div>
      </div>
    </div>

    <h3>State</h3>
    <div class="variant-row gap-60">
      <div class="variant-col items-center">
        <span class="variant-label">Enabled</span>
        <div class="w-fixed-300">
          <ui-tree-item arrow="none" label="Enabled Item"></ui-tree-item>
        </div>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Selected</span>
        <div class="w-fixed-300">
          <ui-tree-item arrow="none" label="Selected Item" selected></ui-tree-item>
        </div>
      </div>
    </div>

    <h3>Leading Icon</h3>
    <ui-tree-group class="w-fixed-300">
      <ui-tree-item arrow="open" label="With Icon" leading-icon icon-name="home"></ui-tree-item>
      <ui-tree-item arrow="none" level="child-1" label="Child" leading-icon icon-name="settings"></ui-tree-item>
    </ui-tree-group>

    <h3>Checkbox</h3>
    <ui-tree-group class="w-fixed-300">
      <ui-tree-item arrow="open" label="With Checkbox" checkbox>
        <ui-checkbox-item slot="checkbox" size="m"></ui-checkbox-item>
      </ui-tree-item>
      <ui-tree-item arrow="none" level="child-1" label="Child" checkbox>
        <ui-checkbox-item slot="checkbox" size="m"></ui-checkbox-item>
      </ui-tree-item>
    </ui-tree-group>

    <h3>Secondary Label</h3>
    <div class="w-fixed-300">
      <ui-tree-item arrow="none" label="Item" secondary-label="Info"></ui-tree-item>
    </div>

    <h3>Tree Group (Interactive)</h3>
    <div class="w-fixed-300">
      <ui-tree-group size="m" searchable>
        <ui-tree-item arrow="closed" label="Documents"></ui-tree-item>
        <ui-tree-item arrow="none" level="child-1" label="Report.pdf"></ui-tree-item>
        <ui-tree-item arrow="none" level="child-1" label="Summary.docx"></ui-tree-item>
        <ui-tree-item arrow="none" level="child-1" label="Notes.txt"></ui-tree-item>
        <ui-tree-item arrow="open" label="Projects"></ui-tree-item>
        <ui-tree-item arrow="none" level="child-1" label="Alpha" selected></ui-tree-item>
        <ui-tree-item arrow="open" level="child-1" label="Beta"></ui-tree-item>
        <ui-tree-item arrow="open" level="child-2" label="Frontend"></ui-tree-item>
        <ui-tree-item arrow="closed" level="child-3" label="Components"></ui-tree-item>
        <ui-tree-item arrow="closed" level="child-2" label="Backend"></ui-tree-item>
        <ui-tree-item arrow="closed" level="child-1" label="Gamma"></ui-tree-item>
      </ui-tree-group>
    </div>
  `,
});
