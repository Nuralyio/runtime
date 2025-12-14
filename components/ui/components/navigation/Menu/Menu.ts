import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

// Safely import @nuralyui/menu
try {
  await import("@nuralyui/menu");
} catch (error) {
  console.warn('[@nuralyui/menu] Package not found or failed to load. Menu functionality may be limited.');
}

import { BaseElementBlock } from "../../base/BaseElement.ts";
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
  component!: ComponentElement;

  constructor() {
    super();
  }

  override renderComponent() {
    return html`

        <nr-menu
                    ${ref(this.inputRef)}
     class="${`drop-${this.component.uuid}`}"

         
          placeholder="Select an option"
          size=${this.inputHandlersValue?.size ?? 'medium'}
          arrowPosition=${this.inputHandlersValue?.arrowPosition ?? 'right'}
          .items=${this.inputHandlersValue?.options ?? []}
          @change="${(e: CustomEvent) => {
            const selectedOptionPath = e.detail.path;
            const selectedPage = this.inputHandlersValue.options[selectedOptionPath[0]]?.id;
            const option = selectedOptionPath.reduce((acc: {
              children: { [x: string]: any; };
            }, curr: string | number) => acc && acc.children && acc.children[curr], { children: this.inputHandlersValue?.options });
            this.executeEvent('onSelect', e, {
              id: option?.id,
              text: option?.text,
              type: option?.type,
              page: selectedPage,
              path: selectedOptionPath,
              value: e.detail.value
            });
          }}"
          @action-click="${(e: CustomEvent) => {
            this.executeEvent('onActionClick', e, {
              value: e.detail.additionalData,
              action: e.detail.value
            });
          }}">
        </nr-menu>
    `;
  }
}
