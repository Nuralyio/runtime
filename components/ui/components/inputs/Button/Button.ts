import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";

// Safely import @nuralyui/button
try {
  await import("@nuralyui/button");
} catch (error) {
  console.warn('[@nuralyui/button] Package not found or failed to load. Button functionality may be limited.');
}



@customElement("button-block")
export class ButtonBlock extends BaseElementBlock {
  static styles = [
    css`
      :host {
        --nuraly-button-icon-width: 19px;
      }
    `,
  ];

  @property({ type: Object })
  component: ComponentElement;

  @state()
  display: any = false;

  override connectedCallback() {
    super.connectedCallback();
    this.registerCallback("value", () => {});
  }

  renderComponent() {
    const buttonStyles = this.getStyles();
    
    // Support multiple icon API formats
    const iconArray = this.resolvedInputs.icon ? [this.resolvedInputs.icon] : [];
    
    return html`
            <nr-button
              ${ref(this.inputRef)}
              size=${this.resolvedInputs?.size || nothing}
              type=${this.resolvedInputs?.type || "default"}
              .shape=${this.resolvedInputs?.shape || nothing}
              .disabled=${this.resolvedInputs?.state == "disabled"}
              .loading=${this.resolvedInputs?.loading || false}
              .block=${this.resolvedInputs?.block || false}
              .dashed=${this.resolvedInputs?.dashed || false}
              .icon=${iconArray}
              .iconLeft=${this.resolvedInputs?.iconLeft || nothing}
              .iconRight=${this.resolvedInputs?.iconRight || nothing}
              .icons=${this.resolvedInputs?.icons || nothing}
              .iconPosition=${this.resolvedInputs?.iconPosition || 'left'}
              .href=${this.resolvedInputs?.href || nothing}
              .target=${this.resolvedInputs?.target || nothing}
              .ripple=${this.resolvedInputs?.ripple !== false}
              .buttonAriaLabel=${this.resolvedInputs?.ariaLabel || nothing}
              .htmlType=${this.resolvedInputs?.htmlType || nothing}
              @click=${(e) => {
               this.executeEvent('onClick' , e)
              }}
              @button-clicked=${(e) => {
               this.executeEvent('onButtonClicked' , e)
              }}
              @link-navigation=${(e) => {
               this.executeEvent('onLinkNavigation' , e)
              }}
              style=${styleMap({ 
                ...this.getStyles(),
                width: buttonStyles?.width,
                height: buttonStyles?.height,
               })}
            >
              ${this.resolvedInputs.label  ?this.resolvedInputs.label  :  this.resolvedInputs.iconOnly ? "" :  "Button" 
                
        }
            </nr-button>
    `;
  }
}