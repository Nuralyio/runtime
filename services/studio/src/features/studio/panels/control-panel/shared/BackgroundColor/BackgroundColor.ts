import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./BackgroundColorHandler/BackgroundColorHandler.ts";
import { type ComponentElement } from '../../../../../../features/runtime/redux/store/component/component.interface.ts';
import styles from "./BackgroundColor.style.ts";
import { updateComponentAttributes } from '../../../../../../features/runtime//redux/actions/component/updateComponentAttributes.ts';

@customElement("attribute-background-color")
export class AttributeBackgroundColor extends LitElement {
  static styles = styles;
  @property({ type: Object })
  component: ComponentElement;

  changeHandler(event: CustomEvent) {
    updateComponentAttributes(this.component.uuid, {
      backgroundColor: event.detail.value
    });
  }

  render() {
    return html`
    <editpanel-attribute-container>
      <span slot="firstColumn">Background color</span>
      <attribute-background-color-value-handler
        slot="secondColumn"
        .component=${{ ...this.component }}
        @attributeUpdate=${this.changeHandler}
      ></attribute-background-color-value-handler>
    </editpanel-attribute-container>
 `;
  }
}
