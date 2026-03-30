/**
 * <diagram-component> — Module within a container. Rect with side tabs (UML-style).
 */

import { DiagramBoxBase, SURFACE_SECONDARY, TEXT_PRIMARY, BORDER_MODERATE, RADIUS_MD, SP_0_5 } from "./diagram-box-base.js";

const STYLES = `
  :host {
    background: ${SURFACE_SECONDARY};
    color: ${TEXT_PRIMARY};
    border: 1px solid ${BORDER_MODERATE};
    border-radius: ${RADIUS_MD};
  }

  /* UML-style side tabs */
  :host::before,
  :host::after {
    content: "";
    position: absolute;
    left: -8px;
    width: 8px;
    height: 12px;
    background: ${SURFACE_SECONDARY};
    border: 1px solid ${BORDER_MODERATE};
    border-right: none;
    border-radius: 3px 0 0 3px;
  }

  :host::before {
    top: 12px;
  }

  :host::after {
    top: 30px;
  }
`;

export class DiagramComponent extends DiagramBoxBase {
  protected _getStyles(): string { return STYLES; }
}

customElements.define("diagram-component", DiagramComponent);
