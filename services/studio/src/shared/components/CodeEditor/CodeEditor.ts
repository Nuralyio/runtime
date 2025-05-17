import { css, html, LitElement, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";

// -- Monaco Editor Imports --
import * as monaco from "monaco-editor";
import { registerCompletion } from 'monacopilot';

// @ts-ignore
import styles from "monaco-editor/min/vs/editor/editor.main.css?inline";
// @ts-ignore
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
// @ts-ignore
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
/**
 * @todo: add worker for those
 *    { label: "JS/Typescript", value: "javascript" },
                { label: "Python", value: "python" },
                { label: "Java", value: "java" },
                { label: "C#", value: "csharp" },
                { label: "C++", value: "cpp" },
                { label: "Go", value: "go" },
                { label: "Rust", value: "rust" },
                { label: "PHP", value: "php" },
                { label: "Ruby", value: "ruby" },
                { label: "HTML/CSS", value: "html" },
                { label: "SQL", value: "sql" }      
                
 */
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";

// Make sure Monaco uses the right workers:
(self as any).MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "html") {
      return new htmlWorker();
    }
    return new editorWorker();
  },
};

@customElement("code-editor")
export class CodeEditor extends LitElement {
  static styles = css`
      :host {
          --editor-width: 100%;
          --editor-height: 100%;
      }
      main {
          width: var(--editor-width);
          height: var(--editor-height);
      }
  `;

  editor?: monaco.editor.IStandaloneCodeEditor;

  @property({ type: Boolean, attribute: "readonly" }) readonly?: boolean;
  @property() theme?: string = "";
  @property() language?: string;
  @property() code?: string;

  private container: Ref<HTMLElement> = createRef();

  render() {
    return html`
      <style>
        ${styles}
      </style>
      <main ${ref(this.container)}></main>
    `;
  }

  /**
   * Returns the current code contents
   */
  getValue() {
    return this.editor?.getValue() ?? "";
  }

  /**
   * Allows external code to update various Monaco editor options
   */
  setOptions(value: monaco.editor.IStandaloneEditorConstructionOptions) {
    this.editor?.updateOptions(value);
  }

  /**
   * Create the Monaco editor once the element has rendered
   */
  firstUpdated() {
    // For demonstration, registering a custom language
    monaco.languages.register({ id: "mylang" });
    monaco.languages.setMonarchTokensProvider("mylang", {
      tokenizer: {
        root: [
          [/#.*$/, "comment"],
          [/\b(begin|end|if|else|while)\b/, "keyword"],
          [/[=+\-*/]/, "operator"],
          [/\d+/, "number"],
        ],
      },
    });

    // Create the editor:
    this.editor = monaco.editor.create(this.container.value!, {
      value: this.getCode(),
      language: this.getLang(),
      theme: this.getTheme(),
      fontSize: 13,
      automaticLayout: true,
      readOnly: this.readonly ?? false,
    });
    registerCompletion(monaco, this.editor, {
      language: this.getLang(),
      // Your API endpoint for handling completion requests
      endpoint: '/api/v1/copilot/completion',
  });

    // Listen for content changes and re-dispatch an event:
    this.editor.getModel()?.onDidChangeContent(() => {
      this.dispatchEvent(
        new CustomEvent("change", { detail: { value: this.getValue() } })
      );
    });

    // Re-apply the theme if the user changes OS-level dark/light preferences
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        monaco.editor.setTheme(this.getTheme());
      });
  }

  /**
   * Dispose of the editor and its model when the element is removed
   * from the DOM. This prevents stale listeners from piling up.
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.editor) {
      const model = this.editor.getModel();
      this.editor.dispose();
      model?.dispose();
      this.editor = undefined;
    }
  }

  /**
   * Whenever the `code` property changes, update the editor’s text if needed
   */
  protected update(changedProperties: PropertyValues) {
    super.update(changedProperties);

    if (
      changedProperties.has("code") &&
      this.code !== changedProperties.get("code")
    ) {
      const cursorPosition = this.editor?.getPosition();
      // Only set the editor value if there's a real change
      if (this.code !== this.getValue() && this.editor) {
        this.editor.setValue(this.code ?? "");
        if (cursorPosition) {
          this.editor.setPosition(cursorPosition);
        }
      }
    }
    if (
      changedProperties.has("readonly") &&
      this.readonly !== changedProperties.get("readonly")
    ) {

      this.editor?.updateOptions({
        readOnly: this.readonly ?? false,
      });

    }

    if (
      changedProperties.has("language") &&
      this.language !== changedProperties.get("language")
    ) {

      if (this.editor && this.editor.getModel()) {
        monaco.editor.setModelLanguage(
          this.editor.getModel()!,
          this.language || "plaintext"
        );
      }
    }

    if (
      changedProperties.has("theme") &&
      this.theme !== changedProperties.get("theme")
    ) {

      this.editor?.updateOptions({
        theme: this.theme 
      });

    }
  }

  /**
   * If the user hasn’t passed any `code`, we look for a <script> child
   * or fallback to an empty string
   */
  private getCode() {
    if (this.code) return this.code;
    const file = this.getFile();
    return file ? file.innerHTML.trim() : "";
  }

  /**
   * If the user hasn’t passed any `language`, we look for a <script> child
   * or fallback to "plaintext"
   */
  private getLang() {
    if (this.language) return this.language;
    const file = this.getFile();
    if (!file) return "plaintext";
    const type = file.getAttribute("type") || "text/plain";
    return type.split("/").pop() || "plaintext";
  }

  /**
   * Figure out which theme Monaco should use
   */
  private getTheme() {
    if (this.theme) return this.theme;
    // If OS prefers dark mode, use vs-dark theme; else use vs-light
    return this.isDark() ? "vs-dark" : "vs-light";
  }

  private isDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  /**
   * If we have a <script> child, return it (this is just a convenience to allow:
   * <code-editor><script type="text/javascript">const x=1;</script></code-editor>)
   */
  private getFile() {
    return this.children.length > 0 ? this.children[0] : null;
  }
}