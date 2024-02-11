import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { updateComponentAttributes } from "$store/component/action";
import { type ComponentElement } from "$store/component/interface";
import "./FontWeightHanlder";


@customElement("attribute-text-font-weight")
export class AttributeTextFontWeight extends LitElement {
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
      fontWeight: event.detail.value,
    });
  }
  render() {
    return html`
    <editpanel-attribute-container>
      <span slot="firstColumn">Font weight</span>
      <attribute-font-weight-value-handler
        slot="secondColumn"
        .component=${{ ...this.component }}
        @attributeUpdate=${this.changeHandler}
      ></attribute-font-weight-value-handler>
    </editpanel-attribute-container>
    `;
  }
}
