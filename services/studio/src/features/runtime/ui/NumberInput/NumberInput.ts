import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { executeCodeWithClosure } from "@runtime/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { debounce } from "@shared/utils/time.ts";


@customElement("number-input-block")
export class NumberInputBlock extends BaseElementBlock {
  static styles = [
    css``
  ];
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Object })
  item: any;
  @state()
  thisvalue: any;

  @state()
  localValue: any = {
    value: 0,
    unity: ""
  };


  handleValueChange = debounce((customEvent: CustomEvent) => {
    if (this.component?.event?.valueChange) {
      executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.valueChange`), {
        value: customEvent.detail.value
      });
    }
  }, 0);


  render() {
    return html`
      <span> 
        <hy-input
          style=${styleMap({ ...this.component.style })}
          .size=${this.component.style.size ?? nothing}
          @valueChange=${this.handleValueChange}
          value=${parseInt(this.inputHandlersValue.value)}
          .step=${this.inputHandlersValue?.step ?? nothing}
          min="0"
          type="number"
          .disabled=${(this.inputHandlersValue.state == "disabled")}
        ></hy-input>
      </span>
    `;
  }
}