import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./BackgroundColorLabel/BackgroundColorLabel";
import "./BackgroundColorValue/BackgroundColorValue";
import { updateComponentAttributes } from "$store/component/action";
import { type ComponentElement } from "$store/component/interface";
import styles from "./BackgroundColorAttribute.style";

@customElement("attribute-background-color")
export class AttributeBackgroundColor extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = styles;
  changeHandler(event: CustomEvent) {
    updateComponentAttributes(this.component.id, {
      backgroundColor: event.detail.value,
    });
  }
  render() {
    return html`<div class="container">
      <attribute-background-color-value-label
        class="first_column"
      ></attribute-background-color-value-label>
      <attribute-background-color-value-handler
        @attributeUpdate=${this.changeHandler}
        .component=${{ ...this.component }}
      ></attribute-background-color-value-handler>
    </div> `;
  }
}
