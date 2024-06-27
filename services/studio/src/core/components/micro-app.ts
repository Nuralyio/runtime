import { $applicationComponents, $currentPageComponents } from '$store/component/sotre';
import { LitElement, html, css, nothing, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { renderComponent } from 'utils/render-util';
import "../../components/shared/blocks/ComponentElements/TextLabel/TextLabel"
import "../../components/shared/blocks/ComponentElements/Containers/Container"

@customElement('micro-app')
export class MicroApp extends LitElement {

    @property({ type: String, reflect: true })
    uuid: string;
    // add page to render 
    @property({ type: String, reflect: false })
    componentToRenderUUID: string;

    static override styles = [
        css`
            :host {
                display: block;
            }
        `
    ];


    @state()
    components: any[] = [];
    constructor() {
        super();
        $applicationComponents(this.uuid).subscribe((components = []) => {
            this.components = [...components];
            this.requestUpdate();

        });
    }

    override connectedCallback() {
        super.connectedCallback();
        setTimeout(() => {
            $applicationComponents(this.uuid).subscribe((components = []) => {
                this.components = [...components];
                this.requestUpdate();
            });
        }, 0);
    }
//renderComponent(this.components, null, true)
    override render() {
        return html`

        ${this.uuid && this.components.length ? html`
            ${
                this.componentToRenderUUID ?
                renderComponent([...this.components.filter((component: any) => component.uuid === this.componentToRenderUUID)], null, true)
                :
                renderComponent(this.components, null, true)

                
            }
        
        
        `: ""
            }
        `;

    }

}