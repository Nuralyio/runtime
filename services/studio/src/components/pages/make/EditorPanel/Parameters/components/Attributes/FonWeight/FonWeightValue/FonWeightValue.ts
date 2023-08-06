import { ComponentElement } from "$store/component/interface";
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/input";
import "@hybridui/dropdown";
import "@hybridui/button";

@customElement("attribute-font-weight-value-handler")
export class AttributeFontWeightValueHandler extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

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

  @state()
  currentWeight = "400";

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
    return html` <hy-dropdown
      .options=${this.options}
      @change="${this.handleChange}"
      ><div slot="label" class="label">
        <hy-button icon="angle-down">
          <span style="margin-left : 5px;font-weight : ${this.currentWeight}">
            ${this.options.find((option) => option.value === this.currentWeight)
              .label || "normal"}</span
          >
        </hy-button>
      </div></hy-dropdown
    >`;
  }
}
