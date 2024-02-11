import {
  type ComponentElement,
} from "$store/component/interface";
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("attribute-background-color-value-handler")
export class AttributeBackgroundColorValue extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  @state()
  backgroundColor = "#ffffff";
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  handleColorChange(event) {
    const { value } = event.detail;
    this.backgroundColor = value;
    this.emitCustomEvent();
  }

  emitCustomEvent() {
    let customEvent = new CustomEvent("attributeUpdate", {
      detail: {
        value: `${this.backgroundColor}`,
      },
    });
    this.dispatchEvent(customEvent);
  }

  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component") {
        this.initValues();
      }
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.initValues();
  }
  initValues() {
    if (this.component.style?.color && this.component.style?.backgroundColor != "undefined") {
      this.backgroundColor = this.component.style?.backgroundColor;
    } else {
      this.backgroundColor = "#000000";
    }
    this.requestUpdate();
  }

  render() {
    return html`
    <hy-color-picker
    .color="${this.backgroundColor}"
    @color-changed="${this.handleColorChange}"
    ></hy-color-picker>

`;
  }
}
