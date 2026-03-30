/**
 * <diagram-person> — Person/actor shape with rounded top (head silhouette).
 * Blue background, white text.
 */

import { DiagramBoxBase, BASE_STYLES, SURFACE_ACTION, TEXT_INVERSE, RADIUS_MD } from "./diagram-box-base.js";

const STYLES = `
  :host {
    background: ${SURFACE_ACTION};
    color: ${TEXT_INVERSE};
    border: 2px solid ${SURFACE_ACTION};
    border-radius: 50% 50% ${RADIUS_MD} ${RADIUS_MD};
  }

  .person-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    margin-bottom: 4px;
  }
`;

export class DiagramPerson extends DiagramBoxBase {
  protected _getStyles(): string { return STYLES; }
  protected _renderIcon(): string {
    return '<div class="person-icon"></div>';
  }
}

customElements.define("diagram-person", DiagramPerson);
