import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseElementBlock } from '../../base/BaseElement';
import { styles } from "./IconPicker.style.ts";
import { EMPTY_STRING } from '../../../../../utils/constants.ts';
import { ref } from "lit/directives/ref.js";
import "@nuralyui/iconpicker"; // TODO: Package doesn't exist, needs to be created or removed

@customElement("icon-picker-block")
export class IconPicker extends BaseElementBlock {
  static override styles = styles;

  @property({ type: Object })
  component: ComponentElement;

  override connectedCallback() {
    super.connectedCallback();
    this.registerCallback("value", () => {});
  }

  renderComponent() {
    const inputValue = this.resolvedInputs.value ?? EMPTY_STRING;
    const size = this.resolvedInputs?.size || 'small';
    const placement = this.resolvedInputs?.placement || 'auto';
    const trigger = this.resolvedInputs?.trigger || 'manual';
    const disabled = this.resolvedInputs?.disable === 'disabled' || this.resolvedInputs?.disable === true;
    const readonly = this.resolvedInputs?.readonly || false;
    const placeholder = this.resolvedInputs?.placeholder || 'Select icon';
    const showSearch = this.resolvedInputs?.showSearch !== false;
    const showClear = this.resolvedInputs?.showClear !== false;
    const maxVisible = this.resolvedInputs?.maxVisible || 500;

    return html`
      <nr-icon-picker
        ${ref(this.inputRef)}
        .value=${inputValue}
        .size=${size}
        .placement=${placement}
        .trigger=${trigger}
        .disabled=${disabled}
        .readonly=${readonly}
        .placeholder=${placeholder}
        .showSearch=${showSearch}
        .showClear=${showClear}
        .maxVisible=${maxVisible}
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