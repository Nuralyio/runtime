import { LitElement, html, css, nothing, type PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { type ComponentElement } from "$store/component/interface";
import { updateComponentAttributeHandlers } from "$store/actions/component";
import "../SmartAttributeCodeEditor/SmartAttributeCodeEditor";

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

  @state()
  private previousComponentId: string | undefined;

  @state()
  view = true;

  codeChangeHandler(event: CustomEvent) {
    const {
      detail: { value },
    } = event;

    updateComponentAttributeHandlers(this.component.uuid, this.handlerScope, {
      [this.attributeName]: value,
    });
    this.dispatchEvent(new CustomEvent('code-change',{bubbles:true,composed:true,detail:{value}}))
  }
  connectedCallback(): void {
    super.connectedCallback();
   this.smartValue = this.getAttributeValue();
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
    this.view = false;
    setTimeout(()=>{
      this.view = true;
    },0)

    }

    this.smartValue = this.getAttributeValue();
  }
  getAttributeValue() {
    let attributes = this.component[this.attributeScope];
    let attributeValue;
    if (this.attributeScope === "style") {
      attributeValue = `"${attributes[this.attributeName]}"`;
    } else {
      attributeValue = attributes[this.attributeName] ?? "";
    }

    if (!this.component[this.handlerScope]) {
      this.component[this.handlerScope] = {}
    }
    const smartAttributeValue =
      this.component[this.handlerScope]![this.attributeName];
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
              .value=${this.smartValue}
              @change=${this.codeChangeHandler}
            ></smart-attribute-codeeditor>` : nothing}`;
  }
}
