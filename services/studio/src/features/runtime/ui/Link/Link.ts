import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { ref } from "lit/directives/ref.js";
import { $components } from "@shared/redux/store/component/store.ts";
import { renderComponent } from "@shared/utils/render-util.ts";


@customElement("link-block")
export class DropdownBlock extends BaseElementBlock {
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


    override  renderComponent() {

        return html`
      <a  
     
            ${ref(this.inputRef)}
            style=${styleMap({
            ...this.getStyles(),
        })} 
        
          @click=${(e: CustomEvent) => {
                this.executeEvent("onClick", e)
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
                >${this.inputHandlersValue?.label ?? this.inputHandlersValue?.placeholder ?? nothing}</hy-label>
                  
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