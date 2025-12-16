import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { executeHandler } from '../../../../../state/runtime-context.ts';
import { ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";

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
      await import("../../advanced/CodeEditor/CodeEditor.ts");
      this.isEditorLoaded = true;
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
  }

  private handleCodeEditorChange(event: CustomEvent) {
    const value = event.detail.value;

    // Update the input value in editor mode
    if (!this.isViewMode) {
      const serializedValue = JSON.stringify(value);
      executeHandler(
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

    // Execute the onChange event handler
    this.executeEvent('onChange', event, { value });
  }

  renderComponent() {
    return html`
      ${this.isEditorLoaded
        ? html`
            <code-editor
              ${ref(this.inputRef)}
              style=${styleMap({
                ...this.getStyles(),
                display: "block"
              })}
              language="${this.inputHandlersValue?.language ?? "javascript"}"
              theme="${this.inputHandlersValue?.theme ?? "vs-dark"}"
              .readonly=${this.inputHandlersValue?.readonly ?? this.isViewMode === true}
              .code=${this.inputHandlersValue?.value ?? ""}
              @click=${(e: MouseEvent) => {
                this.executeEvent("onClick", e);
              }}
              @change=${(event: CustomEvent) => {
                this.handleCodeEditorChange(event);
              }}
              @editor-keydown=${(event: CustomEvent) => {
                this.executeEvent("onKeyDown", event, {
                  key: event.detail.key,
                  code: event.detail.code,
                  ctrlKey: event.detail.ctrlKey,
                  shiftKey: event.detail.shiftKey,
                  altKey: event.detail.altKey,
                  metaKey: event.detail.metaKey
                });
              }}
              @editor-keyup=${(event: CustomEvent) => {
                this.executeEvent("onKeyUp", event, {
                  key: event.detail.key,
                  code: event.detail.code,
                  ctrlKey: event.detail.ctrlKey,
                  shiftKey: event.detail.shiftKey,
                  altKey: event.detail.altKey,
                  metaKey: event.detail.metaKey
                });
              }}
            >
            </code-editor>
          `
        : html`<p>Loading editor...</p>`}
    `;
  }
}