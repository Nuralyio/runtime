import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./DirectionValue/DirectionValue";
import "./DirectionValueLabel/TextValueLabel";
import { type ComponentElement } from "$store/component/interface";
import { updateComponentInput } from "$store/component/action";

@customElement("parameter-container-attribute")
export class ParameterContainerAttribute extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
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

  updated(changedProperties) {}
  render() {
    return html` <div class="container">
      <attributes-container-direction-label
        class="first_column"
      ></attributes-container-direction-label>
      <parameters-container-direction-value-handler
        .component=${{ ...this.component }}
        @parametersUpdate=${(event: CustomEvent) => {
          const {
            detail: { value },
          } = event;
          updateComponentInput(this.component.uuid, {
            direction: value,
          });
        }}
      ></parameters-container-direction-value-handler>
    </div>`;
  }
}
