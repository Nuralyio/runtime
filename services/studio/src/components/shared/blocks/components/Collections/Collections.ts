import { LitElement, html, css, type PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from './Collections.style';
import type { ComponentElement, DraggingComponentInfo } from '$store/component/interface';
import { type Ref, createRef, ref } from "lit/directives/ref.js";
import { renderComponent } from 'utils/render-util';
import { $componentWithChildrens, $components, $draggingComponentInfo, $hoveredComponent, $selectedComponent } from '$store/component/component-sotre';
import { setCurrentComponentIdAction } from '$store/actions/component';
import { setContextMenuEvent } from '$store/actions/page';
import { $resizing } from '$store/apps';

@customElement('colletion-viwer')   
export class CollectionViwer extends LitElement {


    @property()
    component: ComponentElement;

    @state()
    data: any;
    
    static override styles = styles;
    @state()
    hoveredComponent: Readonly<ComponentElement>;

    @state()
    draggingComponentInfo: DraggingComponentInfo;

    @state()
    dropDragPalceHolderStyle = {
        display: "none",
        height: "auto",
        width: "auto",
        minWidth: "80px",
        backgroundColor: "rgb(202 235 255)",
        zIndex: "7",
        borderRadius: " 2px",
    };
    selectedComponent: Readonly<ComponentElement>;



    @state()
    components: ComponentElement[];

    @state()
    thisvalue = "";


    constructor() {
        super();
        $componentWithChildrens.subscribe((components: ComponentElement[]) => {
            this.components = components;
        });

        $hoveredComponent.subscribe((hoveredComponent) => {
            this.hoveredComponent = hoveredComponent;
        });
        $draggingComponentInfo.subscribe(
            (draggingComponentInfo: DraggingComponentInfo) => {
                if (draggingComponentInfo) {
                    this.draggingComponentInfo = draggingComponentInfo;
                    this.dropDragPalceHolderStyle = {
                        ...this.dropDragPalceHolderStyle,
                    };
                } else {
                    this.draggingComponentInfo = null;
                    this.dropDragPalceHolderStyle = {
                        ...this.dropDragPalceHolderStyle,
                        display: "none",
                    };
                }
            }
        );
        $selectedComponent.subscribe((selectedComponent) => {
            this.selectedComponent = selectedComponent;
        });
    }
    protected firstUpdated(): void {
        
    }
    @state()
    containerRef: Ref<HTMLInputElement> = createRef();


    onContextMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        e.ComponentTop = this.containerRef.value?.getBoundingClientRect().top;
        e.ComponentLeft = this.containerRef.value?.getBoundingClientRect().left;
        setContextMenuEvent(e);
    }
    override connectedCallback(): void {
        super.connectedCallback();
        this.addEventListener('contextmenu', (e) => this.onContextMenu(e));
    }
    override updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
        super.updated(changedProperties);

        if (changedProperties.has('component')) {
            if (!this.data || !Array.isArray(this.data)) {
                this.data = [{}, {}, {}]
            }
            this.updateValue()
        }
    }

    updateValue() {
        let messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = function (event) {
            if (Array.isArray(event.data.result)) {
                this.data = event.data.result;
            }
        }.bind(this)
        const command = "executeValue";
        navigator.serviceWorker.controller.postMessage(
            {
                command,
                value: this.component?.inputHandlers.data,
                components: this.components,
                component: this.component,
            },
            [messageChannel.port2]
        );
    }

   


    renderRow(item: any) {
        this.component.Item = item;
        return html`

         <div class="collection"   ${ref(this.containerRef)}
 @click="${(e: any) => {
                setContextMenuEvent(null);
                if (!$resizing.get()) {
                    setCurrentComponentIdAction(this.component?.uuid);
                    e.preventDefault();
                    e.stopPropagation()
                    if (e.target.classList.contains("collection")) {
                        setCurrentComponentIdAction(this.component?.uuid);
                        e.preventDefault();
                        e.stopPropagation()
                    }
                }

            }}"

         >
        ${this.component?.childrenIds?.length
                ? html`
${renderComponent(
                    this.component.childrenIds?.map(
                        (uuid) => {
                            return { ...$components.get().find((component) => component.uuid === uuid), item } as ComponentElement
                        }
                    ),
                    JSON.parse(JSON.stringify(item)),
                    true
                )}
                `
                : html`<div
    
              class="empty-message"
              @click="${(e: any) => {
                        // setCurrentComponentIdAction(this.component?.uuid);
                    }}"
            >
            Add or Drag an item into this collection
            </div>`}
        </div>`;
    }

    override render() {
        return html`
<resize-wrapper
      .component=${{ ...this.component }}
      .selectedComponent=${{ ...this.selectedComponent }}
      .hoveredComponent=${{ ...this.hoveredComponent }}
    >
<component-title
          @dragInit=${() => {
            }}
          .component=${{ ...this.component }}
          .selectedComponent=${{ ...this.selectedComponent }}
        ></component-title>

        ${(this.data || this.component.data)?.map((item: any, index) => {
                return html`${this.renderRow({...item,index})}`

            })}

        </resize-wrapper>`;
    }
}
