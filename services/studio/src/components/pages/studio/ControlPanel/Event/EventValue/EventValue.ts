import { type ComponentElement } from "$store/component/interface";
import { BaseElementBlock } from "components/shared/blocks/components/BaseElement";
import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isServer } from "utils/envirement";
import "@nuralyui/dropdown";
import { executeCodeWithClosure } from "core/executer";
import { getNestedAttribute } from "utils/object.utils";
import { styleMap } from "lit/directives/style-map.js";
setTimeout(() => {
  if(!isServer)
  { 
    import('../../shared/SmartAttribute/SmartAttributeHandler/SmartAttributeHandler')  
  }
  
});

@customElement("parameter-event-handler")
export class ParameterEventLabel extends BaseElementBlock {
  @property()
  component: ComponentElement;
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  handleCodeChange=(e:CustomEvent)=>{
    if (this.component?.event?.codeChange) {
      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.codeChange`),  {
        value: e.detail.value,
      });

    }
  }
  renderCodeEditorTemplate() {
    return html`<smart-attribute-handler
      .component=${{ ...this.component }}
      .attributeName=${this.inputHandlersValue.value?this.inputHandlersValue.value[0]:nothing}
      .attributeValue=${this.inputHandlersValue.value?this.inputHandlersValue.value[1]:nothing}
      .attributeScope=${"event"}
      .handlerScope=${"event"}
      @code-change=${this.handleCodeChange}
    ></smart-attribute-handler>`;
  }

  render() {
    return html` 
    <hy-dropdown
      placeholder="Select an option"
      @closed=${() => {}}
      .template=${this.renderCodeEditorTemplate()}
    >
        <hy-button 
        style=${styleMap(
          {'--hybrid-button-height':'30px',
          '--hybrid-button-width':'30px',
          '--hybrid-button-border-top-left-radius':'5px',
          '--hybrid-button-border-top-right-radius':'5px',
          '--hybrid-button-border-bottom-left-radius':'5px',
          '--hybrid-button-border-bottom-right-radius':'5px',
          '--hybrid-button-icon-width':'12px',
          '--hybrid-button-icon-height':'12px'
        
        })}
        .icon=${['code']} 
         type="text" 
         class="unit"
         >${this.inputHandlersValue?.triggerText??""}</hy-button>
    </hy-dropdown>
     `;
  }
}
