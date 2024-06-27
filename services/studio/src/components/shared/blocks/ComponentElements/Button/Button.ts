import { LitElement, html, css, type PropertyValues, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/button";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { executeDispalyHandler, executeValueHandler } from "core/helper";
import { $context } from "$store/context/store";
const isServer = typeof window === 'undefined';


@customElement("button-block")
export class ButtonBlock extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = [];

  @state()
  thisvalue;

  @state()
  display: any = false;

  getValue() {
    /* if (isServer) {
       if (this.component.parameters?.value) {
         if (this.component?.parent?.component_type === "Collection") {
           return this.component.iterations[this.item.index];
         }
       }
     }*/
    return isServer ? this.component.input?.value?.value : this.thisvalue ?? this.component.input?.value?.value;
  }

  updateValue() {
    executeValueHandler(this.component)
      .onmessage = (event) => {
        if (event.data.result) {
          this.thisvalue = event.data.result;
        }
      }

  }


  override connectedCallback() {
    super.connectedCallback();
    this.updateValue();
    $context.subscribe((context) => {
      if (this.component) {
        this.updateDisplay();
        this.updateValue();
      }
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
    const messageChannel = executeDispalyHandler(this.component);
    messageChannel.onmessage = (event) => {
      if (event.data.result || typeof event.data.result === "boolean") {
        this.display = event.data.result;
      }
    };
  }


  render() {
    return html`
  ${this.display ? html`
    <hy-button 
     @click=${({ x, y, type, }) => {
          if (this.component.event.onClick) {
            executeEventHandler(this.component, "event", "onClick", {
              EventData: { x, y, type, },
            });
          }
        }}
    style=${styleMap({ ...this.component.style })}
      >${this.getValue()}</hy-button
    >` : nothing}
`;
  }
}
