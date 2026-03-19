/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render SendGrid node fields
 */
export function renderSendgridFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const operation = (config as any).operation || 'send_email';
  const isTemplate = operation === 'send_template';

  return html`
    <!-- Operation Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Operation</span>
      </div>
      <div class="config-field">
        <label>Operation</label>
        <nr-select
          .value=${operation}
          .options=${[
            { label: 'Send Email', value: 'send_email' },
            { label: 'Send Template Email', value: 'send_template' },
            { label: 'Add Contact', value: 'add_contact' },
            { label: 'Remove Contact', value: 'remove_contact' },
          ]}
          @nr-change=${(e: CustomEvent) => onUpdate('operation', e.detail.value)}
        ></nr-select>
        <span class="field-description">SendGrid API operation to perform</span>
      </div>
    </div>

    <!-- Sender Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Sender</span>
      </div>
      <div class="config-field">
        <label>From Email</label>
        <nr-input
          value=${(config as any).fromEmail || ''}
          placeholder="sender@example.com"
          @nr-input=${(e: CustomEvent) => onUpdate('fromEmail', e.detail.value)}
        ></nr-input>
        <span class="field-description">Verified sender email address</span>
      </div>
      <div class="config-field">
        <label>From Name</label>
        <nr-input
          value=${(config as any).fromName || ''}
          placeholder="Sender Name"
          @nr-input=${(e: CustomEvent) => onUpdate('fromName', e.detail.value)}
        ></nr-input>
        <span class="field-description">Display name for the sender (optional)</span>
      </div>
    </div>

    <!-- Recipients Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Recipients</span>
        <span class="config-section-desc">Email addresses (use \${variables.name} for dynamic values)</span>
      </div>
      <div class="config-field">
        <label>To</label>
        <nr-input
          value=${(config as any).to || ''}
          placeholder="recipient@example.com"
          @nr-input=${(e: CustomEvent) => onUpdate('to', e.detail.value)}
        ></nr-input>
        <span class="field-description">Primary recipient(s), comma-separated</span>
      </div>
      <div class="config-field">
        <label>CC</label>
        <nr-input
          value=${(config as any).cc || ''}
          placeholder="cc@example.com"
          @nr-input=${(e: CustomEvent) => onUpdate('cc', e.detail.value)}
        ></nr-input>
      </div>
      <div class="config-field">
        <label>BCC</label>
        <nr-input
          value=${(config as any).bcc || ''}
          placeholder="bcc@example.com"
          @nr-input=${(e: CustomEvent) => onUpdate('bcc', e.detail.value)}
        ></nr-input>
      </div>
      <div class="config-field">
        <label>Reply-To</label>
        <nr-input
          value=${(config as any).replyTo || ''}
          placeholder="reply@example.com"
          @nr-input=${(e: CustomEvent) => onUpdate('replyTo', e.detail.value)}
        ></nr-input>
      </div>
    </div>

    <!-- Message Section (for send_email) -->
    ${operation === 'send_email' ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Message</span>
        </div>
        <div class="config-field">
          <label>Subject</label>
          <nr-input
            value=${(config as any).subject || ''}
            placeholder="Email subject"
            @nr-input=${(e: CustomEvent) => onUpdate('subject', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Content Type</label>
          <nr-select
            .value=${(config as any).contentType || 'text/html'}
            .options=${[
              { label: 'HTML', value: 'text/html' },
              { label: 'Plain Text', value: 'text/plain' },
            ]}
            @nr-change=${(e: CustomEvent) => onUpdate('contentType', e.detail.value)}
          ></nr-select>
        </div>
        <div class="config-field">
          <label>Body</label>
          <nr-textarea
            value=${(config as any).body || ''}
            placeholder="Email body content"
            rows="6"
            @nr-input=${(e: CustomEvent) => onUpdate('body', e.detail.value)}
          ></nr-textarea>
          <span class="field-description">Use \${variables.name} or \${input.field} for dynamic content</span>
        </div>
      </div>
    ` : ''}

    <!-- Template Section (for send_template) -->
    ${isTemplate ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Template</span>
        </div>
        <div class="config-field">
          <label>Subject</label>
          <nr-input
            value=${(config as any).subject || ''}
            placeholder="Email subject (overrides template subject)"
            @nr-input=${(e: CustomEvent) => onUpdate('subject', e.detail.value)}
          ></nr-input>
          <span class="field-description">Optional — overrides the template's subject line</span>
        </div>
        <div class="config-field">
          <label>Template ID</label>
          <nr-input
            value=${(config as any).templateId || ''}
            placeholder="d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            @nr-input=${(e: CustomEvent) => onUpdate('templateId', e.detail.value)}
          ></nr-input>
          <span class="field-description">SendGrid dynamic template ID</span>
        </div>
        <div class="config-field">
          <label>Dynamic Template Data</label>
          <nr-textarea
            value=${(config as any).dynamicTemplateData || ''}
            placeholder='{"first_name": "John", "order_id": "12345"}'
            rows="4"
            @nr-input=${(e: CustomEvent) => onUpdate('dynamicTemplateData', e.detail.value)}
          ></nr-textarea>
          <span class="field-description">JSON object with Handlebars variables for the template</span>
        </div>
      </div>
    ` : ''}

    <!-- Contact Section (for add_contact / remove_contact) -->
    ${operation === 'add_contact' || operation === 'remove_contact' ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Contact</span>
        </div>
        <div class="config-field">
          <label>Email</label>
          <nr-input
            value=${(config as any).to || ''}
            placeholder="contact@example.com"
            @nr-input=${(e: CustomEvent) => onUpdate('to', e.detail.value)}
          ></nr-input>
          <span class="field-description">Contact email address</span>
        </div>
      </div>
    ` : ''}

    <!-- Options Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Options</span>
      </div>
      <div class="config-field">
        <label>Categories</label>
        <nr-input
          value=${(config as any).categories || ''}
          placeholder="transactional, order-confirmation"
          @nr-input=${(e: CustomEvent) => onUpdate('categories', e.detail.value)}
        ></nr-input>
        <span class="field-description">Comma-separated categories for analytics tracking</span>
      </div>
    </div>
  `;
}
