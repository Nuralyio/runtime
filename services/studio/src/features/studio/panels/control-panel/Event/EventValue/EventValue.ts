import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isServer } from "@shared/utils/envirement.ts";
import { executeCodeWithClosure } from "@runtime/core/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { styleMap } from "lit/directives/style-map.js";
import { BaseElementBlock } from "@runtime/components/base/BaseElement.ts";

setTimeout(() => {
  if (!isServer) {
    import("../../shared/SmartAttribute/SmartAttributeHandler/SmartAttributeHandler");
  }

});

@customElement("parameter-event-handler")
export class ParameterEventLabel extends BaseElementBlock {
  static styles = [
    css`
      :host {
        display: block;
      }
    `
  ];
  @property()
  component: ComponentElement;

  handleCodeChange = (e: CustomEvent) => {
    if (this.component?.event?.codeChange) {
      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.codeChange`), {
        value: e.detail.value
      });

    }
  };

  renderCodeEditorTemplate() {
    return html`<smart-attribute-handler
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
  
    <hy-dropdown
      placeholder="Select an option"
      @closed=${() => {
    }}
      .template=${this.renderCodeEditorTemplate()}
    >
        <hy-button 
          
        style=${styleMap(
      {
        "--hybrid-button-text-color": "#b8b8b8",
        "--hybrid-button-height": "39px",
        "--hybrid-button-width": this.inputHandlersValue?.triggerText ? "auto" : "30px",
        "--hybrid-button-background-color": "transparent",
        "--hybrid-button-border-left": "none",
        "--hybrid-button-border-right": "none",
        "--hybrid-button-border-top": "none",
        "--hybrid-button-border-bottom": "none"

      })}
        .icon=${["code"]} 
         class="unit"
        iconPosition=${!this.inputHandlersValue?.triggerText ? "left" : "right"}
         >${this.inputHandlersValue?.triggerText ?? ""}</hy-button>
      <hy-tooltip position=${this.inputHandlersValue?.triggerText ? "left" : "right"} alignement=${"start"}>
        Set the value programmatically using Javascript script
      </hy-tooltip>
    </hy-dropdown>
  
     `;
  }
}
