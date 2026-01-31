/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';
import type { CodeEditorChangeEventDetail } from '../../../../code-editor/code-editor.types.js';

/**
 * Open fullscreen code editor modal
 */
function openCodeModal(config: NodeConfiguration, defaultCode: string, onUpdate: (key: string, value: unknown) => void) {
  // Remove existing modal if any
  const existingModal = document.querySelector('#function-code-modal');
  existingModal?.remove();

  // Create overlay container directly with inline styles to avoid stacking context issues
  const overlay = document.createElement('div');
  overlay.id = 'function-code-modal';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
  `;

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: var(--nuraly-color-background, #fff);
    border-radius: 8px;
    width: 85vw;
    height: 85vh;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  `;

  // Header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
  `;
  header.innerHTML = `
    <span style="font-size: 16px; font-weight: 500; color: var(--text-primary, #333);">Edit Function Code</span>
    <button id="close-modal-btn" style="
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  // Body with code editor
  const body = document.createElement('div');
  body.style.cssText = `
    flex: 1;
    padding: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;

  const editorContainer = document.createElement('div');
  editorContainer.style.cssText = `
    flex: 1;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
  `;

  const editor = document.createElement('nr-code-editor') as any;
  editor.setAttribute('language', 'javascript');
  editor.setAttribute('theme', 'vs-dark');
  editor.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    --nuraly-code-editor-height: 100%;
    --nuraly-code-editor-width: 100%;
  `;

  editorContainer.appendChild(editor);
  body.appendChild(editorContainer);

  // Footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    display: flex;
    justify-content: flex-end;
    padding: 12px 20px;
    border-top: 1px solid var(--border-color, #e0e0e0);
    gap: 8px;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = `
    padding: 8px 16px;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    background: var(--bg-secondary, #f5f5f5);
    cursor: pointer;
    font-size: 14px;
  `;

  footer.appendChild(closeBtn);

  modalContent.appendChild(header);
  modalContent.appendChild(body);
  modalContent.appendChild(footer);
  overlay.appendChild(modalContent);
  document.body.appendChild(overlay);

  // Set code after element is in DOM
  requestAnimationFrame(() => {
    editor.code = config.code || defaultCode;
    editor.addEventListener('nr-change', (e: CustomEvent<CodeEditorChangeEventDetail>) => {
      onUpdate('code', e.detail.value);
    });
  });

  // Close handlers
  const closeModal = () => overlay.remove();

  header.querySelector('#close-modal-btn')?.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // ESC key to close
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

/**
 * Render Function node fields
 */
export function renderFunctionFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const defaultCode = `// Available variables:
// - input: Data from previous node or tool arguments
// - variables: Workflow variables
// - args: Node configuration args

// Example: Return a value
return {
  result: input.value * 2,
  message: "Processed successfully"
};`;

  return html`
    <style>
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
    </style>
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">JavaScript Code</span>
        <span class="config-section-desc">Code executes in GraalVM JavaScript engine</span>
      </div>
      <div class="config-field">
        <label>Code</label>
        <div class="code-editor-toolbar">
          <button class="expand-btn" @click=${() => openCodeModal(config, defaultCode, onUpdate)}>
            <nr-icon name="maximize-2" size="14"></nr-icon>
            Fullscreen
          </button>
        </div>
        <div class="code-editor-wrapper">
          <nr-code-editor
            language="javascript"
            theme="vs-dark"
            .code=${config.code || defaultCode}
            @nr-change=${(e: CustomEvent<CodeEditorChangeEventDetail>) => onUpdate('code', e.detail.value)}
          ></nr-code-editor>
        </div>
        <span class="field-description">JavaScript code to execute. Use 'return' to output a value.</span>
      </div>
    </div>
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Output</span>
      </div>
      <div class="config-field">
        <label>Output Variable</label>
        <nr-input
          value=${config.outputVariable || ''}
          placeholder="Optional: store result in variable"
          @nr-input=${(e: CustomEvent) => onUpdate('outputVariable', e.detail.value)}
        ></nr-input>
        <span class="field-description">Variable name to store the function result</span>
      </div>
    </div>
  `;
}
