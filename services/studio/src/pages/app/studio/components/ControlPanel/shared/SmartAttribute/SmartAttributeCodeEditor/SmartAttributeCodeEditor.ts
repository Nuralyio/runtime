import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import "@shared/components/CodeEditor/CodeEditor";

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
    width: "700px",
    marginLeft: "-400px",
    height: "250px",
    border: "solid 1px gray"
  };

  private debounceTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    this.handleCodeEditorChange = this.handleCodeEditorChange.bind(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Ensure that any existing debounce timeout is cleared when the component is disconnected
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
  }

  render() {
    return html`
      <div style=${styleMap(this.containerStyle)}>
        <code-editor
          theme="vs"
          @change=${(event: CustomEvent) => {
      const {
        detail: { value }
      } = event;
      this.debounce(() => this.handleCodeEditorChange(value), 1000); // Call the debounce function
    }}
          .code=${this.value}
          language="javascript"
        >
        </code-editor>
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
