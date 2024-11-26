import { html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@nuralyui/button";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { executeCodeWithClosure } from "../../../core/executer.ts";
import { getNestedAttribute } from "../../../utils/object.utils.ts";
@customElement("button-block")
export class ButtonBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;
  static styles = [];

  @state()
  display: any = false;
 

   override async connectedCallback() {
    await super.connectedCallback();
    this.registerCallback('value', () => {
      this.requestUpdate();
    })
  }
  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    if (changedProperties.has("component")) {
      if(this.component){
        if (!this.component.input?.show?.value) {
          this.display = true;
        }
      }
    }
  }


  render() {
    const buttonStyles = this.component?.style || {};
    const buttonStyleHandlers = this.component?.styleHandlers? Object.fromEntries(
      Object.entries(this.component.styleHandlers).filter(([key,value])=>value)) : {};

    return html`
  ${!this.inputHandlersValue?.display||this.inputHandlersValue.display =='show' ? html`
    <hy-button
    .size=${buttonStyleHandlers?.size?buttonStyleHandlers.size:buttonStyles?.size?buttonStyles.size:nothing}
    .type=${buttonStyleHandlers?.type?buttonStyleHandlers.type:buttonStyles?.type?buttonStyles.type:nothing}     
    .disabled=${(this.inputHandlersValue.state == 'disabled')}
    .icon="${this.inputHandlersValue.icon?[this.inputHandlersValue.icon]:nothing}"
    .iconPosition=${this.inputHandlersValue.iconPosition??nothing}
     @click=${() => {
          if (this.component.event?.onClick) {
            executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onClick`))
          }
        }}
    style=${styleMap({...buttonStyles,...buttonStyleHandlers})}
      >${this.inputHandlersValue.label?? 'Button'}</hy-button
    >` : nothing}
`;
  }
}
