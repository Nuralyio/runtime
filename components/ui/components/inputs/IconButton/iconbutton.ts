import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { executeHandler } from '../../../../../state/runtime-context.ts';
import { getNestedAttribute } from '../../../../../utils/object.utils.ts';
import { ref } from "lit/directives/ref.js";

import "@nuralyui/button";

@customElement("icon-button-block")
export class IconButtonBlock extends BaseElementBlock {
  static styles = css``;
  
  @property({ type: Object })
  component: ComponentElement;

  handleClick = () => {
    if (this.component?.event?.click) {
      executeHandler(this.component, getNestedAttribute(this.component, `event.click`));
    }
  };

  renderComponent() {
    const buttonStyles = this.getStyles();
    const icon = this.resolvedInputs?.icon;
    const iconArray = icon ? [icon] : [];
    const type = this.resolvedInputs.value || buttonStyles?.type || 'default';
    const size = buttonStyles?.size || 'small';

    return html`
      <nr-button 
        ${ref(this.inputRef)}
        .size=${size}
        .type=${type}
        .disabled=${this.resolvedInputs.state == "disabled"}
        .loading=${this.resolvedInputs.loading || false}
        .block=${this.resolvedInputs.block || false}
        .dashed=${this.resolvedInputs.dashed || false}
        .icon=${iconArray}
        .iconPosition=${this.resolvedInputs.iconPosition || 'left'}
        @mousedown=${this.handleClick}
        style=${styleMap({ 
          ...this.getStyles(),
          width: buttonStyles?.width,
          height: buttonStyles?.height,
        })}
      >
      </nr-button>
    `;
  }
}
