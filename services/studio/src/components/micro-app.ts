import { $applicationComponents, $components, } from '$store/component/component-sotre';
import { LitElement, html, css, } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { renderComponent } from 'utils/render-util';
import "../components/shared/blocks/components/TextLabel/TextLabel"
import "../components/shared/blocks/components/Containers/Container"
import { $context } from '$store/context';
import { $pages } from '$store/page';
import { eventDispatcher } from 'utils/change-detection';
import { $environment, ViewMode } from '$store/environment';
import { debounceTime } from 'rxjs/operators';
import { Observable , merge} from 'rxjs';

@customElement('micro-app')
export class MicroApp extends LitElement {

    @property({ type: String, reflect: true })
    uuid: string;
    @property({ type: String, reflect: false })
    componentToRenderUUID: string;

    static override styles = [
        css``
    ];

    @property({ type: Object, reflect: false })
    mode : ViewMode= ViewMode.Preview;

    @state()
    components: any[] = [];
    constructor() {
        super();
    }

    refreshComponent(): void {
        const components = $applicationComponents(this.uuid).get();
        this.components = [...components];
    }

    override connectedCallback() {
        super.connectedCallback();

        // Create Observables for each store listener
        const pages$ = new Observable((subscriber) => {
            const unsubscribe = $pages.subscribe(() => {
                subscriber.next();
            });
            return () => unsubscribe();
        });

        const components$ = new Observable((subscriber) => {
            const unsubscribe = $components.subscribe(() => {
                subscriber.next();
            });
            return () => unsubscribe();
        });

        const context$ = new Observable((subscriber) => {
            const unsubscribe = $context.subscribe(() => {
                subscriber.next();
            });
            return () => unsubscribe();
        });

        const applicationComponents$ = new Observable((subscriber) => {
            const unsubscribe = $applicationComponents(this.uuid).subscribe(() => {
                subscriber.next();
            });
            return () => unsubscribe();
        });

        const envirement$ = new Observable((subscriber) => {
            const unsubscribe = $environment.subscribe(() => {
                subscriber.next();
            });
            return () => unsubscribe();
        });

        const eventDispatcher$ = new Observable((subscriber) => {
            eventDispatcher.on("component:refresh", () => {
                subscriber.next();
            });
        });

        merge(pages$, components$, context$, applicationComponents$, eventDispatcher$, envirement$)
            .pipe(debounceTime(10))
            .subscribe(() => {
                this.refreshComponent();
            });
    }

    isPreviewMode() {
        return this.mode === ViewMode.Preview;
    }

    override render() {
        return html`
            ${this.uuid && this.components.length ? html`
                ${this.componentToRenderUUID ?
                        renderComponent([...this.components.filter((component: any) => component.uuid === this.componentToRenderUUID)], null, this.isPreviewMode())
                        :
                        renderComponent(this.components, null, this.isPreviewMode())
                }
            ` : ""
            }
        `;
    }
}
