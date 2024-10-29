import { html, css, type PropertyValues, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { BaseElementBlock } from "../BaseElement";
import "@hybridui/input"
import { executeCodeWithClosure } from "core/executer";
import { getNestedAttribute } from "utils/object.utils";
import { setValue } from "$store/apps";


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
    setValue(this.component.name, "value", e.detail.value)
    if (this.component?.event?.valueChange) {
      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.valueChange`),{
        value: e.detail.value,
      });
      console.log(fn)
    }
  }, 0); // Adjust the debounce wait time as needed.
  onFocus=()=>{
    if(this.component?.event?.focus){
       const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.focus`));
    }
  }
  onBlur=(e)=>{
    if(this.component?.event?.blur){
      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.blur`));

    }
  }

  render() {
    const inputStyles = this.component?.style || {};
    const inputAutoWidth = this.inputHandlersValue?.width;
    const inputAutoHeight = this.inputHandlersValue?.height;
    const inputStyleHandlers = this.component?.styleHandlers?Object.fromEntries(
      Object.entries(this.component?.styleHandlers).filter(([key,value])=>value)): {}

    return html`
    <span style=${styleMap({...inputStyles,width:inputAutoWidth?'auto':inputStyles.width,height:inputAutoHeight?'auto':inputStyles.height,display:'block',...inputStyleHandlers})}> 
    <hy-input 
    style=${styleMap({...inputStyles,width:inputAutoWidth?'auto':inputStyles.width,height:inputAutoHeight?'auto':inputStyles.height})}
      @valueChange=${this.handleValueChange}
      @focused=${this.onFocus}
      @blured=${this.onBlur}
      .value=${this.inputHandlersValue.value ??""} 
      .size=${inputStyleHandlers?.size ?inputStyleHandlers?.size: inputStyles?.size?inputStyles?.size: nothing}
      .state =${inputStyleHandlers?.state ?inputStyleHandlers?.state: inputStyles?.state ?inputStyles?.state: nothing}
      .type=${this.inputHandlersValue.type??nothing}
      .disabled=${this.inputHandlersValue.state=='disabled'?true:false}
      placeholder=${this.inputHandlersValue.placeholder ??"Text input"}
      .min=${this.inputHandlersValue?.min??nothing}
      .max=${this.inputHandlersValue?.max??nothing}
    >
    <span slot="label" 
    style=${styleMap(
      {"--hybrid-input-label-color":inputStyleHandlers['--hybrid-input-label-color']??inputStyles['--hybrid-input-label-color'],
       "--hybrid-input-label-font-size":inputStyleHandlers['--hybrid-input-label-font-size']??inputStyles['--hybrid-input-label-font-size']
      })}>
    ${this.inputHandlersValue?.label??''}
    </span>
    <span slot="helper-text"
    style=${styleMap(
      {"--hybrid-input-helper-text-color":inputStyleHandlers['--hybrid-input-helper-text-color']??inputStyles['--hybrid-input-helper-text-color'],
       "--hybrid-input-helper-text-font-size":inputStyleHandlers['--hybrid-input-helper-text-font-size']??inputStyles['--hybrid-input-helper-text-font-size']
      })}
    >
    ${this.inputHandlersValue?.helper??''}
    </span>
    </hy-input>
  </span>
      
    `;
  }
}