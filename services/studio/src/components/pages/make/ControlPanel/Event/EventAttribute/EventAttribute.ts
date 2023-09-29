import { ComponentElement } from "$store/component/interface";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../EventLabel/EventLabel";
import "../EventValue/EventValue";
import styles from "./EventAttribute.style";
@customElement("parameter-event")
export class ParameterEvent extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  @property()
  eventName: string;
  static styles = styles;

  render() {
    return html` <div class="container">
      <parameter-event-label
        class="first_column"
        .eventName=${this.eventName}
      ></parameter-event-label>
      <parameter-event-handler
        .component=${this.component}
        .eventName=${this.eventName}
      ></parameter-event-handler>
    </div>`;
  }
}
