import { html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeHandler } from "core/helper";
import { $context } from "$store/context/store";
import { BaseElementBlock } from "../BaseElement";

const isVerbose = import.meta.env.PUBLIC_VERBOSE;

// Debounce function with default wait time
function debounce(func, wait = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

@customElement("text-input-block")
export class TextInputBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  static styles = [
    css``,
  ];

  @state()
  thisvalue: any;
  unsubscribe: () => void;



  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  // Debounced event handler with default debounce wait time
  handleValueChange = debounce((e) => {
    if (this.component?.event?.valueChange) {
      executeHandler(
        {
          component: this.component,
          type: `event.valueChange`,
          extras: {
            EventData: {
              value: e.detail.value,
            },
          },
        }
      );
    }
  }, 300); // Adjust the debounce wait time as needed.

  render() {
    const inputStyles = this.component?.style || {};
    const inputValue = this.thisvalue ?? this.item?.value ?? "";

    return html`
      <span style=${styleMap(inputStyles)}> 
        <hy-input 
          @valueChange=${this.handleValueChange}
          .value=${inputValue}
          placeholder="Text input"
        ></hy-input>
      </span>
    `;
  }
}