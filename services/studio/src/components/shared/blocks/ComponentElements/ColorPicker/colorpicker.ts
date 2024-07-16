import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/color-picker";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { executeValueHandler } from "core/helper";
import { $context } from "$store/context/store";


@customElement("color-picker-block")
export class ColorPickerBlock extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  static styles = [
    css`
      :host {
      }
    `,
  ];

  @state()
  thisvalue: any;

  updateValue() {
    executeValueHandler(this.component)
      .onmessage = (event) => {
        if (event.data.result) {
          this.thisvalue = event.data.result;
        }
      }

  }
  override connectedCallback() {
    super.connectedCallback();
    this.updateValue();
    $context.subscribe((context) => {
      if (this.component) {
        this.updateValue();
      }
    }
    )
  }
  handleValueChange = (e) => {
    if (this.component.event.valueChange) {
      executeEventHandler(this.component, "event", "valueChange", {
        EventData: {
          value: e.detail.value,
        },
      });
    }
  }

  render() {
    return html`
      <span style=${styleMap({ ...this.component.style })}> 
        <hy-color-picker 
          @color-changed=${this.handleValueChange}
          .color=${this.thisvalue ?? this.item.value ?? ""}
          placeholder="Text input"
        ></hy-color-picker>
      </span>
    `;
  }
}