import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./Collections.style.ts";
import type { ComponentElement, DraggingComponentInfo } from "@shared/redux/store/component/interface.ts";
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import { renderComponent } from "@utils/render-util.ts";
import { $components } from "@shared/redux/store/component/store.ts";
import { $resizing } from "@shared/redux/store/apps.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { ViewMode } from "@shared/redux/store/environment.ts";
import { setCurrentComponentIdAction } from "@shared/redux/actions/component/setCurrentComponentIdAction.ts";
import { setContextMenuEvent } from "@shared/redux/actions/page/setContextMenuEvent.ts";
import { executeCodeWithClosure } from "@runtime/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("collection-viewer")
export class CollectionViewer extends BaseElementBlock {
  static override styles = styles;

  @property({ type: Object }) component: ComponentElement;
  @property({ type: Boolean }) isViewMode = false;
  @property({ type: String }) mode: ViewMode;

  @state() hoveredComponent: Readonly<ComponentElement>;
  @state() currentEditingApplication: any;
  @state() draggingComponentInfo: DraggingComponentInfo;
  @state() dropDragPalceHolderStyle = {
    display: "none",
    height: "auto",
    width: "auto",
    minWidth: "80px",
    backgroundColor: "rgb(202 235 255)",
    zIndex: "7",
    borderRadius: "2px"
  };
  @state() childrenComponents: ComponentElement[] = [];

  selectedComponent: Readonly<ComponentElement>;
  containerRef: Ref<HTMLInputElement> = createRef();

  override async connectedCallback() {
    await super.connectedCallback();
    this.updateChildrenComponents();
    if (this.component?.event?.onInit) {
      executeCodeWithClosure(
        this.component,
        getNestedAttribute(this.component, "event.onInit")
      );
    }
  }

  override updated(changedProperties: Map<string, any>) {
    if (changedProperties.has("component")) {
      this.updateChildrenComponents();
    }
  }

  private updateChildrenComponents(): void {
    const applicationComponents = $components.get()[this.component?.application_id];
    if (!applicationComponents || !this.component?.childrenIds?.length) {
      this.childrenComponents = [];
      return;
    }

    this.childrenComponents = this.component.childrenIds
      .map(id => applicationComponents.find(component => component.uuid === id))
      .filter(Boolean);
  }

  private handleCollectionClick(e: MouseEvent) {
    setContextMenuEvent(null);
    if ($resizing.get()) return;
    
    setCurrentComponentIdAction(this.component?.uuid);
    e.preventDefault();
    e.stopPropagation();
  }

  private renderRow(item: any) {
    return html`
      <div class="collection" ${ref(this.containerRef)}
           @click="${(e: MouseEvent) => this.handleCollectionClick(e)}">
        ${this.childrenComponents.length
          ? html`${renderComponent(
              this.childrenComponents.map(component => ({ ...component, item })),
              item,
              this.isViewMode
            )}`
          : html`<div class="empty-message">Add or Drag an item into this collection</div>`
        }
      </div>`;
  }

  private getData() {
    if (Array.isArray(this.inputHandlersValue.data)) {
      return this.inputHandlersValue.data;
    }
    
    return this.component.input?.data ? [] : [
      { title: "Function 1" },
      { title: "Function 2" },
      { title: "Function 3" }
    ];
  }

  override renderComponent() {
    const isVertical = this.inputHandlersValue.direction?.value === "vertical";
    const data = this.getData();

    return html`
      <div
        ${ref(this.inputRef)}
        style=${styleMap(this.getStyles())}
        class=${classMap({
          collection_viewer: true,
          vertical: isVertical
        })}
      >
        ${data.map((item, index) => this.renderRow({ ...item, index }))}
      </div>
    `;
  }
}