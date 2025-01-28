import { html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/select";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import "@nuralyui/icon";
import { executeCodeWithClosure } from "core/Kernel.ts";
import { getNestedAttribute } from "@utils/object.utils.ts";
import { eventDispatcher } from "@utils/change-detection.ts";


@customElement("icon-block")
export class IconBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Object })
  item: any;

  constructor() {
    super();
    this.registerCallback("icon", () => {
    });
  }
  override async connectedCallback() {
    await super.connectedCallback();

  }

  render() {
    const iconStyles = this.component?.style || {};
    const iconStyleHandlers = this.component?.styleHandlers ? Object.fromEntries(
      Object.entries(this.component?.styleHandlers).filter(([, value]) => value)) : {};

    return html`
      <hy-icon
      @click=${() => {
      if (this.component.event?.onClick) {
        executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onClick`),{}, this.item);
      }
    }}
        .name=${this.inputHandlersValue.icon ?? "smile"}
        style=${styleMap({ ...iconStyles, ...iconStyleHandlers })}>
      </hy-icon>
    `;
  }
}