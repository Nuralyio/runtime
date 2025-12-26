import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { EMPTY_STRING } from '../../../../../utils/constants.ts';
import { ref } from "lit/directives/ref.js";
import "@nuralyui/select";


@customElement("select-block")
export class SelectBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  constructor() {
    super();
    
  }

  override connectedCallback() {
    super.connectedCallback();
    this.registerCallback("value", (v) => {
      this.requestUpdate();
    });
  }

override  renderComponent() {

    return html`
      <nr-select
            ${ref(this.inputRef)}
            style=${styleMap({
              ...this.getStyles(),
              "--nuraly-select-width": (this.getStyles() as any)['--nuraly-select-width'] ?? this.getStyles().width
            })}
                 ?multiple=${this.inputHandlersValue?.selectionMode === "multiple"}
                 ?searchable=${this.inputHandlersValue?.searchable ?? false}
                 ?clearable=${this.inputHandlersValue?.clearable ?? false}
                 ?required=${this.inputHandlersValue?.required ?? false}
                 ?block=${this.inputHandlersValue?.block ?? false}
                 .options=${this.inputHandlersValue?.options  ?? []}
                 .value=${this.inputHandlersValue?.value ?? EMPTY_STRING}
                 .placeholder=${this.inputHandlersValue?.placeholder || "Select an option"}
                 .searchPlaceholder=${this.inputHandlersValue?.searchPlaceholder || "Search options..."}
                 .status=${this.inputHandlersValue?.state ?? nothing}
                 .size=${this.inputHandlersValue?.size ?? nothing}
                 .disabled=${this.inputHandlersValue?.disabled ?? (this.inputHandlersValue.state == "disabled")}
                 .type=${this.inputHandlersValue?.type || "default"}
                 @nr-change=${(e: CustomEvent) => {
                   this.executeEvent('onChange', e, {
                     value: e.detail.value ?? EMPTY_STRING
                   });
                 }}
                 @nr-focus=${(e: CustomEvent) => {
                   this.executeEvent('onFocus', e);
                 }}
                 @nr-blur=${(e: CustomEvent) => {
                   this.executeEvent('onBlur', e);
                 }}
                 @nr-dropdown-open=${(e: CustomEvent) => {
                   this.executeEvent('onDropdownOpen', e);
                 }}
                 @nr-dropdown-close=${(e: CustomEvent) => {
                   this.executeEvent('onDropdownClose', e);
                 }}
                 @nr-validation=${(e: CustomEvent) => {
                   this.executeEvent('onValidation', e, {
                     isValid: e.detail.isValid,
                     message: e.detail.message
                   });
                 }}
      >
        <span slot="label">${this.inputHandlersValue.label ?? nothing}</span>
        <span slot="helper-text">${this.inputHandlersValue.helper ?? nothing}</span>
      </nr-select>
    `;
  }
}