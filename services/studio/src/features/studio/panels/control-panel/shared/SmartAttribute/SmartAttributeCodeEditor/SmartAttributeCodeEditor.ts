import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
// Import NuralyUI Code Editor component
import "@nuralyui/code-editor";
import Editor from "../../../../../../runtime/state/editor";
@customElement("smart-attribute-codeeditor")
export class SmartAttributeCodeeditor extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `
  ];

  @property()
  value: string;

  @property({ type: Object })
  containerStyle: any = {
    background: "white",
    width: "700px",
    height: "250px",
  };

  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  @state()
  data: string = "";

  @state()
  private isEditorLoaded: boolean = true;

  constructor() {
    super();
    this.handleCodeEditorChange = this.handleCodeEditorChange.bind(this);
  }

  // No dynamic import needed; CodeEditor is statically registered above

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    // Clear the flag when the component is removed
    Editor.isEditingHandler = false;
  }

  render() {
    return html`
      <div style=${styleMap(this.containerStyle)}>
        ${this.isEditorLoaded
          ? html`
              <nr-code-editor
                theme="vs"
                @nr-change=${(event: CustomEvent) => {
                  const {
                    detail: { value }
                  } = event;
                  this.debounce(() => this.handleCodeEditorChange(value), 1000);
                }}
                @nr-focus=${() => { Editor.isEditingHandler = true; }}
                @nr-blur=${() => {
                  // Only clear the flag if no debounce is pending
                  // This prevents the editor from closing while a save is in progress
                  if (!this.debounceTimeout) {
                    Editor.isEditingHandler = false;
                  }
                }}
                .code=${this.value}
                language="javascript"
              ></nr-code-editor>
            `
          : html`<p>Loading editor...</p>`}
        <markdown-renderer markdown=${this.data}></markdown-renderer>
      </div>
    `;
  }

  private handleCodeEditorChange(value: string) {
    const submitEvent = new CustomEvent("change", {
      detail: { value },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(submitEvent);
  }

  private debounce(callback: Function, delay: number) {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.debounceTimeout = setTimeout(() => {
      this.debounceTimeout = null;
      callback();
      // Keep the flag true for a short time after save to allow the update to complete
      // without triggering tab regeneration
      setTimeout(() => {
        // Only clear if no new debounce has started
        if (!this.debounceTimeout) {
          Editor.isEditingHandler = false;
        }
      }, 500);
    }, delay);
  }
}