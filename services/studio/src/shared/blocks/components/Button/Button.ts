import {  html, type PropertyValues, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@nuralyui/button";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { executeCodeWithClosure } from "../../../../core/executer.ts";
import { getNestedAttribute } from "../../../../utils/object.utils.ts";
const isServer = typeof window === 'undefined';


@customElement("button-block")
export class ButtonBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;
  static styles = [];

  @state()
  thisvalue;

  @state()
  display: any = false;
 

  override connectedCallback() {
    super.connectedCallback();
    this.registerCallback('value', (v) => {
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

  // display handler
  updateDisplay() {

    const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.show`),{
    });
    this.display = fn;
    console.log(fn)
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
    .disabled=${this.inputHandlersValue.state=='disabled'?true:false}
    .icon="${this.inputHandlersValue.icon?[this.inputHandlersValue.icon]:nothing}"
    .iconPosition=${this.inputHandlersValue.iconPosition??nothing}
     @click=${({ x, y, type, }) => {
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
