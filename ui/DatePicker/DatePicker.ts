import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/select";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import "@nuralyui/datepicker";
import { executeCodeWithClosure } from "@runtime/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { ref } from "lit/directives/ref.js";

@customElement("date-picker-block")
export class DatepickertBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;


  handleDateChange = (customEvent: CustomEvent) => {
    if (this.component.event?.dateChange) {
      executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.dateChange`), {
        EventData: {
          value: customEvent.detail
        }
      });
    }
  };

  renderComponent() {
    return html`
        <hy-datepicker
         ${ref(this.inputRef)}
        style=${styleMap({
      ...this.getStyles(),
      "display" : this.getStyles().display ?? "block", 
    })}
          .helper=${this.inputHandlersValue.helper ?? nothing}
          .label=${this.inputHandlersValue.label ?? nothing}
          .locale=${this.inputHandlersValue.locale ?? nothing}
          .state=${this.component?.style?.state ?? nothing}
          .size=${this.component?.style?.size ?? nothing}
          .disabled=${(this.inputHandlersValue.state == "disabled")}
          .dateValue=${this.inputHandlersValue.value ?? nothing}
          .fieldFormat=${this.inputHandlersValue.format ?? nothing}
          @date-change=${this.handleDateChange}
        ></hy-datepicker>
    `;
  }
}