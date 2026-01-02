import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";

// Safely import @nuralyui/icon
try {
  await import("@nuralyui/icon");
} catch (error) {
  console.warn('[@nuralyui/icon] Package not found or failed to load.');
}



@customElement("icon-block")
export class IconBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Object })
  item: any;

  constructor() {
    super();
  }
  override connectedCallback() {
    super.connectedCallback();
  }

  renderComponent() {
    const iconStyles = this.getStyles();

    return html`
      <nr-icon
      ${ref(this.inputRef)}
        .name=${this.resolvedInputs.icon ?? "smile"}
        .type=${this.resolvedInputs.type || 'solid'}
        .alt=${this.resolvedInputs.alt || ''}
        .size=${this.resolvedInputs.size || nothing}
        .color=${this.resolvedInputs.color || nothing}
        .width=${iconStyles?.width || nothing}
        .height=${iconStyles?.height || nothing}
        .clickable=${this.resolvedInputs.clickable || false}
        .disabled=${this.resolvedInputs.state === "disabled"}
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
