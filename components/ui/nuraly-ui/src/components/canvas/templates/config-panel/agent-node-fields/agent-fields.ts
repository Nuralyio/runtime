/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

/**
 * Render Agent node fields
 */
export function renderAgentFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Connections</span>
        <span class="config-section-desc">Connect nodes to the agent's input ports</span>
      </div>
      <div class="config-info-box">
        <nr-icon name="cpu" size="small"></nr-icon>
        <span><strong>LLM</strong> - Model configuration (provider, API key, model)</span>
      </div>
      <div class="config-info-box">
        <nr-icon name="message-square" size="small"></nr-icon>
        <span><strong>Prompt</strong> - System prompt template for agent behavior</span>
      </div>
      <div class="config-info-box">
        <nr-icon name="database" size="small"></nr-icon>
        <span><strong>Memory</strong> - Conversation history (optional)</span>
      </div>
      <div class="config-info-box">
        <nr-icon name="tool" size="small"></nr-icon>
        <span><strong>Tools</strong> - Connect Tool nodes for agent to use (optional)</span>
      </div>
      <div class="config-info-box">
        <nr-icon name="braces" size="small"></nr-icon>
        <span><strong>Structured Output</strong> - JSON schema to constrain output format (optional)</span>
      </div>
    </div>
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Agent Settings</span>
      </div>
      <div class="config-field">
        <label>Agent ID</label>
        <nr-input
          value=${config.agentId || ''}
          placeholder="Agent identifier"
          @nr-input=${(e: CustomEvent) => onUpdate('agentId', e.detail.value)}
        ></nr-input>
        <span class="field-description">Unique identifier for this agent</span>
      </div>
      <div class="config-field">
        <label>Max Iterations</label>
        <nr-input
          type="number"
          value=${String(config.maxIterations || 10)}
          @nr-input=${(e: CustomEvent) => onUpdate('maxIterations', parseInt(e.detail.value))}
        ></nr-input>
        <span class="field-description">Maximum tool call loops before stopping</span>
      </div>
    </div>
  `;
}
