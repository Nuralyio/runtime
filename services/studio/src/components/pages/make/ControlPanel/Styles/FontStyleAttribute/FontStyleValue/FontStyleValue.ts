import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@hybridui/radio";
import "@hybridui/icon";
import { RadioOption } from "@hybridui/radio/radio.type.js";
import {
  ComponentElement,
  TextLabelAttributes,
} from "$store/component/interface";
@customElement("attribute-font-style-value-handler")
export class FOntSTyleVAlue extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Boolean })
  slim: boolean = false;
  
  @state()
  options: RadioOption[] = [
    {
      label: "",
      value: "italic",
      button: {
        icon: "italic",
      },
    },
    {
      label: "",
      value: "underline",
      button: {
        icon: "underline",
      },
    },
    {
      label: "",
      value: "line-through",
      button: {
        icon: "minus",
      },
    },
  ];
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  @state()
  textDecoration;
  handleUnityChange(event: CustomEvent) {
    const {
      detail: { value },
    } = event;
    this.textDecoration = value;
    this.emitCustomEvent();
  }

  emitCustomEvent() {
    let customEvent = new CustomEvent("attributeUpdate", {
      detail: {
        value: `${this.textDecoration}`,
      },
    });
    this.dispatchEvent(customEvent);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.initValues();
  }

  i;
  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component") {
        this.initValues();
      }
    });
  }

  initValues() {
    if ((this.component.style as TextLabelAttributes)?.textDecoration) {
      const { textDecoration } = this.component.style as TextLabelAttributes;
      this.textDecoration = textDecoration;
    } else {
      this.textDecoration = "none";
    }
  }

  render() {
    return html` <hy-radio-input
      display="button"
      .defaultValue=${this.textDecoration}
      @change=${this.handleUnityChange}
      .options=${this.options}
    ></hy-radio-input>`;
  }
}
