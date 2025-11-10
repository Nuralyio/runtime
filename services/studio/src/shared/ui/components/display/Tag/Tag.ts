import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import "@nuralyui/tag";
import { ref } from "lit/directives/ref.js";

@customElement("tag-block")
export class TagBlock extends BaseElementBlock {
  static styles = [css``];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  renderComponent() {
    const tagStyles = this.component?.style || {};
    
    // Get properties from input or inputHandlers
    const label = this.component?.input?.label?.value || this.inputHandlersValue?.label || '';
    const closable = this.component?.input?.closable?.value ?? this.inputHandlersValue?.closable ?? false;
    const color = this.component?.input?.color?.value || this.inputHandlersValue?.color;
    const icon = this.component?.input?.icon?.value || this.inputHandlersValue?.icon;
    const bordered = this.component?.input?.bordered?.value ?? this.inputHandlersValue?.bordered ?? true;

    return html`
      <nr-tag
        ${ref(this.inputRef)}
        style=${styleMap(tagStyles)}
        .label=${label}
        .color=${color}
        .icon=${icon}
        ?closable=${closable}
        ?bordered=${bordered}
        @nr-close=${(e: CustomEvent) => {
          this.executeEvent('onClose', e);
        }}
        @click=${(e: MouseEvent) => {
          this.executeEvent('onClick', e);
        }}
      >
        ${label}
      </nr-tag>
    `;
  }
}
