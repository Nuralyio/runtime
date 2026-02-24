/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render HTTP Start node fields
 */
export function renderHttpStartFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
  workflowId?: string
): TemplateResult {
  const wfId = workflowId || '{workflowId}';
  const httpPath = (config.httpPath as string) || '/webhook';
  const webhookUrl = `${window.location.origin}/api/v1/workflows/${wfId}/trigger${httpPath}`;

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Webhook URL</span>
        <span class="config-section-desc">Use this URL to trigger the workflow</span>
      </div>
      <div class="config-field">
        <div class="webhook-url-container">
          <code class="webhook-url">${webhookUrl}</code>
          <button
            class="copy-btn"
            @click=${() => {
              navigator.clipboard.writeText(webhookUrl);
            }}
            title="Copy URL"
          >
            <nr-icon name="copy" size="small"></nr-icon>
          </button>
        </div>
      </div>
    </div>
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">HTTP Settings</span>
      </div>
      <div class="config-field">
        <label>Path</label>
        <nr-input
          value=${config.httpPath || '/webhook'}
          placeholder="/webhook"
          @nr-input=${(e: CustomEvent) => onUpdate('httpPath', e.detail.value)}
        ></nr-input>
        <span class="field-description">Custom path suffix for this trigger</span>
      </div>
      <div class="config-field">
        <label>Allowed Methods</label>
        <div class="method-checkboxes">
          ${['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(method => {
            const methods = (config.httpMethods as string[]) || ['POST'];
            const isChecked = methods.includes(method);
            return html`
              <label class="method-checkbox">
                <input
                  type="checkbox"
                  .checked=${isChecked}
                  @change=${(e: Event) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    const currentMethods = (config.httpMethods as string[]) || ['POST'];
                    const newMethods = checked
                      ? [...currentMethods, method]
                      : currentMethods.filter(m => m !== method);
                    onUpdate('httpMethods', newMethods.length > 0 ? newMethods : ['POST']);
                  }}
                />
                <span class="method-label">${method}</span>
              </label>
            `;
          })}
        </div>
      </div>
      <div class="config-field">
        <label>Authentication</label>
        <nr-select
          .value=${config.httpAuth || 'none'}
          .options=${[
            { label: 'None', value: 'none' },
            { label: 'API Key', value: 'api_key' },
            { label: 'Bearer Token', value: 'bearer' },
            { label: 'Basic Auth', value: 'basic' }
          ]}
          @nr-change=${(e: CustomEvent) => onUpdate('httpAuth', e.detail.value)}
        ></nr-select>
      </div>
      <div class="config-field">
        <label>Rate Limit (req/min)</label>
        <nr-input
          type="number"
          value=${String(config.httpRateLimit || 100)}
          @nr-input=${(e: CustomEvent) => onUpdate('httpRateLimit', parseInt(e.detail.value))}
        ></nr-input>
      </div>
    </div>
  `;
}

/**
 * Render HTTP End node fields
 */
export function renderHttpEndFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Status Code</label>
      <nr-input
        type="number"
        value=${String(config.httpStatusCode || 200)}
        @nr-input=${(e: CustomEvent) => onUpdate('httpStatusCode', parseInt(e.detail.value))}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>Content Type</label>
      <nr-input
        value=${config.httpContentType || 'application/json'}
        placeholder="application/json"
        @nr-input=${(e: CustomEvent) => onUpdate('httpContentType', e.detail.value)}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>Response Body</label>
      <nr-input
        value=${config.httpResponseBody || '{{data}}'}
        placeholder="{{data}}"
        @nr-input=${(e: CustomEvent) => onUpdate('httpResponseBody', e.detail.value)}
      ></nr-input>
      <span class="field-description">Use \${variables.varName} to reference variables</span>
    </div>
  `;
}

/**
 * Render HTTP node fields
 */
export function renderHttpFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Method</label>
      <nr-input
        value=${config.method || 'GET'}
        placeholder="GET, POST, PUT, DELETE"
        @nr-input=${(e: CustomEvent) => onUpdate('method', e.detail.value)}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>URL</label>
      <nr-input
        value=${config.url || ''}
        placeholder="https://api.example.com"
        @nr-input=${(e: CustomEvent) => onUpdate('url', e.detail.value)}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>Timeout (ms)</label>
      <nr-input
        type="number"
        value=${String(config.timeout || 30000)}
        @nr-input=${(e: CustomEvent) => onUpdate('timeout', parseInt(e.detail.value))}
      ></nr-input>
    </div>
  `;
}
