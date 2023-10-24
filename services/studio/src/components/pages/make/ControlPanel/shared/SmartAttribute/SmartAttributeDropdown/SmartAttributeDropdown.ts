import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/dropdown";
import { styleMap } from "lit/directives/style-map.js";
import "../SmartAttributeHandler/SmartAttributeHandler";
import { type ComponentElement } from "$store/component/interface";
@customElement("smart-attribute-editor-dropdown")
export class SmartAttributeEditorDropDown extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  @property()
  attributeName: string;
  @property()
  attributeScope: string;

  @property()
  handlerScope: string;

  @property()
  attributeValue: string;

  static styles = [css``];

  renderCodeEditorTemplate() {
    return html`<smart-attribute-handler
      .component=${{ ...this.component }}
      .attributeName=${this.attributeName}
      .attributeScope=${this.attributeScope}
      .handlerScope=${this.handlerScope}
    ></smart-attribute-handler>`;
  }
  render() {
    return html` <hy-dropdown
      .customStyles=${{ width: "400px", height: "250px" }}
      placeholder="Select an option"
      @closed=${() => {}}
      .template=${this.renderCodeEditorTemplate()}
    >
      <slot slot="label">
        <hy-button icon="code" type="text" class="unit"></hy-button
      ></slot>
    </hy-dropdown>`;
  }
}
