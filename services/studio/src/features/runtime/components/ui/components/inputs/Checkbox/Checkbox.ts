import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";
import "@nuralyui/checkbox";

@customElement("checkbox-block")
export class CheckboxBlock extends BaseElementBlock {
  static styles = [
    css``,
  ];

  @property({ type: Object })
  component: ComponentElement;

  unsubscribe: () => void;

  override async connectedCallback() {
    await super.connectedCallback();
    this.registerCallback("value", () => {});
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  renderComponent() {
    const checkBoxStyles = this.component?.style || {};
    const size = checkBoxStyles.size as 'small' | 'medium' | 'large' | undefined;

    return html`
      <nr-checkbox
        ${ref(this.inputRef)}
        style=${styleMap({
          ...this.getStyles(),
        })}
        .checked=${this.inputHandlersValue?.value}
        .indeterminate=${this.inputHandlersValue?.checked == "indeterminate"}
        .disabled=${this.inputHandlersValue?.state == "disabled"}
        .size=${size || 'medium'}
        .name=${this.inputHandlersValue?.name || ''}
        .value=${this.inputHandlersValue?.value || ''}
        .required=${this.inputHandlersValue?.required || false}
        .autoFocus=${this.inputHandlersValue?.autoFocus || false}
        .id=${this.inputHandlersValue?.id || ''}
        .title=${this.inputHandlersValue?.title || ''}
        .tabIndex=${this.inputHandlersValue?.tabIndex || 0}
        @nr-change=${(e) => {
          this.executeEvent('onChange', e , {
            checked: e.detail.checked
          });
        }}
        @nr-focus=${(e) => {
          this.executeEvent('onFocus', e);
        }}
        @nr-blur=${(e) => {
          this.executeEvent('onBlur', e);
        }}
        @nr-keydown=${(e) => {
          this.executeEvent('onKeydown', e);
        }}
        @nr-mouseenter=${(e) => {
          this.executeEvent('onMouseEnter', e);
        }}
        @nr-mouseleave=${(e) => {
          this.executeEvent('onMouseLeave', e);
        }}
      >
        ${this.inputHandlersValue?.label ?? ""}
      </nr-checkbox>
    `;
  }
}