import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import "@nuralyui/icon";
import { ref } from "lit/directives/ref.js";


@customElement("icon-block")
export class IconBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Object })
  item: any;

  constructor() {
    super();
    this.registerCallback("icon", () => {
    });
  }
  override async connectedCallback() {
    await super.connectedCallback();

  }

  renderComponent() {
    const iconStyles = this.getStyles();

    return html`
      <nr-icon
      ${ref(this.inputRef)}
        .name=${this.inputHandlersValue.icon ?? "smile"}
        .type=${this.inputHandlersValue.type || 'solid'}
        .alt=${this.inputHandlersValue.alt || ''}
        .size=${this.inputHandlersValue.size || nothing}
        .color=${this.inputHandlersValue.color || nothing}
        .width=${iconStyles?.width || nothing}
        .height=${iconStyles?.height || nothing}
        .clickable=${this.inputHandlersValue.clickable || false}
        .disabled=${this.inputHandlersValue.state === "disabled"}
        @click=${(e) => {
          this.executeEvent("onClick", e);
        }}
        @icon-click=${(e) => {
          this.executeEvent("onIconClick", e);
        }}
        @icon-keyboard-activation=${(e) => {
          this.executeEvent("onIconKeyboardActivation", e);
        }}
        style=${styleMap({ 
          display:"block",
          ...this.getStyles(), 
          "--nuraly-icon-width" : iconStyles?.width,
          "--nuraly-icon-height" : iconStyles?.height
        })}>
      </nr-icon>
    `;
  }
}