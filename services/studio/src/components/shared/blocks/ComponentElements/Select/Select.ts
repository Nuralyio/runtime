import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/select";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { BaseElementBlock } from "../BaseElement";


@customElement("select-block")
export class SelectBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;


  handleValueChange = (e) => {
    if (this.component.event.changed) {
      executeEventHandler(this.component, "event", "changed", {
        EventData: {
          value: e.detail.value.value,
        },
      });
    }
  };

  render() {
    return html`
      <span style=${styleMap({ ...this.component.style })}> 
        <hy-select 
          @changed=${this.handleValueChange}
          .options=${this.inputHandlersValue.value}
        ></hy-input>
      </span>
    `;
  }
}