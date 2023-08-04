import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/button";
@customElement("button-block")
export class ButtonBlock extends LitElement {
  static styles = [
    css`
      :host {
      }
    `,
  ];

  render() {
    return html`<hy-button>Button</hy-button>`;
  }
}
