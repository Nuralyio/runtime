import { customElement, property } from "lit/decorators.js";
import { BaseElementBlock } from "../BaseElement";
import type { ComponentElement } from "$store/component/interface";
import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import '@hybridui/radio'
import { executeEventHandler } from "core/engine";

@customElement("radio-button-block")
export class RadioButtonBlock extends BaseElementBlock{

    @property({ type: Object })
    component: ComponentElement;
  
    @property({ type: Object })
    item: any;
     
    handleChange =(e)=>{
        if(this.component.event.changed){
            const value = e.detail.value;
            executeEventHandler(this.component,'event','changed',{
                EventData:{value}
            })
        }
    }

    render() {
      const options = this.inputHandlersValue?.value[0]??[];
      const defaultValue = this.inputHandlersValue?.value[1]??'';
      const type = this.inputHandlersValue?.value[2]??'default';
        
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

