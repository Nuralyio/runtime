import type { ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@nuralyui/menu";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { executeCodeWithClosure } from "@runtime/core/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { styleMap } from "lit/directives/style-map.js";
import { EMPTY_STRING } from "@shared/utils/constants.ts";
import { ref } from "lit/directives/ref.js";

@customElement("menu-block")
export class MenuBlock extends BaseElementBlock {

  static override styles = [
    css`
        nr-menu {
            --nuraly-menu-width: 100%;

        }
        :host {
            display: block;
        }
        .error {
            color: red;
            background-color: black;
            font-size: smaller;
        }
    `
  ];
  @property({ type: Object, reflect: false })
  component: ComponentElement;
  @state()
  error: string = EMPTY_STRING;
  @state()
  options = [
    {
      text: "Pages",
      id: "pages",
      children: []
    }
  ];
  @state()
  components: ComponentElement[] = [];

  constructor() {
    super();
  }

  onActionClick(e) {
    console.log(e)
    if (this.component?.event?.actionClick) {
      executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.actionClick`), {
        value : e.detail.additionalData,
        action : e.detail.value
      })
    }

  }


  override renderComponent() {
    return html`
      
        <nr-menu
                    ${ref(this.inputRef)}

          style=${styleMap({ ...this.getStyles(), 
            display : 'block',
           })}
          placeholder="Select an option"
          size=${this.inputHandlersValue?.size ?? 'medium'}
          .items=${this.inputHandlersValue?.options ?? []}
          @action-click=${this.onActionClick}
          @change="${(customEvent: CustomEvent) => {
      const selectedOptionPath = customEvent.detail.path;
      const selectedPage = this.inputHandlersValue.options[selectedOptionPath[0]]?.id;
      const option = selectedOptionPath.reduce((acc: {
        children: { [x: string]: any; };
      }, curr: string | number) => acc && acc.children && acc.children[curr], { children: this.inputHandlersValue?.options });
      executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.onSelect`), {
        id: option.id,
        text: option.text,
        type: option.type,
        page: selectedPage
      });
    }}">
        </nr-menu>
    `;
  }
}
