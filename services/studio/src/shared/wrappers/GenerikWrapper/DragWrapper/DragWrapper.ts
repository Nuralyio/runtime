import { css, html, LitElement, nothing, type PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement, type DraggingComponentInfo } from "$store/component/interface.ts";
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import { setDraggingComponentInfo } from "$store/actions/component/setDraggingComponentInfo.ts";
import { moveDraggedComponent } from "$store/actions/component/moveDraggedComponent.ts";

@customElement("drag-wrapper")
export class DragWrapper extends LitElement {
  static styles = [
    css`
      .drop-zone {
        display: block;
        opacity: 0;
        height: 100px;
        margin: 0;
        border: 0;
        border-radius: 4px;
        transition: all 0.3s ease;
        position: relative;
        background-color: transparent;
        pointer-events: auto;
        min-width: 100px;
        max-width: 100%;
      }

      .drop-zone::before {
        content: "Drop before";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #64748b;
        font-size: 0.8rem;
        font-weight: 500;
        opacity: 0;
        transition: opacity 0.2s ease;
        white-space: nowrap;
      }

      .drop-zone.active {
        opacity: 1;
        height: 40px;
        margin: 2px auto;
        border: 2px dashed #3b82f6;
        background-color: #eff6ff;
      }

      .drop-zone.active.target::before {
        color: #3b82f6;
        opacity: 1;
      }
    `
  ];

  slotRef: Ref<HTMLInputElement> = createRef();
  
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  draggingComponentInfo: DraggingComponentInfo;

  @state()
  isDragging: boolean;

  @state()
  dropBeforePlaceHolderStyle = {
    opacity: "0",
    height: "0px",
    width: "100%",
    border: "0",
    margin: "0",
    backgroundColor: "transparent"
  };

  @state()
  dropAfterPlaceHolderStyle = {
    opacity: "0",
    height: "0px",
    width: "100%",
    border: "0",
    margin: "0",
    backgroundColor: "transparent"
  };

  updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "draggingComponentInfo") {
        this.isDragging = Object.keys(this.draggingComponentInfo || {}).length > 0;
      }
    });
  }

  private pendingLeaveTimeout: number | null = null;

  private handleDragLeave(e: DragEvent) {
    e.preventDefault();
    const relatedTarget = e.relatedTarget as HTMLElement;
    
    if (this.pendingLeaveTimeout) {
      clearTimeout(this.pendingLeaveTimeout);
      this.pendingLeaveTimeout = null;
    }

    if (!relatedTarget || !this.contains(relatedTarget)) {
      this.pendingLeaveTimeout = setTimeout(() => {
        this.resetDropZones();
        this.pendingLeaveTimeout = null;
      }, 80) as unknown as number;
    }
  }

  private resetDropZones() {
    this.dropBeforePlaceHolderStyle = {
      opacity: "0",
      height: "0px",
      width: "100%",
      border: "0",
      margin: "0",
      backgroundColor: "transparent"
    };
    this.dropAfterPlaceHolderStyle = {
      opacity: "0",
      height: "0px",
      width: "100%",
      border: "0",
      margin: "0",
      backgroundColor: "transparent"
    };
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (this.pendingLeaveTimeout) {
      clearTimeout(this.pendingLeaveTimeout);
      this.pendingLeaveTimeout = null;
    }

    const rect = this.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const midPoint = rect.height / 2;
    
    const componentWidth = this.draggingComponentInfo?.blockInfo?.width 
      ? `${this.draggingComponentInfo.blockInfo.width}`
      : "100%";

    const activeStyle = {
      opacity: "1",
      height: "40px",
      width: "100%",
      border: "2px dashed #3b82f6",
      margin: "2px auto",
      backgroundColor: "#eff6ff"
    };

    if (y < midPoint) {
      this.dropBeforePlaceHolderStyle = activeStyle;
      this.dropAfterPlaceHolderStyle = this.getInactiveStyle();
    } else {
      this.dropBeforePlaceHolderStyle = this.getInactiveStyle();
      this.dropAfterPlaceHolderStyle = activeStyle;
    }
  }

  private getInactiveStyle() {
    return {
      opacity: "0",
      height: "0px",
      width: "100%",
      border: "0",
      margin: "0",
      backgroundColor: "transparent"
    };
  }

  private handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.resetDropZones();
  }

  private handleDropBefore(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!this.draggingComponentInfo?.componentId) return;
    
    moveDraggedComponent(this.component.uuid, this.draggingComponentInfo.componentId, "before");
    setDraggingComponentInfo(null);
    this.resetDropZones();
  }

  private handleDropAfter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!this.draggingComponentInfo?.componentId) return;
    
    moveDraggedComponent(this.component.uuid, this.draggingComponentInfo.componentId, "after");
    setDraggingComponentInfo(null);
    this.resetDropZones();
  }

  render() {
    const isDragInitiator = this.component.uuid === this.draggingComponentInfo?.componentId;
    const beforeActive = this.dropBeforePlaceHolderStyle.opacity === "1";
    const afterActive = this.dropAfterPlaceHolderStyle.opacity === "1";
  
    return html`
      <div
        ${ref(this.slotRef)}
        @dragover=${this.handleDragOver}
        @dragleave=${this.handleDragLeave}
        @drop=${this.handleDrop}
        @dragend=${(e: Event) => {
          e.preventDefault();
          setDraggingComponentInfo(null);
          this.resetDropZones();
        }}
      >
        ${!isDragInitiator
          ? html`<div
              class="drop-zone ${beforeActive ? 'active target' : ''}"
              style=${styleMap(this.dropBeforePlaceHolderStyle)}
              @dragover=${this.handleDragOver}
              @drop=${this.handleDropBefore}
            ></div>`
          : nothing}
        
        <slot></slot>
    
        ${!isDragInitiator
          ? html`<div
              class="drop-zone ${afterActive ? 'active target' : ''}"
              style=${styleMap(this.dropAfterPlaceHolderStyle)}
              @dragover=${this.handleDragOver}
              @drop=${this.handleDropAfter}
            ></div>`
          : nothing}
      </div>`;
  }
}