import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@nuralyui/dropdown";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { $environment, ViewMode } from "$store/environment.ts";
import { executeCodeWithClosure } from "../../../core/Kernel.ts";
import { getNestedAttribute } from "@utils/object.utils.ts";
import { EMPTY_STRING } from "@utils/constants.ts";
import { ref } from "lit/directives/ref.js";


@customElement("dropdown-block")
export class SelectBlock extends BaseElementBlock {
    @property({ type: Object })
    component: ComponentElement;

    @state()
    options: any[] = [
        { label: 'Copy', value: 'Copy', icon: 'copy'  },
        { label: 'Paste', value: 'Paste', icon: 'paste'  },
        { label: 'Delete', value: 'Delete', icon: 'trash' },
        { label: 'Export', value: 'value12' },
        { label: 'Import', value: 'value12' },
    ];
    show = true;

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
      <hy-dropdown  
      .show=${this.show}
            ${ref(this.inputRef)}
            style=${styleMap({
            ...this.getStyles(),
        })} 
        
        trigger="click"
          .options=${this.options}
          @click-item=${(e: CustomEvent) =>{
             if (this.component.event?.onItemClicked) {
                executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onItemClicked`), {
                    value: e.detail.value
                });
              }
          }}
            >
       
      </hy-dropdown>
        </span>
    `;
    }
}
//.always=${this.show}
