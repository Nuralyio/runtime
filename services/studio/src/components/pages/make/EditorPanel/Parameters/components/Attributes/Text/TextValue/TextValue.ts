import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/input";
import {
  ComponentElement,
  TextLabelParameters,
} from "$store/component/interface";
@customElement("parameters-text-value-handler")
export class AttributesTextValueHandler extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

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

  render() {
    return html` <hy-input
      palceholder="value"
      @valueChange=${this.handleValueChange}
      value=${(this.component?.parameters as TextLabelParameters)?.value}
    ></hy-input>`;
  }
}
