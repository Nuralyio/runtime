/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

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
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">JavaScript Code</span>
        <span class="config-section-desc">Code executes in GraalVM JavaScript engine</span>
      </div>
      <div class="config-field">
        <label>Code</label>
        <textarea
          class="code-editor"
          .value=${config.code || defaultCode}
          placeholder=${defaultCode}
          rows="12"
          @input=${(e: Event) => onUpdate('code', (e.target as HTMLTextAreaElement).value)}
        ></textarea>
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
