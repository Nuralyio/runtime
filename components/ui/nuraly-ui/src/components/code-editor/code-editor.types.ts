/**
 * @license
 * Copyright 2024 Nuraly
 * SPDX-License-Identifier: MIT
 */

export const CODE_EDITOR_THEME = {
  Light: 'vs',
  Dark: 'vs-dark',
  HighContrastDark: 'hc-black',
  HighContrastLight: 'hc-light'
} as const;

export type CodeEditorTheme = typeof CODE_EDITOR_THEME[keyof typeof CODE_EDITOR_THEME];

export const CODE_EDITOR_LANGUAGE = {
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  JSON: 'json',
  HTML: 'html',
  CSS: 'css',
  Markdown: 'markdown',
  Python: 'python',
  PlainText: 'plaintext'
} as const;

export type CodeEditorLanguage = typeof CODE_EDITOR_LANGUAGE[keyof typeof CODE_EDITOR_LANGUAGE] | string;

export interface CodeEditorChangeEventDetail {
  value: string;
}

export interface CodeEditorKeyEventDetail {
  event: KeyboardEvent;
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}

export interface CodeEditorReadyEventDetail {
  editor: unknown;
}
