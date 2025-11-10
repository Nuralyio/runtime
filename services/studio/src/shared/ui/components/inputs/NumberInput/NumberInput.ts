import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import "@nuralyui/input";
import { ref } from "lit/directives/ref.js";


@customElement("number-input-block")
export class NumberInputBlock extends BaseElementBlock {
  static styles = [
    css``
  ];
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Object })
  item: any;


  render() {
    const inputStyles = this.getStyles();
    const componentStyles = this.component?.style || {};
    const size = (componentStyles?.size as 'small' | 'medium' | 'large') || 'medium';

    return html`
      <span> 
        <nr-input
          ${ref(this.inputRef)}
          style=${styleMap({
            ...inputStyles,
            "--nuraly-input-local-border-top-left-radius": inputStyles?.["border-top-left-radius"] ?? "",
            "--nuraly-input-local-border-top-right-radius": inputStyles?.["border-top-right-radius"] ?? "",
            "--nuraly-input-local-border-bottom-left-radius": inputStyles?.["border-bottom-left-radius"] ?? "",
            "--nuraly-input-local-border-bottom-right-radius": inputStyles?.["border-bottom-right-radius"] ?? "",
          })}
          .value=${this.inputHandlersValue?.value ?? nothing}
          .size=${size}
          .state=${this.inputHandlersValue?.status ?? nothing}
          .type=${"number"}
          .variant=${this.inputHandlersValue?.variant ?? nothing}
          .disabled=${this.inputHandlersValue?.state === "disabled"}
          .readonly=${this.inputHandlersValue?.readonly || false}
          .placeholder=${this.inputHandlersValue?.placeholder ?? "Number input"}
          .step=${this.inputHandlersValue?.step ?? nothing}
          .min=${this.inputHandlersValue?.min ?? "0"}
          .max=${this.inputHandlersValue?.max ?? nothing}
          .name=${this.inputHandlersValue?.name ?? nothing}
          .required=${this.inputHandlersValue?.required || false}
          .rules=${this.inputHandlersValue?.rules ?? []}
          .validateOnChangeInput=${this.inputHandlersValue?.validateOnChange !== false}
          .validateOnBlurInput=${this.inputHandlersValue?.validateOnBlur !== false}
          .hasFeedback=${this.inputHandlersValue?.hasFeedback || false}
          @nr-input=${(e) => {
            console.log('[NumberInput] nr-input event:', {
              value: e.detail.value,
              oldValue: e.detail.oldValue
            });
            this.executeEvent('onChange', e, {
              value: e.detail.value,
              oldValue: e.detail.oldValue
            })
          }}
          @nr-focus=${(e) => {
            this.executeEvent('onFocus', e);
          }}
          @nr-blur=${(e) => {
            this.executeEvent('onBlur', e);
          }}
          @nr-enter=${(e) => {
            this.executeEvent('onEnter', e);
          }}
        >
          <span slot="label">
            ${this.inputHandlersValue?.label ?? ""}
          </span>
          <span slot="helper-text">
            ${this.inputHandlersValue?.helper ?? ""}
          </span>
        </nr-input>
      </span>
    `;
  }
}