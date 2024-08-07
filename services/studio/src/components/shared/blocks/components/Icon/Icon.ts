import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/select";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { BaseElementBlock } from "../BaseElement";
 import "@hybridui/icon"; 

@customElement("icon-block")
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
    const options = this.inputHandlersValue?.value?.[0] ?? [];
    const defaultSelected = this.inputHandlersValue?.value?.[1];
  
    return html`
    <!-- for the sake of the demo -->
      <hy-icon name="check"
      style="  --hybrid-icon-width: 30px; --hybrid-icon-height: 35px;  --hybrid-icon-color: green;"></hy-icon>
    `;
  }
}