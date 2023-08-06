import {
  moveDraggedComponent,
  setCurrentComponentIdAction,
  setDraggingComponentInfo,
  updateComponentAttributes,
} from "$store/component/action";
import {
  ComponentElement,
  DraggingComponentInfo,
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

@customElement("generik-component-wrapper")
@useStores($currentComponentId)
export class GenerikComponentWrapper extends LitElement {
  inputRef: Ref<HTMLInputElement> = createRef();
  wrapperRef: Ref<HTMLInputElement> = createRef();
  @property({ type: Object })
  component: ComponentElement;
  static styles = styles;

  @state()
  selectedComponent: ComponentElement;

  @state()
  isDraggbale = false;

  @state()
  isDragintiator = false;

  @state()
  draggingSituation = false;

  @state()
  dragOver = false;

  @state()
  currentResizer;

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
        }
        setTimeout(() => {
          this.updateDragginStyle();
        }, 100);
      }
    );
    $selectedComponent.subscribe((selectedComponent) => {
      this.selectedComponent = selectedComponent;
    });
  }

  minimum_size = 20;
  @state()
  original_width = 0;
  @state()
  original_height = 0;
  @state()
  original_x = 0;
  @state()
  original_y = 0;
  @state()
  original_mouse_x = 0;
  @state()
  original_mouse_y = 0;

  @state()
  slotDOMRect: DOMRect;

  @state()
  dropDragPalceHolderStyle: any = {};
  @state()
  styles: any = {
    lines: {
      top: { width: "0" },
      bottom: { width: "0", marginTop: "0" },
      left: { width: "0", marginTop: "0" },
      right: { height: "0", marginLeft: "0" },
    },
    points: {
      leftTop: {},
      rightTop: {},
      middleTop: {},
      leftBottom: {},
      rightBottom: {},
      middleBottom: {},
    },
  };
  firstUpdated() {
    document.addEventListener("dragend", this.handleMouseUp);
    requestAnimationFrame(() => {
      this.slotDOMRect = this.inputRef.value.getBoundingClientRect();
      const { width, height } = this.slotDOMRect;
      const widthPixel = `${width}px`;
      const heightPixel = `${height}px`;

      this.styles = {
        lines: {
          top: {
            width: widthPixel,
          },
          bottom: {
            width: widthPixel,
            marginTop: heightPixel,
          },
          right: {
            height: heightPixel,
            marginLeft: widthPixel,
          },
          left: {
            height: heightPixel,
          },
        },
        points: {
          leftTop: {
            marginLeft: "-1px",
          },
          rightTop: {
            marginLeft: `${width - 3}px`,
          },
          middleTop: {
            marginLeft: `${width / 2 - 3}px`,
          },
          leftBottom: {
            marginTop: `${height - 2}px`,
            marginLeft: `${-1}px`,
          },
          rightBottom: {
            marginLeft: `${width - 3}px`,
            marginTop: `${height - 2}px`,
          },
          middleBottom: {
            marginLeft: `${width / 2 - 3}px`,
            marginTop: `${height - 2}px`,
          },
        },
      };

      this.requestUpdate();
    });
  }

  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component") {
        this.firstUpdated();
      }
    });
  }

  resize = (e) => {
    if (this.currentResizer.classList.contains("resizer-point-right-bottom")) {
      this.inputRef.value.style.width =
        e.pageX - this.inputRef.value.getBoundingClientRect().left + "px";
      console.log(this.inputRef.value.style.width);

      const width = this.original_width + (e.pageX - this.original_mouse_x);
      const height = this.original_height + (e.pageY - this.original_mouse_y);
      if (width > this.minimum_size) {
        this.inputRef.value.style.width = width + "px";
      }
      if (height > this.minimum_size) {
        this.inputRef.value.style.height = height + "px";
      }
    } else if (
      this.currentResizer.classList.contains("resizer-point-left-bottom")
    ) {
      const height = this.original_height + (e.pageY - this.original_mouse_y);
      const width = this.original_width - (e.pageX - this.original_mouse_x);
      if (height > this.minimum_size) {
        this.inputRef.value.style.height = height + "px";
      }
      if (width > this.minimum_size) {
        this.inputRef.value.style.width = width + "px";
        this.inputRef.value.style.left =
          this.original_x + (e.pageX - this.original_mouse_x) + "px";
      }
    } else if (
      this.currentResizer.classList.contains("resizer-line-bottom") ||
      this.currentResizer.classList.contains("resizer-point-middle-top") ||
      this.currentResizer.classList.contains("resizer-point-middle-bottom")
    ) {
      const height = this.original_height + (e.pageY - this.original_mouse_y);
      const width = this.original_width - (e.pageX - this.original_mouse_x);
      if (height > this.minimum_size) {
        this.inputRef.value.style.height = height + "px";
      }
    } else if (
      this.currentResizer.classList.contains("resizer-point-left-top")
    ) {
      const width = this.original_width - (e.pageX - this.original_mouse_x);
      const height = this.original_height - (e.pageY - this.original_mouse_y);
      if (width > this.minimum_size) {
        this.inputRef.value.style.width = width + "px";
        this.inputRef.value.style.left =
          this.original_x + (e.pageX - this.original_mouse_x) + "px";
      }
      if (height > this.minimum_size) {
        this.inputRef.value.style.height = height + "px";
        this.inputRef.value.style.top =
          this.original_y + (e.pageY - this.original_mouse_y) + "px";
      }
    } else if (
      this.currentResizer.classList.contains("resizer-point-right-top")
    ) {
      const width = this.original_width + (e.pageX - this.original_mouse_x);
      const height = this.original_height - (e.pageY - this.original_mouse_y);
      if (width > this.minimum_size) {
        this.inputRef.value.style.width = width + "px";
      }
      if (height > this.minimum_size) {
        this.inputRef.value.style.height = height + "px";
        this.inputRef.value.style.top =
          this.original_y + (e.pageY - this.original_mouse_y) + "px";
      }
    }
    updateComponentAttributes(this.component.id, {
      width: this.inputRef.value.style.width,
      height: this.inputRef.value.style.height,
      display: "block",
    });
    setTimeout(() => {
      this.firstUpdated();
    });
  };
  stopResize = (e: Event) => {
    e.preventDefault();
    console.log("stopResize", this.currentResizer.classList);
    window.removeEventListener("mousemove", this.resize);
  };

  mouseDown = (e: MouseEvent) => {
    this.currentResizer = e.target;
    this.original_width = parseFloat(
      getComputedStyle(this.wrapperRef.value, null)
        .getPropertyValue("width")
        .replace("px", "")
    );
    this.original_height = parseFloat(
      getComputedStyle(this.wrapperRef.value, null)
        .getPropertyValue("height")
        .replace("px", "")
    );
    this.original_x = this.wrapperRef.value.getBoundingClientRect().left;
    this.original_y = this.wrapperRef.value.getBoundingClientRect().top;
    this.original_mouse_x = e.pageX;
    this.original_mouse_y = e.pageY;

    e.preventDefault();
    window.addEventListener("mousemove", this.resize);
    window.addEventListener("mouseup", this.stopResize);
  };

  handleMouseUp = (e: Event) => {
    e.preventDefault();
    this.isDraggbale = false;
    this.isDragintiator = false;
    setDraggingComponentInfo(null);
  };

  updateDragginStyle() {
    if (this.isDragintiator) {
      return;
    }
    if (this.draggingSituation) {
      this.dropDragPalceHolderStyle = {
        display: "block",
        width: this.draggingComponentInfo?.blockInfo?.width,
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
  }
  render() {
    return html` <span
      draggable=${this.isDraggbale ? "true" : "false"}
      @dragend=${() => {
        this.requestUpdate();
      }}
      ${ref(this.wrapperRef)}
      class=${classMap({
        element: true,
        selected: this.selectedComponent?.id === this.component.id,
      })}
      @click="${() => {
        setCurrentComponentIdAction(this.component?.id);
      }}"
    >
      <span
        @mousedown=${(e: Event) => {
          this.isDraggbale = true;
          this.isDragintiator = true;
          setDraggingComponentInfo({
            componentId: this.component?.id,
            blockInfo: {
              height: this.inputRef.value.getBoundingClientRect().height + "px",
              width: this.inputRef.value.getBoundingClientRect().width + "px",
            },
          });
        }}
        @mouseup=${(e: Event) => {
          e.preventDefault();
          this.isDraggbale = false;
          setDraggingComponentInfo(null);
        }}
        class="component-name"
        style="left: ${this.inputRef.value?.getBoundingClientRect()?.left}px;
           margin-top: -22px;"
        >${this.component.name}</span
      >
      ${!this.isDragintiator
        ? html`<div
            class="drop-zone "
            @dragenter=${(e: Event) => {
              e.preventDefault();
              this.dragOver = true;
              this.updateDragginStyle();
            }}
            @dragleave=${(e: Event) => {
              e.preventDefault();

              this.dragOver = false;
              this.updateDragginStyle();
            }}
            @dragover=${(e: Event) => {
              e.preventDefault();
            }}
            @drop=${() => {
              moveDraggedComponent(
                this.component?.id,
                this.draggingComponentInfo.componentId
              );
              setDraggingComponentInfo(null);
              setTimeout(() => {
                this.firstUpdated();
              });
            }}
            style=${styleMap(this.dropDragPalceHolderStyle)}
          ></div> `
        : nothing}

      <!-- Points -->
      <div
        @mousedown=${this.mouseDown}
        class="resizer-point-left-top"
        style=${styleMap(this.styles.points?.leftTop)}
      ></div>
      <div
        @mousedown=${this.mouseDown}
        class="resizer-point-right-top"
        style=${styleMap(this.styles.points?.rightTop)}
      ></div>
      <div
        @mousedown=${this.mouseDown}
        class="resizer-point-middle-top"
        style=${styleMap(this.styles.points?.middleTop)}
      ></div>

      <div
        @mousedown=${this.mouseDown}
        class="resizer-point-left-bottom"
        style=${styleMap(this.styles.points?.leftBottom)}
      ></div>
      <div
        @mousedown=${this.mouseDown}
        class="resizer-point-right-bottom"
        style=${styleMap(this.styles.points?.rightBottom)}
      ></div>
      <div
        class="resizer-point-middle-bottom"
        @mousedown=${this.mouseDown}
        style=${styleMap(this.styles.points?.middleBottom)}
      ></div>
      <!-- End Points -->
      <!-- Lines -->
      <div
        class="resizer-line-top"
        style=${styleMap(this.styles.lines.top)}
      ></div>
      <div
        class="resizer-line-bottom"
        style=${styleMap(this.styles.lines.bottom)}
      ></div>
      <div
        class="resizer-line-right"
        style=${styleMap(this.styles.lines.right)}
      ></div>
      <div
        class="resizer-line-left"
        style=${styleMap(this.styles.lines.left)}
      ></div>
      <!-- End Lines -->
      <div style="pointer-events: none;" ${ref(this.inputRef)}>
        <slot></slot>
      </div>
    </span>`;
  }
}
