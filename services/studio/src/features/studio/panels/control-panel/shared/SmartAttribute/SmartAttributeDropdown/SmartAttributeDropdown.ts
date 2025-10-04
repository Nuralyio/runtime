import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../SmartAttributeHandler/SmartAttributeHandler.ts";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";

@customElement("smart-attribute-editor-dropdown")
export class SmartAttributeEditorDropDown extends LitElement {
  static styles = [css``];
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
      @closed=${() => {
    }}
      .template=${html`lorem text`}
    >
        <hy-button icon="code" type="text" class="unit"></hy-button
      >
    </hy-dropdown>`;
  }
}
