import { type ComponentElement } from "$store/component/interface";
import { LitElement, html, css, type PropertyValueMap, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("attribute-font-weight-value-handler")
export class AttributeFontWeightValueHandler extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static defaultWeight = "400";

  @property({ type: Boolean })
  slim: boolean = false;  
  @state()
  options = [
    {
      label: "Very light",
      value: "100",
    },
    {
      label: "light",
      value: "300",
    },
    {
      label: "Normal",
      value: "400",
    },

    { label: "Bold", value: "700" },
  ];

  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component") {
        this.initValues();
      }
    });
  }

  initValues() {
    if (this.component.style?.fontWeight) {
      const { fontWeight } = this.component.style;
      this.currentWeight = fontWeight;
    } else {
      this.currentWeight = AttributeFontWeightValueHandler.defaultWeight;
    }
  }
  @state()
  currentWeight = AttributeFontWeightValueHandler.defaultWeight;

  static styles = [
    css`
      .label {
        cursor: pointer;
      }
    `,
  ];

  handleChange(event: CustomEvent) {
    const {
      detail: { value },
    } = event;
    this.currentWeight = value.value;
    this.emitCustomEvent();
  }
  emitCustomEvent() {
    let customEvent = new CustomEvent("attributeUpdate", {
      detail: {
        value: `${this.currentWeight}`,
      },
    });
    this.dispatchEvent(customEvent);
  }
  render() {
    return html` <attribute-input-wrapper
        .component=${{ ...this.component }}
        .attribute=${"fontWeight"}
      >
        <div>
          <hy-dropdown .options=${this.options} @change="${this.handleChange}"
            ><div slot="label" class="label">
              <hy-button icon="angle-down">
                <span
                  style="margin-left : 5px;font-weight : ${this.currentWeight}"
                >
                  ${this.options.find(
                    (option) => option.value === this.currentWeight
                  ).label || "normal"}</span
                >
              </hy-button>
            </div></hy-dropdown
          >
        </div>
      </attribute-input-wrapper>
      ${!this.slim ? html`  <smart-attribute-editor-dropdown
        .component=${{ ...this.component }}
        .attributeName=${"fontWeight"}
      ></smart-attribute-editor-dropdown>` : nothing}
    `;
  }
}
