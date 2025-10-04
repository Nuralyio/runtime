import type { ComponentElement } from "@shared/redux/store/component/interface.ts";
import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@nuralyui/menu/templates/hy-sub-menu.js";
import "@nuralyui/menu/templates/hy-menu-link.js";
import { BaseElementBlock } from "../BaseElement.ts";
import { executeCodeWithClosure } from "@runtime/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { styleMap } from "lit/directives/style-map.js";
import { EMPTY_STRING } from "@shared/utils/constants.ts";
import { ref } from "lit/directives/ref.js";
import "@nuralyui/menu";

@customElement("menu-block")
export class MenuBlock extends BaseElementBlock {

  static override styles = [
    css`
        hy-menu {
            --hybrid-menu-width: 100%;

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
      
        <hy-menu
                    ${ref(this.inputRef)}

          style=${styleMap({ ...this.getStyles(), 
            display : 'block',
           })}
          placeholder="Select an option"
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
        </hy-menu>
    `;
  }
}
