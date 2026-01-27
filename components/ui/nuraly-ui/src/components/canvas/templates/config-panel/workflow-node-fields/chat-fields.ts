/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Chat Start node fields
 */
export function renderChatStartFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Output Variables</span>
        <span class="config-section-desc">Variables available after chat input</span>
      </div>
      <div class="config-field">
        <label>Output Variable</label>
        <nr-input
          value=${config.outputVariable || 'chatInput'}
          placeholder="chatInput"
          @nr-input=${(e: CustomEvent) => onUpdate('outputVariable', e.detail.value)}
        ></nr-input>
        <span class="field-description">Variable containing the full chat message object</span>
      </div>
    </div>

    <!-- File Upload Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">File Upload</span>
        <span class="config-section-desc">Allow users to upload files</span>
      </div>

      <div class="config-field">
        <label class="checkbox-label">
          <nr-checkbox
            ?checked=${config.enableFileUpload === true}
            @nr-change=${(e: CustomEvent) => onUpdate('enableFileUpload', e.detail.checked)}
          ></nr-checkbox>
          Enable File Upload
        </label>
        <span class="field-description">Allow users to attach files to messages</span>
      </div>

      ${config.enableFileUpload ? html`
        <div class="config-field">
          <label>Max File Size (MB)</label>
          <nr-input
            type="number"
            .value=${String((config.maxFileSize as number) || 10)}
            placeholder="10"
            @nr-input=${(e: CustomEvent) => onUpdate('maxFileSize', parseInt(e.detail.value) || 10)}
          ></nr-input>
        </div>

        <div class="config-field">
          <label>Max Files per Message</label>
          <nr-input
            type="number"
            .value=${String((config.maxFiles as number) || 5)}
            placeholder="5"
            @nr-input=${(e: CustomEvent) => onUpdate('maxFiles', parseInt(e.detail.value) || 5)}
          ></nr-input>
        </div>

        <div class="config-field">
          <label>Allowed File Types</label>
          <div class="checkbox-group">
            <label class="checkbox-item">
              <nr-checkbox
                ?checked=${(config.allowImages as boolean) !== false}
                @nr-change=${(e: CustomEvent) => onUpdate('allowImages', e.detail.checked)}
              ></nr-checkbox>
              Images (PNG, JPG, GIF, WebP)
            </label>
            <label class="checkbox-item">
              <nr-checkbox
                ?checked=${(config.allowDocuments as boolean) === true}
                @nr-change=${(e: CustomEvent) => onUpdate('allowDocuments', e.detail.checked)}
              ></nr-checkbox>
              Documents (PDF, Word, Excel)
            </label>
            <label class="checkbox-item">
              <nr-checkbox
                ?checked=${(config.allowText as boolean) === true}
                @nr-change=${(e: CustomEvent) => onUpdate('allowText', e.detail.checked)}
              ></nr-checkbox>
              Text Files (TXT, CSV, JSON)
            </label>
            <label class="checkbox-item">
              <nr-checkbox
                ?checked=${(config.allowAudio as boolean) === true}
                @nr-change=${(e: CustomEvent) => onUpdate('allowAudio', e.detail.checked)}
              ></nr-checkbox>
              Audio (MP3, WAV)
            </label>
            <label class="checkbox-item">
              <nr-checkbox
                ?checked=${(config.allowVideo as boolean) === true}
                @nr-change=${(e: CustomEvent) => onUpdate('allowVideo', e.detail.checked)}
              ></nr-checkbox>
              Video (MP4, WebM)
            </label>
          </div>
        </div>
      ` : nothing}
    </div>

    <!-- Execution Behavior Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Execution Behavior</span>
        <span class="config-section-desc">Configure how the workflow executes</span>
      </div>

      <div class="config-field">
        <label class="checkbox-label">
          <nr-checkbox
            ?checked=${config.alwaysOpenPlan === true}
            @nr-change=${(e: CustomEvent) => onUpdate('alwaysOpenPlan', e.detail.checked)}
          ></nr-checkbox>
          Always Open Plan
        </label>
        <span class="field-description">Show execution plan before running the workflow</span>
      </div>
    </div>
  `;
}

/**
 * Render Chat Output node fields
 */
export function renderChatOutputFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Message</span>
        <span class="config-section-desc">Message to send back to the chatbot</span>
      </div>
      <div class="config-field">
        <label>Message Expression</label>
        <nr-input
          value=${config.message || ''}
          placeholder="\${variables.response}"
          @nr-input=${(e: CustomEvent) => onUpdate('message', e.detail.value)}
        ></nr-input>
        <span class="field-description">Use \${variables.name} or \${input.field} to reference data</span>
      </div>
    </div>
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Options</span>
      </div>
      <div class="config-field">
        <label>Message Type</label>
        <nr-select
          .value=${config.messageType || 'text'}
          .options=${[
            { label: 'Text', value: 'text' },
            { label: 'Markdown', value: 'markdown' },
            { label: 'HTML', value: 'html' },
            { label: 'JSON', value: 'json' }
          ]}
          @nr-change=${(e: CustomEvent) => onUpdate('messageType', e.detail.value)}
        ></nr-select>
        <span class="field-description">Format of the message content</span>
      </div>
    </div>
  `;
}
