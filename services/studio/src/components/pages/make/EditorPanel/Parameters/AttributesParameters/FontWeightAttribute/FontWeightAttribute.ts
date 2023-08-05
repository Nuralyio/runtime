import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../../components/Attributes/FonWeight/FonWeightValue/FonWeightValue";
import "../../components/Attributes/FonWeight/FonWeightLabel/FonWeightLabel";
import { updateComponentAttributes } from "$store/component/action";
import { ComponentElement } from "$store/component/interface";
@customElement("attribute-text-font-weight")
export class AttributeTextFontWeight extends LitElement {
  component: ComponentElement;

  static styles = [
    css`
      .container {
        display: flex;
        flex-direction: row;
      }
      .first_column {
        width: 30%;
      }
    `,
  ];

  changeHandler(event: CustomEvent) {
    updateComponentAttributes(this.component.id, {
      fontWeight: event.detail.value,
    });
  }
  render() {
    return html`
      <div class="container">
        <attribute-font-size-weight-label
          class="first_column"
        ></attribute-font-size-weight-label>
        <attribute-font-weight-value-handler
          @attributeUpdate=${this.changeHandler}
        ></attribute-font-weight-value-handler>
      </div>
    `;
  }
}
