import { $resizing } from "$store/apps.ts";
import { type ComponentElement, type DraggingComponentInfo } from "$store/component/interface.ts";
import { $components, $draggingComponentInfo } from "$store/component/store.ts";
import { html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { renderComponent } from "../../../utils/render-util.ts";
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import styles from "./Container.style.ts";
import { getVar } from "$store/context.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { setDraggingComponentInfo } from "$store/actions/component/setDraggingComponentInfo.ts";
import { moveDraggedComponentInside } from "$store/actions/component/moveDraggedComponentInside.ts";
import { setCurrentComponentIdAction } from "$store/actions/component/setCurrentComponentIdAction.ts";
import { setHoveredComponentIdAction } from "$store/actions/component/setHoveredComponentIdAction.ts";
import { setContextMenuEvent } from "$store/actions/page/setContextMenuEvent.ts";
import { moveDraggedComponent } from "$store/actions/component/moveDraggedComponent.ts";
import { eventDispatcher } from "@utils/change-detection.ts";

@customElement("vertical-container-block")
export class VerticalContainer extends BaseElementBlock {
  static styles = styles;

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @state()
  dragOverSituation = false;

  @state()
  selectedComponent: ComponentElement;

  @state()
  hoveredComponent: ComponentElement;

  @property({ type: Object })
  draggingComponentInfo: DraggingComponentInfo;

  @property({ type: Boolean })
  isViewMode = false;

  @state()
  dropDragPlaceholderStyle = {
    display: "none",
    height: "auto",
    width: "auto",
    minWidth: "80px",
    zIndex: "7",
    borderRadius: "2px",
  };

  @state()
  wrapperStyle: any = {};

  @state()
  containerRef: Ref<HTMLInputElement> = createRef();

  isDragging: boolean;

  override async connectedCallback() {
    await super.connectedCallback();
    this.addEventListener("contextmenu", this.onContextMenu.bind(this));
    $draggingComponentInfo.subscribe((draggingComponentInfo: DraggingComponentInfo) => {
      this.draggingComponentInfo = draggingComponentInfo || {};
      this.isDragging = Object.keys(this.draggingComponentInfo).length > 0;
      console.log(this.isDragging);
    });
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);
    _changedProperties.forEach((_oldValue, propName) => {
      if (propName === "draggingComponentInfo") {
        // Handle changes if needed
      }
    });
  }

  onContextMenu(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const rect = this.containerRef.value?.getBoundingClientRect();
    if (rect) {
      e["ComponentTop"] = rect.top;
      e["ComponentLeft"] = rect.left;
      setContextMenuEvent(e);
    }
  }

  renderView() {
    return html`
      <div
        data-component-uuid=${this.component?.uuid}
        style=${styleMap({
          "min-height": this.component?.childrenIds?.length ? "auto" : "300px",
          ...this.calculatedStyles,
        })}
        class=${classMap({
          container: true,
          vertical: this.inputHandlersValue.direction === "vertical",
          "drag-over": this.dragOverSituation,
        })}
      >
        ${this.component?.childrenIds?.length
          ? renderComponent(
              this.component.childrenIds.map((id) => ({
                ...$components.get()[this.component?.application_id]?.find((component) => component.uuid === id),
                item: this.item,
              })),
              this.item,
              this.isViewMode
            )
          : nothing}
      </div>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    eventDispatcher.on(`component-property-changed:${String(this.component.name)}`, (data) => {
      this.traitInputsHandlers();
      this.requestUpdate();
    });
  }

  renderDropZone() {
    return html`
      <div
        @dragenter=${(e: DragEvent) => e.preventDefault()}
        @dragover=${(e: DragEvent) => e.preventDefault()}
        @drop=${(e: DragEvent) => {
          e.preventDefault();
          console.log(this.draggingComponentInfo);
          this.dragOverSituation = false;
        }}
        @dropend=${(e: DragEvent) => {
          e.preventDefault();
          this.dragOverSituation = false;
        }}
        style=${styleMap({
          ...this.dropDragPlaceholderStyle,
          height: this.draggingComponentInfo?.blockInfo?.height ?? "100px",
          width: "100%",
        })}
        class="drop-zone"
      ></div>
    `;
  }

  render() {
    const verticalContainerStyles = this.calculatedStyles || {};
    const verticalContainerAutoWidth = this.calculatedStyles?.width;
    const verticalContainerAutoHeight = this.calculatedStyles?.height;

    if (this.isViewMode) {
      this.style.width = this.calculatedStyles?.width;
    } else {
      this.closestGenericComponentWrapper!.style.width = this.calculatedStyles?.width;
    }

    if (!this.shouldDisplay) return nothing;

    return html`
      ${this.isViewMode
        ? this.renderView()
        : html`
            <div
              data-component-uuid=${this.component?.uuid}
              ${ref(this.containerRef)}
              @click="${(e: Event) => {
                setContextMenuEvent(null);
                if (!$resizing.get()) {
                  setCurrentComponentIdAction(this.component?.uuid);
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}"
              style=${styleMap({
                ...verticalContainerStyles,
                width: this.calculatedStyles?.width,
                height: this.calculatedStyles?.height,
                "min-height": this.component?.childrenIds?.length ? "auto" : "300px",
              })}
              class=${classMap({
                container: true,
                vertical: this.inputHandlersValue.direction === "vertical",
                "drag-over": this.dragOverSituation,
              })}
              @dragenter=${(e: DragEvent) => {
                if (!this.isRelatedTargetInsideContainer(e.relatedTarget)) {
                  this.dragOverSituation = true;
                  this.dropDragPlaceholderStyle.display = "block";
                }
              }}
              @dragleave=${(e: DragEvent) => {
                if (!this.isRelatedTargetInsideContainer(e.relatedTarget)) {
                  this.dropDragPlaceholderStyle.display = "none";
                  this.dragOverSituation = false;
                }
              }}
              @dragover=${(e: DragEvent) => e.preventDefault()}
              @drop=${(e: DragEvent) => {
                e.preventDefault();
                this.dragOverSituation = false;
                this.dropDragPlaceholderStyle.display = "none";
                moveDraggedComponent(this.component?.uuid, this.draggingComponentInfo.componentId, "inside");
                setDraggingComponentInfo(null);
              }}
              @dragend=${(e: DragEvent) => {
                e.preventDefault();
                this.dragOverSituation = false;
                this.dropDragPlaceholderStyle.display = "none";
              }}
            >
              ${this.component?.childrenIds?.length
                ? renderComponent(
                    this.component.childrenIds.map((id) => ({
                      ...$components.get()[this.component?.application_id]?.find((component) => component.uuid === id),
                      item: this.item,
                    })),
                    this.item,
                    this.isViewMode
                  )
                : html`
                    <div
                      class="empty-message"
                      @click="${(e: Event) => {
                        setCurrentComponentIdAction(this.component?.uuid);
                      }}"
                    >
                      Add or Drag an item into this container
                    </div>
                  `}
              ${this.dragOverSituation ? html` ${this.renderDropZone()} ` : nothing}
            </div>
          `}
    `;
  }

  private isRelatedTargetInsideContainer(relatedTarget: EventTarget | null): boolean {
    return (
      relatedTarget instanceof HTMLElement && this.containerRef.value?.contains(relatedTarget)
    );
  }
}