import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";

// Safely import @nuralyui/checkbox
try {
  await import("@nuralyui/checkbox");
} catch (error) {
  console.warn('[@nuralyui/checkbox] Package not found or failed to load.');
}


@customElement("checkbox-block")
export class CheckboxBlock extends BaseElementBlock {

  renderComponent() {
    return html`
      <nr-checkbox
        class="${`drop-${this.component.uuid}`}"
        ${ref(this.inputRef)}
        .checked=${this.inputHandlersValue?.value === true}
        .indeterminate=${this.inputHandlersValue?.value === "indeterminate"}
        .disabled=${this.inputHandlersValue?.disabled}
        .size=${this.inputHandlersValue?.size || 'medium'}
        .name=${this.inputHandlersValue?.name || ''}
        .value=${this.inputHandlersValue?.value || ''}
        .autoFocus=${this.inputHandlersValue?.autoFocus || false}
        .id=${this.inputHandlersValue?.id || ''}
        .title=${this.inputHandlersValue?.title || ''}
        .tabIndex=${this.inputHandlersValue?.tabIndex || 0}
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
       <nr-label .size=${this.inputHandlersValue?.size || 'medium'}> ${this.inputHandlersValue?.label ?? ""}</nr-label>
      </nr-checkbox>
    `;
  }
}
