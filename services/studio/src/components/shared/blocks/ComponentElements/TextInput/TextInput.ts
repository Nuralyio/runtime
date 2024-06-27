import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@hybridui/input";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeEventHandler } from "core/engine";
import { executeValueHandler } from "core/helper";
import { $context } from "$store/context/store";

const isVerbose = import.meta.env.PUBLIC_VERBOSE;

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

@customElement("text-input-block")
export class TextInputBlock extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  static styles = [
    css`
      :host {
      }
    `,
  ];

  @state()
  thisvalue: any;

  updateValue() {
    executeValueHandler(this.component)
      .onmessage = (event) => {
        if (event.data.result) {
          this.thisvalue = event.data.result;
        }
      }

  }
  override connectedCallback() {
    super.connectedCallback();
    this.updateValue();
    $context.subscribe((context) => {
      if (this.component) {
        this.updateValue();
      }
    }
    )
  }
  // Debounced event handler
  handleValueChange = debounce((e) => {
    if (this.component.event.valueChange) {
      // Pass data into the function.
      // Use custom JS to update data.
      executeEventHandler(this.component, "event", "valueChange", {
        EventData: {
          value: e.detail.value,
        },
      });
    }
  }, 0); // Adjust the debounce wait time as needed.

  render() {
    return html`
      <span style=${styleMap({ ...this.component.style })}> 
        <hy-input 
          @valueChange=${this.handleValueChange}
          .value=${this.thisvalue ?? this.item.value ?? ""}
          placeholder="Text input"
        ></hy-input>
      </span>
    `;
  }
}