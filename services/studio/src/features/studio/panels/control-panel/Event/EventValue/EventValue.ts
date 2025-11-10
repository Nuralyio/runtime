import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { css, html, isServer, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { BaseElementBlock } from "@runtime/components/base/BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";
import { executeCodeWithClosure } from "@features/runtime/kernel/ExecuteCode";
import { getNestedAttribute } from "@shared/utils/object.utils";

  if (!isServer) {
    import("../../shared/SmartAttribute/SmartAttributeHandler/SmartAttributeHandler");
  }

@customElement("parameter-event-handler")
export class ParameterEventLabel extends BaseElementBlock {
  static styles = [
    css`
      :host {
        display: block;
      }
    `
  ];
  @property({ type: Object })
  component: ComponentElement;
  

  handleCodeChange = (e: CustomEvent) => {
    if (this.component?.event?.codeChange) {
      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.codeChange`), {
        value: e.detail.value
      });

    }
  };

  renderCodeEditorTemplate() {
    return html`
    <smart-attribute-handler
      .component=${{ ...this.component }}
      .attributeName=${this.inputHandlersValue.value ? this.inputHandlersValue.value[0] : nothing}
      .attributeValue=${this.inputHandlersValue.value ? this.inputHandlersValue.value[1] : nothing}
      .attributeScope=${"event"}
      .handlerScope=${"event"}
      @code-change=${this.handleCodeChange}
    ></smart-attribute-handler>`;
  }

  render() {
    return html`
  
    <nr-dropdown
      trigger="click"
      placement="left"
      style=${styleMap({
        "--nuraly-dropdown-max-width": "500px",
      })}
    >
        <nr-button 
            slot="trigger"
        size=${"small"}
        .iconLeft=${"code"} 
        style=${styleMap({
          "--nuraly-button-padding-small" : "0px",
          "--nuraly-button-min-width": "30px"
        })}
        iconPosition=${!this.inputHandlersValue?.triggerText ? "left" : "right"}
         >${this.inputHandlersValue?.triggerText ?? ""}</nr-button>
        
        <div slot="content" >
          ${this.renderCodeEditorTemplate()}
        </div>
      
      <nr-tooltip position=${this.inputHandlersValue?.triggerText ? "left" : "right"} alignement=${"start"}>
        Set the value programmatically using Javascript script
      </nr-tooltip>
    </nr-dropdown>
  
     `;
  }
}
