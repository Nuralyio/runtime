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


  handleValueChange = (e) => {
    if (this.component.event.changed) {
      const optionValue = e.detail.value.length? e.detail.value[0].value:undefined;
      executeEventHandler(this.component, "event", "changed", {
        EventData: {
          value: optionValue,
        },
      });
    }
  };

  render() {
    return html`
    ${JSON.stringify(this.inputHandlersValue)}
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
        ></hy-datepicker>
      </span>
    `;
  }
}