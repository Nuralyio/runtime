import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { type ComponentElement } from "$store/component/interface";
@customElement("collection-input-value-handler")
export class CollectionInputValueHandler extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  label = "";

  static styles = [css``];
  @property({ type: Boolean })
  slim: any;

  @property({ type: Boolean })
  flat: any;

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
    this.label = this.component?.parameters?.value ?? "";
    this.requestUpdate();
  }
    renderCodeEditorTemplate() {
    return html`<smart-attribute-handler
      .component=${{ ...this.component }}
      .attributeName=${"data"}
      .containerStyle=${{
         width: "auto",
        height: "250px",
        border: "solid 1px gray",
      }}
      .attributeScope=${"inputHandlers"}
      .handlerScope=${"inputHandlers"}
    ></smart-attribute-handler>`;
  }
  render() {
    return html` 
     ${
      this.flat ?       this.renderCodeEditorTemplate()
      : html`
<hy-input
      palceholder="value"
      @valueChange=${this.handleValueChange}
      .value=${this.label}
    ></hy-input>
${!this.slim && !this.flat ? html`
          <smart-attribute-editor-dropdown
        .component=${{ ...this.component }}
        .attributeName=${"data"}
        .attributeScope=${"inputHandlers"}
        .handlerScope=${"inputHandlers"}
      ></smart-attribute-editor-dropdown>
      ` : nothing}
      `
     }
          `;
  }
}
