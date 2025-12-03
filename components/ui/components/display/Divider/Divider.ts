import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";
import "@nuralyui/divider";

@customElement("divider-block")
export class DividerBlock extends BaseElementBlock {
  static styles = [
    css`
    :host { 
        display: block;
        width: 100%;
    }
    
    :host([data-type="vertical"]) {
        display: inline-flex;
        width: auto;
        align-self: stretch; /* This makes it fill the parent's height in flexbox */
    }
    
    :host([data-type="vertical"]) nr-divider {
        height: 100%;
        display: flex;
        align-items: stretch;
    }
    `
  ];
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Object })
  item: any;
  unsubscribe: () => void;

  override async connectedCallback() {
    await super.connectedCallback();
    this.registerCallback("value", () => {
    });
    // Set data-type attribute for CSS styling
    this.updateHostAttribute();
  }

  override updated(changedProperties: Map<string, any>) {
    super.updated(changedProperties);
    this.updateHostAttribute();
  }

  private updateHostAttribute() {
    const direction = this.inputHandlersValue?.direction ?? "horizontal";
    this.setAttribute('data-type', direction);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    const dividerStyles = this.component?.style || {};
    const dividerAutoWidth = this.inputHandlersValue?.width;
    const dividerAutoHeight = this.inputHandlersValue?.height;
    const isVertical = (this.inputHandlersValue?.direction ?? "horizontal") === "vertical";

    // Filter out height from styles if it's a vertical divider to avoid conflicts
    const filteredStyles = { ...dividerStyles };
    if (isVertical && dividerAutoHeight) {
      delete filteredStyles.height;
    }

    return html`
    ${!this.inputHandlersValue?.display || this.inputHandlersValue.display == "show" ?
      html`
      <nr-divider
        ${ref(this.inputRef)}
        style=${styleMap({
          ...filteredStyles,
          width: dividerAutoWidth ? "100%" : dividerStyles.width,
          height: !isVertical && dividerAutoHeight ? "auto" : filteredStyles.height
        })}
        type=${this.inputHandlersValue?.direction ?? "horizontal"}
        .variant=${this.inputHandlersValue?.variant || 'solid'}
        .orientation=${this.inputHandlersValue?.textOrientation || 'center'}
        .orientationMargin=${this.inputHandlersValue?.orientationMargin ?? nothing}
        .plain=${this.inputHandlersValue?.plain !== false}
        .size=${this.inputHandlersValue?.size ?? nothing}
        .dashed=${this.inputHandlersValue?.dashed || false}
        @click=${(e) => {
          this.executeEvent("onClick", e);
        }}
      >
        ${this.inputHandlersValue?.text || ''}
      </nr-divider>
      ` : nothing}
    `;
  }
}