import { type ComponentElement } from "$store/component/interface";
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("advanced-panel")
export class AdvancedPanel extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = [css``];

  render() {
    return html`${Object.keys(this.component.style || []).map(
      (attributeName: string) => {
        return html`<div>
          ${attributeName} Value :
          <smart-attribute-handler
            .containerStyle=${{
              height: "30px",
              border: "solid 1px gray",
            }}
            .component=${{ ...this.component }}
            .attributeName=${attributeName}
            .handlerScope=${"styleHandlers"}
          ></smart-attribute-handler>
        </div>`;
      }
    )}`;
  }
}
