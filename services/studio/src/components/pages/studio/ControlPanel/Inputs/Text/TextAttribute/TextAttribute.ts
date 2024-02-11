import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./TextValueLabel/TextValueLabel";
import "./TextValue/TextValue";
import { type ComponentElement } from "$store/component/interface";
import { updateComponentParameters } from "$store/component/action";
import "../../../shared/EditPanelAttributeContainer/EditPanelAttributeContainer"
@customElement("parameter-text-label")
export class TextLabelAttributes extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = [
    css`
     
    `,
  ];

  render() {
    return html` 
      <editpanel-attribute-container>
      <attributes-text-value-label
      slot="firstColumn"
      ></attributes-text-value-label>
      <parameters-text-value-handler
      slot="secondColumn"
        .component=${this.component}
        @parametersUpdate=${(event: CustomEvent) => {
        const {
          detail: { value },
        } = event;
        updateComponentParameters(this.component.uuid, {
          value,
        });
      }}
      ></parameters-text-value-handler>
      </editpanel-attribute-container>
    `;
  }
}
