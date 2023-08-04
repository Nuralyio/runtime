import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/input";
@customElement("text-input-block")
export class TextInputBlock extends LitElement {
  static styles = [
    css`
      :host {
      }
    `,
  ];

  render() {
    return html`<hy-input></hy-input>`;
  }
}
