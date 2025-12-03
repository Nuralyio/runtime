import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/select";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import "@nuralyui/datepicker";
import { executeHandler } from '../../../../../state/runtime-context.ts';
import { getNestedAttribute } from '../../../../../utils/object.utils.ts';
import { ref } from "lit/directives/ref.js";

@customElement("date-picker-block")
export class DatepickertBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;


  handleDateChange = (customEvent: CustomEvent) => {
    if (this.component.event?.dateChange) {
      executeHandler(this.component, getNestedAttribute(this.component, `event.dateChange`), {
        EventData: {
          value: customEvent.detail?.date || customEvent.detail
        }
      });
    }
  };

  renderComponent() {
    const datePickerStyles = this.component?.style || {};
    const size = (datePickerStyles.size as 'small' | 'medium' | 'large') || 'medium';
    const variant = (datePickerStyles.variant as 'default' | 'outlined' | 'filled') || 'default';
    const placement = (datePickerStyles.placement as 'auto' | 'bottom' | 'top') || 'auto';
    const state = (datePickerStyles?.state as 'default' | 'error' | 'warning' | 'success') || 'default';

    return html`
      <nr-datepicker
        ${ref(this.inputRef)}
        style=${styleMap({
          ...this.getStyles(),
          "display": this.getStyles().display ?? "block", 
        })}
        .helper=${this.inputHandlersValue.helper || ''}
        .label=${this.inputHandlersValue.label || ''}
        .locale=${this.inputHandlersValue.locale || 'en'}
        .state=${state}
        .size=${size}
        .variant=${variant}
        .placement=${placement}
        .disabled=${this.inputHandlersValue.state == "disabled"}
        .dateValue=${this.inputHandlersValue.value || ''}
        .fieldFormat=${this.inputHandlersValue.format || 'DD/MM/YYYY'}
        .range=${this.inputHandlersValue.range || false}
        .minDate=${this.inputHandlersValue.minDate}
        .maxDate=${this.inputHandlersValue.maxDate}
        .required=${this.inputHandlersValue.required || false}
        @nr-date-change=${this.handleDateChange}
      ></nr-datepicker>
    `;
  }
}