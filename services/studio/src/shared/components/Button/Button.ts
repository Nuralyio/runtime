import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { executeCodeWithClosure } from "../../../core/Kernel.ts";
import { getNestedAttribute } from "../../../utils/object.utils.ts";
import { ref } from "lit/directives/ref.js";

let HyButton: any;
const loadHyButton = async () => {
  if (!HyButton) {
    const module = await import("@nuralyui/button");
    HyButton = module.default || module;
  }
};

@customElement("button-block")
export class ButtonBlock extends BaseElementBlock {
  static styles = [
    css`
      :host {
        --hybrid-button-icon-width: 19px;
      }
    `,
  ];

  @property({ type: Object })
  component: ComponentElement;

  @state()
  display: any = false;

  override async connectedCallback() {
    await super.connectedCallback();
    this.registerCallback("value", () => {});
    await loadHyButton();
  }

  renderComponent() {
    const buttonStyles = this.getStyles();
    return html`
            <hy-button
              ${ref(this.inputRef)}
              .size=${buttonStyles?.size
                ? buttonStyles.size
                : buttonStyles?.size
                ? buttonStyles.size
                : nothing}
              .type=${buttonStyles?.type
                ? buttonStyles.type
                : buttonStyles?.type
                ? buttonStyles.type
                : nothing}
              .disabled=${this.inputHandlersValue.state == "disabled"}
              .icon="${this.inputHandlersValue.icon ? [this.inputHandlersValue.icon] : nothing}"
              .iconPosition=${this.inputHandlersValue.iconPosition ?? nothing}
              @mousedown=${() => {

                if (this.component.event?.onClick) {
                  executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onClick`));
                }
              }}
              style=${styleMap({ ...this.getStyles() , 
                "--hybrid-button-width": buttonStyles?.width,
                "--hybrid-button-height": buttonStyles?.height,
                "--hybrid-button-local-border-top-left-radius": buttonStyles?.["border-top-left-radius"] ?? "",
                "--hybrid-button-local-border-top-right-radius": buttonStyles?.["border-top-right-radius"] ?? "",
                "--hybrid-button-local-border-bottom-left-radius": buttonStyles?.["border-bottom-left-radius"] ?? "",
                "--hybrid-button-local-border-bottom-right-radius": buttonStyles?.["border-bottom-right-radius"] ?? "",
                "--hybrid-button-margin-y": buttonStyles?.["margin-top"] ?? "",

               })}
            >
             <hy-label> ${this.inputHandlersValue.label ?? "Button"}</hy-label>
            </hy-button>
    `;
  }
}