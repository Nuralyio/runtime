import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import { type ComponentElement, ComponentType } from "$store/component/interface.ts";
import styles from "./ResizeWrapper.style.ts";
import { classMap } from "lit/directives/class-map.js";
import { $pageZoom, $showBorder } from "$store/page.ts";
import { updateComponentAttributes } from "$store/actions/component/updateComponentAttributes.ts";
import { setResizing } from "$store/actions/page/setResizing.ts";
import { eventDispatcher } from "@utils/change-detection.ts";

@customElement("resize-wrapper")
export class ResizeWrapper extends LitElement {
  static styles = styles;
  inputRef: Ref<HTMLInputElement> = createRef();
  onlyWidthResizableComponents = [ComponentType.TextInput, ComponentType.Select, ComponentType.DatePicker, ComponentType.Button, ComponentType.Checkbox];
  notResizableComponents = [ComponentType.Checkbox, ComponentType.TextLabel];
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  selectedComponent: ComponentElement;

  @property({ type: Boolean })
  isSelected = false;
  @property({ type: Object })
  hoveredComponent: ComponentElement;

  @state()
  styles: any = {
    lines: {
      top: { width: "0" },
      bottom: { width: "0", marginTop: "0" },
      left: { width: "0", marginTop: "0" },
      right: { height: "0", marginLeft: "0" }
    },
    points: {
      leftTop: {},
      rightTop: {},
      middleTop: {},
      leftBottom: {},
      rightBottom: {},
      middleBottom: {}
    }
  };

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
  currentResizer;

  @state()
  zoomLevel;
  @state()
  showBorder = false;

  constructor() {
    super();
    $showBorder.subscribe((showBorder) => {
      this.showBorder = showBorder;
    });
  }

  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component") {
      }
    });
  }

  emitResizingEvent(isResising) {

    let customEvent = new CustomEvent("isResising", {
      detail: {
        value: isResising
      }
    });
    this.dispatchEvent(customEvent);

  }

  resize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.currentResizer.classList.contains("resizer-point-right-bottom")) {
      this.inputRef.value.style.width =
        e.pageX - this.inputRef.value.getBoundingClientRect().left + "px";

      const width = this.original_width + (e.pageX - this.original_mouse_x);
      const height = this.original_height + (e.pageY - this.original_mouse_y);

      if (width > this.minimum_size) {
        this.inputRef.value.style.width = width + "px";
      }
      if (height > this.minimum_size &&
        !this.onlyWidthResizableComponents.includes(this.component.component_type)
      ) {
        this.inputRef.value.style.height = height + "px";
      }
    } else if (
      this.currentResizer.classList.contains("resizer-point-left-bottom")
    ) {

      const height = this.original_height + (e.pageY - this.original_mouse_y);
      const width = this.original_width - (e.pageX - this.original_mouse_x);
      if (height > this.minimum_size &&
        !this.onlyWidthResizableComponents.includes(this.component.component_type)
      ) {
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
      if (height > this.minimum_size &&
        !this.onlyWidthResizableComponents.includes(this.component.component_type)
      ) {
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
      if (height > this.minimum_size &&
        !this.onlyWidthResizableComponents.includes(this.component.component_type)
      ) {
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
      if (height > this.minimum_size &&
        !this.onlyWidthResizableComponents.includes(this.component.component_type)
      ) {
        this.inputRef.value.style.height = height + "px";
        this.inputRef.value.style.top =
          this.original_y + (e.pageY - this.original_mouse_y) + "px";
      }
    }

    setTimeout(() => {
      this.firstUpdated();
    });
    setTimeout(() => {
      this.applyResize();
    }, 1000);
  };

  connectedCallback(): void {
    super.connectedCallback();
    eventDispatcher.on("refresh:resize"+this.component.uuid, () => {
      this.firstUpdated();
    })

    window.removeEventListener("resize", this.firstUpdated);
    window.addEventListener("mouseup", this.stopResize);
    $pageZoom.subscribe((pageZoom: string) => {
      this.zoomLevel = Number(pageZoom);
      this.firstUpdated();
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("mouseup", this.stopResize);
    if (
      !this.notResizableComponents.includes(this.component.component_type)
    ) {
      window.removeEventListener("mousemove", this.resize);
    }
  }

  firstUpdated() {
    
      requestAnimationFrame(() => {
        this.slotDOMRect = this.inputRef.value.getBoundingClientRect();
        this.slotDOMRect = this.inputRef.value.getBoundingClientRect();
        const originalWidth = this.inputRef.value.offsetWidth;
        const originalHeight = this.inputRef.value.offsetHeight;
        
        // Calculate the scaled dimensions
        const scaledWidth = originalWidth;
        const scaledHeight = originalHeight * this.zoomLevel;

        let { width, height }: any = this.slotDOMRect;
        width = originalWidth;
        height = originalHeight;
        const widthPixel = `${width}px`;
        const heightPixel = `${height}px`;
        this.styles = {
          lines: {
            top: {
              width: widthPixel
            },
            bottom: {
              width: widthPixel,
              marginTop: heightPixel
            },
            right: {
              height: heightPixel,
              marginLeft: widthPixel
            },
            left: {
              height: heightPixel
            }
          },
          points: {
            leftTop: {
              marginLeft: "-1px"
            },
            rightTop: {
              marginLeft: `${width - 3}px`
            },
            middleTop: {
              marginLeft: `${width / 2 - 3}px`
            },
            leftBottom: {
              marginTop: `${height - 2}px`,
              marginLeft: `${-1}px`
            },
            rightBottom: {
              marginLeft: `${width - 3}px`,
              marginTop: `${height - 2}px`
            },
            middleBottom: {
              marginLeft: `${width / 2 - 3}px`,
              marginTop: `${height - 2}px`
            }
          }
        };
        this.requestUpdate();
      });
  }

  stopResize = () => {
    window.removeEventListener("mousemove", this.resize);
    setTimeout(() => {
      setResizing(false);
    });
  };
  applyResize = () => {
    if (this.component.component_type == ComponentType.Button) {
      updateComponentAttributes(this.component.application_id, this.component.uuid, "style", {
        "--hybrid-button-width": this.inputRef.value.style.width
      });
    } else if (this.component.component_type == ComponentType.Icon) {
      updateComponentAttributes(this.component.application_id, this.component.uuid, "style", {
        "--hybrid-icon-width": this.inputRef.value.style.width,
        "--hybrid-icon-height": this.inputRef.value.style.height
      });

    } else if (this.component.component_type == ComponentType.Select) {
      updateComponentAttributes(this.component.application_id, this.component.uuid, "style", {
        "--hybrid-select-width": this.inputRef.value.style.width
      });

    } else if (
      this.component.component_type == ComponentType.TextInput
      || this.component.component_type == ComponentType.DatePicker
    ) {
      updateComponentAttributes(this.component.application_id, this.component.uuid, "style", {
        width: this.inputRef.value.style.width
      });

    } else {
      updateComponentAttributes(this.component.application_id, this.component.uuid, "style", {
        width: this.inputRef.value.style.width,
        height: this.inputRef.value.style.height
      });
    }
  };


  mouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    this.currentResizer = e.target;
    this.original_width = this.inputRef.value.offsetWidth;
    this.original_height = this.inputRef.value.offsetHeight;
    this.original_x = this.inputRef.value.getBoundingClientRect().left;
    this.original_y = this.inputRef.value.getBoundingClientRect().top;
    this.original_mouse_x = e.pageX;
    this.original_mouse_y = e.pageY;

    if (
      !this.notResizableComponents.includes(this.component.component_type)
    ) {
      window.addEventListener("mousemove", this.resize);
    }
  };

  render() {
    return html`
      <!-- Points -->
       
      <div
        class=${classMap({
      element: true,
      selected:
        this.isSelected ,
      hovered:
        this.hoveredComponent?.uuid === this.component.uuid &&
        this.selectedComponent?.uuid !== this.component.uuid,
      bordered: this.showBorder
    })}
       ${ref(this.inputRef)}
      >
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

        <slot @slotchange="${(e) => {
    }}"></slot>
      </div>
    `;
  }
}
