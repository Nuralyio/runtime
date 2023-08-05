import {
  setCurrentComponentIdAction,
  updateComponentAttributes,
} from "$store/component/action";
import { ComponentElement } from "$store/component/interface";
import {
  $currentComponentId,
  $selectedComponent,
} from "$store/component/sotre";
import { useStores } from "@nanostores/lit";
import { LitElement, html, css } from "lit";
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
  currentResizer;
  constructor() {
    super();
    $currentComponentId.subscribe(() => {});
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
    });
    setTimeout(() => {
      this.firstUpdated();
    });
  };
  stopResize = () => {
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

  render() {
    return html` <span
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
        class="component-name"
        style="left: ${this.inputRef.value?.getBoundingClientRect()?.left}px;
        top :  ${this.inputRef.value?.getBoundingClientRect()?.top - 20}px;"
        >${this.component.name}</span
      >
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
