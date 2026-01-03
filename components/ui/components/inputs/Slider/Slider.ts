import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";

import "@nuralyui/slider-input";

@customElement("slider-block")
export class SliderBlock extends BaseElementBlock {
  static styles = [css``];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  renderComponent() {
    const sliderStyles = this.component?.style || {};
    
    // Get properties from input or inputHandlers
    const value = this.component?.input?.value?.value ?? this.resolvedInputs?.value ?? 0;
    const min = this.component?.input?.min?.value ?? this.resolvedInputs?.min ?? 0;
    const max = this.component?.input?.max?.value ?? this.resolvedInputs?.max ?? 100;
    const step = this.component?.input?.step?.value ?? this.resolvedInputs?.step ?? 1;
    const disabled = this.component?.input?.disabled?.value ?? this.resolvedInputs?.disabled ?? false;
    const vertical = this.component?.input?.vertical?.value ?? this.resolvedInputs?.vertical ?? false;
    const showTooltip = this.component?.input?.showTooltip?.value ?? this.resolvedInputs?.showTooltip ?? true;
    const showMarks = this.component?.input?.showMarks?.value ?? this.resolvedInputs?.showMarks ?? false;
    const range = this.component?.input?.range?.value ?? this.resolvedInputs?.range ?? false;
    
    // Get marks from inputHandlers (complex object)
    const marks = this.resolvedInputs?.marks;

    return html`
      <nr-slider-input
        ${ref(this.inputRef)}
        style=${styleMap(sliderStyles)}
        .value=${value}
        .min=${min}
        .max=${max}
        .step=${step}
        .marks=${marks}
        ?disabled=${disabled}
        ?vertical=${vertical}
        ?showTooltip=${showTooltip}
        ?showMarks=${showMarks}
        ?range=${range}
        @nr-change=${(e: CustomEvent) => {
          this.executeEvent('onChange', e, {
            value: e.detail.value
          });
        }}
        @nr-after-change=${(e: CustomEvent) => {
          this.executeEvent('onAfterChange', e, {
            value: e.detail.value
          });
        }}
      ></nr-slider-input>
    `;
  }
}
