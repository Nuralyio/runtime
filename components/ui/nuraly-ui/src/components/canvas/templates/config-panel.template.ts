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
  DataOperation,
} from '../workflow-canvas.types.js';

// Import data node field components
import '../data-node/data-node-fields.component.js';

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
 * Check if a section should be shown based on operation
 */
function shouldShowSection(sectionId: string, operation: DataOperation | string): boolean {
  const showWhenMap: Record<string, DataOperation[]> = {
    filter: ['QUERY', 'UPDATE', 'DELETE'],
    fields: ['INSERT', 'UPDATE'],
    select: ['QUERY'],
    sorting: ['QUERY'],
    pagination: ['QUERY'],
  };

  if (!showWhenMap[sectionId]) return true;
  return showWhenMap[sectionId].includes(operation as DataOperation);
}

/**
 * Render Data Node specific configuration fields
 */
function renderDataNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const operation = (config.operation as DataOperation) || 'QUERY';

  // Mock data sources and fields for demo (in real app, these would come from a service)
  const mockDataSources = [
    { id: 'ds1', name: 'Production DB', type: 'postgresql' as const },
    { id: 'ds2', name: 'Analytics DB', type: 'mysql' as const },
    { id: 'ds3', name: 'User Store', type: 'mongodb' as const },
  ];

  const mockEntities = [
    { id: 'users', name: 'users', type: 'table' as const },
    { id: 'orders', name: 'orders', type: 'table' as const },
    { id: 'products', name: 'products', type: 'table' as const },
  ];

  const mockFields = [
    { id: 'id', name: 'id', type: 'number' as const },
    { id: 'name', name: 'name', type: 'string' as const },
    { id: 'email', name: 'email', type: 'string' as const },
    { id: 'status', name: 'status', type: 'string' as const },
    { id: 'created_at', name: 'created_at', type: 'datetime' as const },
    { id: 'balance', name: 'balance', type: 'number' as const },
  ];

  return html`
    <!-- Basic Section -->
    <div class="config-section">
      <div class="config-field">
        <label>Operation</label>
        <nr-operation-select
          .value=${operation}
          @value-change=${(e: CustomEvent) => onUpdate('operation', e.detail.value)}
        ></nr-operation-select>
      </div>

      <div class="config-field">
        <nr-datasource-select
          label="Data Source"
          .value=${config.dataSource || null}
          .dataSources=${mockDataSources}
          description="Database connection to use"
          @value-change=${(e: CustomEvent) => onUpdate('dataSource', e.detail.value)}
        ></nr-datasource-select>
      </div>

      <div class="config-field">
        <nr-entity-select
          label="Table / Collection"
          .value=${config.entity || null}
          .entities=${mockEntities}
          description="Table or collection to query"
          @value-change=${(e: CustomEvent) => onUpdate('entity', e.detail.value)}
        ></nr-entity-select>
      </div>
    </div>

    <!-- Filter Section -->
    ${shouldShowSection('filter', operation) ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Filter</span>
          <span class="config-section-desc">Define conditions to filter records</span>
        </div>
        <nr-filter-builder
          .value=${config.filter || null}
          .fields=${mockFields}
          allowExpressions
          description="Add conditions to filter records"
          @value-change=${(e: CustomEvent) => onUpdate('filter', e.detail.value)}
        ></nr-filter-builder>
      </div>
    ` : nothing}

    <!-- Fields Section (for INSERT/UPDATE) -->
    ${shouldShowSection('fields', operation) ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Fields</span>
        </div>
        <nr-field-mapper
          label="Field Values"
          .value=${config.fields || {}}
          .fields=${mockFields}
          allowExpressions
          description="Map values to database fields"
          @value-change=${(e: CustomEvent) => onUpdate('fields', e.detail.value)}
        ></nr-field-mapper>
      </div>
    ` : nothing}

    <!-- Select Fields Section (for QUERY) -->
    ${shouldShowSection('select', operation) ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Select Fields</span>
        </div>
        <nr-field-multi-select
          label="Fields to Return"
          .value=${config.select || []}
          .fields=${mockFields}
          placeholder="All fields"
          description="Leave empty to return all fields"
          @value-change=${(e: CustomEvent) => onUpdate('select', e.detail.value)}
        ></nr-field-multi-select>
      </div>
    ` : nothing}

    <!-- Sorting Section (for QUERY) -->
    ${shouldShowSection('sorting', operation) ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Sorting</span>
        </div>
        <nr-sort-builder
          label="Order By"
          .value=${config.orderBy || []}
          .fields=${mockFields}
          @value-change=${(e: CustomEvent) => onUpdate('orderBy', e.detail.value)}
        ></nr-sort-builder>
      </div>
    ` : nothing}

    <!-- Pagination Section (for QUERY) -->
    ${shouldShowSection('pagination', operation) ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Pagination</span>
        </div>
        <div class="config-field">
          <label>Limit</label>
          <nr-input
            type="number"
            .value=${String(config.limit || '')}
            placeholder="No limit"
            @nr-input=${(e: CustomEvent) => onUpdate('limit', e.detail.value ? parseInt(e.detail.value) : null)}
          ></nr-input>
          <span class="field-description">Maximum records to return</span>
        </div>
        <div class="config-field">
          <label>Offset</label>
          <nr-input
            type="number"
            .value=${String(config.offset || '')}
            placeholder="0"
            @nr-input=${(e: CustomEvent) => onUpdate('offset', e.detail.value ? parseInt(e.detail.value) : null)}
          ></nr-input>
          <span class="field-description">Number of records to skip</span>
        </div>
      </div>
    ` : nothing}

    <!-- Output Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Output</span>
      </div>
      <nr-variable-name-input
        label="Save Result To"
        .value=${config.outputVariable || 'results'}
        placeholder="results"
        description="Variable name to store the result"
        @value-change=${(e: CustomEvent) => onUpdate('outputVariable', e.detail.value)}
      ></nr-variable-name-input>
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

    case WorkflowNodeType.DATABASE:
      return renderDataNodeFields(config, onUpdate);

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
