import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";
import "@nuralyui/color-picker";
import { EMPTY_STRING } from '../../../../../utils/constants.ts';

@customElement("color-picker-block")
export class ColorPickerBlock extends BaseElementBlock {
  static styles = [
    css``,
  ];

  @property({ type: Object })
  component: ComponentElement;

  override connectedCallback() {
    super.connectedCallback();
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
        .color=${this.resolvedInputs.value ?? EMPTY_STRING}
        .disabled=${this.resolvedInputs?.state == "disabled"}
        .size=${size}
        .trigger=${this.resolvedInputs?.trigger || 'click'}
        .placement=${this.resolvedInputs?.placement || 'auto'}
        .animation=${this.resolvedInputs?.animation || 'fade'}
        .closeOnSelect=${this.resolvedInputs?.closeOnSelect || false}
        .closeOnOutsideClick=${this.resolvedInputs?.closeOnOutsideClick !== false}
        .closeOnEscape=${this.resolvedInputs?.closeOnEscape !== false}
        .showInput=${this.resolvedInputs?.showInput !== false}
        .showCopyButton=${this.resolvedInputs?.showCopyButton !== false}
        .format=${this.resolvedInputs?.format || 'hex'}
        .inputPlaceholder=${this.resolvedInputs?.inputPlaceholder || 'Enter color'}
        .label=${this.resolvedInputs?.label || ''}
        .helperText=${this.resolvedInputs?.helperText || ''}
        .defaultColorSets=${this.resolvedInputs?.defaultColorSets || []}
        @nr-color-change=${(e) => {
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