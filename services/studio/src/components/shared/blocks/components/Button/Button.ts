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
    const inputStyles = this.component?.style || {};

    return html`
  ${this.display ? html`
    <hy-button 
    .size=${inputStyles.size}
    .type=${inputStyles.type}     
    .disabled=${this.inputHandlersValue.state=='disabled'?true:false}
     @click=${({ x, y, type, }) => {
          if (this.component.event?.onClick) {
            executeEventHandler(this.component, "event", "onClick", {
              EventData: { x, y, type, },
            });
          }
        }}
    style=${styleMap(inputStyles)}
      >${this.inputHandlersValue.label??''}</hy-button
    >` : nothing}
`;
  }
}
