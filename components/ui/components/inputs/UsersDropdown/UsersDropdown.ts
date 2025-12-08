import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

// Safely import @nuralyui/image
try {
  await import("@nuralyui/image");
} catch (error) {
  console.warn('[@nuralyui/image] Package not found or failed to load.');
}

import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";


@customElement("users-dropdown-block")
export class UsersDropdownBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;


  render() {
    return html`
      <nr-dropdown
        trigger=${this.inputHandlersValue?.trigger ?? nothing}
        .options=${this.inputHandlersValue?.users ?? []}
        @click-item=${(e: CustomEvent) => console.log("value clicked", e.detail)}
      >
        <nr-image
          .src="${this.inputHandlersValue?.userImage ?? nothing}"
          .width="${this.inputHandlersValue?.imageWidth ?? nothing}"
          .height="${this.inputHandlersValue?.imageHeight ?? nothing}"
        >
        </nr-image>
      </nr-dropdown>
    `;
  }
}