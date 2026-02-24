import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import "@nuralyui/menu";
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

  override connectedCallback() {
    super.connectedCallback();
  }

  override renderComponent() {
    return html`

        <nr-menu
                    ${ref(this.inputRef)}
     class="${`drop-${this.component.uuid}`}"

         
          placeholder="Select an option"
          size=${this.resolvedInputs?.size ?? 'medium'}
          arrowPosition=${this.resolvedInputs?.arrowPosition ?? 'right'}
          .items=${this.resolvedInputs?.options ?? []}
          .onLabelEdit=${(detail: { path: number[]; oldValue: string; newValue: string }) => {
            const option = detail.path.reduce((acc: {
              children: { [x: string]: any; };
            }, curr: string | number) => acc && acc.children && acc.children[curr], { children: this.resolvedInputs?.options });
            this.executeEvent('onLabelEdit', undefined, {
              path: detail.path,
              oldValue: detail.oldValue,
              newValue: detail.newValue,
              item: option
            });
          }}
          @change="${(e: CustomEvent) => {
            const selectedOptionPath = e.detail.path;
            const selectedPage = this.resolvedInputs.options[selectedOptionPath[0]]?.id;
            const option = selectedOptionPath.reduce((acc: {
              children: { [x: string]: any; };
            }, curr: string | number) => acc && acc.children && acc.children[curr], { children: this.resolvedInputs?.options });
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
              value: e.detail.item?.additionalData,
              action: e.detail.value,
              originalEvent: e.detail.originalEvent,
              close: e.detail.close
            });
          }}"
          @label-edit="${(e: CustomEvent) => {
            const path = e.detail.path;
            const option = path.reduce((acc: {
              children: { [x: string]: any; };
            }, curr: string | number) => acc && acc.children && acc.children[curr], { children: this.resolvedInputs?.options });
            this.executeEvent('onLabelEdit', e, {
              path: e.detail.path,
              oldValue: e.detail.oldValue,
              newValue: e.detail.newValue,
              item: option
            });
          }}">
        </nr-menu>
    `;
  }
}
