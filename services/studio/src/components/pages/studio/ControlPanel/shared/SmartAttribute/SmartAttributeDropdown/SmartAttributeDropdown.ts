import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@nuraly/dropdown";
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
    return html`ss<smart-attribute-handler
      .component=${{ ...this.component }}
      .attributeName=${this.attributeName}
      .attributeScope=${this.attributeScope}
      .handlerScope=${this.handlerScope}
    ></smart-attribute-handler>`;
  }
  render() {
    return html`<hy-dropdown
      placeholder="Select an option"
      @closed=${() => {}}
      .template=${html`lorem text`}
    >
        <hy-button icon="code" type="text" class="unit"></hy-button
      >
    </hy-dropdown>`;
  }
}
