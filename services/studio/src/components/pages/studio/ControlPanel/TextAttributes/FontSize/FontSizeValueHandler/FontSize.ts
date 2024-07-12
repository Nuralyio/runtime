import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/input";
import "@hybridui/dropdown";
import { type ComponentElement } from "$store/component/interface";
import "../../../shared/SmartAttribute/SmartAttributeDropdown/SmartAttributeDropdown";
import "../../../shared/AttributeInputWrapper/AttributeInputWrapper";
import styles from "./FontSize.style";
import { $currentPageViewPort } from "$store/page/store";

@customElement("attribute-font-size-value-handler")
export class AttributeFontSizeValue extends LitElement {
  @property({ type: Object })
  component: ComponentElement;


  @property({ type: Boolean })
  slim: boolean = false;


  static styles = styles;

  @state()
  currentUnity = "px";

  @state()
  fontSizeValue = "11";

  @state()
  viewPort = null;
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
    
    $currentPageViewPort.subscribe((viewPort) => {
      if (viewPort) {
        this.viewPort = viewPort;
      }
    });
  }

  initValues() {
    if (typeof this.component.style?.fontSize === "string")
      this.currentUnity =
        this.component.style.fontSize?.match(/[a-zA-Z]+/g)[0] || "px";
  }

  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component") {
        this.initValues();
      }
    });
  }

  resetStyle(){
    let customEvent = new CustomEvent("attributeUpdate", {
      detail: {
        value: null,
      },
    });
    this.dispatchEvent(customEvent);
  }

  drivenByResponsive() {
    if (this.component?.styleBreakPoints?.[this.viewPort]?.fontSize) {
      return this.viewPort; 
    }
    else {
      return "";
    }
  }
  // check if the values are driven by responsive
  getValue(){
    if (this.component?.styleBreakPoints?.[this.viewPort]?.fontSize) {
      return this.component?.styleBreakPoints?.[this.viewPort]?.fontSize.match(/\d+/g);
    }
    else {
      return this.component?.style?.fontSize?.match(/\d+/g);
    }
  }

  render() {
    return html` <div class="container">
      <attribute-input-wrapper
        .component=${{ ...this.component }}
        .attribute=${"fontSize"}
      >
        <hy-input
          type="number"
          palceholder="value"
          @valueChange=${this.handleValueChange}
          value=${this.getValue() || 16}
        ></hy-input>
        <hy-dropdown
          .options=${[
        {
          label: "px",
        },
        { label: "rem" },
      ]}
          @change="${this.handleUnityChange}"
          ><div slot="label" class="unit">
            ${this.currentUnity}
          </div></hy-dropdown
        >
      </attribute-input-wrapper>
          ${!this.slim ? html`
          <smart-attribute-editor-dropdown
        .component=${{ ...this.component }}
        .attributeName=${"fontSize"}
        .attributeScope=${"style"}
        .handlerScope=${"styleHandlers"}
      ></smart-attribute-editor-dropdown>
      ` : nothing}
      <br/>
    </div>
     ${this.drivenByResponsive() ? html`<div style="font-size : 11px; margin-top : 4px">Driven by : ${this.drivenByResponsive()} break point <hy-icon name="undo" @click="${this.resetStyle}" class="redo" > </hy-icon></div>` :nothing}
    `;
  }
}
