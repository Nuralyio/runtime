import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./TextColorHandler/TextColorHandler";
import { updateComponentAttributes } from "$store/component/action";
import { type ComponentElement } from "$store/component/interface";
import styles from "./TextColor.style";

@customElement("attribute-color")
export class AttributeColor extends LitElement {
  @property({ type: Object })
  component: ComponentElement;


  @property({ type: Boolean })
  slim: boolean = false;


  static styles = styles;
  changeHandler(event: CustomEvent) {
    updateComponentAttributes(this.component.uuid, {
      color: event.detail.value,
    });
  }
  render() {
    return html`
    <editpanel-attribute-container>
      <span slot="firstColumn">Text color</span>
      <attribute-color-value-handler
        slot="secondColumn"
        .component=${{ ...this.component }}
        @attributeUpdate=${this.changeHandler}
      ></attribute-color-value-handler>
    </editpanel-attribute-container>
   `;
  }
}
