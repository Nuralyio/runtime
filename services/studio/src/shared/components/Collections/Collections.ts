import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./Collections.style.ts";
import type { ComponentElement, DraggingComponentInfo } from "$store/component/interface.ts";
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import { renderComponent } from "../../../utils/render-util.ts";
import { $components } from "$store/component/store.ts";
import { $resizing } from "$store/apps.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { getVar } from "$store/context.ts";
import { $environment, type Environment, ViewMode } from "$store/environment.ts";
import { setCurrentComponentIdAction } from "$store/actions/component/setCurrentComponentIdAction.ts";
import { setContextMenuEvent } from "$store/actions/page/setContextMenuEvent.ts";

@customElement("collection-viewer")
export class CollectionViwer extends BaseElementBlock {

  constructor() {
    super();

    this.registerCallback("data", (data) => {
      console.log(data);
    });
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });
  }

  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Boolean }) isViewMode = false;
  mode: ViewMode;

  static override styles = styles;
  @state()
  hoveredComponent: Readonly<ComponentElement>;
  @state()
  currentEditingApplication: any;
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
    borderRadius: " 2px"
  };
  selectedComponent: Readonly<ComponentElement>;


  @state()
  components: ComponentElement[];


  override async connectedCallback() {
    await super.connectedCallback();
    this.currentEditingApplication = getVar("global", "currentEditingApplication").value;

  }
  // todo: move this to a util class
  isPreviewMode() {
    return this.mode === ViewMode.Preview || !this.mode || this.isViewMode;
  }

  @state()
  containerRef: Ref<HTMLInputElement> = createRef();

  renderRow(item: any) {
    return html`

      <div class="collection" ${ref(this.containerRef)}
           @click="${(e: any) => {
             setContextMenuEvent(null);
             if (!$resizing.get()) {
               setCurrentComponentIdAction(this.component?.uuid);
               e.preventDefault();
               e.stopPropagation();
               if (e.target.classList.contains("collection")) {
                 setCurrentComponentIdAction(this.component?.uuid);
                 e.preventDefault();
                 e.stopPropagation();
               }
             }
           }}"

      >
        ${this.component?.childrenIds?.length
          ? html`
            ${renderComponent(
              this.component.childrenIds?.map(
                (uuid) => {
                  return {
                    ...$components.get()[this.currentEditingApplication.uuid].find((component) => component.uuid === uuid),
                    item
                  } as ComponentElement;
                }
              ),
              JSON.parse(JSON.stringify(item)),
              false
            )}
          `
          : html`
            <div

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
        <div class="collection_viewer">
          ${(Array.isArray(this.inputHandlersValue.data) ? this.inputHandlersValue.data : [{}, {}, {}])?.map((item: any, index) => {
            return html`${this.renderRow({ ...item, index })}`;
          })}
        </div>

      </resize-wrapper>
    `;
  }
}
