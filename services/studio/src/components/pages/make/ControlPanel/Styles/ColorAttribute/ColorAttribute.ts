import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./ColorLabel/ColorLabel";
import "./ColorValue/ColorValue";
import { updateComponentAttributes } from "$store/component/action";
import { type ComponentElement } from "$store/component/interface";
import styles from "./ColorAttribute.style";

@customElement("attribute-color")
export class AttributeColor extends LitElement {
  @property({ type: Object })
  component: ComponentElement;


  @property({ type: Boolean })
  slim: boolean = false;


  static styles = styles;
  changeHandler(event: CustomEvent) {
    updateComponentAttributes(this.component.id, {
      color: event.detail.value,
    });
  }
  render() {
    return html`<div class="container">
      ${this.slim ? nothing : html`<attribute-color-value-label class="first_column"></attribute-color-value-label>` }
      <attribute-color-value-handler
        @attributeUpdate=${this.changeHandler}
        .component=${{ ...this.component }}
      ></attribute-color-value-handler>
    </div> `;
  }
}
