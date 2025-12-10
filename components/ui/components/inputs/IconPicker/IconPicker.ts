import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseElementBlock } from '../../base/BaseElement';
import { styles } from "./IconPicker.style.ts";
import { EMPTY_STRING } from '../../../../../utils/constants.ts';
import { styleMap } from "lit/directives/style-map.js";
import { ref } from "lit/directives/ref.js";
// import "@nuralyui/iconpicker"; // TODO: Package doesn't exist, needs to be created or removed

@customElement("icon-picker-block")
export class IconPicker extends BaseElementBlock {
  static override styles = styles;

  @property({ type: Object })
  component: ComponentElement;

  override async connectedCallback() {
    await super.connectedCallback();
    this.registerCallback("value", () => {});
  }

  renderComponent() {
    const iconPickerStyles = this.component?.style || {};
    const size = (iconPickerStyles.size as 'small' | 'medium' | 'large') || 'medium';

    return html`
      <nr-icon-picker
        ${ref(this.inputRef)}
        style=${styleMap({
          ...this.getStyles(),
        })}
        .value=${this.inputHandlersValue.value ?? EMPTY_STRING}
        .disabled=${this.inputHandlersValue?.state === "disabled"}
        .readonly=${this.inputHandlersValue?.readonly || false}
        .size=${size}
        .placement=${this.inputHandlersValue?.placement || 'auto'}
        .trigger=${this.inputHandlersValue?.trigger || 'manual'}
        .placeholder=${this.inputHandlersValue?.placeholder || 'Select icon'}
        .showSearch=${this.inputHandlersValue?.showSearch !== false}
        .showClear=${this.inputHandlersValue?.showClear !== false}
        .maxVisible=${this.inputHandlersValue?.maxVisible || 500}
        @nr-icon-picker-change=${(e: CustomEvent) => {
          this.executeEvent('onChange', e, { value: e.detail.value, icon: e.detail.icon });
        }}
        @nr-icon-picker-open=${(e: CustomEvent) => {
          this.executeEvent('onOpen', e);
        }}
        @nr-icon-picker-close=${(e: CustomEvent) => {
          this.executeEvent('onClose', e);
        }}
        @nr-icon-picker-search=${(e: CustomEvent) => {
          this.executeEvent('onSearch', e, { query: e.detail.query });
        }}
        @nr-icon-picker-clear=${(e: CustomEvent) => {
          this.executeEvent('onClear', e);
        }}
      ></nr-icon-picker>
    `;
  }
}