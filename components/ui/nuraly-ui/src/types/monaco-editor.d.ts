declare namespace monaco {
  namespace editor {
    interface IStandaloneCodeEditor {
      dispose(): void;
      getValue(): string;
      setValue(value: string): void;
      getModel(): any;
      onDidChangeModelContent(handler: (e: any) => void): any;
      onKeyDown(handler: (e: IKeyboardEvent) => void): any;
      onKeyUp(handler: (e: IKeyboardEvent) => void): any;
      onDidFocusEditorWidget(handler: () => void): any;
      onDidBlurEditorWidget(handler: () => void): any;
      layout(): void;
      updateOptions(options: any): void;
      getPosition(): any;
      setPosition(position: any): void;
      focus(): void;
    }
    interface IStandaloneEditorConstructionOptions {
      [key: string]: any;
    }
    function create(container: HTMLElement, options?: any): IStandaloneCodeEditor;
    function setTheme(theme: string): void;
    function setModelLanguage(model: any, language: string): void;
  }
  namespace languages {
    namespace typescript {
      const typescriptDefaults: any;
      const javascriptDefaults: any;
      enum ScriptTarget { ES2020 = 7 }
      enum ModuleResolutionKind { NodeJs = 2 }
      enum ModuleKind { CommonJS = 1 }
      enum JsxEmit { React = 2 }
    }
    interface CompletionItem {
      [key: string]: any;
    }
    interface Hover {
      contents: any[];
      range?: any;
    }
    enum CompletionItemKind {
      Method = 0, Function = 1, Constructor = 2, Field = 3, Variable = 4,
      Class = 5, Struct = 6, Interface = 7, Module = 8, Property = 9,
      Event = 10, Operator = 11, Unit = 12, Value = 13, Constant = 14,
      Enum = 15, EnumMember = 16, Keyword = 17, Text = 18, Color = 19,
      File = 20, Reference = 21, Customcolor = 22, Folder = 23, TypeParameter = 24, Snippet = 25,
    }
    enum CompletionItemInsertTextRule {
      None = 0, KeepWhitespace = 1, InsertAsSnippet = 4,
    }
    function registerCompletionItemProvider(languageIds: string[], provider: any): any;
    function registerHoverProvider(languageIds: string[], provider: any): any;
  }
  interface IKeyboardEvent {
    readonly keyCode: number;
    readonly code: string;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    preventDefault(): void;
    stopPropagation(): void;
    browserEvent: KeyboardEvent;
  }
  enum KeyCode {
    Enter = 3,
    Escape = 9,
    Tab = 2,
  }
}

declare module 'monaco-editor' {
  export = monaco;
}

declare module 'monacopilot' {
  export function registerCompletion(monaco: any, editor: any, options: any): any;
}

declare module 'monaco-editor/min/vs/editor/editor.main.css?inline' {
  const styles: string;
  export default styles;
}

declare module 'monaco-editor/esm/vs/editor/editor.worker?worker' {
  const Worker: new () => Worker;
  export default Worker;
}

declare module 'monaco-editor/esm/vs/language/typescript/ts.worker?worker' {
  const Worker: new () => Worker;
  export default Worker;
}

declare module 'monaco-editor/esm/vs/language/html/html.worker?worker' {
  const Worker: new () => Worker;
  export default Worker;
}

declare module 'monaco-editor/esm/vs/language/json/json.worker?worker' {
  const Worker: new () => Worker;
  export default Worker;
}
