import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/image";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
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