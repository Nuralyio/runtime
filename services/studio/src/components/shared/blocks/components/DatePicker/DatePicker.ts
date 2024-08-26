import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/select";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { BaseElementBlock } from "../BaseElement";
import "@hybridui/datepicker";

@customElement("date-picker-block")
export class SelectBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;


  handleDateChange = (e) => {
    if (this.component.event?.dateChange) {
      executeEventHandler(this.component, "event", "dateChange", {
        EventData: {
          value: e.detail,
        },
      });
    }
  };

  render() {
    return html`
      <span style=${styleMap({ ...this.component.style })}> 
        <hy-datepicker 
         .helper=${this.inputHandlersValue.helper??nothing}
         .label=${this.inputHandlersValue.label??nothing}
         .locale=${this.inputHandlersValue.locale??nothing}
         .state=${this.component.style.state??nothing}
         .size=${this.component.style.size??nothing}
         .disabled=${this.inputHandlersValue.state=='disabled'?true:false}
         .dateValue=${this.inputHandlersValue.value??nothing}
         .fieldFormat=${this.inputHandlersValue.format??nothing}
         @date-change=${this.handleDateChange}
        ></hy-datepicker>
      </span>
    `;
  }
}