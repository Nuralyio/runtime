import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";

import "@nuralyui/checkbox";

@customElement("checkbox-block")
export class CheckboxBlock extends BaseElementBlock {

  renderComponent() {
    return html`
      <nr-checkbox
        class="${`drop-${this.component.uuid}`}"
        ${ref(this.inputRef)}
        .checked=${this.resolvedInputs?.value === true}
        .indeterminate=${this.resolvedInputs?.value === "indeterminate"}
        .disabled=${this.resolvedInputs?.disabled}
        .size=${this.resolvedInputs?.size || 'medium'}
        .name=${this.resolvedInputs?.name || ''}
        .value=${this.resolvedInputs?.value || ''}
        .autoFocus=${this.resolvedInputs?.autoFocus || false}
        .id=${this.resolvedInputs?.id || ''}
        .title=${this.resolvedInputs?.title || ''}
        .tabIndex=${this.resolvedInputs?.tabIndex || 0}
        @nr-change=${(e : CustomEvent) => {
          this.executeEvent('onChange', e , {
            checked: e.detail.checked
          });
        }}
        @nr-focus=${(e : CustomEvent) => {
          this.executeEvent('onFocus', e);
        }}
        @nr-blur=${(e : CustomEvent) => {
          this.executeEvent('onBlur', e);
        }}
        @nr-keydown=${(e : CustomEvent) => {
          this.executeEvent('onKeydown', e);
        }}
        @nr-mouseenter=${(e : CustomEvent) => {
          this.executeEvent('onMouseEnter', e);
        }}
        @nr-mouseleave=${(e : CustomEvent) => {
          this.executeEvent('onMouseLeave', e);
        }}
      >
       <nr-label .size=${this.resolvedInputs?.size || 'medium'}> ${this.resolvedInputs?.label ?? ""}</nr-label>
      </nr-checkbox>
    `;
  }
}
