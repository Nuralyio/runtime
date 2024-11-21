import { customElement, property } from "lit/decorators.js";
import { BaseElementBlock } from "../BaseElement";
import type { ComponentElement } from "$store/component/interface";
import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import '@nuraly/radio'
import { executeEventHandler } from "core/engine";
import { executeCodeWithClosure } from "core/executer";
import { getNestedAttribute } from "utils/object.utils";

@customElement("radio-button-block")
export class RadioButtonBlock extends BaseElementBlock{

    @property({ type: Object })
    component: ComponentElement;
  
    @property({ type: Object })
    item: any;
     
    handleChange =(e)=>{
        if(this.component.event.changed){
            const value = e.detail.value;
            executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.changed`), {value});
           
        }
    }

    render() {
      const options = this.inputHandlersValue?.value?this.inputHandlersValue?.value[0]:[];
      const defaultValue = this.inputHandlersValue?.value?this.inputHandlersValue?.value[1]:'';
      const type = this.inputHandlersValue?.value?this.inputHandlersValue?.value[2]:'default';
        
        return html`
          <span style=${styleMap({...this.component.style})}>
            <hy-radio-input
              .type=${type}
              .options=${options}
              .defaultValue="${defaultValue}"
              @change=${this.handleChange}
            ></hy-radio-input>
          </span>
        `;
      }
}

