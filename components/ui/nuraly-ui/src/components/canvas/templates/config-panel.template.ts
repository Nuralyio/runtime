/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import {
  WorkflowNode,
  NodeConfiguration,
  NODE_TEMPLATES,
  WorkflowNodeType,
  AgentNodeType,
} from '../workflow-canvas.types.js';

/**
 * Callbacks for config panel interactions
 */
export interface ConfigPanelCallbacks {
  onClose: () => void;
  onUpdateName: (name: string) => void;
  onUpdateDescription: (description: string) => void;
  onUpdateConfig: (key: string, value: unknown) => void;
}

/**
 * Data required for rendering the config panel
 */
export interface ConfigPanelTemplateData {
  node: WorkflowNode | null;
  position: { x: number; y: number } | null;
  callbacks: ConfigPanelCallbacks;
}

/**
 * Render common fields (name and description)
 */
function renderCommonFields(
  node: WorkflowNode,
  callbacks: ConfigPanelCallbacks
): TemplateResult {
  return html`
    <div class="config-field">
      <label>Name</label>
      <nr-input
        value=${node.name}
        placeholder="Node name"
        @nr-input=${(e: CustomEvent) => callbacks.onUpdateName(e.detail.value)}
      ></nr-input>
    </div>
    <div class="config-field">
      <label>Description</label>
      <nr-input
        value=${node.metadata?.description || ''}
        placeholder="Description"
        @nr-input=${(e: CustomEvent) => callbacks.onUpdateDescription(e.detail.value)}
      ></nr-input>
    </div>
  `;
}

/**
 * Render type-specific config fields
 */
function renderTypeFields(
  type: string,
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult | typeof nothing {
  switch (type) {
    case WorkflowNodeType.HTTP:
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

    case WorkflowNodeType.FUNCTION:
      return html`
        <div class="config-field">
          <label>Function ID</label>
          <nr-input
            value=${config.functionId || ''}
            placeholder="Enter function ID"
            @nr-input=${(e: CustomEvent) => onUpdate('functionId', e.detail.value)}
          ></nr-input>
        </div>
      `;

    case WorkflowNodeType.CONDITION:
      return html`
        <div class="config-field">
          <label>Expression</label>
          <nr-input
            value=${config.expression || ''}
            placeholder="data.value > 10"
            @nr-input=${(e: CustomEvent) => onUpdate('expression', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Language</label>
          <nr-input
            value=${config.language || 'javascript'}
            placeholder="javascript or jsonata"
            @nr-input=${(e: CustomEvent) => onUpdate('language', e.detail.value)}
          ></nr-input>
        </div>
      `;

    case WorkflowNodeType.DELAY:
      return html`
        <div class="config-field">
          <label>Duration</label>
          <nr-input
            type="number"
            value=${String(config.duration || 1000)}
            @nr-input=${(e: CustomEvent) => onUpdate('duration', parseInt(e.detail.value))}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Unit</label>
          <nr-input
            value=${config.unit || 'milliseconds'}
            placeholder="milliseconds, seconds, minutes"
            @nr-input=${(e: CustomEvent) => onUpdate('unit', e.detail.value)}
          ></nr-input>
        </div>
      `;

    case WorkflowNodeType.LOOP:
      return html`
        <div class="config-field">
          <label>Iterator Variable</label>
          <nr-input
            value=${config.iteratorVariable || 'item'}
            placeholder="Variable name"
            @nr-input=${(e: CustomEvent) => onUpdate('iteratorVariable', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Array Expression</label>
          <nr-input
            value=${config.arrayExpression || ''}
            placeholder="data.items"
            @nr-input=${(e: CustomEvent) => onUpdate('arrayExpression', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Max Iterations</label>
          <nr-input
            type="number"
            value=${String(config.maxIterations || 100)}
            @nr-input=${(e: CustomEvent) => onUpdate('maxIterations', parseInt(e.detail.value))}
          ></nr-input>
        </div>
      `;

    case WorkflowNodeType.TRANSFORM:
      return html`
        <div class="config-field">
          <label>Transform Expression</label>
          <nr-input
            value=${config.transformExpression || ''}
            placeholder="JSONata expression"
            @nr-input=${(e: CustomEvent) => onUpdate('transformExpression', e.detail.value)}
          ></nr-input>
        </div>
      `;

    case WorkflowNodeType.EMAIL:
      return html`
        <div class="config-field">
          <label>To</label>
          <nr-input
            value=${(config as any).to || ''}
            placeholder="recipient@example.com"
            @nr-input=${(e: CustomEvent) => onUpdate('to', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Subject</label>
          <nr-input
            value=${(config as any).subject || ''}
            placeholder="Email subject"
            @nr-input=${(e: CustomEvent) => onUpdate('subject', e.detail.value)}
          ></nr-input>
        </div>
      `;

    case AgentNodeType.AGENT:
      return html`
        <div class="config-field">
          <label>Agent ID</label>
          <nr-input
            value=${config.agentId || ''}
            placeholder="Agent identifier"
            @nr-input=${(e: CustomEvent) => onUpdate('agentId', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>System Prompt</label>
          <nr-input
            value=${config.systemPrompt || ''}
            placeholder="System prompt for the agent"
            @nr-input=${(e: CustomEvent) => onUpdate('systemPrompt', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Model</label>
          <nr-input
            value=${config.model || 'gpt-4'}
            placeholder="gpt-4, claude-3, etc."
            @nr-input=${(e: CustomEvent) => onUpdate('model', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Temperature</label>
          <nr-input
            type="number"
            value=${String(config.temperature || 0.7)}
            @nr-input=${(e: CustomEvent) => onUpdate('temperature', parseFloat(e.detail.value))}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Max Tokens</label>
          <nr-input
            type="number"
            value=${String(config.maxTokens || 2048)}
            @nr-input=${(e: CustomEvent) => onUpdate('maxTokens', parseInt(e.detail.value))}
          ></nr-input>
        </div>
      `;

    case AgentNodeType.LLM:
      return html`
        <div class="config-field">
          <label>Provider</label>
          <nr-input
            value=${config.provider || 'openai'}
            placeholder="openai, anthropic, local"
            @nr-input=${(e: CustomEvent) => onUpdate('provider', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Model Name</label>
          <nr-input
            value=${config.modelName || 'gpt-4'}
            placeholder="Model name"
            @nr-input=${(e: CustomEvent) => onUpdate('modelName', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Temperature</label>
          <nr-input
            type="number"
            value=${String(config.temperature || 0.7)}
            @nr-input=${(e: CustomEvent) => onUpdate('temperature', parseFloat(e.detail.value))}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Max Tokens</label>
          <nr-input
            type="number"
            value=${String(config.maxTokens || 2048)}
            @nr-input=${(e: CustomEvent) => onUpdate('maxTokens', parseInt(e.detail.value))}
          ></nr-input>
        </div>
      `;

    case AgentNodeType.PROMPT:
      return html`
        <div class="config-field">
          <label>Template</label>
          <nr-input
            value=${(config as any).template || ''}
            placeholder="Prompt template with {variables}"
            @nr-input=${(e: CustomEvent) => onUpdate('template', e.detail.value)}
          ></nr-input>
        </div>
      `;

    case AgentNodeType.MEMORY:
      return html`
        <div class="config-field">
          <label>Memory Type</label>
          <nr-input
            value=${config.memoryType || 'buffer'}
            placeholder="buffer, summary, vector"
            @nr-input=${(e: CustomEvent) => onUpdate('memoryType', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Max Messages</label>
          <nr-input
            type="number"
            value=${String(config.maxMessages || 10)}
            @nr-input=${(e: CustomEvent) => onUpdate('maxMessages', parseInt(e.detail.value))}
          ></nr-input>
        </div>
      `;

    case AgentNodeType.TOOL:
      return html`
        <div class="config-field">
          <label>Tool Name</label>
          <nr-input
            value=${config.toolName || ''}
            placeholder="Tool identifier"
            @nr-input=${(e: CustomEvent) => onUpdate('toolName', e.detail.value)}
          ></nr-input>
        </div>
      `;

    case AgentNodeType.RETRIEVER:
      return html`
        <div class="config-field">
          <label>Vector Store ID</label>
          <nr-input
            value=${(config as any).vectorStoreId || ''}
            placeholder="Vector store identifier"
            @nr-input=${(e: CustomEvent) => onUpdate('vectorStoreId', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Top K</label>
          <nr-input
            type="number"
            value=${String((config as any).topK || 5)}
            @nr-input=${(e: CustomEvent) => onUpdate('topK', parseInt(e.detail.value))}
          ></nr-input>
        </div>
      `;

    default:
      return nothing;
  }
}

/**
 * Render the config panel
 */
export function renderConfigPanelTemplate(
  data: ConfigPanelTemplateData
): TemplateResult | typeof nothing {
  const { node, position, callbacks } = data;

  if (!node || !position) return nothing;

  const template = NODE_TEMPLATES.find(t => t.type === node.type);

  const panelStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  return html`
    <div class="config-panel" style=${styleMap(panelStyle)}>
      <div class="config-panel-header">
        <div class="config-panel-title">
          <div
            class="config-panel-icon"
            style="background: ${template?.color || '#3b82f6'}"
          >
            <nr-icon name=${template?.icon || 'box'} size="small"></nr-icon>
          </div>
          <span>${node.name}</span>
        </div>
        <button class="config-panel-close" @click=${callbacks.onClose}>
          <nr-icon name="x" size="small"></nr-icon>
        </button>
      </div>
      <div class="config-panel-content">
        ${renderCommonFields(node, callbacks)}
        ${renderTypeFields(node.type, node.configuration, callbacks.onUpdateConfig)}
      </div>
    </div>
  `;
}
