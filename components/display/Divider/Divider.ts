import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";
import "@nuralyui/divider";

@customElement("divider-block")
export class DividerBlock extends BaseElementBlock {
  static styles = [
    css`
    :host { 
        width: 100%;
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
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    const dividerStyles = this.component?.style || {};
    const dividerAutoWidth = this.inputHandlersValue?.width;
    const dividerAutoHeight = this.inputHandlersValue?.height;

    return html`
    ${!this.inputHandlersValue?.display || this.inputHandlersValue.display == "show" ?
      html`
      <nr-divider
        ${ref(this.inputRef)}
        style=${styleMap({
          ...dividerStyles,
          width: dividerAutoWidth ? "100%" : dividerStyles.width,
          height: dividerAutoHeight ? "auto" : dividerStyles.height
        })}
        .type=${this.inputHandlersValue?.orientation === "vertical" ? "vertical" : "horizontal"}
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