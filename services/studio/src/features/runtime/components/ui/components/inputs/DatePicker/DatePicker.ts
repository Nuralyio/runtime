import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { executeHandler } from '../../../../../state/runtime-context.ts';
import { getNestedAttribute } from '../../../../../utils/object.utils.ts';
import { ref } from "lit/directives/ref.js";
// Safely import @nuralyui/datepicker
try {
  await import("@nuralyui/datepicker");
} catch (error) {
  console.warn('[@nuralyui/datepicker] Package not found or failed to load.');
}


@customElement("date-picker-block")
export class DatepickertBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;


  handleDateChange = (customEvent: CustomEvent) => {
    this.executeEvent('onDateChange', customEvent, {
      value: customEvent.detail?.value || customEvent.detail?.date || customEvent.detail
    });
  };

  handleRangeChange = (customEvent: CustomEvent) => {
    this.executeEvent('onRangeChange', customEvent, {
      startDate: customEvent.detail?.startDate,
      endDate: customEvent.detail?.endDate,
      value: customEvent.detail?.value
    });
  };

  handleCalendarOpen = (customEvent: CustomEvent) => {
    this.executeEvent('onCalendarOpen', customEvent);
  };

  handleCalendarClose = (customEvent: CustomEvent) => {
    this.executeEvent('onCalendarClose', customEvent);
  };

  handleFocus = (customEvent: CustomEvent) => {
    this.executeEvent('onFocus', customEvent);
  };

  handleBlur = (customEvent: CustomEvent) => {
    this.executeEvent('onBlur', customEvent);
  };

  handleValidation = (customEvent: CustomEvent) => {
    this.executeEvent('onValidation', customEvent, {
      isValid: customEvent.detail?.isValid,
      message: customEvent.detail?.message
    });
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
        .size=${this.inputHandlersValue.size ?? size}
        .variant=${variant}
        .placement=${placement}
        ?disabled=${this.inputHandlersValue.disabled ?? false}
        .dateValue=${this.inputHandlersValue.value || ''}
        .fieldFormat=${this.inputHandlersValue.format || 'DD/MM/YYYY'}
        ?range=${this.inputHandlersValue.range ?? false}
        .minDate=${this.inputHandlersValue.minDate}
        .maxDate=${this.inputHandlersValue.maxDate}
        ?required=${this.inputHandlersValue.required ?? false}
        @nr-date-change=${this.handleDateChange}
        @nr-range-change=${this.handleRangeChange}
        @nr-calendar-open=${this.handleCalendarOpen}
        @nr-calendar-close=${this.handleCalendarClose}
        @nr-focus=${this.handleFocus}
        @nr-blur=${this.handleBlur}
        @nr-validation=${this.handleValidation}
      ></nr-datepicker>
    `;
  }
}
