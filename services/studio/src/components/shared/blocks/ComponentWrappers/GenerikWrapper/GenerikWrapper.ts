import { setCurrentComponentIdAction } from "$store/component/action";
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
  @property({ type: Object })
  component: ComponentElement;
  static styles = styles;

  @state()
  selectedComponent: ComponentElement;
  constructor() {
    super();
    $currentComponentId.subscribe(() => {});
    $selectedComponent.subscribe((selectedComponent) => {
      this.selectedComponent = selectedComponent;
    });
  }

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

  render() {
    return html` <span
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
        class="resizer-point-left-top"
        style=${styleMap(this.styles.points?.leftTop)}
      ></div>
      <div
        class="resizer-point-right-top"
        style=${styleMap(this.styles.points?.rightTop)}
      ></div>
      <div
        class="resizer-point-middle-top"
        style=${styleMap(this.styles.points?.middleTop)}
      ></div>

      <div
        class="resizer-point-left-bottom"
        style=${styleMap(this.styles.points?.leftBottom)}
      ></div>
      <div
        class="resizer-point-right-bottom"
        style=${styleMap(this.styles.points?.rightBottom)}
      ></div>
      <div
        class="resizer-point-middle-bottom"
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
