import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";
// import "@nuralyui/color-picker";
import { EMPTY_STRING } from '../../../../../utils/constants.ts';

@customElement("color-picker-block")
export class ColorPickerBlock extends BaseElementBlock {
  static styles = [
    css``,
  ];

  @property({ type: Object })
  component: ComponentElement;

  override async connectedCallback() {
    await super.connectedCallback();
    this.registerCallback("value", () => {});
  }

  renderComponent() {
    const colorPickerStyles = this.component?.style || {};
    const size = (colorPickerStyles.size as 'small' | 'default' | 'large') || 'default';

    return html`
      <nr-color-picker
        ${ref(this.inputRef)}
        style=${styleMap({
          width: "28px",
          height: "28px",
          ...this.getStyles(),
        })}
        .color=${this.inputHandlersValue.value ?? EMPTY_STRING}
        .disabled=${this.inputHandlersValue?.state == "disabled"}
        .size=${size}
        .trigger=${this.inputHandlersValue?.trigger || 'click'}
        .placement=${this.inputHandlersValue?.placement || 'auto'}
        .animation=${this.inputHandlersValue?.animation || 'fade'}
        .closeOnSelect=${this.inputHandlersValue?.closeOnSelect || false}
        .closeOnOutsideClick=${this.inputHandlersValue?.closeOnOutsideClick !== false}
        .closeOnEscape=${this.inputHandlersValue?.closeOnEscape !== false}
        .showInput=${this.inputHandlersValue?.showInput !== false}
        .showCopyButton=${this.inputHandlersValue?.showCopyButton !== false}
        .format=${this.inputHandlersValue?.format || 'hex'}
        .inputPlaceholder=${this.inputHandlersValue?.inputPlaceholder || 'Enter color'}
        .label=${this.inputHandlersValue?.label || ''}
        .helperText=${this.inputHandlersValue?.helperText || ''}
        .defaultColorSets=${this.inputHandlersValue?.defaultColorSets || []}
        @nr-color-change=${(e) => {
          console.log(e.detail)
          this.executeEvent('onChange', e, { value: e.detail.color });
        }}
        @nr-colorpicker-open=${(e) => {
          this.executeEvent('onOpen', e);
        }}
        @nr-colorpicker-close=${(e) => {
          this.executeEvent('onClose', e);
        }}
      ></nr-color-picker>
    `;
  }
}