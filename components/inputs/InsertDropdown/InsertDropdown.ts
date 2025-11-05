import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/button";
import "@nuralyui/dropdown";
import "@nuralyui/label";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";
import { ref } from "lit/directives/ref.js";


@customElement("insert-dropdown-block")
export class InsertDropdownBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;


  static override  styles = [
    css``
  ]


  renderComponent() {
    const options = this.inputHandlersValue?.options || [];
    
    return html`
      <nr-dropdown
        ${ref(this.inputRef)}
        style=${styleMap({ 
          ...this.getStyles(),
          "--nuraly-icon-color": "#515161",
          "--nuraly-select-local-dropdown-max-height": this.inputHandlersValue?.maxHeight || "auto",
        })}
        .items=${options}
        .trigger=${this.inputHandlersValue?.trigger || 'click'}
        .placement=${this.inputHandlersValue?.placement || 'bottom-start'}
        .animation=${this.inputHandlersValue?.animation || 'fade'}
        .disabled=${this.inputHandlersValue?.state === 'disabled'}
        .arrow=${this.inputHandlersValue?.arrow || false}
        .autoClose=${this.inputHandlersValue?.autoClose !== false}
        .closeOnOutsideClick=${this.inputHandlersValue?.closeOnOutsideClick !== false}
        .closeOnEscape=${this.inputHandlersValue?.closeOnEscape !== false}
        .offset=${this.inputHandlersValue?.offset || 4}
        .delay=${this.inputHandlersValue?.delay || 50}
        .minWidth=${this.inputHandlersValue?.minWidth || 'auto'}
        @nr-dropdown-item-click=${(e: CustomEvent) => {
          // e.detail contains { item, dropdown }
          // item has properties: { label, value, additionalData, icon, etc. }
          const item = e.detail.item;
          
          this.executeEvent('onClick', e, {
            value: item.value,
            item: item,
            additionalData: item.additionalData
          });
        }}
        @nr-dropdown-open=${(e: CustomEvent) => {
          this.executeEvent('onOpen', e);
        }}
        @nr-dropdown-close=${(e: CustomEvent) => {
          this.executeEvent('onClose', e);
        }}
      >
        <nr-label
          slot="trigger"
          style=${styleMap({
            "--resolved-text-label-color": this.getStyles()["title-color"],
          })}
        >
          ${this.inputHandlersValue?.title}
        </nr-label>
      </nr-dropdown>
    `;
  }
}