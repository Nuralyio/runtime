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
// @ts-ignore
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";

// Import custom type definitions
import { databaseTypeDefinitions } from '../../../../../types/database.types';

// Make sure Monaco uses the right workers (only on client-side):
if (typeof self !== "undefined") {
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
}

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
  private isEditorReady = false;

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
   * Set up custom IntelliSense for TypeScript/JavaScript
   */
  private setupCustomIntelliSense() {
    // Add custom type definitions to TypeScript compiler
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      databaseTypeDefinitions,
      'database-types.d.ts'
    );
    
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      databaseTypeDefinitions,
      'database-types.d.ts'
    );

    // Configure TypeScript compiler options for better IntelliSense
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"]
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      allowJs: true,
      checkJs: false
    });

    // Register custom completion provider for enhanced Database suggestions
    monaco.languages.registerCompletionItemProvider(['javascript', 'typescript'], {
      provideCompletionItems: (model, position) => {
        const suggestions: monaco.languages.CompletionItem[] = [];
        
        // Add Database class completion
        suggestions.push({
          label: 'Database',
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: 'Database',
          documentation: 'Static Database Client for Nuraly Database Manager',
          detail: 'class Database'
        });

        // Common Database operations with snippets
        const dbOperations = [
          {
            label: 'Database.select',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.select(${1:"tableName"}, {${2:}})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Select data from a table with optional criteria and relations',
            detail: '(method) Database.select(tableName: string, options?: SelectOptions): Promise<any>'
          },
          {
            label: 'Database.insert',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.insert(${1:"tableName"}, ${2:{}})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Insert data into a table',
            detail: '(method) Database.insert(tableName: string, data: Record<string, any>): Promise<any>'
          },
          {
            label: 'Database.update',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.update(${1:"tableName"}, ${2:{}}, ${3:{}})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Update data in a table',
            detail: '(method) Database.update(tableName: string, data: Record<string, any>, criteria: Record<string, any>): Promise<any>'
          },
          {
            label: 'Database.delete',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.delete(${1:"tableName"}, ${2:{}})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Delete data from a table',
            detail: '(method) Database.delete(tableName: string, criteria: Record<string, any>): Promise<any>'
          },
          {
            label: 'Database.createTable',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.createTable(${1:"tableName"}, {\n  ${2:field}: { type: ${3:"varchar"}, nullable: ${4:false} }\n})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a new table with specified schema',
            detail: '(method) Database.createTable(tableName: string, schema: TableSchema, options?: Record<string, any>): Promise<any>'
          },
          {
            label: 'Database.paginate',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.paginate(${1:"tableName"}, ${2:1}, ${3:10}, ${4:{}})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Get paginated results with metadata',
            detail: '(method) Database.paginate(tableName: string, page?: number, pageSize?: number, options?: SelectOptions): Promise<PaginationResult<any>>'
          },
          {
            label: 'Database.schemaQuery',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.schemaQuery(${1:"LIST_TABLES"}${2:, "tableName"})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Execute schema queries for database introspection',
            detail: '(method) Database.schemaQuery(type: string, tableName?: string): Promise<any>'
          },
          {
            label: 'Database.join',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.join(${1:"mainTable"}, [\n  { table: ${2:"joinTable"}, on: ${3:"field1 = field2"}, type: ${4:"inner"} }\n], ${5:{}})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Perform complex join queries',
            detail: '(method) Database.join(mainTable: string, joins: JoinDefinition[], options?: Record<string, any>): Promise<any>'
          }
        ];

        suggestions.push(...dbOperations);

        return { suggestions };
      }
    });

    // Register hover provider for detailed documentation
    monaco.languages.registerHoverProvider(['javascript', 'typescript'], {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return;

        const hoverDocs: Record<string, monaco.languages.Hover> = {
          'Database': {
            contents: [
              { value: '**Database**' },
              { value: 'Static Database Client for Nuraly Database Manager' },
              { value: 'Provides a comprehensive interface for database operations including:' },
              { value: '- Table management (create, drop, schema operations)' },
              { value: '- Data operations (select, insert, update, delete)' },
              { value: '- Advanced queries (joins, aggregations, pagination)' },
              { value: '- Schema introspection and management' },
              { value: '```typescript\n// Configure the client\nDatabase.configure("/api/v1/database");\n\n// Create a table\nawait Database.createTable("users", {\n  name: { type: "varchar", nullable: false },\n  email: { type: "varchar", nullable: false }\n});\n\n// Insert data\nawait Database.insert("users", {\n  name: "John Doe",\n  email: "john@example.com"\n});\n```' }
            ]
          }
        };

        return hoverDocs[word.word] || null;
      }
    });
  }

  /**
   * Create the Monaco editor once the element has rendered
   */
  firstUpdated() {
    // Guard: Ensure container is available before creating editor
    if (!this.container.value) {
      console.error('CodeEditor: Container element not available in firstUpdated');
      return;
    }

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
    try {
      this.editor = monaco.editor.create(this.container.value, {
        value: this.getCode(),
        language: this.getLang(),
        theme: this.getTheme(),
        fontSize: 13,
        automaticLayout: true,
        readOnly: this.readonly ?? false,
      });
      // Mark editor as ready for updates
      this.isEditorReady = true;
    } catch (error) {
      console.error('CodeEditor: Failed to create editor instance', error);
      return;
    }

    // Set up custom IntelliSense
    this.setupCustomIntelliSense();

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

    // Add keyboard event listeners
    this.registerKeyboardEvents();

    // Re-apply the theme if the user changes OS-level dark/light preferences
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        monaco.editor.setTheme(this.getTheme());
      });
  }

  /**
   * Register keyboard event handlers for the editor
   */
  private registerKeyboardEvents() {
    if (!this.editor) return;
    
    this.editor.onKeyDown((e: monaco.IKeyboardEvent) => {
      this.dispatchEvent(
        new CustomEvent("editor-keydown", { 
          detail: { 
            event: e,
            key: e.browserEvent.key,
            code: e.browserEvent.code,
            ctrlKey: e.browserEvent.ctrlKey,
            shiftKey: e.browserEvent.shiftKey,
            altKey: e.browserEvent.altKey,
            metaKey: e.browserEvent.metaKey
          } 
        })
      );
    });

    this.editor.onKeyUp((e: monaco.IKeyboardEvent) => {
      this.dispatchEvent(
        new CustomEvent("editor-keyup", { 
          detail: { 
            event: e,
            key: e.browserEvent.key,
            code: e.browserEvent.code,
            ctrlKey: e.browserEvent.ctrlKey,
            shiftKey: e.browserEvent.shiftKey,
            altKey: e.browserEvent.altKey,
            metaKey: e.browserEvent.metaKey
          } 
        })
      );
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
    this.isEditorReady = false;
  }

  /**
   * Whenever the `code` property changes, update the editor’s text if needed
   */
  protected update(changedProperties: PropertyValues) {
    super.update(changedProperties);

    // Don't process updates until editor is initialized
    if (!this.isEditorReady) {
      return;
    }

    if (
      changedProperties.has("code") &&
      this.code !== changedProperties.get("code")
    ) {
      // Guard: Only update if editor instance exists
      if (!this.editor) {
        return;
      }

      // Guard: Make sure the editor has a model before trying to edit it
      const model = this.editor.getModel();
      if (!model) {
        return;
      }

      const cursorPosition = this.editor.getPosition();
      // Only set the editor value if there's a real change
      if (this.code !== this.getValue()) {
        try {
          this.editor.setValue(this.code ?? "");
          if (cursorPosition) {
            this.editor.setPosition(cursorPosition);
          }
        } catch (e) {
          // Silently ignore errors - Monaco services might be temporarily unavailable
          // The editor will still be functional
        }
      }
    }
    if (
      changedProperties.has("readonly") &&
      this.readonly !== changedProperties.get("readonly")
    ) {
      try {
        this.editor?.updateOptions({
          readOnly: this.readonly ?? false,
        });
      } catch (e) {
        // Silently ignore
      }
    }

    if (
      changedProperties.has("language") &&
      this.language !== changedProperties.get("language")
    ) {
      try {
        if (this.editor && this.editor.getModel()) {
          monaco.editor.setModelLanguage(
            this.editor.getModel()!,
            this.language || "plaintext"
          );
        }
      } catch (e) {
        // Silently ignore
      }
    }

    if (
      changedProperties.has("theme") &&
      this.theme !== changedProperties.get("theme")
    ) {
      try {
        this.editor?.updateOptions({
          theme: this.theme 
        });
      } catch (e) {
        // Silently ignore
      }
    }
  }

  /**
   * If the user hasn't passed any `code`, we look for a <script> child
   * or fallback to an empty string
   */
  private getCode() {
    if (this.code) return this.code;
    const file = this.getFile();
    return file ? file.innerHTML.trim() : "";
  }

  /**
   * If the user hasn't passed any `language`, we look for a <script> child
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