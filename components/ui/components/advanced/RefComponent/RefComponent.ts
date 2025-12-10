import { type ComponentElement, type DraggingComponentInfo } from '../../../../../redux/store/component/component.interface.ts';
import { $applicationComponents } from '../../../../../redux/store/component/store.ts';
import { html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { renderComponent } from '../../../../../utils/render-util';
import { createRef, type Ref } from "lit/directives/ref.js";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { setCurrentComponentIdAction } from '../../../../../redux/actions/component/setCurrentComponentIdAction.ts';
import { eventDispatcher } from '../../../../../utils/change-detection.ts';

@customElement("ref-component-container-block")
export class RefComponentContainer extends BaseElementBlock {

    @property({ type: Object })
    component: ComponentElement;

    @property({ type: Object })
    item: any;

    @state()
    dragOverSituation = false;

    @state()
    selectedComponent: ComponentElement;

    @state()
    hoveredComponent: ComponentElement;

    @property({ type: Object })
    draggingComponentInfo: DraggingComponentInfo;

    @property({ type: Boolean })
    isViewMode = false;

    @state()
    wrapperStyle: any = {};

    @state()
    containerRef: Ref<HTMLInputElement> = createRef();

    isDragging: boolean;
    @state()
    components: ComponentElement[];

    override async connectedCallback() {
        await super.connectedCallback();
    }
    constructor() {
        super();
        this.addEventListener("click" , (e)=>{
            e.preventDefault();
            e.stopPropagation();
            setCurrentComponentIdAction(this.component.uuid);
        })
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        eventDispatcher.on(`component-property-changed:${String(this.component.name)}`, () => {
           // this.traitInputsHandlers();
            this.requestUpdate();
        });

        $applicationComponents(this.component.application_id).subscribe((components: ComponentElement[]) => {
          this.components = [...components];
        }
        );
        eventDispatcher.on("component:refresh", () => {
            this.components =  $applicationComponents(this.component.application_id).get();
        }
        );
    }

    override renderComponent() {
        const componentToRender = this.components?.find(
            component => component.uuid === this.inputHandlersValue?.ref &&  this.component.uuid !== this.inputHandlersValue?.ref
        )
        return html`
        ${
            renderComponent(
                [componentToRender]
,{} , true)
        }
       
        `;
    }
}
