import { ComponentElement } from "$store/component/interface";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("parameter-event-handler")
export class ParameterEventLabel extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  @property()
  eventName: string;
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  render() {
    return html`<smart-attribute-editor-dropdown
      .component=${{ ...this.component }}
      .attributeName=${this.eventName}
      .attributeScope=${"event"}
      .handlerScope=${"event"}
    >
      <hy-button icon="code" type="text" class="unit">Handler</hy-button>
    </smart-attribute-editor-dropdown> `;
  }
}
