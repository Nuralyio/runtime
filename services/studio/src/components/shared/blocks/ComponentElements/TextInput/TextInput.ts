import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/input";
import { styleMap } from "lit/directives/style-map.js";
import { ComponentElement } from "$store/component/interface";
@customElement("text-input-block")
export class TextInputBlock extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = [
    css`
      :host {
      }
    `,
  ];

  render() {
    return html`<span style=${styleMap({ ...this.component.attributes })}
      ><hy-input></hy-input
    ></span>`;
  }
}
