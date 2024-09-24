import {  html, type PropertyValues, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/button";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { executeHandler } from "core/helper";
import { $context } from "$store/context";
import { BaseElementBlock } from "../BaseElement";
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
    const messageChannel = executeHandler({
      component: this.component,
      type: "input.show",
      extras: {},
    });
    messageChannel.onmessage = (event) => {
      if (event.data.result || typeof event.data.result === "boolean") {
        this.display = event.data.result;
      }
    };
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
            executeEventHandler(this.component, "event", "onClick", {
              EventData: { x, y, type, },
            });
          }
        }}
    style=${styleMap({...buttonStyles,...buttonStyleHandlers})}
      >${this.inputHandlersValue.label?? 'Button'}</hy-button
    >` : nothing}
`;
  }
}
