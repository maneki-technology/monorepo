/**
 * <diagram-external> — Third-party/external system. Dashed border, muted colors.
 */

import { DiagramBoxBase, SURFACE_TERTIARY, TEXT_SECONDARY, BORDER_MODERATE, RADIUS_MD } from "./diagram-box-base.js";

const STYLES = `
  :host {
    background: ${SURFACE_TERTIARY};
    color: ${TEXT_SECONDARY};
    border: 2px dashed ${BORDER_MODERATE};
    border-radius: ${RADIUS_MD};
  }
`;

export class DiagramExternal extends DiagramBoxBase {
  protected _getStyles(): string { return STYLES; }
}

customElements.define("diagram-external", DiagramExternal);
