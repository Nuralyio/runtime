import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/input";
import { type ComponentElement } from "$store/component/interface";
@customElement("parameters-container-direction-value-handler")
export class ParametersContainerDirectionValueHandler extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  label = "";
  @state()
  options = [
    {
      label: "horizontal",
      value: "horizontal",
    },
    {
      label: "vertical",
      value: "vertical",
    },
  ];

  static styles = [css``];

  handleValueChange(event: CustomEvent) {
    const {
      detail: { value },
    } = event;
    let customEvent = new CustomEvent("parametersUpdate", {
      detail: {
        value: value.value,
      },
    });
    this.label = value.value;
    this.dispatchEvent(customEvent);
  }
  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component") {
        this.initValues();
      }
    });
  }
  initValues() {
    this.label = this.component.input.direction ?? "";
    this.requestUpdate();
  }
  render() {
    return html`
      <hy-dropdown .options=${this.options} @change="${this.handleValueChange}"
        ><div slot="label" class="label">
          <hy-button icon="angle-down">
            <span>
              ${this.options.find((option) => option.value === this.label)
                ?.label || ""}</span
            >
          </hy-button>
        </div></hy-dropdown
      >
    `;
  }
}
