import { LitElement, html, css, nothing, type PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import styles from "./DragWrapper.style";
import {
  type ComponentElement,
  type DraggingComponentInfo,
} from "$store/component/interface";
import { type Ref, createRef, ref } from "lit/directives/ref.js";
import {
  moveDraggedComponent,
  setDraggingComponentInfo,
} from "$store/actions/component";

@customElement("drag-wrapper")
export class DragWrapper extends LitElement {
  slotRef: Ref<HTMLInputElement> = createRef();

  @property({ type: Object })
  component: ComponentElement;
  @property({
    type: Object,
  })
  draggingComponentInfo: DraggingComponentInfo;

  @state()
  isDragging: boolean;

  static styles = styles;
  @state()
  dropDragPalceHolderStyle = {
    display: "none",
    height: "20px",
    width: "auto",
    backgroundColor: "rgb(202 235 255)",
    zIndex: "7",
    borderRadius: " 2px",
  };
  firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void { }

  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "draggingComponentInfo") {
        if ([...changedProperties][1][1]) {
          this.isDragging = true;
        } else {
          this.isDragging = false;
        }
      }
    });
  }
  render() {
    const isDragintiator =
      this.component.uuid === this.draggingComponentInfo?.componentId;
    return html`<div
      ${ref(this.slotRef)}
      @dragover=${(e) => {
        e.preventDefault();
        this.dropDragPalceHolderStyle = {
          ...this.dropDragPalceHolderStyle,
          display: "block",
        };
      }}
      @drop=${(e: Event) => {
        this.dropDragPalceHolderStyle = {
          ...this.dropDragPalceHolderStyle,
          display: "none",
          height: "20px",
          width: "auto",
        };
        e.preventDefault();
      }}

      @dragend=${(e: Event) => {
        e.preventDefault();
        setDraggingComponentInfo(null);
      }}  
      @dragleave=${(e: DragEvent) => {
        e.preventDefault();
        if (!(e.relatedTarget as HTMLElement)?.classList.contains("drop-zone")) {
          this.dropDragPalceHolderStyle = {
            ...this.dropDragPalceHolderStyle,
            display: "none",
          };
        }
      }}
    >
      ${this.isDragging && !isDragintiator
        ? html`<span
            class="drop-zone "
            @dragenter=${(e: Event) => {
            e.preventDefault();

            this.dropDragPalceHolderStyle = {
              ...this.dropDragPalceHolderStyle,
              height:
                this.draggingComponentInfo.blockInfo.height ??
                this.dropDragPalceHolderStyle.height,
            };
    
          }}
            @dragleave=${(e: Event) => {
            e.preventDefault();
            this.dropDragPalceHolderStyle = {
              ...this.dropDragPalceHolderStyle,
              display: "none",
              height: "20px",
              width: "auto",
            };
          }}
            @drop=${(e) => {
          e.preventDefault();
          e.stopPropagation();
            this.dropDragPalceHolderStyle = {
              ...this.dropDragPalceHolderStyle,
              display: "none",
              height: "20px",
            };
            moveDraggedComponent(
              this.component?.uuid,
              this.draggingComponentInfo.componentId
            );
            setDraggingComponentInfo(null);
           
          }}
            style=${styleMap(this.dropDragPalceHolderStyle)}
          ></span> `
        : nothing}<slot></slot>
    </div>`;
  }
}
