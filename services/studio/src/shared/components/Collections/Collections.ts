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
import { eventDispatcher } from "../../../utils/change-detection.ts";
import { executeCodeWithClosure } from "core/Kernel.ts";
import { getNestedAttribute } from "@utils/object.utils.ts";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("collection-viewer")
export class CollectionViwer extends BaseElementBlock {

  static override styles = styles;
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Boolean }) isViewMode = false;
  mode: ViewMode;
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
  @state()
  containerRef: Ref<HTMLInputElement> = createRef();

  constructor() {
    super();

    this.registerCallback("data", (data) => {
    });
    $environment.subscribe((environment: Environment) => {
      this.mode = environment.mode;
    });
  }

  override async connectedCallback() {
    await super.connectedCallback();
    eventDispatcher.on(`component-property-changed:${String(this.component.name)}`, () => {
      this.traitInputsHandlers();
    });
    if(this.component?.event?.onInit){
      executeCodeWithClosure(
        this.component,
        getNestedAttribute(this.component, `event.onInit`)
      );
    }

  }

  // todo: move this to a util class
  isPreviewMode() {
    return this.mode === ViewMode.Preview || !this.mode || this.isViewMode;
  }

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
              ...$components.get()[this.component?.application_id]?.find((component) => component.uuid === uuid),
              item
            } as ComponentElement;
          }
        ),
        JSON.parse(JSON.stringify(item)),
        this.isViewMode
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

  override renderComponent() {
    return html`
        <div
        ${ref(this.inputRef)}
        style=${styleMap({  
          ...this.getStyles(),
        })} 
        class=${classMap({
          collection_viewer: true,
          vertical: this.inputHandlersValue.direction?.value === "vertical",
        })}>
          ${(Array.isArray(this.inputHandlersValue.data) ? this.inputHandlersValue.data :

            this.component.input?.data ? [] : [
            
            {
      title: "Function 1",
          }, {
            title: "Function 2",
            
          }, {
            title: "Function 3",
          }])?.map((item: any, index) => {
      return html`${this.renderRow({ ...item, index })}`;
    })}
        </div>

    `;
  }
}
/**

    display: flex;
    flex-wrap: wrap;
    flex-direction: column;


 */