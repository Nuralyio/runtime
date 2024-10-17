import { html, css, type PropertyValues, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { BaseElementBlock } from "../BaseElement";
import { executeCodeWithClosure } from "core/executer";
import { getNestedAttribute } from "utils/object.utils";

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
      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.valueChange`), {
        value: e.detail.value,
      });
    }
  };


  render() {
    return html`
      <span> 
        <hy-input 
        style=${styleMap({ ...this.component.style })}
        .size=${ this.component.style.size ?? nothing}
          @valueChange=${this.handleValueChange}
          value=${parseInt(this.inputHandlersValue.value)}
          min="0"
          type="number"
          .disabled=${this.inputHandlersValue.state=='disabled'?true:false}
        ></hy-input>
      </span>
    `;
  }
}