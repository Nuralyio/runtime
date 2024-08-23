import { html, css, type PropertyValues, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { executeHandler } from "core/helper";
import { BaseElementBlock } from "../BaseElement";
import "@hybridui/checkbox"
const isVerbose = import.meta.env.PUBLIC_VERBOSE;

// Debounce function with default wait time
function debounce(func, wait = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

@customElement("checkbox-block")
export class TextInputBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  static styles = [
    css``,
  ];

 
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
    const checkBoxStyles = this.component?.style || {};
    return html`
     <hy-checkbox 
     .checked=${this.inputHandlersValue?.checked =='check'?true:false}
     .disabled=${this.inputHandlersValue?.state =='disable'?true:false}
     .size=${checkBoxStyles.size ?? nothing}
     >${this.inputHandlersValue?.label??''}</hy-checkbox>
    `;
  }
}