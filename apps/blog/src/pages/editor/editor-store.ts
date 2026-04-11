import type { ReactiveController, ReactiveControllerHost } from "lit";
import { state, onSidebarRender, onTabBarRender, onFormRender, type EditorState } from "./state.js";

export class EditorStoreController implements ReactiveController {
  host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    onSidebarRender(() => this.host.requestUpdate());
    onTabBarRender(() => this.host.requestUpdate());
    onFormRender(() => this.host.requestUpdate());
  }

  get state(): EditorState {
    return state;
  }
}
