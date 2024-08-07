import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/color-picker";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { $context } from "$store/context";
import { BaseElementBlock } from "../BaseElement";


@customElement("color-picker-block")
export class ColorPickerBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  static styles = [
    css``,
  ];

  @state()
  thisvalue: any;

  constructor() {
    super();
    this.registerCallback("value", this.handleValueChange);
  }

  handleValueChange = (e) => {
    if (this.component.event.valueChange) {
      executeEventHandler(this.component, "event", "valueChange", {
        EventData: {
          value: e.detail?.value ?? "",
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