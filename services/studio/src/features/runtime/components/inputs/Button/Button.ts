import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";
import "@nuralyui/button";



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

  override async connectedCallback() {
    await super.connectedCallback();
    this.registerCallback("value", () => {});
  }

  renderComponent() {
    const buttonStyles = this.getStyles();
    
    // Support multiple icon API formats
    const iconArray = this.inputHandlersValue.icon ? [this.inputHandlersValue.icon] : [];
    
    return html`
            <nr-button
              ${ref(this.inputRef)}
              size=${this.inputHandlersValue?.size || nothing}
              type=${this.inputHandlersValue?.type || "default"}
              .shape=${this.inputHandlersValue?.shape || nothing}
              .disabled=${this.inputHandlersValue?.state == "disabled"}
              .loading=${this.inputHandlersValue?.loading || false}
              .block=${this.inputHandlersValue?.block || false}
              .dashed=${this.inputHandlersValue?.dashed || false}
              .icon=${iconArray}
              .iconLeft=${this.inputHandlersValue?.iconLeft || nothing}
              .iconRight=${this.inputHandlersValue?.iconRight || nothing}
              .icons=${this.inputHandlersValue?.icons || nothing}
              .iconPosition=${this.inputHandlersValue?.iconPosition || 'left'}
              .href=${this.inputHandlersValue?.href || nothing}
              .target=${this.inputHandlersValue?.target || nothing}
              .ripple=${this.inputHandlersValue?.ripple !== false}
              .buttonAriaLabel=${this.inputHandlersValue?.ariaLabel || nothing}
              .htmlType=${this.inputHandlersValue?.htmlType || nothing}
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
              ${this.inputHandlersValue.label  ?this.inputHandlersValue.label  :  this.inputHandlersValue.iconOnly ? "" :  "Button" 
                
        }
            </nr-button>
    `;
  }
}