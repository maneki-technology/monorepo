import { registerPage } from "../registry.js";

registerPage("popover", {
  title: "Popover",
  section: "Overlays",
  render: () => `
    <h3>Variants</h3>
    <div style="display: flex; gap: 40px; padding: 20px 0 120px;">
      <div class="variant-col" style="align-items: center;">
        <span class="variant-label">Size S</span>
        <ui-popover size="s" placement="bottom-left" title-text="Title" description="Description" open>
          <ui-button slot="trigger" size="s">Trigger S</ui-button>
        </ui-popover>
      </div>
      <div class="variant-col" style="align-items: center; margin-left: 380px;">
        <span class="variant-label">Size M</span>
        <ui-popover size="m" placement="bottom-left" title-text="Title" description="Description" open>
          <ui-button slot="trigger" size="m">Trigger M</ui-button>
        </ui-popover>
      </div>
    </div>

    <h3>Dismissable</h3>
    <div style="display: flex; gap: 40px; padding: 20px 0 120px;">
      <div class="variant-col" style="align-items: center;">
        <span class="variant-label">Off</span>
        <ui-popover size="m" placement="bottom-left" title-text="Title" description="Description" open>
          <ui-button slot="trigger" size="m">Trigger</ui-button>
        </ui-popover>
      </div>
      <div class="variant-col" style="align-items: center; margin-left: 380px;">
        <span class="variant-label">On</span>
        <ui-popover size="m" placement="bottom-left" title-text="Title" description="Description" dismissable open>
          <ui-button slot="trigger" size="m">Trigger</ui-button>
        </ui-popover>
      </div>
    </div>

    <h3>Placement — Top</h3>
    <div style="display: flex; padding: 140px 0 20px;">
      <div style="margin-left: 20px;">
        <ui-popover placement="top-left" title-text="Top Left" description="Arrow points down" open>
          <ui-button slot="trigger" size="s">Trigger</ui-button>
        </ui-popover>
      </div>
      <div style="margin-left: 420px;">
        <ui-popover placement="top-center" title-text="Top Center" description="Arrow points down" open>
          <ui-button slot="trigger" size="s">Trigger</ui-button>
        </ui-popover>
      </div>
      <div style="margin-left: 420px;">
        <ui-popover placement="top-right" title-text="Top Right" description="Arrow points down" open>
          <ui-button slot="trigger" size="s">Trigger</ui-button>
        </ui-popover>
      </div>
    </div>

    <h3>Placement — Bottom</h3>
    <div style="display: flex; padding: 20px 0 140px;">
      <div style="margin-left: 20px;">
        <ui-popover placement="bottom-left" title-text="Bottom Left" description="Arrow points up" open>
          <ui-button slot="trigger" size="s">Trigger</ui-button>
        </ui-popover>
      </div>
      <div style="margin-left: 420px;">
        <ui-popover placement="bottom-center" title-text="Bottom Center" description="Arrow points up" open>
          <ui-button slot="trigger" size="s">Trigger</ui-button>
        </ui-popover>
      </div>
      <div style="margin-left: 420px;">
        <ui-popover placement="bottom-right" title-text="Bottom Right" description="Arrow points up" open>
          <ui-button slot="trigger" size="s">Trigger</ui-button>
        </ui-popover>
      </div>
    </div>

    <h3>Placement — Left</h3>
    <div style="display: flex; flex-direction: column; gap: 120px; padding: 20px 0 20px 400px;">
      <ui-popover placement="left-top" title-text="Left Top" description="Arrow points right" open>
        <ui-button slot="trigger" size="s">Trigger</ui-button>
      </ui-popover>
      <ui-popover placement="left-center" title-text="Left Center" description="Arrow points right" open>
        <ui-button slot="trigger" size="s">Trigger</ui-button>
      </ui-popover>
      <ui-popover placement="left-bottom" title-text="Left Bottom" description="Arrow points right" open>
        <ui-button slot="trigger" size="s">Trigger</ui-button>
      </ui-popover>
    </div>

    <h3>Placement — Right</h3>
    <div style="display: flex; flex-direction: column; gap: 120px; padding: 20px 0 20px 20px;">
      <ui-popover placement="right-top" title-text="Right Top" description="Arrow points left" open>
        <ui-button slot="trigger" size="s">Trigger</ui-button>
      </ui-popover>
      <ui-popover placement="right-center" title-text="Right Center" description="Arrow points left" open>
        <ui-button slot="trigger" size="s">Trigger</ui-button>
      </ui-popover>
      <ui-popover placement="right-bottom" title-text="Right Bottom" description="Arrow points left" open>
        <ui-button slot="trigger" size="s">Trigger</ui-button>
      </ui-popover>
    </div>
  `,
});
