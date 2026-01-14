import { css, html, LitElement, nothing, type PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement, type DraggingComponentInfo } from '../../../../../../redux/store/component/component.interface';
import { createRef, type Ref } from "lit/directives/ref.js";
import { setDraggingComponentInfo } from '../../../../../../redux/actions/component/setDraggingComponentInfo';
import { moveDraggedComponent } from '../../../../../../redux/actions/component/moveDraggedComponent';
import { $draggingComponentInfo } from '../../../../../../redux/store/component/store';

@customElement("drag-wrapper")
export class DragWrapper extends LitElement {
  static styles = [
    css`
      .drop-zone {
        position: relative;
        opacity: 0;
        height: 100px;
        margin: 0;
        border: 0;
        border-radius: 4px;
        transition: all 0.1s ease;
        position: relative;
        background-color: transparent;
        pointer-events: auto;
        max-width: 100%;
      }
      .message {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        color : #3b82f6;
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
  @property({ type: String })
  message: String;
  @state()
  draggingComponentInfo: DraggingComponentInfo;

  @state()
  isDragging: boolean;

  @state()
  dropBeforePlaceHolderStyle = {
    opacity: "0",
    height: "0px",
    width: "0px",
    border: "0",
    margin: "0",
    backgroundColor: "transparent",
    position : "relative"
  };

  @state()
  dropAfterPlaceHolderStyle = {
    opacity: "0",
    height: "0px",
    width: "0px",
    border: "0",
    margin: "0",
    backgroundColor: "transparent",
    position : "relative"

  };
  draggingSituation: boolean;
  @property({ type: Object })
  inputRef: any;
  currentTimeout: NodeJS.Timeout;

  @property({ type: String })
  where: string;

  updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "draggingComponentInfo") {
        this.isDragging = Object.keys(this.draggingComponentInfo || {}).length > 0;
      }
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    // this.inputRef.value.addEventListener("dragover", this.handleDragOver.bind(this));
    // this.inputRef.value.addEventListener("dragleave", (e)=>{
    //   this.handleDragLeave(e);
    // });

    this.addEventListener("drag-over-component", this.handleDragOver.bind(this));
    this.addEventListener("drag-leave-component", this.handleDragLeave.bind(this));

    $draggingComponentInfo.subscribe((draggingComponentInfo: DraggingComponentInfo) => {
      if (draggingComponentInfo) {
        this.draggingComponentInfo = draggingComponentInfo;
        this.draggingSituation = true;
        if (this.draggingComponentInfo?.componentId === this.component?.uuid) {
          if (
            this.draggingComponentInfo?.blockInfo &&
            !this.draggingComponentInfo?.blockInfo?.height
          ) {
            const rect = this.inputRef.value?.getBoundingClientRect();
            this.draggingComponentInfo.blockInfo.height = `${rect.height}px`;
            //this.draggingComponentInfo.blockInfo.width = `${rect.width}px`;
            setDraggingComponentInfo({
              componentId: this.draggingComponentInfo?.componentId,
              blockInfo: { ...this.draggingComponentInfo.blockInfo }
            });
          }
        }
      } else {
        this.draggingSituation = false;
        this.draggingComponentInfo = null;
        this.resetDropZones();
      }
    });
  }
  private pendingLeaveTimeout: number | null = null;

  private handleDragLeave(e: DragEvent) {
    this.resetDropZones();
  }

  private resetDropZones() {
    this.dropBeforePlaceHolderStyle = {
     
      opacity: "0",
      height: "0px",
      width: "0",
      border: "0",
      margin: "0",
      backgroundColor: "transparent",
      position : "relative"
    };
    this.dropAfterPlaceHolderStyle = {
      opacity: "0",
      height: "0px",
      width: "0",
      border: "0",
      margin: "0",
      backgroundColor: "transparent",
      position : "relative"

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
      zIndex: "900",
      opacity: "1",
      height: "40px",
      border: "2px dashed #3b82f6",
      margin: "0",
      backgroundColor: "#eff6ff",
      position: "relative",
    };
       this.dropBeforePlaceHolderStyle = activeStyle;
    // this.dropBeforePlaceHolderStyle.width = this.inputRef.value?.style.width ;
    // this.dropBeforePlaceHolderStyle.height = this.inputRef.value?.style.height;
  }

 
  private handleDropBefore(e: DragEvent) {
   
    if(!["before", "after", "inside"].includes(this.where)){
      this.where = "before";
    }
    
    if (!this.draggingComponentInfo?.componentId) return;
    
    moveDraggedComponent(this.component.uuid, this.draggingComponentInfo.componentId, this.where  );
    setDraggingComponentInfo(null);
    this.resetDropZones();
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const isDragInitiator = this.component.uuid === this.draggingComponentInfo?.componentId;
    const beforeActive = this.dropBeforePlaceHolderStyle.opacity === "1";
    return html`
        ${!isDragInitiator
          ? html`<div
          @dragenter=${
            (e: DragEvent) => {
              e.preventDefault();
            }
          }
         
              class="drop-zone ${beforeActive ? 'active target' : ''} drop-${this.component.uuid}"
              style=${styleMap(this.dropBeforePlaceHolderStyle)}
              @drop=${this.handleDropBefore}
            ><div class="message">${this.message  ?? "Drop here"}</div></div>`
          : nothing}
       `;
  }
}

// Safe registration - only register if not already defined
if (!customElements.get('drag-wrapper')) {
  customElements.define('drag-wrapper', DragWrapper);
}