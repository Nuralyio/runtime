import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/button";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { $context } from "$store/context/store";
import { BaseElementBlock } from "../BaseElement";


@customElement("icon-button-block")
export class IconButtonBlock extends BaseElementBlock {
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
    $context.subscribe((context) => {
      if (this.component) {
        this.updateValue();
      }
    }
    )
  }
  handleClick = (e) => {
    if (this.component.event.click) {
      executeEventHandler(this.component, "event", "click");
    }
  }

  render() {  
    return html` 
      <span style=${styleMap({ ...this.component.style })}> 
        <hy-button 
          @click=${this.handleClick}
          .color=${this.thisvalue ?? this.item.value ?? ""}
          .icon=${[this.component.parameters?.icon]}
        ></hy-button>
      </span>
    `;
  }
}