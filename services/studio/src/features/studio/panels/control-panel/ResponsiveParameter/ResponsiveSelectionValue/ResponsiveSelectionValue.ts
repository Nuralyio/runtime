import { $currentPageViewPort } from "@shared/redux/store/page";
import { css, html, LitElement } from "lit";
import { state } from "lit/decorators.js";
import { setCurrentPageViewPort } from "@shared/redux/actions/page/setCurrentPageViewPort";

export class ResponsiveSelection extends LitElement {
  static override styles = [
    css`
            :host {
                display: block;
            }

            nr-radio-input{
              --nuraly-button-font-size : 15px;
            }
        `
  ];


  @state()
  label = "laptop";
  @state()
  options = [
    {
      label: "Laptop",
      value: "laptop",
      button: {
        icon: "laptop"
      }
    },
    {
      label: "Tablet",
      value: "tablet",
      button: {
        icon: "tablet"
      }
    },
    {
      label: "Mobile",
      value: "mobile",
      button: {
        icon: "mobile"
      }

    }
  ];

  constructor() {
    super();
    $currentPageViewPort.subscribe((viewPort) => {
        this.label = viewPort;
      }
    );
  }

  handleValueChange(event: CustomEvent) {
    const {
      detail: { value }
    } = event;
    let customEvent = new CustomEvent("parametersUpdate", {
      detail: {
        value: value.value
      }
    });
    this.label = value.value;
    this.dispatchEvent(customEvent);
  }

  override render() {
    return html`
        <nr-radio-input
      display="button"
      .selectedOption=${this.label}
      @change=${e => setCurrentPageViewPort(e.detail.value)}
      .options=${this.options}
    ></nr-radio-input>
       
        `;
  }
}

customElements.define("responsive-selectionl-parameter-value", ResponsiveSelection);