import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import "@nuralyui/checkbox";
import { executeCodeWithClosure } from "../../../core/executer.ts";
import { getNestedAttribute } from "../../../utils/object.utils.ts";


@customElement("checkbox-block")
export class TextInputBlock extends BaseElementBlock {
  static styles = [
    css``
  ];
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Object })
  item: any;
  unsubscribe: () => void;

  override async connectedCallback() {
    await super.connectedCallback();
    this.registerCallback("value", () => {
      this.requestUpdate();
    });
  }


  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  handleCheckboxChange = (e) => {
    if (this.component.event?.checkboxChanged) {
      executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.checkboxChanged`), { value: e.detail.value });
    }
  };

  render() {
    const checkBoxStyles = this.component?.style || {};
    const checkboxAutoWidth = this.inputHandlersValue?.width;
    const checkboxAutoHeight = this.inputHandlersValue?.height;
    return html`
    ${!this.inputHandlersValue?.display || this.inputHandlersValue.display == "show" ?
      html`
    <hy-checkbox 
    style=${styleMap({
        ...checkBoxStyles,
        width: checkboxAutoWidth ? "auto" : checkBoxStyles.width,
        height: checkboxAutoHeight ? "auto" : checkBoxStyles.height
      })}
    .checked=${(this.inputHandlersValue?.checked == "check")}
    .indeterminate=${(this.inputHandlersValue?.checked == "indeterminate")}
    .disabled=${(this.inputHandlersValue?.state == "disabled")}
    .size=${checkBoxStyles.size ?? nothing}
    @checkbox-changed=${this.handleCheckboxChange}
    >${this.inputHandlersValue?.label ?? ""}</hy-checkbox>
      ` : nothing}
     
    `;
  }
}