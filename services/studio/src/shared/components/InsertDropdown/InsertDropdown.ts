import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/button";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { executeCodeWithClosure } from "../../../core/executer.ts";
import { getNestedAttribute } from "@utils/object.utils.ts";
import { styleMap } from "lit/directives/style-map.js";


@customElement("insert-dropdown-block")
export class InsertDropdownBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;


  render() {
    return html`
      <hy-dropdown
        trigger=${this.inputHandlersValue?.trigger ?? nothing}
        .options=${this.inputHandlersValue?.options ?? []}
        @click-item=${(e) => {
          if (this.component.event?.onClick) {
            executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onClick`), {
              value: e.detail.value
            });
          }
        }
        }
      >
        <hy-button
          .type=${this.inputHandlersValue.buttonType ?? nothing}
          .icon="${this.inputHandlersValue.buttonIcon ? [this.inputHandlersValue.buttonIcon] : nothing}"
          style=${styleMap({
            "--hybrid-button-padding-y": "2px",
            "--hybrid-button-padding-x": "2px",
            "--hybrid-button-ghost-border-color": "transparent",
            "--hybrid-button-ghost-background-color": "transparent"
          })}
        >
        </hy-button>
      </hy-dropdown>
    `;
  }
}