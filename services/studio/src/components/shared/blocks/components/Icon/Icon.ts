import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/select";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { BaseElementBlock } from "../BaseElement";
 import "@hybridui/icon"; 

@customElement("icon-block")
export class IconBlock extends BaseElementBlock {
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
    const iconStyles = this.component?.style || {};

  
    return html`
      <hy-icon 
      .name=${this.inputHandlersValue.icon??'smile'}
      style=${styleMap(iconStyles)}>
      </hy-icon>
    `;
  }
}