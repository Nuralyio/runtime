import { css, html, nothing, type PropertyValueMap, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { executeCodeWithClosure } from "../../../core/Kernel.ts";
import { getNestedAttribute } from "../../../utils/object.utils.ts";
import { eventDispatcher } from "@utils/change-detection.ts";

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

  protected firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    eventDispatcher.on(`component-property-changed:${String(this.component.name)}`, (data) => {
     this.traitInputsHandlers();
      this.requestUpdate()
    });
  }
  render() {
    if(!this.shouldDisplay) return nothing;
    const buttonStyles = this.component?.style || {};
    const buttonStyleHandlers = this.component?.styleHandlers
      ? Object.fromEntries(Object.entries(this.component.styleHandlers).filter(([key, value]) => value))
      : {};

    return html`
            <hy-button
              .size=${buttonStyleHandlers?.size
                ? buttonStyleHandlers.size
                : buttonStyles?.size
                ? buttonStyles.size
                : nothing}
              .type=${buttonStyleHandlers?.type
                ? buttonStyleHandlers.type
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
              style=${styleMap({ ...buttonStyles, ...buttonStyleHandlers })}
            >
              ${this.inputHandlersValue.label ?? "Button"}
            </hy-button>
    `;
  }
}