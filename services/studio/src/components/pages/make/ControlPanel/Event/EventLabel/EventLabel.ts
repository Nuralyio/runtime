import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("parameter-event-label")
export class ParameterEventLabel extends LitElement {
  @property()
  eventName: string;
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  render() {
    return html`${this.eventName}`;
  }
}
