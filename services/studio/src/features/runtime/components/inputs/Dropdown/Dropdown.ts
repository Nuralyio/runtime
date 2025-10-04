import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@nuralyui/dropdown";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { executeCodeWithClosure } from "@runtime/core/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { EMPTY_STRING } from "@shared/utils/constants.ts";
import { ref } from "lit/directives/ref.js";
import { $components } from "@shared/redux/store/component/store.ts";
import { renderComponent } from "@shared/utils/render-util.ts";
import { setCurrentComponentIdAction } from "@shared/redux/actions/component/setCurrentComponentIdAction.ts";


@customElement("dropdown-block")
export class DropdownBlock extends BaseElementBlock {
    @property({ type: Object })
    component: ComponentElement;

    @state() childrenComponents: ComponentElement[] = [];

    @state()
    options: any[] = [
        { label: 'Copy', value: 'Copy', icon: 'copy' },
        { label: 'Paste', value: 'Paste', icon: 'paste' },
        { label: 'Delete', value: 'Delete', icon: 'trash' },
        { label: 'Export', value: 'value12' },
        { label: 'Import', value: 'value12' },
    ];
    show = false;

    constructor() {
        super();

    }

    override async connectedCallback() {
        await super.connectedCallback();
        this.registerCallback("value", (v) => {
            this.requestUpdate();
        });
    }

    private updateChildrenComponents(): void {
        this.childrenComponents = this.component?.childrenIds
            ?.map((id) => {
                return $components.get()[this.component?.application_id]?.find(
                    (component) => component.uuid === id
                );
            })
            .filter(Boolean) ?? [];
    }

    override updated(changedProperties: Map<string, any>) {
        if (changedProperties.has("component")) {
            this.updateChildrenComponents();
        }
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
      <hy-dropdown  
      .show=${this.inputHandlersValue.show}
            ${ref(this.inputRef)}
            style=${styleMap({
            ...this.getStyles(),
        })} 
        
        trigger="click"
          .options=${this.inputHandlersValue.options || options}
          @click-item=${(e: CustomEvent) => {

                executeCodeWithClosure(this.component,
                    /* js */ `
                    try {
                        Vars.currentValue = "${e.detail.value}"
                    } catch (error) {
                        console.log(error);
                    }
                    `, {});
                if (this.component.event?.onItemClicked) {
                    executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onItemClicked`), {
                        value: e.detail.value
                    });
                }
            }}
            >
       <span>
        ${this.childrenComponents.length
                ? renderComponent(this.childrenComponents.map((component) => ({ ...component, item: this.item })), this.item, this.isViewMode)
                : html`
                     <hy-label
                style=${styleMap({
                    "--resolved-text-label-color": this.getStyles()["title-color"],
                })}
                >${this.inputHandlersValue?.label ?? this.inputHandlersValue?.placeholder ??  nothing}</hy-label>
                  
                <drag-wrapper
                        .where=${"inside"}
                        .message=${"Drop inside"}
                        .component=${{ ...this.component }}
                        .inputRef=${this.inputRef}
                        .isDragInitiator=${this.isDragInitiator}
                      >
                      </drag-wrapper>
                <!-- <div
                      class="empty-message"
                      @click="${() => setCurrentComponentIdAction(this.component?.uuid)}"
                    >
                      Add or Drag an item into this container
                      <drag-wrapper
                        .where=${"inside"}
                        .message=${"Drop inside"}
                        .component=${{ ...this.component }}
                        .inputRef=${this.inputRef}
                        .isDragInitiator=${this.isDragInitiator}
                      >
                      </drag-wrapper>
                    </div> -->
                  `}
       </span>
      </hy-dropdown>
    `;
    }
}
//.always=${this.show}
