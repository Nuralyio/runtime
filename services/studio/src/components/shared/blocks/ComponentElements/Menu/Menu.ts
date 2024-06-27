import type { ComponentElement } from '$store/component/interface';
import { $AllcomponentWithChildrens, $applicationComponents, $componentWithChildrens } from '$store/component/sotre';
import { $context } from '$store/context/store';
import { executeHandler, executeValueHandler } from 'core/helper';
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { renderComponent } from 'utils/render-util';

@customElement('menu-block')
export class MenuBlock extends LitElement {


    @property({ type: Object, reflect: false })
    component: ComponentElement;
    @state()
    error: string = "";
    @state()
    options = [
        {
            label: "Pages",
            id: "pages",
            children: [
                {
                    label: "Page 1",
                    id: "page1",
                    handler: () => {
                        console.log("Page 1");
                    }
                },
                {
                    label: "Page 2",
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
                            label
                        }) => {
                            executeHandler(this.component, option.handlerKey, {
                                EventData: {
                                    id,
                                    label
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
                    .options=${this.options}
                        @change="${(intem: any, position) => { }}" >
                </hy-menu>
            </div>
                `;
    }
}