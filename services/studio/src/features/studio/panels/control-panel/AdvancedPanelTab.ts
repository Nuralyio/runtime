import { type ComponentElement } from "@shared/redux/store/component/interface";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("advanced-panel")
export class AdvancedPanel extends LitElement {
  static styles = [css``];
  @property({ type: Object })
  component: ComponentElement;

  render() {
    return html`${Object.keys(this.component.style || []).map(
      (attributeName: string) => {
        return html`<div>
          ${attributeName} Value :
          <smart-attribute-handler
            .containerStyle=${{
          height: "30px",
          border: "solid 1px gray"
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
