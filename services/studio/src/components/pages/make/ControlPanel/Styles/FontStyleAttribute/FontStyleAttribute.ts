import { updateComponentAttributes } from "$store/component/action";
import { ComponentElement } from "$store/component/interface";
import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./FontStyleValue/FontStyleValue";
import "./FontStyleLabel/FontStyleLabel";
@customElement("attribute-text-font-style")
export class FOntSTyleATtribute extends LitElement {
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
    if (event.detail.value === "italic") {
      updateComponentAttributes(this.component.id, {
        textDecoration: "",
        fontStyle: "italic",
      });
    }
    updateComponentAttributes(this.component.id, {
      textDecoration: event.detail.value,
    });
  }

  render() {
    return html` <div class="container">
      ${this.slim ? nothing : html`<attribute-font-style-value-label class="first_column"></attribute-font-style-value-label>` }
      <attribute-font-style-value-handler
        .component=${{ ...this.component }}
        @attributeUpdate=${this.changeHandler}
      ></attribute-font-style-value-handler>
    </div>`;
  }
}
