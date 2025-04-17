import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { executeCodeWithClosure } from "../../../core/Kernel.ts";
import { getNestedAttribute } from "../../../utils/object.utils.ts";
import { ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";

import "../RichText/RichTextEditor.ts";



@customElement("code-block")
export class TextInputBlock extends BaseElementBlock {
    static styles = [
        css`
      :host {
      }
      code-editor{
        display:block;
        height:100px
      }
    `,
    ];

    @property({ type: Object })
    component: ComponentElement;

    @property({ type: Object })
    item: any;


    override async connectedCallback() {
        await super.connectedCallback();
    }

    override disconnectedCallback() {
        super.disconnectedCallback();
    }

    handleCheckboxChange = (e) => {
        if (this.component.event?.checkboxChanged) {
            executeCodeWithClosure(
                this.component,
                getNestedAttribute(this.component, `event.onCodeChange`),
                { value: e.detail.value }
            );
        }
    };

    private handleCodeEditorChange(value: string) {
        if (!this.isViewMode) {
            const serializedValue = JSON.stringify(value);
            executeCodeWithClosure(this.component,
                /* js */ `
                  try {
                      const selectedComponent = Utils.first(Vars.selectedComponents);
                      updateInput(selectedComponent, "value", "string", ${serializedValue}, null);
                  } catch (error) {
                      console.log(error);
                  }
                `, {});
        }
    }
    renderComponent() {

        return html`
      <code-editor
      @click=${(e) => {
                this.executeEvent("onClick", e);
            }   
      }
      ${ref(this.inputRef)}
      style=${styleMap({
            ...this.getStyles(),
            display: "block",
        })
            }
            language="${this.inputHandlersValue?.language ?? "javascript"}"
      theme="${this.inputHandlersValue?.theme ?? "vs"}"
                   ${ref(this.inputRef)}
        .readonly=${this.inputHandlersValue?.readonly ?? this.isViewMode === true}
          @change=${(event: CustomEvent) => {
                const {
                    detail: { value }
                } = event;
                this.handleCodeEditorChange(value)
            }}
          .code=${this.inputHandlersValue?.value ?? ""}
          language="javascript"
        >
        </code-editor>

          
    `;
    }
}