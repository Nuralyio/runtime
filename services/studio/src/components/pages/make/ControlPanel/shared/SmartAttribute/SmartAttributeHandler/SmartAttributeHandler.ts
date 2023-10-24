import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../SmartAttributeCodeEditor/SmartAttributeCodeEditor";
import { type ComponentElement } from "$store/component/interface";
import { updateComponentAttributeHandlers } from "$store/component/action";

@customElement("smart-attribute-handler")
export class SmartAttributeHandler extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @property()
  attributeName: string;

  @property({ type: Object })
  containerStyle: any;

  @property()
  attributeScope: string = "style";

  @property()
  handlerScope: string;

  @state()
  smartValue: string;

  static styles = [
    css`
      .error-message-text {
        color: red;
      }
    `,
  ];

  codeChangeHandler(event: CustomEvent) {
    const {
      detail: { value },
    } = event;

    updateComponentAttributeHandlers(this.component.id, this.handlerScope, {
      [this.attributeName]: value,
    });
  }
  connectedCallback(): void {
    super.connectedCallback();
  }
  getAttributeValue() {
    let attributes = this.component[this.attributeScope];
    let attributeValue;
    if (this.attributeScope === "style") {
      attributeValue = `"${attributes[this.attributeName]}"`;
    } else {
      attributeValue = attributes[this.attributeName] ?? "";
    }

    const smartAttributeValue =
      this.component[this.handlerScope]![this.attributeName];
    return smartAttributeValue && smartAttributeValue !== ""
      ? smartAttributeValue
      : attributeValue;
  }
  render() {
    return html`${this.component.errors &&
      this.component.errors[this.attributeName]
      ? html`<div class="error-message-text">
            ${this.component.errors[this.attributeName]}
          </div>`
      : nothing}
      <smart-attribute-codeeditor
        .containerStyle=${this.containerStyle ?? nothing}
        .value=${this.getAttributeValue()}
        @change=${this.codeChangeHandler}
      ></smart-attribute-codeeditor>`;
  }
}
