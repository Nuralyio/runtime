import { type ComponentElement } from "$store/component/interface";
import { BaseElementBlock } from "components/shared/blocks/components/BaseElement";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isServer } from "utils/envirement";
import "@hybridui/dropdown";
import { executeEventHandler } from "core/engine";
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
    if (this.component.event.codeChange) {
      executeEventHandler(this.component,'event','codeChange',{
        EventData: {
          value: e.detail.value,
        },
      });
    }
  }
  renderCodeEditorTemplate() {
    return html`<smart-attribute-handler
      .component=${{ ...this.component }}
      .attributeName=${this.inputHandlersValue.value}
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
        <hy-button icon="code" type="text" class="unit">handler</hy-button>
    </hy-dropdown>
     `;
  }
}
