import { ComponentElement, TextLabelStyles } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("text-label-block")
export class TextLabelBlock extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  render() {
    return html`<label
      style=${styleMap({ ...this.component.style })}
      @click=${(e) => {
        if (this.component.event.onClick) {
          executeEventHandler(this.component, "event", "onClick");
        }
      }}
      >${this.component.parameters?.value}</label
    >`;
  }
}
