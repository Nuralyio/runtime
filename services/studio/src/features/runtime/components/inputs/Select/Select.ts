import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/select";
import "@nuralyui/dropdown";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ViewMode } from "@shared/redux/store/environment.ts";
import { executeCodeWithClosure } from "@runtime/core/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { EMPTY_STRING } from "@shared/utils/constants.ts";
import { ref } from "lit/directives/ref.js";


@customElement("select-block")
export class SelectBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;
  mode: ViewMode;

  constructor() {
    super();
    
  }

  override async connectedCallback() {
    await super.connectedCallback();
    this.registerCallback("value", (v) => {
      this.requestUpdate();
    });
  }

  handleValueChange = (customEvent: CustomEvent) => {
    if (this.component.event.changed) {
      const optionValue = customEvent.detail.value ? customEvent.detail.value.value : EMPTY_STRING;
      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.changed`), {
        value: optionValue
      });
    }
  };

override  renderComponent() {
    const options = this.inputHandlersValue?.value?.[0] ?? [];
    const defaultSelected = this.inputHandlersValue?.value?.[1] ?? [];
    const selectStyles = this.component?.style || {};

    return html`
    <span>
      <nr-select  
            ${ref(this.inputRef)}
            style=${styleMap({...this.getStyles(), 
            "--nuraly-select-width" : this.getStyles()['--nuraly-select-width']  ?? this.getStyles().width    
          })}
                 selectionMode=${this.inputHandlersValue?.selectionMode === "multiple" ? "multiple" : nothing}
                 .options=${this.inputHandlersValue?.options || options}
                 .defaultSelected="${[this.inputHandlersValue?.defaultSelected] }"
                 .placeholder=${this.inputHandlersValue.placeholder || "Select an option"}
                 .status=${selectStyles?.state ?? nothing}
                 .size=${selectStyles?.size ?? nothing}
                 .disabled=${(this.inputHandlersValue.state == "disabled")}
                 .type=${this.inputHandlersValue.type == "inline" ? "inline" : nothing}
                 @changed=${this.handleValueChange}
      >
        <span slot="label">${this.inputHandlersValue.label ?? nothing}</span>
        <span slot="helper-text">${this.inputHandlersValue.helper ?? nothing}</span>
      </nr-select>
        </span>
    `;
  }
}