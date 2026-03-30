/**
 * <diagram-container> — Application or service. Standard rect, gray border.
 */

import { DiagramBoxBase, SURFACE_PRIMARY, TEXT_PRIMARY, BORDER_MODERATE, RADIUS_MD } from "./diagram-box-base.js";

const STYLES = `
  :host {
    background: ${SURFACE_PRIMARY};
    color: ${TEXT_PRIMARY};
    border: 1px solid ${BORDER_MODERATE};
    border-radius: ${RADIUS_MD};
  }
`;

export class DiagramContainer extends DiagramBoxBase {
  protected _getStyles(): string { return STYLES; }
}

customElements.define("diagram-container", DiagramContainer);
