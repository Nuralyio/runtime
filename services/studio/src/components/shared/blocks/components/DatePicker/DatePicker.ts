import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/select";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { BaseElementBlock } from "../BaseElement";
import "@nuralyui/datepicker";
import { executeCodeWithClosure } from "core/executer";
import { getNestedAttribute } from "utils/object.utils";

@customElement("date-picker-block")
export class SelectBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;


  handleDateChange = (e) => {
    if (this.component.event?.dateChange) {
      executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.dateChange`,{
        EventData: {
          value: e.detail,
        },
      }))
    }
  };

  render() {
    const datepickerStyle= this.component?.style || {};
    const datepickerAutoWidth = this.inputHandlersValue?.width;
    return html`
      <span style=${styleMap({ ...datepickerStyle,width:datepickerAutoWidth ?'auto':datepickerStyle.width,display:'block'})}> 
        <hy-datepicker 
         .helper=${this.inputHandlersValue.helper??nothing}
         .label=${this.inputHandlersValue.label??nothing}
         .locale=${this.inputHandlersValue.locale??nothing}
         .state=${this.component?.style?.state??nothing}
         .size=${this.component?.style?.size??nothing}
         .disabled=${this.inputHandlersValue.state=='disabled'?true:false}
         .dateValue=${this.inputHandlersValue.value??nothing}
         .fieldFormat=${this.inputHandlersValue.format??nothing}
         @date-change=${this.handleDateChange}
        ></hy-datepicker>
      </span>
    `;
  }
}