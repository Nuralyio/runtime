import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@nuralyui/color-picker";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { executeCodeWithClosure } from "../../../core/executer.ts";
import { getNestedAttribute } from "@utils/object.utils.ts";
import { debounce } from "@utils/time.ts";
import { EMPTY_STRING } from "@utils/constants.ts";

@customElement("color-picker-block")
export class ColorPickerBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  static styles = [
    css`:host {
        width: fit-content
    }`
  ];

  constructor() {
    super();
    this.registerCallback("value", this.handleValueChange);
  }

  handleValueChange = debounce((event: { detail: { value: any; }; }) => {
    if (this.component.event.valueChange) {
      event?.detail?.value && executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.valueChange`), {
        value: event.detail?.value ?? ""
      });
    }
  });

  render() {
    return html`
      <span style=${styleMap({ ...this.component.style })}> 
        <hy-color-picker
          @color-changed=${this.handleValueChange}
          .color=${this.inputHandlersValue.value ?? EMPTY_STRING}
          .disabled=${(this.inputHandlersValue?.state == "disabled")}
          placeholder="Text input"
        ></hy-color-picker>
      </span>
    `;
  }
}