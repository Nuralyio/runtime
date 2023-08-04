import {
  ComponentElement,
  TextLabelParameters,
} from "$store/component/interface";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("text-label-block")
export class TextLabelBlock extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = [css``];

  render() {
    return html`<label style=${styleMap({ ...this.component.attributes })}
      >${(this.component.parameters as TextLabelParameters)?.value}</label
    >`;
  }
}
