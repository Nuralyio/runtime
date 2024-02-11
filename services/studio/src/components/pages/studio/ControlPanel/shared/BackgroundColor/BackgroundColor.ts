import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./BackgroundColorHandler/BackgroundColorHandler";
import { updateComponentAttributes } from "$store/component/action";
import { type ComponentElement } from "$store/component/interface";
import styles from "./BackgroundColor.style";

@customElement("attribute-background-color")
export class AttributeBackgroundColor extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = styles;
  changeHandler(event: CustomEvent) {
    updateComponentAttributes(this.component.uuid, {
      backgroundColor: event.detail.value,
    });
  }
  render() {
    return html`
    <editpanel-attribute-container>
      <span slot="firstColumn">Background color</span>
      <attribute-background-color-value-handler
        slot="secondColumn"
        .component=${{ ...this.component }}
        @attributeUpdate=${this.changeHandler}
      ></attribute-background-color-value-handler>
    </editpanel-attribute-container>
 `;
  }
}
