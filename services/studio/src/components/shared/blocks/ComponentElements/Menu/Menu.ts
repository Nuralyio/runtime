import type { ComponentElement } from '$store/component/interface';
import { $context } from '$store/context/store';
import { executeHandler  } from 'core/helper';
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { generateRandomId } from 'utils/randomness';
import '@hybridui/menu/templates/hy-sub-menu.js'
import '@hybridui/menu/templates/hy-menu-link.js'

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
            children: []
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
        const eventId = generateRandomId();
        executeHandler(
            {
                eventId,
                component: this.component,
                type: "options",
                extras: {}
            }
        );

        const handler = ({ detail: { data } }) => {
            document.removeEventListener(eventId, handler as any);
            if (data.error) {
                this.error = data.error;
                console.error(data.error)
            } else {
                const processOptions = (options) => {
                    return options.map((option) => {
                        option.handler = ({
                            id,
                            text
                        }) => {
                            executeHandler(
                                {
                                    eventId: generateRandomId(),
                                    component: this.component,
                                    type: "onSelect",
                                    extras: {
                                        EventData: {
                                            id,
                                            text
                                        }
                                    }
                                }
                            );
                        }
                        if (option.children) {
                            option.children = processOptions(option.children);
                        }
                        return option;
                    });
                }

                if (Array.isArray(data.result)) {
                    this.options = processOptions(data.result);
                } else {
                    console.log("Options should be an array")
                }
            }

        };
        document.addEventListener(eventId, handler as any);
    }
    override connectedCallback() {
        super.connectedCallback();
        this.generateOptions();
        $context.subscribe(() => {
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
                    @change="${(e: CustomEvent) => {
                const selectedOptionPath = e.detail.path;
                const option = selectedOptionPath.reduce((acc, curr) => acc && acc.children && acc.children[curr], { children: this.options });
                executeHandler(
                    {
                        eventId: generateRandomId(),
                        component: this.component,
                        type: "onSelect",
                        extras: {
                            EventData: {
                                id: option.id,
                                text: option.text
                            }
                        }
                    })
            }}" >
                </hy-menu>
            </div>
                `;
    }
}