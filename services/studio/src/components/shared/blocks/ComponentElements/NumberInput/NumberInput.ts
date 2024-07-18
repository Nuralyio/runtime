import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/input";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { $context } from "$store/context/store";
import { BaseElementBlock } from "../BaseElement";

@customElement("number-input-block")
export class TextInputBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  static styles = [
    css``,
  ];

  @state()
  thisvalue: any;


  override connectedCallback() {
    super.connectedCallback();
    this.updateValue();
    $context.subscribe(() => {
      if (this.component) {
        this.updateValue();
      }
    }
    )
  }

  handleValueChange = (e) => {
    if (this.component.event.valueChange) {
      executeEventHandler(this.component, "event", "valueChange", {
        EventData: {
          value: e.detail.value,
        },
      });
    }
  }; 

  render() {
      return html`
      <span style=${styleMap({ ...this.component.style })}> 
        <hy-input 
          @valueChange=${this.handleValueChange}
          .value=${this.thisvalue ?? this.item.value ?? ""}
          min='0'
          type='number'
        ></hy-input>
      </span>
    `;
  }
}