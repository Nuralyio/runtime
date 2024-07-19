import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/input";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { BaseElementBlock } from "../BaseElement";

@customElement("number-input-block")
export class NumberInputBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  static styles = [
    css``,
  ];

  @state()
  thisvalue: any;


  handleValueChange = (e) => {
    if (this.component.event.valueChange) {
      executeEventHandler(this.component, "event", "valueChange", {
        EventData: {
          value: e.detail.value,
          unity:this.thisvalue[1]
        },
      });
    }
  }; 

  render() {
      return html`
      <span style=${styleMap({ ...this.component.style })}> 
        <hy-input 
          @valueChange=${this.handleValueChange}
          .value=${this.thisvalue?this.thisvalue[0]:0}
          min='0'
          type='number'
        ></hy-input>
      </span>
    `;
  }
}