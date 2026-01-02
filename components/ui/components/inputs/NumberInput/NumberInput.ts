import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";

// Safely import @nuralyui/input
try {
  await import("@nuralyui/input");
} catch (error) {
  console.warn('[@nuralyui/input] Package not found or failed to load.');
}



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
          .value=${this.resolvedInputs?.value ?? nothing}
          .size=${size}
          .state=${this.resolvedInputs?.status ?? nothing}
          .type=${"number"}
          .variant=${this.resolvedInputs?.variant ?? nothing}
          .disabled=${this.resolvedInputs?.state === "disabled"}
          .readonly=${this.resolvedInputs?.readonly || false}
          .placeholder=${this.resolvedInputs?.placeholder ?? "Number input"}
          .step=${this.resolvedInputs?.step ?? nothing}
          .min=${this.resolvedInputs?.min ?? "0"}
          .max=${this.resolvedInputs?.max ?? nothing}
          .name=${this.resolvedInputs?.name ?? nothing}
          .required=${this.resolvedInputs?.required || false}
          .rules=${this.resolvedInputs?.rules ?? []}
          .validateOnChangeInput=${this.resolvedInputs?.validateOnChange !== false}
          .validateOnBlurInput=${this.resolvedInputs?.validateOnBlur !== false}
          .hasFeedback=${this.resolvedInputs?.hasFeedback || false}
          @nr-input=${(e) => {
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
            ${this.resolvedInputs?.label ?? ""}
          </span>
          <span slot="helper-text">
            ${this.resolvedInputs?.helper ?? ""}
          </span>
        </nr-input>
      </span>
    `;
  }
}
