import { $resizing } from "$store/apps";
import {
  moveDraggedComponentInside,
  setCurrentComponentIdAction,
  setDraggingComponentInfo,
  setHoveredComponentIdAction,
} from "$store/component/action";
import {
  type ComponentElement,
  type DraggingComponentInfo,
} from "$store/component/interface";
import {
  $components,
  $draggingComponentInfo,
  $hoveredComponent,
  $selectedComponent,
} from "$store/component/component-sotre";
import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { renderComponent } from "utils/render-util";
import { type Ref, createRef, ref } from "lit/directives/ref.js";
import styles from "./Container.style";
import { setContextMenuEvent } from "$store/page/action";

@customElement("vertical-container-block")
export class VerticalContainer extends LitElement {
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
    borderRadius: "2px",
  };

  static styles = styles;

  @state()
  wrapperStyle: any = {};

  @state()
  containerRef: Ref<HTMLInputElement> = createRef();

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("contextmenu", this.onContextMenu.bind(this));
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
        style=${styleMap({
      ...this.component.style,
      "min-height": this.component?.childrenIds?.length ? "auto" : "300px",
    })}
        class=${classMap({
      container: true,
      vertical: this.component?.input?.direction === "vertical",
      "drag-over": this.dragOverSituation,
    })}
      >
        ${this.component?.childrens?.length
        ? renderComponent(this.component.childrens, this.item, this.isViewMode)
        : nothing}
      </div>
    `;
  }

  render() {
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
                draggable="true"
                @mouseenter="${() => {
            this.dragOverSituation = true;
            setHoveredComponentIdAction(this.component?.uuid);
          }}"
                @mouseleave="${() => {
            this.dragOverSituation = false;
            setHoveredComponentIdAction(null);
          }}"
                ${ref(this.containerRef)}
                class="container"
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
            ...this.component.style,
            "min-height": this.component?.childrenIds?.length ? "auto" : "300px",
          })}
                class=${classMap({
            container: true,
            vertical: this.component?.input?.direction === "vertical",
            "drag-over": this.dragOverSituation,
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
                ...$components.get().find((component) => component.uuid === id),
                item: this.item,
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
                  this.dropDragPlaceholderStyle.width,
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