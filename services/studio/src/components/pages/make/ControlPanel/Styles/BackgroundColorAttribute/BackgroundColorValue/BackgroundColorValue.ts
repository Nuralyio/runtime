import {
  ComponentElement,
  TextLabelAttributes,
} from "$store/component/interface";
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ChangeEvent } from "react";

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
    const { value } = event.target;
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
    this.backgroundColor = this.component.style.backgroundColor ?? "#ffffff";
    this.requestUpdate();
  }

  render() {
    return html`<input
      type="color"
      .value=${this.backgroundColor}
      @change=${this.handleColorChange}
    />`;
  }
}
