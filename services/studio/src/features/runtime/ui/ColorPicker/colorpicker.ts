import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { executeCodeWithClosure } from "@runtime/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { debounce } from "@shared/utils/time.ts";
import { EMPTY_STRING } from "@shared/utils/constants.ts";

let HyColorPicker: any;
const loadHyColorPicker = async () => {
  if (!HyColorPicker) {
    const module = await import("@nuralyui/color-picker");
    HyColorPicker = module.default || module;
  }
};

@customElement("color-picker-block")
export class ColorPickerBlock extends BaseElementBlock {
  static styles = [
    css`
      :host {
        width: fit-content;
      }
    `,
  ];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  handleValueChange = debounce((event: { detail: { value: any } }) => {
    if (this.component.event.valueChange) {
      event?.detail?.value &&
        executeCodeWithClosure(
          this.component,
          getNestedAttribute(this.component, `event.valueChange`),
          {
            value: event.detail?.value ?? "",
          }
        );
    }
  },0);

  constructor() {
    super();
    this.registerCallback("value", this.handleValueChange);
  }


  render() {
    return html`
      <hy-color-picker
        style=${styleMap({
          width: "28px",
          height: "28px",
          ...this.component.style,
        })}
        @color-changed=${this.handleValueChange}
        .color=${this.inputHandlersValue.value ?? EMPTY_STRING}
        .disabled=${this.inputHandlersValue?.state == "disabled"}
        placeholder="Text input"
      ></hy-color-picker>
    `;
  }
}