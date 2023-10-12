import { ComponentElement } from "$store/component/interface";
import { PageElement } from "$store/page/interface";
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ChangeEvent } from "react";

@customElement("attribute-backgroundcolor-value-handler")
export class AttributeColorValue extends LitElement {
  @property({ type: Object })
  page: PageElement;
  @state()
  color = "#000000";
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  handleColorChange(event) {
    const { value } = event.target;
    this.color = value;
    this.emitCustomEvent();
  }

  emitCustomEvent() {
    let customEvent = new CustomEvent("attributeUpdate", {
      detail: {
        value: `${this.color}`,
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
    this.color = this.page.style?.backgroundColor ?? "#ffffff";
    this.requestUpdate();
  }

  render() {
    return html`<input
      type="color"
      .value=${this.color}
      @change=${this.handleColorChange}
      id="head"
      name="head"
    />`;
  }
}
