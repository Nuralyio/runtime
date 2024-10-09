import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/image";
import { type ComponentElement } from "$store/component/interface";
import { BaseElementBlock } from "../BaseElement";


@customElement("image-block")
export class ImageBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;


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