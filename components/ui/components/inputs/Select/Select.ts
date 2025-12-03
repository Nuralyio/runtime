import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { executeHandler } from '../../../../../state/runtime-context.ts';
import { getNestedAttribute } from '../../../../../utils/object.utils.ts';
import { EMPTY_STRING } from '../../../../../utils/constants.ts';
import { ref } from "lit/directives/ref.js";


@customElement("select-block")
export class SelectBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

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
      const optionValue = customEvent.detail.value ?? EMPTY_STRING;
      executeHandler(this.component, getNestedAttribute(this.component, `event.changed`), {
        value: optionValue
      });
    }
  };

override  renderComponent() {

    return html`
    <span>
      <nr-select  
            ${ref(this.inputRef)}
            style=${styleMap({...this.getStyles(), 
            "--nuraly-select-width" : this.getStyles()['--nuraly-select-width']  ?? this.getStyles().width    
          })}
                 ?multiple=${this.inputHandlersValue?.selectionMode === "multiple"}
                 ?searchable=${this.inputHandlersValue?.searchable ?? false}
                 .options=${this.inputHandlersValue?.options  ?? []}
                 .value=${this.inputHandlersValue?.value ?? EMPTY_STRING}
                 .placeholder=${this.inputHandlersValue.placeholder || "Select an option"}
                 search-placeholder=${this.inputHandlersValue?.searchPlaceholder || "Search options..."}
                 .status=${this.inputHandlersValue?.state ?? nothing}
                 .size=${this.inputHandlersValue?.size ?? nothing}
                 .disabled=${(this.inputHandlersValue.state == "disabled")}
                 .type=${this.inputHandlersValue.type == "inline" ? "inline" : nothing}
                 @nr-change=${this.handleValueChange}
      >
        <span slot="label">${this.inputHandlersValue.label ?? nothing}</span>
        <span slot="helper-text">${this.inputHandlersValue.helper ?? nothing}</span>
      </nr-select>
        </span>
    `;
  }
}