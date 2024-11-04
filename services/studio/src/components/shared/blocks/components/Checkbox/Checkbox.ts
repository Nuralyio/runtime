import { html, css, type PropertyValues, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface";
import { BaseElementBlock } from "../BaseElement";
import "@hybridui/checkbox"
import { executeCodeWithClosure } from "core/executer";
import { getNestedAttribute } from "utils/object.utils";


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

  override connectedCallback() {
    super.connectedCallback();
    this.registerCallback('value', (v) => {
      this.requestUpdate();
    })
  }



  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  handleCheckboxChange = (e) => {
    if (this.component.event?.checkboxChanged) {
      executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.checkboxChanged`),{value:e.detail.value}) 
    }
  }

  render() {
    const checkBoxStyles = this.component?.style || {};
    const checkboxAutoWidth = this.inputHandlersValue?.width;
    const checkboxAutoHeight = this.inputHandlersValue?.height;
    return html`
    ${!this.inputHandlersValue?.display||this.inputHandlersValue.display =='show'?
    html`
    <hy-checkbox 
    style=${styleMap({...checkBoxStyles,width:checkboxAutoWidth?'auto':checkBoxStyles.width,height:checkboxAutoHeight?'auto':checkBoxStyles.height})}
    .checked=${this.inputHandlersValue?.checked =='check'?true:false}
    .indeterminate=${this.inputHandlersValue?.checked =='indeterminate'?true:false}
    .disabled=${this.inputHandlersValue?.state =='disabled'?true:false}
    .size=${checkBoxStyles.size ?? nothing}
    @checkbox-changed=${this.handleCheckboxChange}
    >${this.inputHandlersValue?.label??''}</hy-checkbox>
      `:nothing}
     
    `;
  }
}