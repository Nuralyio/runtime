import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { BaseElementBlock } from "../BaseElement.ts";
import type { ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { executeCodeWithClosure } from "@runtime/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";

@customElement("icon-button-block")
export class IconButtonBlock extends BaseElementBlock {
  static styles = css``;
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Object })
  item: any;

  handleClick = () => {
    setTimeout(() => {
      if (this.component?.event?.click) {
        const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.click`));
      }
    }, 0);
  };

  render() {
    const { style } = this.component ?? {};
    const { icon } = this.component?.parameters ?? {};
    const color = this.thisvalue ?? this.item?.value ?? "";
    const type = this.inputHandlersValue.value ?? "default";

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