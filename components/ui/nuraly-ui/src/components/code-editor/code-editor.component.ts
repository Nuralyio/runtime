/**
 * @license
 * Copyright 2024 Nuraly
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createRef, type Ref, ref } from 'lit/directives/ref.js';
import { styles } from './code-editor.style.js';
import {
  CODE_EDITOR_THEME,
  type CodeEditorTheme,
  type CodeEditorLanguage,
  type CodeEditorChangeEventDetail,
  type CodeEditorKeyEventDetail
} from './code-editor.types.js';
import { ThemeAwareMixin } from '../../shared/theme-mixin.js';

// Monaco Editor Imports
import * as monaco from 'monaco-editor';
import { registerCompletion } from 'monacopilot';

// @ts-ignore
import monacoStyles from 'monaco-editor/min/vs/editor/editor.main.css?inline';
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
// @ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
// @ts-ignore
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
// @ts-ignore
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

// Import custom type definitions
import { databaseTypeDefinitions } from '../../../../../../../types/database.types';

// Setup Monaco workers (client-side only)
if (typeof self !== 'undefined') {
  (self as any).MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker();
      }
      if (label === 'json') {
        return new jsonWorker();
      }
      if (label === 'html') {
        return new htmlWorker();
      }
      return new editorWorker();
    },
  };
}

/**
 * NuralyUI Code Editor component wrapping Monaco Editor.
 *
 * @example
 * ```html
 * <nr-code-editor
 *   language="javascript"
 *   theme="vs-dark"
 *   .code=${"console.log('Hello');"}
 *   @nr-change=${(e) => console.log(e.detail.value)}
 * ></nr-code-editor>
 * ```
 *
 * @fires nr-change - Fired when the code content changes
 * @fires nr-keydown - Fired on keydown events in the editor
 * @fires nr-keyup - Fired on keyup events in the editor
 * @fires nr-focus - Fired when the editor gains focus
 * @fires nr-blur - Fired when the editor loses focus
 * @fires nr-ready - Fired when the editor is ready
 *
 * @csspart editor-container - The container wrapping the editor
 *
 * @cssprop [--nr-code-editor-width=100%] - Width of the editor
 * @cssprop [--nr-code-editor-height=100%] - Height of the editor
 * @cssprop [--nr-code-editor-min-height=0] - Minimum height
 * @cssprop [--nr-code-editor-max-height=none] - Maximum height
 * @cssprop [--nr-code-editor-border-radius=4px] - Border radius
 */
@customElement('nr-code-editor')
export class NrCodeEditorElement extends ThemeAwareMixin(LitElement) {
  static override styles = styles;

  /** Monaco editor instance */
  editor?: monaco.editor.IStandaloneCodeEditor;

  /** Whether editor is initialized */
  private isEditorReady = false;

  /** Reference to the editor container */
  private containerRef: Ref<HTMLElement> = createRef();

  /** Track the last applied Monaco theme to avoid unnecessary updates */
  private lastAppliedTheme?: string;

  /** Makes the editor read-only */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /** Editor theme (vs, vs-dark, hc-black, hc-light) */
  @property({ type: String, reflect: true })
  theme: CodeEditorTheme = CODE_EDITOR_THEME.Dark;

  /** Programming language for syntax highlighting */
  @property({ type: String, reflect: true })
  language: CodeEditorLanguage = 'javascript';

  /** The code content */
  @property({ type: String })
  code = '';

  /** Show line numbers */
  @property({ type: Boolean, attribute: 'line-numbers' })
  lineNumbers = true;

  /** Show minimap */
  @property({ type: Boolean })
  minimap = false;

  /** Enable word wrap */
  @property({ type: Boolean, attribute: 'word-wrap' })
  wordWrap = false;

  /** Font size in pixels */
  @property({ type: Number, attribute: 'font-size' })
  fontSize = 13;

  /** Enable AI completions via monacopilot */
  @property({ type: Boolean, attribute: 'ai-completions' })
  aiCompletions = true;

  /** API endpoint for AI completions */
  @property({ type: String, attribute: 'completions-endpoint' })
  completionsEndpoint = '/api/v1/copilot/completion';

  override render() {
    return html`
      <style>
        ${monacoStyles}
      </style>
      <div class="editor-container" part="editor-container">
        <main ${ref(this.containerRef)}></main>
      </div>
    `;
  }

  /**
   * Returns the current code contents
   */
  getValue(): string {
    return this.editor?.getValue() ?? '';
  }

  /**
   * Sets the editor value programmatically
   */
  setValue(value: string): void {
    if (this.editor) {
      const cursorPosition = this.editor.getPosition();
      this.editor.setValue(value);
      if (cursorPosition) {
        this.editor.setPosition(cursorPosition);
      }
    }
  }

  /**
   * Updates Monaco editor options
   */
  setOptions(options: monaco.editor.IStandaloneEditorConstructionOptions): void {
    this.editor?.updateOptions(options);
  }

  /**
   * Focus the editor
   */
  override focus(): void {
    this.editor?.focus();
  }

  override firstUpdated(): void {
    if (!this.containerRef.value) {
      console.error('NrCodeEditor: Container element not available');
      return;
    }

    this.initializeEditor();
  }

  private initializeEditor(): void {
    // Determine initial theme - prefer data-theme if no explicit theme set
    const initialTheme = this.getInitialTheme();

    try {
      this.editor = monaco.editor.create(this.containerRef.value!, {
        value: this.code,
        language: this.language,
        theme: initialTheme,
        fontSize: this.fontSize,
        automaticLayout: true,
        readOnly: this.readonly,
        lineNumbers: this.lineNumbers ? 'on' : 'off',
        minimap: { enabled: this.minimap },
        wordWrap: this.wordWrap ? 'on' : 'off',
      });

      this.isEditorReady = true;
    } catch (error) {
      console.error('NrCodeEditor: Failed to create editor', error);
      return;
    }

    this.setupCustomIntelliSense();

    if (this.aiCompletions) {
      registerCompletion(monaco, this.editor, {
        language: this.language,
        endpoint: this.completionsEndpoint,
      });
    }

    this.setupEventListeners();
    this.setupThemeListener();

    this.dispatchEvent(
      new CustomEvent('nr-ready', {
        detail: { editor: this.editor },
        bubbles: true,
        composed: true,
      })
    );
  }

  private setupEventListeners(): void {
    if (!this.editor) return;

    // Content change events
    this.editor.getModel()?.onDidChangeContent(() => {
      this.emit('nr-change', { value: this.getValue() });
    });

    // Keyboard events
    this.editor.onKeyDown((e: monaco.IKeyboardEvent) => {
      this.emit('nr-keydown', this.createKeyEventDetail(e));
    });

    this.editor.onKeyUp((e: monaco.IKeyboardEvent) => {
      this.emit('nr-keyup', this.createKeyEventDetail(e));
    });

    // Focus events
    this.editor.onDidFocusEditorWidget(() => this.emit('nr-focus'));
    this.editor.onDidBlurEditorWidget(() => this.emit('nr-blur'));
  }

  /** Helper to create keyboard event detail */
  private createKeyEventDetail(e: monaco.IKeyboardEvent): CodeEditorKeyEventDetail {
    return {
      event: e.browserEvent,
      key: e.browserEvent.key,
      code: e.browserEvent.code,
      ctrlKey: e.browserEvent.ctrlKey,
      shiftKey: e.browserEvent.shiftKey,
      altKey: e.browserEvent.altKey,
      metaKey: e.browserEvent.metaKey,
    };
  }

  /** Helper to emit custom events */
  private emit(eventName: string, detail?: Record<string, unknown>): void {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true,
    }));
  }

  private setupThemeListener(): void {
    // The ThemeAwareMixin handles theme observation automatically
    // We just need to apply the initial theme
    this.applyThemeFromMixin();
  }

  /**
   * Convert the mixin's currentTheme to Monaco theme
   * Uses explicit theme prop if set, otherwise derives from data-theme
   */
  private getMonacoThemeFromMixin(): string {
    // If explicit theme prop is set, use it
    if (this.theme) {
      return this.theme;
    }

    // Use the mixin's currentTheme which handles data-theme and system preference
    const currentTheme = this.currentTheme;

    // Map theme values to Monaco themes
    if (currentTheme.includes('dark')) {
      return CODE_EDITOR_THEME.Dark;
    }

    return CODE_EDITOR_THEME.Light;
  }

  /**
   * Apply the current theme from the mixin to Monaco editor
   */
  private applyThemeFromMixin(): void {
    if (!this.isEditorReady || !this.editor) return;

    const monacoTheme = this.getMonacoThemeFromMixin();

    // Only update if theme has changed
    if (monacoTheme !== this.lastAppliedTheme) {
      try {
        monaco.editor.setTheme(monacoTheme);
        this.lastAppliedTheme = monacoTheme;
      } catch {
        // Ignore errors
      }
    }
  }

  /**
   * Get the initial theme for the editor
   * Priority: explicit theme prop > data-theme > system preference
   */
  private getInitialTheme(): string {
    return this.getMonacoThemeFromMixin();
  }

  private setupCustomIntelliSense(): void {
    const tsDefaults = monaco.languages.typescript.typescriptDefaults;
    const jsDefaults = monaco.languages.typescript.javascriptDefaults;

    // Add custom type definitions for both TypeScript and JavaScript
    [tsDefaults, jsDefaults].forEach(defaults => {
      defaults.addExtraLib(databaseTypeDefinitions, 'database-types.d.ts');
    });

    // Base compiler options shared between TS and JS
    const baseCompilerOptions = {
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      allowJs: true,
    };

    // TypeScript-specific options
    tsDefaults.setCompilerOptions({
      ...baseCompilerOptions,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      typeRoots: ['node_modules/@types'],
    });

    // JavaScript-specific options
    jsDefaults.setCompilerOptions({
      ...baseCompilerOptions,
      checkJs: false,
    });

    // Register custom completion provider for Database suggestions
    monaco.languages.registerCompletionItemProvider(['javascript', 'typescript'], {
      provideCompletionItems: () => {
        const suggestions: monaco.languages.CompletionItem[] = [
          {
            label: 'Database',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: 'Database',
            documentation: 'Static Database Client for Nuraly Database Manager',
            detail: 'class Database',
          },
          {
            label: 'Database.select',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.select(${1:"tableName"}, {${2:}})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Select data from a table with optional criteria and relations',
            detail: '(method) Database.select(tableName: string, options?: SelectOptions): Promise<any>',
          },
          {
            label: 'Database.insert',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.insert(${1:"tableName"}, ${2:{}})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Insert data into a table',
            detail: '(method) Database.insert(tableName: string, data: Record<string, any>): Promise<any>',
          },
          {
            label: 'Database.update',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.update(${1:"tableName"}, ${2:{}}, ${3:{}})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Update data in a table',
            detail: '(method) Database.update(tableName: string, data: Record<string, any>, criteria: Record<string, any>): Promise<any>',
          },
          {
            label: 'Database.delete',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.delete(${1:"tableName"}, ${2:{}})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Delete data from a table',
            detail: '(method) Database.delete(tableName: string, criteria: Record<string, any>): Promise<any>',
          },
          {
            label: 'Database.createTable',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.createTable(${1:"tableName"}, {\n  ${2:field}: { type: ${3:"varchar"}, nullable: ${4:false} }\n})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a new table with specified schema',
            detail: '(method) Database.createTable(tableName: string, schema: TableSchema, options?: Record<string, any>): Promise<any>',
          },
          {
            label: 'Database.paginate',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.paginate(${1:"tableName"}, ${2:1}, ${3:10}, ${4:{}})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Get paginated results with metadata',
            detail: '(method) Database.paginate(tableName: string, page?: number, pageSize?: number, options?: SelectOptions): Promise<PaginationResult<any>>',
          },
          {
            label: 'Database.schemaQuery',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.schemaQuery(${1:"LIST_TABLES"}${2:, "tableName"})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Execute schema queries for database introspection',
            detail: '(method) Database.schemaQuery(type: string, tableName?: string): Promise<any>',
          },
          {
            label: 'Database.join',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: 'Database.join(${1:"mainTable"}, [\n  { table: ${2:"joinTable"}, on: ${3:"field1 = field2"}, type: ${4:"inner"} }\n], ${5:{}})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Perform complex join queries',
            detail: '(method) Database.join(mainTable: string, joins: JoinDefinition[], options?: Record<string, any>): Promise<any>',
          },
        ];

        return { suggestions };
      },
    });

    // Register hover provider for documentation
    monaco.languages.registerHoverProvider(['javascript', 'typescript'], {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return;

        const hoverDocs: Record<string, monaco.languages.Hover> = {
          Database: {
            contents: [
              { value: '**Database**' },
              { value: 'Static Database Client for Nuraly Database Manager' },
              { value: 'Provides a comprehensive interface for database operations including:' },
              { value: '- Table management (create, drop, schema operations)' },
              { value: '- Data operations (select, insert, update, delete)' },
              { value: '- Advanced queries (joins, aggregations, pagination)' },
              { value: '- Schema introspection and management' },
            ],
          },
        };

        return hoverDocs[word.word] || null;
      },
    });
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (!this.isEditorReady || !this.editor) return;

    // Apply theme from mixin on every update (handles data-theme changes)
    this.applyThemeFromMixin();

    if (changedProperties.has('code') && this.code !== changedProperties.get('code')) {
      const model = this.editor.getModel();
      if (model && this.code !== this.getValue()) {
        try {
          const cursorPosition = this.editor.getPosition();
          this.editor.setValue(this.code ?? '');
          if (cursorPosition) {
            this.editor.setPosition(cursorPosition);
          }
        } catch {
          // Monaco services might be temporarily unavailable
        }
      }
    }

    if (changedProperties.has('readonly')) {
      try {
        this.editor.updateOptions({ readOnly: this.readonly });
      } catch {
        // Ignore
      }
    }

    if (changedProperties.has('language') && this.editor.getModel()) {
      try {
        monaco.editor.setModelLanguage(this.editor.getModel()!, this.language || 'plaintext');
      } catch {
        // Ignore
      }
    }

    if (changedProperties.has('theme')) {
      try {
        monaco.editor.setTheme(this.theme);
      } catch {
        // Ignore
      }
    }

    if (changedProperties.has('fontSize')) {
      try {
        this.editor.updateOptions({ fontSize: this.fontSize });
      } catch {
        // Ignore
      }
    }

    if (changedProperties.has('lineNumbers')) {
      try {
        this.editor.updateOptions({ lineNumbers: this.lineNumbers ? 'on' : 'off' });
      } catch {
        // Ignore
      }
    }

    if (changedProperties.has('minimap')) {
      try {
        this.editor.updateOptions({ minimap: { enabled: this.minimap } });
      } catch {
        // Ignore
      }
    }

    if (changedProperties.has('wordWrap')) {
      try {
        this.editor.updateOptions({ wordWrap: this.wordWrap ? 'on' : 'off' });
      } catch {
        // Ignore
      }
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    // Clean up Monaco editor
    if (this.editor) {
      const model = this.editor.getModel();
      this.editor.dispose();
      model?.dispose();
      this.editor = undefined;
    }
    this.isEditorReady = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-code-editor': NrCodeEditorElement;
  }
}
