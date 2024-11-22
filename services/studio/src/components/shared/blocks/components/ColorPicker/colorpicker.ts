import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@nuralyui/color-picker";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { BaseElementBlock } from "../BaseElement";
import { executeCodeWithClosure } from "core/executer";
import { getNestedAttribute } from "utils/object.utils";

// Debounce function with default wait time
function debounce(func, wait = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
@customElement("color-picker-block")
export class ColorPickerBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  static styles = [
    css`:host{
      width:fit-content
    }`,
  ];

  @state()
  thisvalue: any;

  constructor() {
    super();
    this.registerCallback("value", this.handleValueChange);
  }

  handleValueChange = debounce((e) => {
    if (this.component.event.valueChange) {
      e?.detail?.value  && executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.valueChange`), {
        value: e.detail?.value ?? "",
      });
    }
  })

  render() {
    return html`
      <span style=${styleMap({ ...this.component.style })}> 
        <hy-color-picker 
          @color-changed=${this.handleValueChange}
          .color=${this.inputHandlersValue.value?? ""}
          .disabled=${this.inputHandlersValue?.state =='disabled'?true:false}
          placeholder="Text input"
        ></hy-color-picker>
      </span>
    `;
  }
}