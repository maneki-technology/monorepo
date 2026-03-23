import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-scrollbar.js";

registerPage("scrollbar", {
  title: "Scrollbar",
  section: "Data Display",
  render: () => `
    <h3>Emphasis</h3>
    <div class="variant-row gap-60">
      <div class="variant-col items-center">
        <span class="variant-label">Bold</span>
        <ui-scrollbar emphasis="bold" orientation="vertical" style="width: 200px; height: 200px; border: 1px solid var(--fd-border-minimal, #dce3e8);">
          <div style="padding: 12px; font-size: 14px; line-height: 1.6; color: var(--fd-text-primary, #1c2b36);">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
          </div>
        </ui-scrollbar>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Minimal</span>
        <ui-scrollbar emphasis="minimal" orientation="vertical" style="width: 200px; height: 200px; border: 1px solid var(--fd-border-minimal, #dce3e8);">
          <div style="padding: 12px; font-size: 14px; line-height: 1.6; color: var(--fd-text-primary, #1c2b36);">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
          </div>
        </ui-scrollbar>
      </div>
    </div>

    <h3>Orientation</h3>
    <div class="variant-row gap-60">
      <div class="variant-col items-center">
        <span class="variant-label">Vertical</span>
        <ui-scrollbar emphasis="bold" orientation="vertical" style="width: 200px; height: 200px; border: 1px solid var(--fd-border-minimal, #dce3e8);">
          <div style="padding: 12px; font-size: 14px; line-height: 1.6; color: var(--fd-text-primary, #1c2b36);">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
            <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </div>
        </ui-scrollbar>
      </div>
      <div class="variant-col items-center">
        <span class="variant-label">Horizontal</span>
        <ui-scrollbar emphasis="bold" orientation="horizontal" style="width: 300px; height: 80px; border: 1px solid var(--fd-border-minimal, #dce3e8);">
          <div style="padding: 12px; font-size: 14px; line-height: 1.6; color: var(--fd-text-primary, #1c2b36); white-space: nowrap; width: 800px;">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.
          </div>
        </ui-scrollbar>
      </div>
    </div>
  `,
});
