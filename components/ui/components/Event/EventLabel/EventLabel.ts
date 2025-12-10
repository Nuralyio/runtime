import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("parameter-event-label")
export class ParameterEventLabel extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `
  ];
  @property()
  eventName: string;

  render() {
    return html`${this.eventName}`;
  }
}
