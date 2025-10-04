import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
// Lazy load instead of importing eagerly
// import "@shared/ui/CodeEditor/CodeEditor";

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
    marginLeft: "-550px",
    height: "250px",
    border: "solid 1px gray"
  };

  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  @state()
  data: string = "";

  @state()
  private isEditorLoaded: boolean = false;

  constructor() {
    super();
    this.handleCodeEditorChange = this.handleCodeEditorChange.bind(this);
  }

  async connectedCallback() {
    super.connectedCallback();

    // Lazy-load the code editor module
    if (!this.isEditorLoaded) {
      await import("@runtime/components/advanced/CodeEditor/CodeEditor");
      this.isEditorLoaded = true;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
  }

  render() {
    return html`
      <div style=${styleMap(this.containerStyle)}>
        ${this.isEditorLoaded
          ? html`
              <code-editor
                theme="vs"
                @change=${(event: CustomEvent) => {
                  const {
                    detail: { value }
                  } = event;
                  this.debounce(() => this.handleCodeEditorChange(value), 1000);
                }}
                .code=${this.value}
                language="javascript"
              ></code-editor>
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
    }, delay);
  }
}