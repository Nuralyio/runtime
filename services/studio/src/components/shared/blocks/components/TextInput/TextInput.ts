import { html, css, type PropertyValues, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { BaseElementBlock } from "../BaseElement";
import { executeEventHandler } from "core/engine";
import "@hybridui/input"


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
      executeEventHandler(this.component,'event','valueChange',{
        EventData: {
          value: e.detail.value,
        },
      })
    }
  }, 300); // Adjust the debounce wait time as needed.
  onFocus=()=>{
    if(this.component?.event?.focus){
      executeEventHandler(this.component,'event','focus')
    }
  }
  onBlur=(e)=>{
    if(this.component?.event?.blur){
      executeEventHandler(this.component,'event','blur')
    }
  }

  render() {
    const inputStyles = this.component?.style || {};
    const inputAutoWidth = this.inputHandlersValue?.width;
    const inputAutoHeight = this.inputHandlersValue?.height;
    return html`
    <span style=${styleMap({...inputStyles,width:inputAutoWidth?'auto':inputStyles.width,height:inputAutoHeight?'auto':inputStyles.height,display:'block'})}> 
    <hy-input 
      @valueChange=${this.handleValueChange}
      @focused=${this.onFocus}
      @blured=${this.onBlur}
      .value=${this.inputHandlersValue.value ??""} 
      .size=${inputStyles.size ?? nothing}
      .state =${inputStyles.state ?? nothing}
      .type=${this.inputHandlersValue.type??nothing}
      .disabled=${this.inputHandlersValue.state=='disabled'?true:false}
      placeholder=${this.inputHandlersValue.placeholder ??"Text input"}
    >
    <span slot="label">${this.inputHandlersValue?.label??''}</span>
    <span slot="helper-text">${this.inputHandlersValue?.helper??''}</span>
    </hy-input>
  </span>
      
    `;
  }
}