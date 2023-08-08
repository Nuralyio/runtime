import { LitElement, html, css, nothing, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import styles from "./DragWrapper.style";
import {
  ComponentElement,
  DraggingComponentInfo,
  TextLabelAttributes,
} from "$store/component/interface";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { moveDraggedComponent } from "$store/component/action";

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
  ): void {}

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
      this.component.id === this.draggingComponentInfo?.componentId;
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
      }}
      @dragleave=${(e: DragEvent) => {
        e.preventDefault();
        if (!(e.relatedTarget as HTMLElement).classList.contains("drop-zone")) {
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

              console.log(this.draggingComponentInfo);
              this.dropDragPalceHolderStyle = {
                ...this.dropDragPalceHolderStyle,
                height:
                  this.draggingComponentInfo.blockInfo.height ??
                  this.dropDragPalceHolderStyle.height,
                // width: this.draggingComponentInfo.blockInfo.width,
              };
              //e.preventDefault();
              //this.dragOver = true;
              //this.updateDragginStyle();
            }}
            @dragleave=${(e: Event) => {
              e.preventDefault();
              this.dropDragPalceHolderStyle = {
                ...this.dropDragPalceHolderStyle,
                display: "none",
                height: "20px",
                width: "auto",
              };

              console.log(e);
              //this.dragOver = false;
              //  this.updateDragginStyle();
            }}
            @drop=${() => {
              this.dropDragPalceHolderStyle = {
                ...this.dropDragPalceHolderStyle,
                display: "none",
                height: "20px",
              };
              moveDraggedComponent(
                this.component?.id,
                this.draggingComponentInfo.componentId
              );
              /*moveDraggedComponent(
                this.component?.id,
                this.draggingComponentInfo.componentId
              );
              setDraggingComponentInfo(null);
              setTimeout(() => {
                //  this.firstUpdated();
              });*/
            }}
            style=${styleMap(this.dropDragPalceHolderStyle)}
          ></span> `
        : nothing}<slot></slot>
    </div>`;
  }
}
