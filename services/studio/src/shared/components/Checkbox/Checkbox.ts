import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { executeCodeWithClosure } from "../../../core/Kernel.ts";
import { getNestedAttribute } from "../../../utils/object.utils.ts";

let HyCheckbox: any;
const loadHyCheckbox = async () => {
  if (!HyCheckbox) {
    const module = await import("@nuralyui/checkbox");
    HyCheckbox = module.default || module;
  }
};

@customElement("checkbox-block")
export class TextInputBlock extends BaseElementBlock {
  static styles = [
    css`
      :host {
      }
    `,
  ];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  unsubscribe: () => void;

  override async connectedCallback() {
    await super.connectedCallback();
    await loadHyCheckbox();
    this.registerCallback("value", () => {});
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  handleCheckboxChange = (e) => {
    if (this.component.event?.checkboxChanged) {
      executeCodeWithClosure(
        this.component,
        getNestedAttribute(this.component, `event.checkboxChanged`),
        { value: e.detail.value }
      );
    }
  };

  render() {
    const checkBoxStyles = this.component?.style || {};
    const checkboxAutoWidth = this.inputHandlersValue?.width;
    const checkboxAutoHeight = this.inputHandlersValue?.height;

    return html`
      ${!this.inputHandlersValue?.display || this.inputHandlersValue.display == "show"
        ? html`
            <hy-checkbox
              style=${styleMap({
                ...checkBoxStyles,
                width: checkboxAutoWidth ? "auto" : checkBoxStyles.width,
                height: checkboxAutoHeight ? "auto" : checkBoxStyles.height,
                "user-select": "none",
              })}
              .checked=${this.inputHandlersValue?.checked == "check"}
              .indeterminate=${this.inputHandlersValue?.checked == "indeterminate"}
              .disabled=${this.inputHandlersValue?.state == "disabled"}
              .size=${checkBoxStyles.size ?? nothing}
              @checkbox-changed=${this.handleCheckboxChange}
            >
              ${this.inputHandlersValue?.label ?? ""}
            </hy-checkbox>
          `
        : nothing}
    `;
  }
}