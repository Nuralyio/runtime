import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/image";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { BaseElementBlock } from "../BaseElement";
import { styleMap } from "lit/directives/style-map.js";


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
    const imageStyles = this.component?.style || {};
    const imageStyleHandlers =this.component?.styleHandlers? Object.fromEntries(
      Object.entries(this.component?.styleHandlers).filter(([key,value])=>value)) : {};
    return html`
      <hy-image  
      .src=${this.inputHandlersValue.src??nothing} 
      .fallback=${this.inputHandlersValue.fallback??nothing}
      .width=${imageStyleHandlers?.width?imageStyleHandlers.width:imageStyles?.width}
      .height=${imageStyleHandlers?.height?imageStyleHandlers?.height:imageStyles?.height}
      .alt=${this.inputHandlersValue.alt??'image'}
      >
      </hy-image>
    `;
  }
}