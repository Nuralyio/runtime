import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/input";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
@customElement("text-input-block")
export class TextInputBlock extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item:any;
  static styles = [
    css`
      :host {
      }
    `,
  ];
  render() {
    return html`
    <span style=${styleMap({ ...this.component.style })}
      ><hy-input .value=${this.item.value ?? ""} placeholder="Text input"></hy-input
    ></span>`;
  }
}
