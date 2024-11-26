import { css, html, LitElement, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, type  Ref, ref } from "lit/directives/ref.js";

// -- Monaco Editor Imports --
import * as monaco from "monaco-editor";
// @ts-ignore
import styles from "monaco-editor/min/vs/editor/editor.main.css?inline";
// @ts-ignore
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
// @ts-ignore
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
 
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

@customElement("code-editor")
export class CodeEditor extends LitElement {
  private container: Ref<HTMLElement> = createRef();
  editor?: monaco.editor.IStandaloneCodeEditor;
  @property({ type: Boolean, attribute: "readonly" }) readOnly?: boolean;
  @property() theme?: string;
  @property() language?: string;
  @property() code?: string;

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

  protected override updated(_changedProperties: PropertyValues): void {
    if(_changedProperties.has('code')&& this.code != _changedProperties.get('code')){
      const cursorPosition =this.editor.getPosition()
      if(this.code != this.getValue()){
        this.editor.setValue(this.code);
        this.editor.setPosition(cursorPosition)
        this.requestUpdate()
      }
    }
  }
  render() {
    return html`
      <style>
        ${styles}
      </style>
      <main ${ref(this.container)}></main>
    `;
  }

  private getFile() {
    if (this.children.length > 0) return this.children[0];
    return null;
  }

  private getCode() {
    if (this.code) return this.code;
    const file = this.getFile();
    if (!file) return;
    return file.innerHTML.trim();
  }

  private getLang() {
    if (this.language) return this.language;
    const file = this.getFile();
    if (!file) return;
    const type = file.getAttribute("type")!;
    return type.split("/").pop()!;
  }

  private getTheme() {
    if (this.theme) return this.theme;
    if (this.isDark()) return "vs-dark";
    return "vs-light";
  }

  private isDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }
  getValue() {
    return this.editor!.getValue();
  }
  setOptions(value: monaco.editor.IStandaloneEditorConstructionOptions) {
    this.editor!.updateOptions(value);
  }

  override firstUpdated() {
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
  
      this.editor = monaco.editor.create(this.container.value!, {
        value: this.getCode(),
        language: this.getLang(),
        theme: this.getTheme(),
        fontSize: 13,
        automaticLayout: true,
        readOnly: this.readOnly ?? false,
      });
      this.editor.getModel()!.onDidChangeContent(() => {
        this.dispatchEvent(
          new CustomEvent("change", { detail: { value: this.getValue() } })
        );
      });
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", () => {
          monaco.editor.setTheme(this.getTheme());
        });
    }
    
}
