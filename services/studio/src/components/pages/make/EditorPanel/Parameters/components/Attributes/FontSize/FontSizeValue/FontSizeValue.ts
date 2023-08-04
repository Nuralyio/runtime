import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/input";
import "@hybridui/dropdown";
import {
  ComponentElement,
  TextLabelAttributes,
} from "$store/component/interface";
import styles from "./FontSizeValue.style";

@customElement("attribute-font-size-value-handler")
export class AttributeFontSizeValue extends LitElement {
  static styles = styles;

  @state()
  currentUnity = "px";

  @state()
  fontSizeValue = "11";

  @property({ type: Object })
  component: ComponentElement;

  handleValueChange(event: CustomEvent) {
    const {
      detail: { value },
    } = event;
    this.fontSizeValue = value;
    this.emitCustomEvent();
  }

  handleUnityChange(event: CustomEvent) {
    const {
      detail: {
        value: { label },
      },
    } = event;
    this.currentUnity = label;
    this.emitCustomEvent();
  }
  emitCustomEvent() {
    let customEvent = new CustomEvent("attributeUpdate", {
      detail: {
        value: `${this.fontSizeValue}${this.currentUnity}`,
      },
    });
    this.dispatchEvent(customEvent);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.initValues();
  }

  initValues() {
    this.currentUnity =
      (this.component.attributes as TextLabelAttributes).fontSize.match(
        /[a-zA-Z]+/g
      )[0] || "px";
  }

  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component") {
        this.initValues();
      }
    });
  }

  render() {
    return html` <div class="container">
      <hy-input
        type="number"
        palceholder="value"
        @valueChange=${this.handleValueChange}
        value=${Number(
          (this.component?.attributes as TextLabelAttributes)?.fontSize.match(
            /\d+/g
          )
        )}
      ></hy-input>
      <hy-dropdown
        .options=${[
          {
            label: "px",
          },
          { label: "rem" },
        ]}
        @change="${this.handleUnityChange}"
        ><div slot="label" class="unit">${this.currentUnity}</div></hy-dropdown
      >
    </div>`;
  }
}
