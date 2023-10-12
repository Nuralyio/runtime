import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./FontWeightValue/FontWeightValue";
import "./FontWeightLabel/FontWeightLabel";
import { updateComponentAttributes } from "$store/component/action";
import { ComponentElement } from "$store/component/interface";
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
    updateComponentAttributes(this.component.id, {
      fontWeight: event.detail.value,
    });
  }
  render() {
    return html`
      <div class="container">
      ${this.slim ? nothing : html`<attribute-font-size-weight-label class="first_column"></attribute-font-size-weight-label>` }
        <attribute-font-weight-value-handler
         .slim=${this.slim}
          .component=${{ ...this.component }}
          @attributeUpdate=${this.changeHandler}
        ></attribute-font-weight-value-handler>
      </div>
    `;
  }
}
