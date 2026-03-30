/**
 * <diagram-system> — Top-level system. Large rounded rect, bold border, blue.
 */

import { DiagramBoxBase, SURFACE_ACTION, TEXT_INVERSE, RADIUS_LG } from "./diagram-box-base.js";

const STYLES = `
  :host {
    background: ${SURFACE_ACTION};
    color: ${TEXT_INVERSE};
    border: 3px solid ${SURFACE_ACTION};
    border-radius: ${RADIUS_LG};
    min-width: 160px;
    min-height: 100px;
  }
`;

export class DiagramSystem extends DiagramBoxBase {
  protected _getStyles(): string { return STYLES; }
}

customElements.define("diagram-system", DiagramSystem);
