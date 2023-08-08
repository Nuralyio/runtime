import {
  moveDraggedComponent,
  setCurrentComponentIdAction,
  setDraggingComponentInfo,
  updateComponentAttributes,
} from "$store/component/action";
import {
  ComponentElement,
  DraggingComponentInfo,
  TextLabelAttributes,
} from "$store/component/interface";
import {
  $currentComponentId,
  $draggingComponentInfo,
  $selectedComponent,
} from "$store/component/sotre";
import { useStores } from "@nanostores/lit";
import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";
import { classMap } from "lit/directives/class-map.js";
import styles from "./GenerikWrapper.style";
import "./DragWrapper/DragWrapper";
import "./ResizeWrapper/ResizeWrapper";

@customElement("generik-component-wrapper")
@useStores($currentComponentId)
export class GenerikComponentWrapper extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = styles;

  @state()
  selectedComponent: ComponentElement;

  @state()
  displayTitle = true;

  @state()
  isDraggbale = false;

  @state()
  isDragintiator = false;

  @state()
  draggingSituation = false;

  @state()
  dragOver = false;

  @state()
  draggingComponentInfo: DraggingComponentInfo;
  constructor() {
    super();
    $currentComponentId.subscribe(() => {});
    $draggingComponentInfo.subscribe(
      (draggingComponentInfo: DraggingComponentInfo) => {
        if (draggingComponentInfo) {
          this.draggingSituation = true;
          this.draggingComponentInfo = draggingComponentInfo;
        } else {
          this.draggingSituation = false;
          this.draggingComponentInfo = null;
        }
        /* setTimeout(() => {
          this.updateDragginStyle();
        }, 100);*/
      }
    );
    $selectedComponent.subscribe((selectedComponent) => {
      this.selectedComponent = selectedComponent;
    });
  }

  @state()
  dropDragPalceHolderStyle: any = {};

  /* updateDragginStyle() {
    if (this.isDragintiator) {
      return;
    }
    if (this.draggingSituation) {
      this.dropDragPalceHolderStyle = {
        display: "block",
        width: this.styles.lines.top.width,
        height: "20px",
        backgroundColor: "rgb(202 235 255)",
        zIndex: "7",
        borderRadius: " 2px",
      };
      if (this.dragOver) {
        this.dropDragPalceHolderStyle = {
          display: "block",
          width: this.draggingComponentInfo?.blockInfo?.width,
          height: this.draggingComponentInfo?.blockInfo?.height,
          backgroundColor: "rgb(202 235 255)",
          zIndex: "7",
          borderRadius: " 2px",
        };
      }
    } else {
      this.dropDragPalceHolderStyle = {
        width: this.styles.lines.top.width,
        height: "0px",
        display: "none",
        backgroundColor: "rgb(202 235 255)",
        zIndex: "7",
        borderRadius: " 2px",
      };
    }
  } */
  render() {
    return html` <resize-wrapper
      .component=${{ ...this.component }}
      .selectedComponent=${{ ...this.selectedComponent }}
    >
      <drag-wrapper
        .component=${{ ...this.component }}
        .draggingComponentInfo=${{ ...this.draggingComponentInfo }}
        .isDragintiator=${this.isDragintiator}
      >
        <span
          draggable=${this.isDragintiator}
          class=${classMap({
            isDraggable: this.isDragintiator,
          })}
          @dragend=${() => {
            this.requestUpdate();
          }}
          @click="${() => {
            setCurrentComponentIdAction(this.component?.id);
          }}"
        >
          <span
            style=${styleMap({
              display:
                this.selectedComponent?.id === this.component.id &&
                this.displayTitle
                  ? "block"
                  : "none",
            })}
            @mousedown=${(e: Event) => {
              this.isDragintiator = true;
              setTimeout(() => {
                setDraggingComponentInfo({
                  componentId: this.component?.id,
                  blockInfo: {
                    height: (this.component.attributes as TextLabelAttributes)
                      .height,
                    width: (this.component.attributes as TextLabelAttributes)
                      .width,
                  },
                });
              }, 100);
            }}
            @mouseup=${(e: Event) => {
              e.preventDefault();
              this.isDragintiator = false;
              setDraggingComponentInfo(null);
            }}
            class="component-name"
            >${this.component.name}</span
          >

          <div style="pointer-events: none;">
            <slot></slot>
          </div>
        </span>
      </drag-wrapper>
    </resize-wrapper>`;
  }
}
