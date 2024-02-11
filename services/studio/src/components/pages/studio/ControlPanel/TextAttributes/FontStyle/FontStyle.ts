import { updateComponentAttributes } from "$store/component/action";
import { type ComponentElement } from "$store/component/interface";
import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./FontStyleHandler";

@customElement("attribute-text-font-style")
export class FOntSTyleATtribute extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Boolean })
  slim: boolean = false;

  static styles = [
    css``,
  ];

  changeHandler(event: CustomEvent) {
    
    const {
      detail: { value },
    } = event;

    updateComponentAttributes(this.component.uuid, {
      textDecoration: value.textDecoration,
      fontStyle: value.fontStyle,
    });
   
  }

  render() {
    return html` 
    <editpanel-attribute-container>
      <span  slot="firstColumn">Font style</span>
      <attribute-font-style-value-handler
        slot="secondColumn"
        .component=${{ ...this.component }}
        @attributeUpdate=${this.changeHandler}
      ></attribute-font-style-value-handler>
    </editpanel-attribute-container>
`;
  }
}
