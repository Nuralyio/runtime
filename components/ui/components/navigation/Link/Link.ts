import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { ref } from "lit/directives/ref.js";
import { $components } from '../../../../../redux/store/component/store.ts';
import { renderComponent } from '../../../../../utils/render-util';


@customElement("link-block")
export class LinkBlock extends BaseElementBlock {
    @property({ type: Object })
    component: ComponentElement;

    @state() childrenComponents: ComponentElement[] = [];


    constructor() {
        super();
    }

    override async connectedCallback() {
        await super.connectedCallback();
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
        const url = this.inputHandlersValue?.url ?? '#';
        const target = this.inputHandlersValue?.target ?? '_self';
        const label = this.inputHandlersValue?.label ?? this.inputHandlersValue?.placeholder ?? '';

        return html`
      <a
            ${ref(this.inputRef)}
            href=${this.isViewMode ? url : nothing}
            target=${target}
            style=${styleMap({
                ...this.getStyles(),
            })}
            @click=${(e: MouseEvent) => {
                if (!this.isViewMode) {
                    e.preventDefault();
                }
                this.executeEvent("onClick", e, { url, target });
            }}
            @mouseenter=${(e: MouseEvent) => {
                this.executeEvent("onMouseEnter", e);
            }}
            @mouseleave=${(e: MouseEvent) => {
                this.executeEvent("onMouseLeave", e);
            }}
            >
       <span>
        ${this.childrenComponents.length
                ? renderComponent(this.childrenComponents.map((component) => ({ ...component, item: this.item })), this.item, this.isViewMode)
                : html`
                     <nr-label
                style=${styleMap({
                    "--resolved-text-label-color": this.getStyles()["title-color"],
                })}
                >${label}</nr-label>

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
      </a>
    `;
    }
}
