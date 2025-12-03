import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../EventLabel/EventLabel.ts";
import "../EventValue/EventValue.ts";
import styles from "./EventAttribute.style.ts";

@customElement("parameter-event")
export class ParameterEvent extends LitElement {
  static styles = styles;
  @property({ type: Object })
  component: ComponentElement;
  @property()
  eventName: string;

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
