import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/input";
import "@hybridui/dropdown";
import { ComponentElement } from "$store/component/interface";
import "../../../shared/SmartAttribute/SmartAttributeDropdown/SmartAttributeDropdown";
import "../../../shared/AttributeInputWrapper/AttributeInputWrapper";
import styles from "./FontSizeValue.style";

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

  render() {
    return html` <div class="container">
      <div></div>
      <attribute-input-wrapper
        .component=${{ ...this.component }}
        .attribute=${"fontSize"}
      >
        <hy-input
          type="number"
          palceholder="value"
          @valueChange=${this.handleValueChange}
          value=${Number(this.component?.style?.fontSize?.match(/\d+/g)) ||16}
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
      
    </div>`;
  }
}
