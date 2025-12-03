import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@nuralyui/dropdown";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";
import { $components } from '../../../../../redux/store/component/store.ts';
import { renderComponent } from '../../../../../utils/render-util.ts';

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

    override renderComponent() {
        const options = this.inputHandlersValue?.value?.[0] ?? [];
        const dropdownStyles = this.component?.style || {};
        const size = (dropdownStyles.size as 'small' | 'medium' | 'large') || 'medium';
        const placement = (dropdownStyles.placement as 'bottom' | 'top' | 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'auto') || 'bottom';
        const trigger = (dropdownStyles.trigger as 'click' | 'hover' | 'focus' | 'manual') || 'click';
        const animation = (dropdownStyles.animation as 'none' | 'fade' | 'slide' | 'scale') || 'fade';

        return html`
      <nr-dropdown  
        .open=${this.inputHandlersValue.show || false}
        ${ref(this.inputRef)}
        style=${styleMap({
          ...this.getStyles(),
        })} 
        .trigger=${trigger}
        .placement=${placement}
        .size=${size}
        .animation=${animation}
        .disabled=${this.inputHandlersValue?.state == "disabled"}
        .items=${this.inputHandlersValue.options || options}
        .arrow=${dropdownStyles.arrow === 'true' || this.inputHandlersValue.arrow || false}
        .autoClose=${dropdownStyles.autoClose !== 'false' && this.inputHandlersValue.autoClose !== false}
        .closeOnOutsideClick=${dropdownStyles.closeOnOutsideClick !== 'false' && this.inputHandlersValue.closeOnOutsideClick !== false}
        .closeOnEscape=${dropdownStyles.closeOnEscape !== 'false' && this.inputHandlersValue.closeOnEscape !== false}
        .offset=${this.inputHandlersValue.offset || 4}
        .delay=${this.inputHandlersValue.delay || 50}
        .maxHeight=${this.inputHandlersValue.maxHeight || '300px'}
        .minWidth=${this.inputHandlersValue.minWidth || 'auto'}
        .cascadeDirection=${this.inputHandlersValue.cascadeDirection || 'auto'}
        .cascadeDelay=${this.inputHandlersValue.cascadeDelay || 50}
        .cascadeOnHover=${this.inputHandlersValue.cascadeOnHover !== false}
        @nr-dropdown-item-click=${(e: CustomEvent) => {
          // e.detail contains { item, dropdown }
          // item has properties: { label, value, additionalData, icon, etc. }
          const item = e.detail.item;
          
          this.executeEvent('onItemClick', e, { 
            value: item.value,
            item: item,
            additionalData: item.additionalData
          });
        }}
        @nr-dropdown-open=${(e: CustomEvent) => {
          this.executeEvent('onOpen', e);
        }}
        @nr-dropdown-close=${(e: CustomEvent) => {
          this.executeEvent('onClose', e);
        }}
      >
        <span slot="trigger">
          ${this.childrenComponents.length
            ? renderComponent(this.childrenComponents.map((component) => ({ ...component, item: this.item })), this.item, this.isViewMode)
            : html`
                <nr-label
                  style=${styleMap({
                    "--resolved-text-label-color": this.getStyles()["title-color"],
                  })}
                >${this.inputHandlersValue?.label ?? this.inputHandlersValue?.placeholder ?? nothing}</nr-label>
                  
                <drag-wrapper
                  .where=${"inside"}
                  .message=${"Drop inside"}
                  .component=${{ ...this.component }}
                  .inputRef=${this.inputRef}
                  .isDragInitiator=${this.isDragInitiator}
                >
                </drag-wrapper>
              `}
        </span>
      </nr-dropdown>
    `;
    }
}
