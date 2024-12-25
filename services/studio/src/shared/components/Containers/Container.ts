import { $resizing } from "$store/apps.ts";
import { type ComponentElement, type DraggingComponentInfo } from "$store/component/interface.ts";
import { $components } from "$store/component/store.ts";
import { html, nothing } from "lit";
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
  draggingComponentInfo: DraggingComponentInfo;
  @property({ type: Boolean })
  isViewMode = false;
  @state()
  dropDragPlaceholderStyle = {
    display: "none",
    height: "auto",
    width: "auto",
    minWidth: "80px",
    backgroundColor: "rgb(202 235 255)",
    zIndex: "7",
    borderRadius: "2px"
  };
  @state()
  wrapperStyle: any = {};

  @state()
  containerRef: Ref<HTMLInputElement> = createRef();
  currentEditingApplication: any;

  override async connectedCallback() {
    await super.connectedCallback();
    this.addEventListener("contextmenu", this.onContextMenu.bind(this));
    this.currentEditingApplication = getVar("global", "currentEditingApplication").value;

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
          ...this.component.style
        })}
        class=${classMap({
          container: true,
          vertical: this.component?.input?.direction === "vertical",
          "drag-over": this.dragOverSituation
        })}
      >
        ${this.component?.childrens?.length
          ? renderComponent(this.component.childrens, this.item, this.isViewMode)
          : nothing}
      </div>
    `;
  }

  render() {
    const verticalContainerStyles = this.component?.style || {};
    const verticalContainerAutoWidth = this.inputHandlersValue?.width;
    const verticalContainerAutoHeight = this.inputHandlersValue?.height;
    return html`
      ${this.isViewMode
      ? this.renderView()
      : html`
        <resize-wrapper
          .component=${{ ...this.component }}
          .selectedComponent=${{ ...this.selectedComponent }}
          .hoveredComponent=${{ ...this.hoveredComponent }}
        >
          <div
            data-component-uuid=${this.component?.uuid}
            @mouseenter="${() => {
              this.dragOverSituation = true;
              setHoveredComponentIdAction(this.component?.uuid);
            }}"
            @mouseleave="${() => {
              this.dragOverSituation = false;
              setHoveredComponentIdAction(null);
            }}"
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
              "min-width": "120px",
              ...verticalContainerStyles,
              width: verticalContainerAutoWidth ? "auto" : verticalContainerStyles.width,
              height: verticalContainerAutoHeight ? "auto" : verticalContainerStyles.height,
              "min-height": this.component?.childrenIds?.length ? "auto" : "300px"
            })}
            class=${classMap({
              container: true,
              vertical: this.component?.input?.direction === "vertical",
              "drag-over": this.dragOverSituation
            })}
            @dragenter=${(e: DragEvent) => {
              e.preventDefault();
              this.dragOverSituation = true;
              this.dropDragPlaceholderStyle.display = "block";
            }}
            @dragleave=${(e: DragEvent) => {
              e.preventDefault();
              if (!this.isRelatedTargetInsideContainer(e.relatedTarget)) {
                this.dragOverSituation = false;
                this.dropDragPlaceholderStyle.display = "none";
              }
            }}
            @dragover=${(e: DragEvent) => e.preventDefault()}
            @drop=${(e: DragEvent) => {
              e.preventDefault();
              this.dragOverSituation = false;
              moveDraggedComponentInside(
                this.component?.uuid,
                this.draggingComponentInfo.componentId
              );
              setDraggingComponentInfo(null);
            }}
            @dragend=${(e: DragEvent) => {
              e.preventDefault();
              this.dragOverSituation = false;
            }}
          >
            <component-title
              .component=${{ ...this.component }}
              .selectedComponent=${{ ...this.selectedComponent }}
            ></component-title>

            ${this.component?.childrenIds?.length
              ? renderComponent(
                this.component.childrenIds.map((id) =>
                  ({
                    ...$components.get()[this.currentEditingApplication.uuid].find((component) => component.uuid === id),
                    item: this.item
                  } as ComponentElement)
                ),
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
            <div
              style=${styleMap({
                ...this.dropDragPlaceholderStyle,
                height:
                  this.draggingComponentInfo?.blockInfo.height ??
                  this.dropDragPlaceholderStyle.height,
                width:
                  this.draggingComponentInfo?.blockInfo.width ??
                  this.dropDragPlaceholderStyle.width
              })}
              class="drop-zone"
            ></div>
          </div>
        </resize-wrapper>
      `}
    `;
  }

  private isRelatedTargetInsideContainer(relatedTarget: EventTarget | null): boolean {
    return (
      relatedTarget instanceof HTMLElement &&
      (relatedTarget.classList.contains("drag-over") ||
        relatedTarget.classList.contains("drop-zone") ||
        relatedTarget.classList.contains("empty-message"))
    );
  }
}