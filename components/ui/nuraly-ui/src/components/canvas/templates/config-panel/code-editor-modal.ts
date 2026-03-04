/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import type { CodeEditorChangeEventDetail } from '../../../code-editor/code-editor.types.js';

interface CodeEditorModalOptions {
  modalId: string;
  title: string;
  language: string;
  initialCode: string;
  onCodeChange: (value: string) => void;
}

function styledEl(tag: string, css: string): HTMLElement {
  const el = document.createElement(tag);
  el.style.cssText = css;
  return el;
}

function svgLine(x1: string, y1: string, x2: string, y2: string): SVGLineElement {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  return line;
}

function createCloseIcon(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '20');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.appendChild(svgLine('18', '6', '6', '18'));
  svg.appendChild(svgLine('6', '6', '18', '18'));
  return svg;
}

/**
 * Shared CSS styles for inline code editor panels.
 */
export const codeEditorPanelStyles = `
  .code-editor-wrapper {
    position: relative;
    height: 200px;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    overflow: hidden;
  }
  .code-editor-wrapper nr-code-editor {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    --nuraly-code-editor-height: 100%;
    --nuraly-code-editor-width: 100%;
    --nuraly-code-editor-border-radius: 4px;
    --nuraly-code-editor-border: none;
  }
  .code-editor-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 8px;
  }
  .expand-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    background: var(--bg-secondary, #f5f5f5);
    color: var(--text-secondary, #666);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .expand-btn:hover {
    background: var(--bg-hover, #e8e8e8);
    color: var(--text-primary, #333);
  }
`;

interface CodeEditorFieldOptions {
  language: string;
  code: string;
  onCodeChange: (e: CustomEvent<CodeEditorChangeEventDetail>) => void;
  onFullscreen: () => void;
}

/**
 * Renders the inline code editor field with toolbar and fullscreen button.
 */
export function renderCodeEditorField(options: CodeEditorFieldOptions): TemplateResult {
  return html`
    <div class="code-editor-toolbar">
      <button class="expand-btn" @click=${options.onFullscreen}>
        <nr-icon name="maximize-2" size="14"></nr-icon>
        Fullscreen
      </button>
    </div>
    <div class="code-editor-wrapper">
      <nr-code-editor
        language="${options.language}"
        theme="vs-dark"
        .code=${options.code}
        @nr-change=${options.onCodeChange}
      ></nr-code-editor>
    </div>
  `;
}

const EDITOR_FILL_CSS = 'position:absolute;top:0;left:0;right:0;bottom:0;--nuraly-code-editor-height:100%;--nuraly-code-editor-width:100%';

/**
 * Opens a fullscreen code editor modal with the given options.
 */
export function openCodeEditorModal(options: CodeEditorModalOptions): void {
  const { modalId, title, language, initialCode, onCodeChange } = options;

  document.querySelector(`#${modalId}`)?.remove();

  const overlay = styledEl('div', 'position:fixed;top:0;left:0;right:0;bottom:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999');
  overlay.id = modalId;

  const modalContent = styledEl('div', 'background:var(--nuraly-color-background,#fff);border-radius:8px;width:85vw;height:85vh;max-width:1200px;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.2)');

  const header = styledEl('div', 'display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--border-color,#e0e0e0)');
  const headerTitle = styledEl('span', 'font-size:16px;font-weight:500;color:var(--text-primary,#333)');
  headerTitle.textContent = title;
  const closeModalBtn = styledEl('button', 'background:none;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;border-radius:4px');
  closeModalBtn.appendChild(createCloseIcon());
  header.append(headerTitle, closeModalBtn);

  const body = styledEl('div', 'flex:1;padding:16px;overflow:hidden;display:flex;flex-direction:column');
  const editorContainer = styledEl('div', 'flex:1;position:relative;border-radius:4px;overflow:hidden');

  const editor = document.createElement('nr-code-editor') as any;
  editor.setAttribute('language', language);
  editor.setAttribute('theme', 'vs-dark');
  editor.style.cssText = EDITOR_FILL_CSS;

  editorContainer.appendChild(editor);
  body.appendChild(editorContainer);

  const footer = styledEl('div', 'display:flex;justify-content:flex-end;padding:12px 20px;border-top:1px solid var(--border-color,#e0e0e0);gap:8px');
  const closeBtn = styledEl('button', 'padding:8px 16px;border:1px solid var(--border-color,#e0e0e0);border-radius:4px;background:var(--bg-secondary,#f5f5f5);cursor:pointer;font-size:14px');
  closeBtn.textContent = 'Close';
  footer.appendChild(closeBtn);

  modalContent.append(header, body, footer);
  overlay.appendChild(modalContent);
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    editor.code = initialCode;
    editor.addEventListener('nr-change', (e: CustomEvent<CodeEditorChangeEventDetail>) => {
      onCodeChange(e.detail.value);
    });
  });

  const closeModal = () => overlay.remove();
  closeModalBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function handleEsc(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  });
}
