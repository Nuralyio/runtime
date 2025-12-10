import { css, html, LitElement, nothing, type PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../SmartAttributeCodeEditor/SmartAttributeCodeEditor.ts";

@customElement("smart-attribute-handler")
export class SmartAttributeHandler extends LitElement {
  static styles = [
    css`
      .error-message-text {
        color: red;
      }
    `
  ];
  @property({ type: Object })
  component: any;
  @property()
  attributeName: string;
  @property()
  attributeValue: string;
  @property({ type: Object })
  containerStyle: any;
  @property()
  attributeScope: string = "style";
  @property()
  handlerScope: string;
  @state()
  smartValue: string;
  @state()
  view = true;
  @state()
  private previousComponentId: string | undefined;

  codeChangeHandler(event: CustomEvent) {
    const {
      detail: { value }
    } = event;

    this.dispatchEvent(new CustomEvent("code-change", { bubbles: true, composed: true, detail: { value } }));
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.smartValue = this.getAttributeValue();
  }

  getAttributeValue() {
    let attributes = this.attributeScope && this.component ? this.component[this.attributeScope] : "";
    let attributeValue;
    if (this.attributeScope === "style") {
      attributeValue = `"${attributes[this.attributeName]}"`;
    } else {
      attributeValue = this.attributeName ? attributes[this.attributeName] : "";
    }

    if (this.handlerScope && !this.component[this.handlerScope]) {
      this.component[this.handlerScope] = {};
    }
    const smartAttributeValue = this.component && this.handlerScope && this.attributeName ?
      this.component[this.handlerScope]![this.attributeName] : "";
    return smartAttributeValue && smartAttributeValue !== ""
      ? smartAttributeValue
      : attributeValue;
  }

  render() {
    return html`
    ${this.component.errors &&
    this.component.errors[this.attributeName]
      ? html`<div class="error-message-text">
            ${this.component.errors[this.attributeName]}
          </div>`
      : nothing}
      ${this.view ? html`<smart-attribute-codeeditor
              .containerStyle=${this.containerStyle ?? nothing}
              .value=${this.attributeValue}
              @change=${this.codeChangeHandler}
            ></smart-attribute-codeeditor>` : nothing}`;
  }

  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    super.updated(_changedProperties);

    if (
      _changedProperties.has("component") &&
      this.component.uuid !== this.previousComponentId
    ) {
      this.previousComponentId = this.component.uuid;
    }

    this.smartValue = this.getAttributeValue();
  }
}
