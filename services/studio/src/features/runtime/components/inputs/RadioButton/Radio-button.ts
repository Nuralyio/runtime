import { customElement, property } from "lit/decorators.js";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import type { ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "@nuralyui/radio-group";
import { ref } from "lit/directives/ref.js";

@customElement("radio-button-block")
export class RadioButtonBlock extends BaseElementBlock {

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  renderComponent() {
    const radioStyles = this.component?.style || {};
    
    // Extract values from the handler structure [options, defaultValue, type]
    const options = this.inputHandlersValue?.value?.[0] || [];
    const defaultValue = this.inputHandlersValue?.value?.[1] || '';
    const type = this.inputHandlersValue?.value?.[2] || 'default';
    
    // Get other properties
    const direction = this.inputHandlersValue?.direction || 'vertical';
    const position = this.inputHandlersValue?.position || 'left';
    const size = this.inputHandlersValue?.size || 'medium';
    const disabled = this.inputHandlersValue?.disabled || false;
    const required = this.inputHandlersValue?.required || false;
    const name = this.inputHandlersValue?.name || 'radioGroup';

    console.log('[RadioButton] Rendering with:', {
      options,
      defaultValue,
      type,
      direction,
      position,
      size,
      disabled,
      required,
      name
    });

    return html`
      <span style=${styleMap(radioStyles)}>
        <nr-radio-group
          ${ref(this.inputRef)}
          .options=${options}
          .defaultValue=${defaultValue}
          .value=${defaultValue}
          .type=${type}
          .direction=${direction}
          .position=${position}
          .size=${size}
          .name=${name}
          ?disabled=${disabled}
          ?required=${required}
          @nr-change=${(e: CustomEvent) => {
            console.log('[RadioButton] nr-change event:', {
              detail: e.detail,
              value: e.detail.value,
              option: e.detail.option,
              oldValue: e.detail.oldValue
            });
            this.executeEvent('onChange', e, { 
              value: e.detail.value,
              option: e.detail.option,
              oldValue: e.detail.oldValue
            });
          }}
        ></nr-radio-group>
      </span>
    `;
  }
}

