import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { executeCodeWithClosure } from "../../../core/executer.ts";
import { getNestedAttribute } from "@utils/object.utils.ts";
import "@nuralyui/divider"
@customElement("divider-block")
export class DividerBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  static styles = [
    css`
    :host { 
        width: 100%;
    }
    `,
  ];

  unsubscribe: () => void;

  override async connectedCallback() {
    await super.connectedCallback();
    this.registerCallback('value', () => {
      this.requestUpdate();
    })
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) this.unsubscribe();
  }

  handleDividerEvent = () => {
    if (this.component.event?.dividerInteracted) {
      executeCodeWithClosure(
        this.component,
        getNestedAttribute(this.component, `event.dividerInteracted`)
      )
    }
  }

  render() {
    const dividerStyles = this.component?.style || {};
    const dividerAutoWidth = this.inputHandlersValue?.width;
    const dividerAutoHeight = this.inputHandlersValue?.height;

    return html`
    ${!this.inputHandlersValue?.display || this.inputHandlersValue.display == 'show' ?
      html`
      <hy-divider
        style=${styleMap({
        ...dividerStyles,
        width: dividerAutoWidth ? '100%' : dividerStyles.width,
        height: dividerAutoHeight ? 'auto' : dividerStyles.height
      })}
        .color=${dividerStyles.color ?? nothing}
        .darkColor=${dividerStyles.darkColor ?? nothing}
        .lightColor=${dividerStyles.lightColor ?? nothing}
        .orientation=${this.inputHandlersValue?.orientation ?? 'horizontal'}
        .thickness=${dividerStyles.thickness ?? 1}
        @divider-interacted=${this.handleDividerEvent}
      ></hy-divider>
      ` : nothing}
    `;
  }
}