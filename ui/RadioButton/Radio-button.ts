import { customElement, property } from "lit/decorators.js";
import { BaseElementBlock } from "../BaseElement.ts";
import type { ComponentElement } from "@shared/redux/store/component/interface.ts";
import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "@nuralyui/radio";
import { executeCodeWithClosure } from "@runtime/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { EMPTY_STRING } from "@shared/utils/constants.ts";

@customElement("radio-button-block")
export class RadioButtonBlock extends BaseElementBlock {

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;
  constructor() {
    super();
    this.registerCallback("value", (value: any) => {
      this.requestUpdate();
    }
    );
  }

  handleChange = (customEvent: CustomEvent) => {
    if (this.component.event.changed) {
      const { value } = customEvent.detail;
      executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.changed`), { value });

    }
  };

  renderComponent() {
    const options = this.inputHandlersValue?.value ? this.inputHandlersValue?.value[0] : [];
    const defaultValue = this.inputHandlersValue?.value ? this.inputHandlersValue?.value[1] : EMPTY_STRING;
    const type = this.inputHandlersValue?.value ? this.inputHandlersValue?.value[2] : "default";

    return html`
    <!-- <pre>${
      JSON.stringify(options, null, 2)
    }</pre> -->
      <span style=${styleMap({ ...this.component.style })}>
            <hy-radio-input
              .type=${type}
              .options=${[...options]}
              .defaultValue="${defaultValue}"
              @change=${this.handleChange}
            ></hy-radio-input>
          </span>
    `;
  }
}

