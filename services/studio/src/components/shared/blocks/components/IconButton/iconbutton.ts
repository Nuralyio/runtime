import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { executeEventHandler } from "core/engine";
import { $context } from "$store/context";
import { BaseElementBlock } from "../BaseElement";
import type { ComponentElement } from "$store/component/interface";

@customElement("icon-button-block")
export class IconButtonBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  static styles = css``;

  @state()
  thisvalue: any;


  handleClick = () => {
    setTimeout(() => {
      if (this.component?.event?.click) {
        executeEventHandler(this.component, "event", "click");
      }
    }, 0);
  }

  render() {
    const { style } = this.component ?? {};
    const { icon } = this.component?.parameters ?? {};
    const color = this.thisvalue ?? this.item?.value ?? "";

    return html`
      <span style=${styleMap(style)}>
        <hy-button 
          @mousedown=${this.handleClick}
          .color=${color}
          .icon=${[icon]}
        ></hy-button>
      </span>
    `;
  }
}