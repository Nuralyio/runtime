import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { executeCodeWithClosure } from "@runtime/core/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";
import { ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";
// Removed static import
// import "@shared/ui/CodeEditor/CodeEditor";

@customElement("code-block")
export class TextInputBlock extends BaseElementBlock {
  static styles = [
    css`
      :host {
      }
      code-editor {
        display: block;
        height: 100px;
      }
    `
  ];

  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @state()
  private isEditorLoaded: boolean = false;

  override async connectedCallback() {
    await super.connectedCallback();
    if (!this.isEditorLoaded) {
      await import("@runtime/components/advanced/CodeEditor/CodeEditor");
      this.isEditorLoaded = true;
    }
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
      executeCodeWithClosure(
        this.component,
        /* js */ `
          try {
              const selectedComponent = Utils.first(Vars.selectedComponents);
              updateInput(selectedComponent, "value", "string", ${serializedValue}, null);
          } catch (error) {
              console.log(error);
          }
        `,
        {}
      );
    }
  }

  renderComponent() {
    return html`
      ${this.isEditorLoaded
        ? html`
            <code-editor
              @click=${(e) => {
                this.executeEvent("onClick", e);
              }}
              ${ref(this.inputRef)}
              style=${styleMap({
                ...this.getStyles(),
                display: "block"
              })}
              language="${this.inputHandlersValue?.language ?? "javascript"}"
              theme="${this.inputHandlersValue?.theme ?? "vs"}"
              .readonly=${this.inputHandlersValue?.readonly ?? this.isViewMode === true}
              @change=${(event: CustomEvent) => {
                const {
                  detail: { value }
                } = event;
                this.handleCodeEditorChange(value);
              }}
              .code=${this.inputHandlersValue?.value ?? ""}
            >
            </code-editor>
          `
        : html`<p>Loading editor...</p>`}
    `;
  }
}