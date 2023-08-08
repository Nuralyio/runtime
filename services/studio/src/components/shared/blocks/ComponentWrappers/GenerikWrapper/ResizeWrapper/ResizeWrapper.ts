import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { updateComponentAttributes } from "$store/component/action";
import { ComponentElement } from "$store/component/interface";
import styles from "./ResizeWrapper.style";
import { classMap } from "lit/directives/class-map.js";
@customElement("resize-wrapper")
export class ResizeWrapper extends LitElement {
  inputRef: Ref<HTMLInputElement> = createRef();

  static styles = styles;

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  selectedComponent: ComponentElement;

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

      const width = this.original_width + (e.pageX - this.original_mouse_x);
      const height = this.original_height + (e.pageY - this.original_mouse_y);
      console.log(height);

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
  connectedCallback(): void {
    super.connectedCallback();
    window.removeEventListener("resize", this.firstUpdated);
  }

  firstUpdated() {
    setTimeout(() => {
      requestAnimationFrame(() => {
        this.requestUpdate();
        this.slotDOMRect = this.inputRef.value.getBoundingClientRect();
        const { width, height } = this.slotDOMRect;
        const widthPixel = `${width}px`;
        const heightPixel = `${height}px`;
        console.log(widthPixel, heightPixel);
        console.log(heightPixel);
        console.log(widthPixel);
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
    });
  }

  stopResize = (e: Event) => {
    e.preventDefault();
    window.removeEventListener("mousemove", this.resize);
  };

  mouseDown = (e: MouseEvent) => {
    this.currentResizer = e.target;
    this.original_width = this.inputRef.value.getBoundingClientRect().width;
    this.original_height = this.inputRef.value.getBoundingClientRect().height;
    this.original_x = this.inputRef.value.getBoundingClientRect().left;
    this.original_y = this.inputRef.value.getBoundingClientRect().top;
    this.original_mouse_x = e.pageX;
    this.original_mouse_y = e.pageY;

    e.preventDefault();
    window.addEventListener("mousemove", this.resize);
    window.addEventListener("mouseup", this.stopResize);
  };

  render() {
    return html`
      <!-- Points -->
      <div
        class=${classMap({
          element: true,
          selected: this.selectedComponent?.id === this.component.id,
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

        <slot></slot>
      </div>
    `;
  }
}
