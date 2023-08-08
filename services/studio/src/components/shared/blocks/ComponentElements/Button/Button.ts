import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@hybridui/button";
import { styleMap } from "lit/directives/style-map.js";
import { ComponentElement } from "$store/component/interface";
@customElement("button-block")
export class ButtonBlock extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = [];

  render() {
    return html`<hy-button style=${styleMap({ ...this.component.attributes })}
      >Button</hy-button
    >`;
  }
}
