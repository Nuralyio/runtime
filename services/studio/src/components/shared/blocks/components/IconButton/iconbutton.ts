import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { $context } from "$store/context";
import { BaseElementBlock } from "../BaseElement";
import type { ComponentElement } from "$store/component/interface";
import { executeCodeWithClosure } from "core/executer";
import { getNestedAttribute } from "utils/object.utils";

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
        const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.click`));
      }
    }, 0);
  }

  render() {
    const { style } = this.component ?? {};
    const { icon } = this.component?.parameters ?? {};
    const color = this.thisvalue ?? this.item?.value ?? "";
    const type=this.inputHandlersValue.value??'default'

    return html`
      <span style=${styleMap(style)}>
        <hy-button 
          @mousedown=${this.handleClick}
          .color=${color}
          .icon=${[icon]}
          .type=${type}
        ></hy-button>
      </span>
    `;
  }
}