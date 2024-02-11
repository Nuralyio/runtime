import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@hybridui/radio";
import "@hybridui/icon";
import { type RadioOption } from "@hybridui/radio/radio.type.js";
import {
  type ComponentElement,
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

  @state()
  fontStyle;

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
        value: {
          textDecoration: this.textDecoration,
          fontStyle: this.fontStyle,
        }
      },
    });
    this.dispatchEvent(customEvent);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.initValues();
  }

  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component") {
        this.initValues();
      }
    });
  }

  initValues() {
    if ((this.component.style)?.textDecoration) {
      const { textDecoration, fontStyle} = this.component.style;
      this.textDecoration = textDecoration;
      this.fontStyle = fontStyle;
    } else {
      this.textDecoration = "none";
      this.fontStyle = "";
    }
  }

  render() {
    return html` 
    <hy-button
    .type=${this.fontStyle === "italic" ? "primary" : ""}
    
    icon="italic" @click=${() => {
      if(this.fontStyle === "italic"){
        this.fontStyle = "";
        this.emitCustomEvent();
      }else{
        this.fontStyle = "italic";
        this.emitCustomEvent();
      }
    }
    }></hy-button>

    <hy-button 
    .type=${this.textDecoration === "underline" ? "primary" : ""}
    icon="underline" @click=${() => {
     if(this.textDecoration === "underline"){
        this.textDecoration = "none";
        this.emitCustomEvent();
      }else{
        this.textDecoration = "underline";
        this.emitCustomEvent();
      }
    } 
    }></hy-button>

    <hy-button
    .type=${this.textDecoration === "line-through" ? "primary" : ""}
    icon="minus" @click=${() => {
      if(this.textDecoration === "line-through"){
        this.textDecoration = "none";
        this.emitCustomEvent();
      }else{
        this.textDecoration = "line-through";
        this.emitCustomEvent();
      }
    }
    }></hy-button>`;
  }
}
