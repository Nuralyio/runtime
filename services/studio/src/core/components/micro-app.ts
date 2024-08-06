import { $applicationComponents, $components, } from '$store/component/component-sotre';
import { LitElement, html, css, } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { renderComponent } from 'utils/render-util';
import "../../components/shared/blocks/ComponentElements/TextLabel/TextLabel"
import "../../components/shared/blocks/ComponentElements/Containers/Container"
import { $context } from '$store/context/context-store';
import { $pages } from '$store/page/page-store';
import { eventDispatcher } from 'utils/change-detection';

@customElement('micro-app')
export class MicroApp extends LitElement {

    @property({ type: String, reflect: true })
    uuid: string;
    @property({ type: String, reflect: false })
    componentToRenderUUID: string;

    static override styles = [
        css``
    ];


    @state()
    components: any[] = [];
    constructor() {
        super();

     
    }
    refreshComponent(): void {
        const components = $applicationComponents(this.uuid).get()
        this.components = [...components];
    }

    override connectedCallback() {
        super.connectedCallback();

        $pages.listen(() => this.refreshComponent());
        $components.listen(() => this.refreshComponent());
        $context.listen(() => this.refreshComponent());
        $applicationComponents(this.uuid).listen(() => this.refreshComponent());

        eventDispatcher.on("component:refresh", () => {
            this.refreshComponent()
        });
        
        setTimeout(() => {
            this.refreshComponent();
        }, 0);
    }
    override render() {
        return html`

        ${this.uuid && this.components.length ? html`
            ${this.componentToRenderUUID ?
                    renderComponent([...this.components.filter((component: any) => component.uuid === this.componentToRenderUUID)], null, true)
                    :
                    renderComponent(this.components, null, true)


                }
        
        
        `: ""
            }
        `;

    }

}