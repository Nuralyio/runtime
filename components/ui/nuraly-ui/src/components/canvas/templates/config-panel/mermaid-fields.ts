/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../workflow-canvas.types.js';
import '../../../code-editor/code-editor.component.js';
import { openCodeEditorModal, codeEditorPanelStyles, renderCodeEditorField } from './code-editor-modal.js';

const DEFAULT_MERMAID = `graph TD
  A[Start] --> B[End]`;

/**
 * Open fullscreen mermaid code editor modal
 */
function openMermaidModal(config: NodeConfiguration, onUpdate: (key: string, value: unknown) => void) {
  openCodeEditorModal({
    modalId: 'mermaid-code-modal',
    title: 'Edit Mermaid Diagram',
    language: 'markdown',
    initialCode: (config.textContent as string) || DEFAULT_MERMAID,
    onCodeChange: (value) => onUpdate('textContent', value),
  });
}

/**
 * Render MERMAID node specific configuration fields
 */
export function renderMermaidFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <style>${codeEditorPanelStyles}</style>
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Mermaid Diagram</span>
        <span class="config-section-desc">Write Mermaid syntax to render diagrams</span>
      </div>
      <div class="config-field">
        <label>Mermaid Code</label>
        ${renderCodeEditorField({
          language: 'markdown',
          code: (config.textContent as string) || DEFAULT_MERMAID,
          onCodeChange: (e) => onUpdate('textContent', e.detail.value),
          onFullscreen: () => openMermaidModal(config, onUpdate),
        })}
        <span class="field-description">Supports flowcharts, sequence diagrams, class diagrams, and more.</span>
      </div>
    </div>
  `;
}
