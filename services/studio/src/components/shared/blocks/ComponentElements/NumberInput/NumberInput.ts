import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { BaseElementBlock } from "../BaseElement";
import { executeHandler } from "core/helper";

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

  @state()
  localValue: any = {
    value: 0,
    unity: ''
  };


  handleValueChange = (e) => {
    if (this.component.event.valueChange) {
      executeHandler({
        component: this.component,
        type: `event.valueChange`,
        extras: {
          EventData: {
            value: e.detail.value,
            unity: this.thisvalue[1]
          },
        },
      });
    }
  };


  render() {
    return html`
      <span style=${styleMap({ ...this.component.style })}> 
        <hy-input 
          @valueChange=${this.handleValueChange}
          value=${parseInt(this.inputHandlersValue.value)}
          min="0"
          type="number"
        ></hy-input>
      </span>
    `;
  }
}