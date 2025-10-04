import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/button";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { executeCodeWithClosure } from "@runtime/core/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { styleMap } from "lit/directives/style-map.js";


@customElement("insert-dropdown-block")
export class InsertDropdownBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;


  static override  styles = [
    css`
    hy-dropdown{
      --hybrid-dropdown-padding: 7px;
    }
   `
  ]


  renderComponent() {
    return html`
      <hy-dropdown
      style=${styleMap({ ...this.getStyles() , 
    "--hybrid-icon-color": "#515151",
        
               })}
        trigger=${this.inputHandlersValue?.trigger ?? nothing}
        .options=${this.inputHandlersValue?.options ?? []}
        @click-item=${(e) => {
      if (this.component.event?.onClick) {
        executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onClick`), {
          value: e.detail.value.value,
          additionalData : e.detail.value.additionalData
        });
      }
    }
    }
      >
        <!-- <hy-button
          .type=${this.inputHandlersValue.buttonType ?? nothing}
          .icon="${this.inputHandlersValue.buttonIcon ? [this.inputHandlersValue.buttonIcon] : nothing}"
          style=${styleMap({
              " --hybrid-button-height": "23px",
               "--hybrid-button-margin-y":" -9px",
      "--hybrid-button-padding-y": "1px",
      "--hybrid-button-padding-x": "2px",
      "--hybrid-button-ghost-border-color": "transparent",
      "--hybrid-button-ghost-background-color": "transparent"
    })}
        > qsd
        </hy-button> -->
        <hy-label
        style=${styleMap({
          "--resolved-text-label-color": this.getStyles()["title-color"],
        })}
        >${this.inputHandlersValue?.title}</hy-label>
      </hy-dropdown>
    `;
  }
}