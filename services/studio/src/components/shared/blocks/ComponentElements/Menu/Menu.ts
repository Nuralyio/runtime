import type { ComponentElement } from '$store/component/interface';
import { $AllcomponentWithChildrens, $applicationComponents, $componentWithChildrens } from '$store/component/sotre';
import { $context, setVar } from '$store/context/store';
import { executeHandler, executeValueHandler } from 'core/helper';
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { renderComponent } from 'utils/render-util';
import '@hybridui/menu/templates/hy-menu-link.js'
import '@hybridui/menu/templates/hy-sub-menu.js'
import type { ServiceWorkerMessage } from 'core/interfaces/core.interfaces';
import { setCurrentPageAction } from '$store/page/action';

@customElement('menu-block')
export class MenuBlock extends LitElement {


    @property({ type: Object, reflect: false })
    component: ComponentElement;
    @state()
    error: string = "";
    @state()
    options = [
        {
            text: "Pages",
            id: "pages",
            children: [
                {
                    text: "Page 1",
                    id: "page1",
                    handler: () => {
                        console.log("Page 1");
                    }
                },
                {
                    text: "Page 2",
                    id: "page2",
                    handler: () => {
                        console.log("Page 2");
                    }
                }
            ]
        }
    ];

    @state()
    components: ComponentElement[] = [];


    constructor() {
        super();
    }
    static override styles = [
        css`
        hy-menu{
            --hybrid-menu-width: 100%;

        }
            :host {
                display: block;
            }
            .error {
                color: red;
                background-color: black;
                font-size: smaller;
            }
        `
    ];

    generateOptions() {
        this.error = "";
        const messageChannel = executeHandler(this.component, "options");
        messageChannel.onmessage = (event) => {
            if (event.data.error) {
                this.error = event.data.error;
                console.error(event.data.error)
            } else {
                const  processOptions = (options) =>{
                    return options.map((option) => {
                        option.handler = ({
                            id,
                            text
                        }) => {
                            executeHandler(this.component, option.handlerKey, {
                                EventData: {
                                    id,
                                    text
                                }
                            });
                        }
                        if (option.children) {
                            option.children = processOptions(option.children);
                        }
                        return option;
                    });
                }

                if (Array.isArray(event.data.result)) {
                    this.options = processOptions(event.data.result);
                } else {
                    console.log("Options should be an array")
                }
            }

        };

    }
    override connectedCallback() {
        super.connectedCallback();
        this.generateOptions();
        $context.subscribe((context) => {
            if (this.component) {
                this.generateOptions();
            }
        })
    }
    override updated(changedProperties: Map<string | number | symbol, unknown>) {
        super.updated(changedProperties);
        if (changedProperties.has('component')) {
            this.generateOptions();
        }
    }
    override render() {
        return html`
            <div>
                ${this.error ? html`<pre class="error">${this.error}</pre>` : nothing}
                <hy-menu
                    placeholder="Select an option"
                    .items=${this.options}
                    @change="${(e:CustomEvent) => {
                        const selectedOptionPath = e.detail.path;
                        const option = selectedOptionPath.reduce((acc,curr)=>acc && acc.children && acc.children[curr],{children:this.options});
                        const messageChannel = executeHandler(this.component, "onSelect",{EventData:{page:{id: option.id, type : option.type}}});
                        messageChannel.onmessage = (event)=>{
                        const { funtionNameToExecute, eventData, component } = event.data as ServiceWorkerMessage;
                    
                        if (funtionNameToExecute === 'SetVar') {
                            const key = Object.keys(eventData)[0];
                            const value = Object.values(eventData)[0];
                            setVar("global", key, value);
                        }
                    
                                            
                    }
                    }}" >
                </hy-menu>
            </div>
                `;
    }
}