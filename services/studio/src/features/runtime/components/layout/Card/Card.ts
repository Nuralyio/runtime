import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import "@nuralyui/card";
import { ref } from "lit/directives/ref.js";

@customElement("card-block")
export class CardBlock extends BaseElementBlock {
  static styles = [css``];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  renderComponent() {
    const cardStyles = this.component?.style || {};
    
    // Get properties from input or inputHandlers
    const title = this.component?.input?.title?.value || this.inputHandlersValue?.title || '';
    const bordered = this.component?.input?.bordered?.value ?? this.inputHandlersValue?.bordered ?? true;
    const hoverable = this.component?.input?.hoverable?.value ?? this.inputHandlersValue?.hoverable ?? false;
    const loading = this.component?.input?.loading?.value ?? this.inputHandlersValue?.loading ?? false;
    const size = this.component?.input?.size?.value || this.inputHandlersValue?.size || 'default';

    return html`
      <nr-card
        ${ref(this.inputRef)}
        style=${styleMap(cardStyles)}
        .title=${title}
        .size=${size}
        ?bordered=${bordered}
        ?hoverable=${hoverable}
        ?loading=${loading}
        @click=${(e: MouseEvent) => {
          this.executeEvent('onClick', e);
        }}
      >
        <slot></slot>
      </nr-card>
    `;
  }
}
