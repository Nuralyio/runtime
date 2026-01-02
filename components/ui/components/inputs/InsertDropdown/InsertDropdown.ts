import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
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
    const options = this.resolvedInputs?.options || [];
    
    return html`
      <nr-dropdown
        ${ref(this.inputRef)}
        style=${styleMap({ 
          ...this.getStyles(),
          "--nuraly-icon-color": "#515161",
          "--nuraly-select-local-dropdown-max-height": this.resolvedInputs?.maxHeight || "auto",
        })}
        .items=${options}
        .trigger=${this.resolvedInputs?.trigger || 'click'}
        .placement=${this.resolvedInputs?.placement || 'bottom-start'}
        .animation=${this.resolvedInputs?.animation || 'fade'}
        .disabled=${this.resolvedInputs?.state === 'disabled'}
        .arrow=${this.resolvedInputs?.arrow || false}
        .autoClose=${this.resolvedInputs?.autoClose !== false}
        .closeOnOutsideClick=${this.resolvedInputs?.closeOnOutsideClick !== false}
        .closeOnEscape=${this.resolvedInputs?.closeOnEscape !== false}
        .offset=${this.resolvedInputs?.offset || 4}
        .delay=${this.resolvedInputs?.delay || 50}
        .minWidth=${this.resolvedInputs?.minWidth || 'auto'}
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
            "--nuraly-label-local-font-weight": "400",
          })}
        >
          ${this.resolvedInputs?.title} ${this.resolvedInputs?.icon ? html`<nr-button style="--nuraly-button-min-width: 47px;" type="default" .iconLeft="${this.resolvedInputs.icon}" size="small"></nr-button>` : nothing}
        </nr-label>
      </nr-dropdown>
    `;
  }
}