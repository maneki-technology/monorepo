import { registerPage } from "../registry.js";
import "@maneki/ui-components/components/ui-icon.js";
import "@maneki/ui-components/components/ui-skeleton.js";
import "@maneki/ui-components/components/ui-table.js";
import "@maneki/ui-components/components/ui-table-cell.js";
import "@maneki/ui-components/components/ui-table-row.js";

registerPage("skeleton", {
  title: "Skeleton",
  section: "Data Display",
  render: () => `
    <h3>Text Lines</h3>
    <div style="max-width: 400px; display: flex; flex-direction: column; gap: 8px;">
      <ui-skeleton variant="text" width="80%"></ui-skeleton>
      <ui-skeleton variant="text" width="100%"></ui-skeleton>
      <ui-skeleton variant="text" width="100%"></ui-skeleton>
      <ui-skeleton variant="text" width="60%"></ui-skeleton>
    </div>

    <h3>Circle</h3>
    <div class="variant-row gap-16">
      <ui-skeleton variant="circle" width="24" height="24"></ui-skeleton>
      <ui-skeleton variant="circle" width="32" height="32"></ui-skeleton>
      <ui-skeleton variant="circle" width="48" height="48"></ui-skeleton>
    </div>

    <h3>Rectangle</h3>
    <div class="w-400">
      <ui-skeleton variant="rect" width="100%" height="192"></ui-skeleton>
    </div>

    <h3>Card Skeleton</h3>
    <div style="max-width: 400px; display: flex; flex-direction: column; gap: 16px; padding: 16px; border: 1px solid var(--fd-border-minimal, #dce3e8); border-radius: 4px;">
      <div style="display: flex; gap: 12px; align-items: center;">
        <ui-skeleton variant="circle" width="48" height="48"></ui-skeleton>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <ui-skeleton variant="text" width="60%"></ui-skeleton>
          <ui-skeleton variant="text" width="40%"></ui-skeleton>
        </div>
      </div>
      <ui-skeleton variant="rect" width="100%" height="160"></ui-skeleton>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <ui-skeleton variant="text" width="100%"></ui-skeleton>
        <ui-skeleton variant="text" width="100%"></ui-skeleton>
        <ui-skeleton variant="text" width="75%"></ui-skeleton>
      </div>
    </div>

    <h3>List Skeleton</h3>
    <div style="max-width: 400px; display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; gap: 12px; align-items: flex-start;">
        <ui-skeleton variant="circle" width="48" height="48"></ui-skeleton>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <ui-skeleton variant="text" width="40%" height="16"></ui-skeleton>
          <ui-skeleton variant="text" width="70%"></ui-skeleton>
          <ui-skeleton variant="text" width="100%"></ui-skeleton>
          <ui-skeleton variant="text" width="100%"></ui-skeleton>
        </div>
      </div>
      <div style="display: flex; gap: 12px; align-items: flex-start;">
        <ui-skeleton variant="circle" width="48" height="48"></ui-skeleton>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <ui-skeleton variant="text" width="35%" height="16"></ui-skeleton>
          <ui-skeleton variant="text" width="80%"></ui-skeleton>
          <ui-skeleton variant="text" width="60%"></ui-skeleton>
        </div>
      </div>
      <div style="display: flex; gap: 12px; align-items: flex-start;">
        <ui-skeleton variant="circle" width="48" height="48"></ui-skeleton>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <ui-skeleton variant="text" width="50%" height="16"></ui-skeleton>
          <ui-skeleton variant="text" width="90%"></ui-skeleton>
          <ui-skeleton variant="text" width="100%"></ui-skeleton>
          <ui-skeleton variant="text" width="45%"></ui-skeleton>
        </div>
      </div>
    </div>
    <h3>Rect with Icon (Chart/Image Placeholder)</h3>
    <div style="max-width: 400px; display: flex; gap: 16px;">
      <ui-skeleton variant="rect" width="100%" height="192">
        <ui-icon name="bar_chart" size="l" style="color: #9FB1BD;"></ui-icon>
      </ui-skeleton>
      <ui-skeleton variant="rect" width="100%" height="192">
        <ui-icon name="image" size="l" style="color: #9FB1BD;"></ui-icon>
      </ui-skeleton>
    </div>

    <h3>Table Skeleton</h3>
    <div class="w-500">
      <ui-table size="l" separator="minimal">
        <ui-table-row header>
          <ui-table-cell header><ui-skeleton variant="text" width="72px"></ui-skeleton></ui-table-cell>
          <ui-table-cell header><ui-skeleton variant="text" width="38px"></ui-skeleton></ui-table-cell>
          <ui-table-cell header><ui-skeleton variant="text" width="44px"></ui-skeleton></ui-table-cell>
          <ui-table-cell header><ui-skeleton variant="text" width="52px"></ui-skeleton></ui-table-cell>
          <ui-table-cell header><ui-skeleton variant="text" width="36px"></ui-skeleton></ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell><ui-skeleton variant="text" width="68px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="42px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="36px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="48px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="30px"></ui-skeleton></ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell><ui-skeleton variant="text" width="58px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="34px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="46px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="40px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="44px"></ui-skeleton></ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell><ui-skeleton variant="text" width="74px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="28px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="50px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="36px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="42px"></ui-skeleton></ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell><ui-skeleton variant="text" width="62px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="46px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="32px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="54px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="38px"></ui-skeleton></ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell><ui-skeleton variant="text" width="56px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="40px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="44px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="32px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="48px"></ui-skeleton></ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell><ui-skeleton variant="text" width="70px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="36px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="42px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="46px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="34px"></ui-skeleton></ui-table-cell>
        </ui-table-row>
        <ui-table-row>
          <ui-table-cell><ui-skeleton variant="text" width="64px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="50px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="38px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="42px"></ui-skeleton></ui-table-cell>
          <ui-table-cell><ui-skeleton variant="text" width="46px"></ui-skeleton></ui-table-cell>
        </ui-table-row>
      </ui-table>
    </div>
  `,
});
