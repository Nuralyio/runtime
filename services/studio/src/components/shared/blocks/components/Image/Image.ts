import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/image";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { BaseElementBlock } from "../BaseElement";

@customElement("image-block")
export class ImageBlock extends BaseElementBlock {
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
    <!-- for the sake of the demo -->
      <hy-image  
      .src=${this.inputHandlersValue.src??nothing} 
      .fallback=${this.inputHandlersValue.fallback??nothing}
      .width=${this.inputHandlersValue.width+'px'}
      .height=${this.inputHandlersValue.height+'px'}
      .alt=${this.inputHandlersValue.alt??nothing}
      
      >
      
      </hy-image>
    `;
  }
}