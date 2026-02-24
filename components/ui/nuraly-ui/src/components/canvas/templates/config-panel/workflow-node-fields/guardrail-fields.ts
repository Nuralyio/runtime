/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult, nothing } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

interface GuardrailCheck {
  type: string;
  action?: string;
  categories?: string[];
  sensitivity?: string;
  blocked?: string[];
  minLength?: number;
  maxLength?: number;
  patterns?: string[];
  mode?: string;
  apiKey?: string;
  policies?: Array<{ name: string; description: string }>;
  threshold?: number;
  topics?: Array<{ name: string; description: string }>;
}

/**
 * Render Guardrail node fields
 */
export function renderGuardrailFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const checks = (config.checks || []) as GuardrailCheck[];

  const addCheck = (type: string) => {
    const newCheck: GuardrailCheck = { type, action: 'block' };
    if (type === 'pii') newCheck.categories = ['email', 'phone'];
    if (type === 'injection') newCheck.sensitivity = 'high';
    if (type === 'moderation') newCheck.categories = ['hate', 'violence'];
    if (type === 'length') { newCheck.minLength = 1; newCheck.maxLength = 10000; }
    onUpdate('checks', [...checks, newCheck]);
  };

  const updateCheck = (index: number, key: string, value: unknown) => {
    const updated = [...checks];
    updated[index] = { ...updated[index], [key]: value };
    onUpdate('checks', updated);
  };

  const removeCheck = (index: number) => {
    const updated = checks.filter((_, i) => i !== index);
    onUpdate('checks', updated);
  };

  return html`
    <div class="config-field">
      <label>Mode</label>
      <nr-select
        .value=${config.mode || 'input'}
        .options=${[
          { label: 'Input (before LLM)', value: 'input' },
          { label: 'Output (after LLM)', value: 'output' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('mode', e.detail.value)}
      ></nr-select>
    </div>

    <div class="config-field">
      <label>Content Field</label>
      <nr-input
        value=${config.contentField || 'content'}
        placeholder="content"
        @nr-input=${(e: CustomEvent) => onUpdate('contentField', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Input field to validate</small>
    </div>

    <div class="config-field">
      <label>On Fail</label>
      <nr-select
        .value=${config.onFail || 'block'}
        .options=${[
          { label: 'Block (stop workflow)', value: 'block' },
          { label: 'Warn (continue with warning)', value: 'warn' },
          { label: 'Passthrough (log only)', value: 'passthrough' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('onFail', e.detail.value)}
      ></nr-select>
    </div>

    <hr style="margin: 16px 0; border: none; border-top: 1px solid var(--nr-border-color);" />

    <div class="config-section-title" style="display: flex; justify-content: space-between; align-items: center;">
      <span>Checks (${checks.length})</span>
      <nr-dropdown>
        <nr-button slot="trigger" size="small" variant="secondary">
          <nr-icon name="plus" size="small"></nr-icon> Add Check
        </nr-button>
        <nr-menu>
          <nr-menu-item @click=${() => addCheck('pii')}>PII Detection</nr-menu-item>
          <nr-menu-item @click=${() => addCheck('injection')}>Prompt Injection</nr-menu-item>
          <nr-menu-item @click=${() => addCheck('moderation')}>Content Moderation</nr-menu-item>
          <nr-menu-item @click=${() => addCheck('topics')}>Topic Blocking</nr-menu-item>
          <nr-menu-item @click=${() => addCheck('length')}>Length Validation</nr-menu-item>
          <nr-menu-item @click=${() => addCheck('regex')}>Regex Pattern</nr-menu-item>
          <nr-divider></nr-divider>
          <nr-menu-item @click=${() => addCheck('openai_moderation')}>OpenAI Moderation (API)</nr-menu-item>
          <nr-menu-item @click=${() => addCheck('llm_policy')}>LLM Policy (API)</nr-menu-item>
          <nr-menu-item @click=${() => addCheck('semantic_topic')}>Semantic Topic (API)</nr-menu-item>
        </nr-menu>
      </nr-dropdown>
    </div>

    ${checks.length === 0 ? html`
      <div class="config-empty" style="text-align: center; padding: 20px; color: var(--nr-text-secondary);">
        No checks configured. Add checks to validate content.
      </div>
    ` : checks.map((check, index) => html`
      <div class="config-check-card" style="border: 1px solid var(--nr-border-color); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong>${getCheckLabel(check.type)}</strong>
          <nr-button size="small" variant="ghost" @click=${() => removeCheck(index)}>
            <nr-icon name="trash-2" size="small"></nr-icon>
          </nr-button>
        </div>
        ${renderCheckFields(check, index, updateCheck)}
      </div>
    `)}
  `;
}

function getCheckLabel(type: string): string {
  const labels: Record<string, string> = {
    pii: 'PII Detection',
    injection: 'Prompt Injection',
    moderation: 'Content Moderation',
    topics: 'Topic Blocking',
    length: 'Length Validation',
    regex: 'Regex Pattern',
    openai_moderation: 'OpenAI Moderation',
    llm_policy: 'LLM Policy',
    semantic_topic: 'Semantic Topic',
  };
  return labels[type] || type;
}

function renderCheckFields(
  check: GuardrailCheck,
  index: number,
  updateCheck: (index: number, key: string, value: unknown) => void
): TemplateResult {
  const actionField = html`
    <div class="config-field" style="margin-bottom: 8px;">
      <label style="font-size: 12px;">Action</label>
      <nr-select
        size="small"
        .value=${check.action || 'block'}
        .options=${[
          { label: 'Block', value: 'block' },
          { label: 'Redact', value: 'redact' },
          { label: 'Warn', value: 'warn' },
        ]}
        @nr-change=${(e: CustomEvent) => updateCheck(index, 'action', e.detail.value)}
      ></nr-select>
    </div>
  `;

  switch (check.type) {
    case 'pii':
      return html`
        ${actionField}
        <div class="config-field">
          <label style="font-size: 12px;">Categories</label>
          <nr-select
            size="small"
            multiple
            .value=${check.categories || []}
            .options=${[
              { label: 'Email', value: 'email' },
              { label: 'Phone', value: 'phone' },
              { label: 'SSN', value: 'ssn' },
              { label: 'Credit Card', value: 'credit_card' },
              { label: 'IP Address', value: 'ip' },
            ]}
            @nr-change=${(e: CustomEvent) => updateCheck(index, 'categories', e.detail.value)}
          ></nr-select>
        </div>
      `;

    case 'injection':
      return html`
        ${actionField}
        <div class="config-field">
          <label style="font-size: 12px;">Sensitivity</label>
          <nr-select
            size="small"
            .value=${check.sensitivity || 'high'}
            .options=${[
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' },
            ]}
            @nr-change=${(e: CustomEvent) => updateCheck(index, 'sensitivity', e.detail.value)}
          ></nr-select>
        </div>
      `;

    case 'moderation':
      return html`
        ${actionField}
        <div class="config-field">
          <label style="font-size: 12px;">Categories</label>
          <nr-select
            size="small"
            multiple
            .value=${check.categories || []}
            .options=${[
              { label: 'Hate', value: 'hate' },
              { label: 'Violence', value: 'violence' },
              { label: 'Sexual', value: 'sexual' },
              { label: 'Self Harm', value: 'self_harm' },
              { label: 'Profanity', value: 'profanity' },
            ]}
            @nr-change=${(e: CustomEvent) => updateCheck(index, 'categories', e.detail.value)}
          ></nr-select>
        </div>
      `;

    case 'topics':
      return html`
        ${actionField}
        <div class="config-field">
          <label style="font-size: 12px;">Blocked Topics</label>
          <nr-input
            size="small"
            value=${(check.blocked || []).join(', ')}
            placeholder="politics, religion, competitors"
            @nr-input=${(e: CustomEvent) => {
              const topics = e.detail.value.split(',').map((t: string) => t.trim()).filter(Boolean);
              updateCheck(index, 'blocked', topics);
            }}
          ></nr-input>
          <small class="field-hint">Comma-separated keywords to block</small>
        </div>
      `;

    case 'length':
      return html`
        ${actionField}
        <div style="display: flex; gap: 8px;">
          <div class="config-field" style="flex: 1;">
            <label style="font-size: 12px;">Min Length</label>
            <nr-input
              size="small"
              type="number"
              value=${check.minLength || 1}
              @nr-input=${(e: CustomEvent) => updateCheck(index, 'minLength', parseInt(e.detail.value) || 1)}
            ></nr-input>
          </div>
          <div class="config-field" style="flex: 1;">
            <label style="font-size: 12px;">Max Length</label>
            <nr-input
              size="small"
              type="number"
              value=${check.maxLength || 10000}
              @nr-input=${(e: CustomEvent) => updateCheck(index, 'maxLength', parseInt(e.detail.value) || 10000)}
            ></nr-input>
          </div>
        </div>
      `;

    case 'regex':
      return html`
        ${actionField}
        <div class="config-field">
          <label style="font-size: 12px;">Patterns</label>
          <nr-input
            size="small"
            value=${(check.patterns || []).join(', ')}
            placeholder="password\\s*[:=]\\s*\\S+"
            @nr-input=${(e: CustomEvent) => {
              const patterns = e.detail.value.split(',').map((p: string) => p.trim()).filter(Boolean);
              updateCheck(index, 'patterns', patterns);
            }}
          ></nr-input>
        </div>
        <div class="config-field">
          <label style="font-size: 12px;">Mode</label>
          <nr-select
            size="small"
            .value=${check.mode || 'block_match'}
            .options=${[
              { label: 'Block if matches', value: 'block_match' },
              { label: 'Require match', value: 'require_match' },
            ]}
            @nr-change=${(e: CustomEvent) => updateCheck(index, 'mode', e.detail.value)}
          ></nr-select>
        </div>
      `;

    case 'openai_moderation':
    case 'llm_policy':
    case 'semantic_topic':
      return html`
        ${actionField}
        <div class="config-field">
          <label style="font-size: 12px;">API Key Path</label>
          <nr-input
            size="small"
            value=${check.apiKey || ''}
            placeholder="openai/api-key"
            @nr-input=${(e: CustomEvent) => updateCheck(index, 'apiKey', e.detail.value)}
          ></nr-input>
          <small class="field-hint">KV store path for API key</small>
        </div>
        ${check.type === 'semantic_topic' ? html`
          <div class="config-field">
            <label style="font-size: 12px;">Threshold</label>
            <nr-input
              size="small"
              type="number"
              value=${check.threshold || 0.75}
              min="0"
              max="1"
              step="0.05"
              @nr-input=${(e: CustomEvent) => updateCheck(index, 'threshold', parseFloat(e.detail.value) || 0.75)}
            ></nr-input>
          </div>
        ` : nothing}
      `;

    default:
      return html`${actionField}`;
  }
}
