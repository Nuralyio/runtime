import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./FontSizeValueHandler/FontSize";
import { type ComponentElement } from "$store/component/interface";
import { updateComponentAttributes } from "$store/component/action";

@customElement("attribute-text-font-size")
export class AttributeTextFontSize extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Boolean })
  slim: boolean = false;

  
  static styles = [
    css`
      .container {
        display: flex;
        flex-direction: row;
      }
      .first_column {
        width: 40%;
      }
    `,
  ];

  changeHandler(event: CustomEvent) {
    updateComponentAttributes(this.component.uuid, {
      fontSize: event.detail.value,
    });
  }
 // Font Size
  render() {
    return html` 
     <editpanel-attribute-container>
      <span  slot="firstColumn">Font Size</span>
      <attribute-font-size-value-handler
        slot="secondColumn"
        .slim=${this.slim}
        @attributeUpdate=${this.changeHandler}
        .component=${{ ...this.component }}
      ></attribute-font-size-value-handler>
     </editpanel-attribute-container>
   `;
  }
}
