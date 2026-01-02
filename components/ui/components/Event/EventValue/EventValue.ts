import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { css, html, isServer, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BaseElementBlock } from '../../base/BaseElement';
import { styleMap } from "lit/directives/style-map.js";
import { executeHandler } from '../../../../../handlers/handler-executor.ts';
import { getNestedAttribute } from '../../../../../utils/object.utils.ts';

  if (!isServer) {
    import("../../../../../../studio/panels/control-panel/shared/SmartAttribute/SmartAttributeHandler/SmartAttributeHandler.ts");
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

  @state() private isDropdownOpen = false;
  

  handleCodeChange = (e: CustomEvent) => {
    if (this.component?.event?.codeChange) {
      const fn = executeHandler(this.component, getNestedAttribute(this.component, `event.codeChange`), {
        value: e.detail.value
      });

    }
  };

  renderCodeEditorTemplate() {
    return html`
    <smart-attribute-handler
      .component=${{ ...this.component }}
      .attributeName=${this.resolvedInputs.value ? this.resolvedInputs.value[0] : nothing}
      .attributeValue=${this.resolvedInputs.value ? this.resolvedInputs.value[1] : nothing}
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
      position-strategy="fixed"
      style=${styleMap({
        "--nuraly-dropdown-max-width": "500px",
      })}
      @nr-dropdown-open=${() => { this.isDropdownOpen = true; }}
      @nr-dropdown-close=${() => { this.isDropdownOpen = false; }}
    >
        <nr-button
            slot="trigger"
        size=${"small"}
        .iconLeft=${"code"}
        style=${styleMap({
          "--nuraly-button-padding-small" : "0px",
          "--nuraly-button-min-width": "30px"
        })}
        iconPosition=${!this.resolvedInputs?.triggerText ? "left" : "right"}
         >${this.resolvedInputs?.triggerText ?? ""}</nr-button>

        <div slot="content" >
          ${this.isDropdownOpen ? this.renderCodeEditorTemplate() : nothing}
        </div>

      <nr-tooltip position=${this.resolvedInputs?.triggerText ? "left" : "right"} alignement=${"start"}>
        Set the value programmatically using Javascript script
      </nr-tooltip>
    </nr-dropdown>

     `;
  }
}
