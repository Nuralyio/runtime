import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./FontSizeValue/FontSizeValue";
import "./FontSizeValueLabel/FontSizeValueLabel";
import { ComponentElement } from "$store/component/interface";
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
    updateComponentAttributes(this.component.id, {
      fontSize: event.detail.value,
    });
  }

  render() {
    return html` <div class="container">
      ${this.slim ? nothing : html`<attribute-font-size-value-label class="first_column"></attribute-font-size-value-label>` }
      <attribute-font-size-value-handler
        .slim=${this.slim}
        @attributeUpdate=${this.changeHandler}
        .component=${{ ...this.component }}
      ></attribute-font-size-value-handler>
    </div>`;
  }
}
