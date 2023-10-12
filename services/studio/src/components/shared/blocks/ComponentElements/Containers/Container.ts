import { $component, $resizing } from "$store/apps";
import {
  moveDraggedComponent,
  moveDraggedComponentInside,
  setCurrentComponentIdAction,
  setDraggingComponentInfo,
  setHoveredComponentIdAction,
} from "$store/component/action";
import {
  ComponentElement,
  DraggingComponentInfo,
} from "$store/component/interface";
import {
  $components,
  $draggingComponentInfo,
  $hoveredComponent,
  $selectedComponent,
} from "$store/component/sotre";
import { LitElement, html, css, nothing, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { renderComponent } from "utils/render-util";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import styles from "./Container.style";
import { setContextMenuEvent, setResizing } from "$store/page/action";
@customElement("vertical-container-block")
export class VerticalContainer extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  dragOverSituation = false;

  @state()
  selectedComponent: ComponentElement;

  @state()
  hoveredComponent: ComponentElement;

  draggingComponentInfo: DraggingComponentInfo;
  constructor() {
    super();
    this.addEventListener('contextmenu', (e) => this.onContextMenu(e));

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
  static styles = styles;
  @state()
  wrapperStyle: any = {};
  @state()
  containerRef: Ref<HTMLInputElement> = createRef();

  onContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    //setCurrentComponentIdAction(this.component?.id);
    //this.showQuickAction = true;
    //console.log(this.inputRef.value?.getBoundingClientRect().top);
    e.ComponentTop = this.containerRef.value?.getBoundingClientRect().top;
    e.ComponentLeft = this.containerRef.value?.getBoundingClientRect().left;
    setContextMenuEvent(e);
  }

  render() {
    return html` <resize-wrapper
      .component=${{ ...this.component }}
      .selectedComponent=${{ ...this.selectedComponent }}
      .hoveredComponent=${{ ...this.hoveredComponent }}
    >
      <div
       draggable="true"
        @mouseenter="${() => {
        this.dragOverSituation = true;
        setHoveredComponentIdAction(this.component?.id);
      }}"
        @mouseleave="${() => {
        this.dragOverSituation = false;

        setHoveredComponentIdAction(null);
      }}"
      
        ${ref(this.containerRef)}
        class="container"
        @click="${(e: any) => {
          setContextMenuEvent(null);
        if (!$resizing.get()) {
          setCurrentComponentIdAction(this.component?.id);
          e.preventDefault();
          e.stopPropagation()
          if (e.target.classList.contains("container")) {
            setCurrentComponentIdAction(this.component?.id);
            e.preventDefault();
          e.stopPropagation()
          }
        }

      }}"
      style="min-width: 120px;"
        class=${classMap({
        container: true,
        vertical: this.component.input?.direction === "vertical",
        "drag-over": this.dragOverSituation,
      })}
        @dragenter=${(e) => {
        e.preventDefault();
        this.dragOverSituation = true;
        this.dropDragPalceHolderStyle = {
          ...this.dropDragPalceHolderStyle,
          display: "block",
        };
      }}
        @dragleave=${(e) => {
        e.preventDefault();
        if (
          !(e.relatedTarget as HTMLElement)?.classList.contains("drag-over") &&
          !(e.relatedTarget as HTMLElement)?.classList.contains("drop-zone") &&
          !(e.relatedTarget as HTMLElement)?.classList.contains(
            "empty-message-container"
          )
        ) {
          this.dragOverSituation = false;
          this.dropDragPalceHolderStyle = {
            ...this.dropDragPalceHolderStyle,
            display: "none",
          };
        }
      }}
        @dragover=${(e) => {
        e.preventDefault();
      }}
        @drop=${(e) => {
        e.preventDefault();
        this.dragOverSituation = false;
        moveDraggedComponentInside(
          this.component?.id,
          this.draggingComponentInfo.componentId
        );
        setDraggingComponentInfo(null);
      }}
        @dragend=${(event: Event) => {
        event.preventDefault();
        this.dragOverSituation = false;
      }}
       
      >
        <component-title
          @dragInit=${() => {
      }}
          .component=${{ ...this.component }}
          .selectedComponent=${{ ...this.selectedComponent }}
        ></component-title>
    
        ${this.component.childrenIds?.length
        ? renderComponent(
          this.component.childrenIds?.map(
            (id) =>
              $components.get().find((comment) => comment.id === id) as ComponentElement
          )
        )
        : html`<div
    
              class="empty-message"
              @click="${(e: any) => {
            setCurrentComponentIdAction(this.component?.id);
          }}"
            >
            Add or Drag an item into this container
            </div>`}
        <!--div
          style=${styleMap({
            ...this.dropDragPalceHolderStyle,
            height:
              this.draggingComponentInfo?.blockInfo.height ??
              this.dropDragPalceHolderStyle.height,
            width:
              this.draggingComponentInfo?.blockInfo.width ??
              this.dropDragPalceHolderStyle.width,
          })}
          class="drop-zone drop-zone-end-of-container-${this.component.input
        ?.direction}"
        ></div-->
        <div
          style=${styleMap({
        ...this.dropDragPalceHolderStyle,
        height:
          this.draggingComponentInfo?.blockInfo.height ??
          this.dropDragPalceHolderStyle.height,
        width:
          this.draggingComponentInfo?.blockInfo.width ??
          this.dropDragPalceHolderStyle.width,
      })}
          @dragend=${(e) => {
        e.preventDefault();
      }
      }
          class="drop-zone"
        ></div>

        </div
    ></resize-wrapper>`;
  }
}
