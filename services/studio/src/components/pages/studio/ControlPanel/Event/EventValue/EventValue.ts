import { type ComponentElement } from "$store/component/interface";
import { BaseElementBlock } from "components/shared/blocks/ComponentElements/BaseElement";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("parameter-event-handler")
export class ParameterEventLabel extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;
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
      .attributeName=${this.inputHandlersValue.value}
      .attributeScope=${"event"}
      .handlerScope=${"event"}
    >
      <hy-button icon="code" type="text" class="unit">Handler</hy-button>
    </smart-attribute-editor-dropdown> `;
  }
}
