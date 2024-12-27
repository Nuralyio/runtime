import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/select";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import "@nuralyui/icon";


@customElement("icon-block")
export class IconBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  override async connectedCallback() {
    await super.connectedCallback();
    this.registerCallback("value", () => {
      this.requestUpdate();
    });
  }


  render() {
    const iconStyles = this.component?.style || {};
    const iconStyleHandlers = this.component?.styleHandlers ? Object.fromEntries(
      Object.entries(this.component?.styleHandlers).filter(([, value]) => value)) : {};

    return html`
      <hy-icon
        .name=${this.inputHandlersValue.icon ?? "smile"}
        style=${styleMap({ ...iconStyles, ...iconStyleHandlers })}>
      </hy-icon>
    `;
  }
}