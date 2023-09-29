import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/input";
import { ComponentElement, TextLabelStyles } from "$store/component/interface";
@customElement("parameters-text-value-handler")
export class AttributesTextValueHandler extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  label = "";

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
    ></hy-input>`;
  }
}
