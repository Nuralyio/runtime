import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./TextValueLabel/TextValueLabel";
import "./TextValue/TextValue";
import { ComponentElement } from "$store/component/interface";
import { updateComponentParameters } from "$store/component/action";
@customElement("parameter-text-label")
export class TextLabelAttributes extends LitElement {
  @property({ type: Object })
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

  render() {
    return html` <div class="container">
      <attributes-text-value-label
        class="first_column"
      ></attributes-text-value-label>
      <parameters-text-value-handler
        .component=${this.component}
        @parametersUpdate=${(event: CustomEvent) => {
          const {
            detail: { value },
          } = event;
          updateComponentParameters(this.component.id, {
            value,
          });
        }}
        class="column"
      ></parameters-text-value-handler>
    </div>`;
  }
}
