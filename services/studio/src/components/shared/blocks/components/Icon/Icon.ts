import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/select";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { BaseElementBlock } from "../BaseElement";
import "@hybridui/icon"; 


@customElement("icon-block")
export class IconBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  override connectedCallback() {
    super.connectedCallback();
    this.registerCallback('value', (v) => {
      this.requestUpdate();
    })
  }



  render() {
    const iconStyles = this.component?.style || {};
    const iconStyleHandlers =this.component?.styleHandlers? Object.fromEntries(
      Object.entries(this.component?.styleHandlers).filter(([key,value])=>value)) : {};

  
    return html`
      <hy-icon 
      .name=${this.inputHandlersValue.icon??'smile'}
      style=${styleMap({...iconStyles,...iconStyleHandlers})}>
      </hy-icon>
    `;
  }
}