import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/input";
import { type ComponentElement } from "$store/component/interface";
@customElement("parameters-text-value-handler")
export class AttributesTextValueHandler extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  label = "";

  @property({ type: Boolean })
  slim: boolean = false;

  static styles = [css``];

  handleValueChange(event: CustomEvent) {
    const {
      detail: { value },
    } = event;
    let customEvent = new CustomEvent("parametersUpdate", {
      detail: {
        value,
      },
    });
    this.dispatchEvent(customEvent);
  }
  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component") {
        this.initValues();
      }
    });
  }
  initValues() {
    this.label = this.component.parameters.value ?? "";
    this.requestUpdate();
  }
  render() {
    return html` <hy-input
      palceholder="value"
      @valueChange=${this.handleValueChange}
      .value=${this.label}
    ></hy-input>
   </attribute-input-wrapper>
          ${!this.slim ? html`
          <smart-attribute-editor-dropdown
        .component=${{ ...this.component }}
        .attributeName=${"value"}
        .attributeScope=${"attributes"}
        .handlerScope=${"attributesHandlers"}
      ></smart-attribute-editor-dropdown>
      ` : nothing}
    `;
  }
}
