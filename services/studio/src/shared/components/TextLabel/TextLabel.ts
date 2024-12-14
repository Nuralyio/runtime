import { type ComponentElement } from "$store/component/interface.ts";
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { BaseElementBlock } from "../BaseElement.ts";
import { styles } from "./TextLabel.style.ts";
import { getNestedAttribute } from "@utils/object.utils.ts";
import { executeCodeWithClosure } from "../../../core/executer.ts";
import { updateComponentAttributes } from "$store/actions/component/updateComponentAttributes.ts";
import "@nuralyui/label";
import { setHoveredComponentIdAction } from "$store/actions/component/setHoveredComponentIdAction.ts";

@customElement("text-label-block")
export class TextLabelBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  currentPageViewPort: string;

  @state()
  viewPortStyles: any;

  static styles = styles;

  @state()
  components: ComponentElement[];

  @property({ type: Boolean })
  isViewMode = false;

  @property({ type: Object })
  item: any;

  @state()
  isEditable = false;

  @state()
  hoveredComponent: ComponentElement;
  override async connectedCallback() {
    await super.connectedCallback();
   
  }

  renderView() {
    const labelStyles = this.component?.style || {};
    const labelStyleHandlers = this.component?.styleHandlers
      ? Object.fromEntries(Object.entries(this.component?.styleHandlers)?.filter(([key, value]) => value))
      : {};
    const labelAutoWidth = this.inputHandlersValue?.width;
    const labelAutoHeight = this.inputHandlersValue?.height;

    const combinedStyles = {
      ...labelStyles,
      width: labelAutoWidth ? "auto" : labelStyles.width,
      height: labelAutoHeight ? "auto" : labelStyles.height,
      ...labelStyleHandlers,
    };

    return html`
      ${!this.inputHandlersValue?.display || (this.inputHandlersValue.value && this.inputHandlersValue.display === "show")
      ? html`
          <hy-label
            id=${this.component.uuid}
            contentEditable="${this.isEditable}"
            style=${styleMap(combinedStyles)}
            @click=${() => {
        if (this.component.event?.onClick) {
          executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onClick`));
        }
      }}
            @mouseenter=${() => {
        if (this.component?.event?.mouseEnter) {
          executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.mouseEnter`));
        }
      }}
            @mouseleave=${() => {
        if (this.component?.event?.mouseLeave) {
          executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.mouseLeave`));
        }
      }}
            @blur=${(e: Event) => {
        this.isEditable = false;
        const value = (e.target as HTMLElement).innerText;
        updateComponentAttributes(this.component.applicationId, this.component.uuid, "input", {
          value: {
            type: "value",
            value,
          },
        });
      }}
            @dblclick=${(e) => {
        e.preventDefault();
        this.isEditable = true;
      }}
          >${this.inputHandlersValue.value || "Text label"}</hy-label>
        `
      : nothing}
    `;
  }

  render() {
    return html`
      ${this.isViewMode
      ? this.renderView()
      : html`
          <resize-wrapper
            .component=${this.component}
            @mouseenter="${() => {
              setHoveredComponentIdAction(this.component?.uuid);
            }}"
            @mouseleave="${() => {
              setHoveredComponentIdAction(null);
            }}"
          >
            ${this.renderView()}
          </resize-wrapper>
        `}
    `;
  }
}