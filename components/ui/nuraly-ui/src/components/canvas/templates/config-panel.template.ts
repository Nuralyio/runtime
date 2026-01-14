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
  DbDesignerNodeType,
  DataOperation,
} from '../workflow-canvas.types.js';

// Import data node field components
import '../data-node/data-node-fields.component.js';

// Import chatbot trigger field components
import '../chatbot-trigger/chatbot-trigger-fields.component.js';

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
    filter: [DataOperation.QUERY, DataOperation.UPDATE, DataOperation.DELETE],
    fields: [DataOperation.INSERT, DataOperation.UPDATE],
    select: [DataOperation.QUERY],
    sorting: [DataOperation.QUERY],
    pagination: [DataOperation.QUERY],
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
 * Render Chatbot Trigger specific configuration fields
 */
function renderChatbotTriggerFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <!-- Trigger Events Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Trigger Events</span>
        <span class="config-section-desc">Select when the workflow should trigger</span>
      </div>
      <nr-trigger-event-select
        .value=${(config.triggerEvents as string[]) || ['MESSAGE_SENT']}
        @value-change=${(e: CustomEvent) => onUpdate('triggerEvents', e.detail.value)}
      ></nr-trigger-event-select>
    </div>

    <!-- Chatbot Appearance Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Appearance</span>
        <span class="config-section-desc">Configure chatbot appearance</span>
      </div>

      <div class="config-field">
        <label>Title</label>
        <nr-input
          .value=${(config.title as string) || 'Chat Assistant'}
          placeholder="Chatbot title"
          @nr-input=${(e: CustomEvent) => onUpdate('title', e.detail.value)}
        ></nr-input>
      </div>

      <div class="config-field">
        <label>Subtitle</label>
        <nr-input
          .value=${(config.subtitle as string) || ''}
          placeholder="Chatbot subtitle"
          @nr-input=${(e: CustomEvent) => onUpdate('subtitle', e.detail.value)}
        ></nr-input>
      </div>

      <div class="config-field">
        <label>Placeholder</label>
        <nr-input
          .value=${(config.placeholder as string) || 'Type a message...'}
          placeholder="Input placeholder text"
          @nr-input=${(e: CustomEvent) => onUpdate('placeholder', e.detail.value)}
        ></nr-input>
      </div>

      <nr-chatbot-size-select
        label="Size"
        .value=${(config.chatbotSize as string) || 'medium'}
        @value-change=${(e: CustomEvent) => onUpdate('chatbotSize', e.detail.value)}
      ></nr-chatbot-size-select>

      <nr-chatbot-variant-select
        label="Variant"
        .value=${(config.chatbotVariant as string) || 'floating'}
        @value-change=${(e: CustomEvent) => onUpdate('chatbotVariant', e.detail.value)}
      ></nr-chatbot-variant-select>
    </div>

    <!-- Behavior Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Behavior</span>
        <span class="config-section-desc">Configure chatbot behavior</span>
      </div>

      <div class="config-field">
        <label>Initial Message</label>
        <nr-input
          .value=${(config.initialMessage as string) || ''}
          placeholder="Optional greeting message"
          @nr-input=${(e: CustomEvent) => onUpdate('initialMessage', e.detail.value)}
        ></nr-input>
        <span class="field-description">Message shown when chat opens</span>
      </div>

      <nr-feature-toggle
        label="Typing Indicator"
        description="Show typing animation when waiting for response"
        .checked=${config.enableTypingIndicator !== false}
        @toggle-change=${(e: CustomEvent) => onUpdate('enableTypingIndicator', e.detail.checked)}
      ></nr-feature-toggle>

      <nr-loading-type-select
        label="Loading Animation"
        .value=${(config.loadingType as string) || 'dots'}
        @value-change=${(e: CustomEvent) => onUpdate('loadingType', e.detail.value)}
      ></nr-loading-type-select>
    </div>

    <!-- Suggestions Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Suggestions</span>
        <span class="config-section-desc">Quick reply suggestions for users</span>
      </div>

      <nr-feature-toggle
        label="Enable Suggestions"
        description="Show quick reply buttons to users"
        .checked=${config.enableSuggestions === true}
        @toggle-change=${(e: CustomEvent) => onUpdate('enableSuggestions', e.detail.checked)}
      ></nr-feature-toggle>

      ${config.enableSuggestions ? html`
        <nr-suggestion-list
          label="Suggestion Items"
          .value=${(config.suggestions as string[]) || []}
          @value-change=${(e: CustomEvent) => onUpdate('suggestions', e.detail.value)}
        ></nr-suggestion-list>
      ` : nothing}
    </div>

    <!-- Preview Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Preview</span>
      </div>
      <nr-chatbot-preview
        .title=${(config.title as string) || 'Chat Assistant'}
        .subtitle=${(config.subtitle as string) || 'Ask me anything'}
        .variant=${(config.chatbotVariant as string) || 'floating'}
      ></nr-chatbot-preview>
    </div>
  `;
}

/**
 * Render Table node specific configuration fields
 */
function renderTableNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const columns = (config.columns as Array<{name: string; type: string; nullable?: boolean; defaultValue?: unknown}>) || [];

  return html`
    <!-- Table Name Section -->
    <div class="config-section">
      <div class="config-field">
        <label>Table Name</label>
        <nr-input
          .value=${(config.tableName as string) || ''}
          placeholder="e.g., users, orders"
          @nr-input=${(e: CustomEvent) => onUpdate('tableName', e.detail.value)}
        ></nr-input>
        <span class="field-description">Name of the database table</span>
      </div>
    </div>

    <!-- Primary Key Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Primary Key</span>
      </div>
      <div class="config-field">
        <label>Primary Key Column</label>
        <nr-input
          .value=${(config.primaryKey as string) || ''}
          placeholder="e.g., id"
          @nr-input=${(e: CustomEvent) => onUpdate('primaryKey', e.detail.value)}
        ></nr-input>
        <span class="field-description">Column that uniquely identifies each row</span>
      </div>
    </div>

    <!-- Columns Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Columns</span>
        <span class="config-section-desc">Define table columns</span>
      </div>
      <div class="config-columns-list">
        ${columns.map((col, index) => html`
          <div class="config-column-item">
            <div class="config-field">
              <label>Column ${index + 1}</label>
              <div class="column-inputs">
                <nr-input
                  .value=${col.name || ''}
                  placeholder="Column name"
                  @nr-input=${(e: CustomEvent) => {
                    const newColumns = [...columns];
                    newColumns[index] = { ...newColumns[index], name: e.detail.value };
                    onUpdate('columns', newColumns);
                  }}
                ></nr-input>
                <nr-input
                  .value=${col.type || ''}
                  placeholder="Type (VARCHAR, INT, etc.)"
                  @nr-input=${(e: CustomEvent) => {
                    const newColumns = [...columns];
                    newColumns[index] = { ...newColumns[index], type: e.detail.value };
                    onUpdate('columns', newColumns);
                  }}
                ></nr-input>
              </div>
            </div>
            <button
              class="remove-column-btn"
              @click=${() => {
                const newColumns = columns.filter((_, i) => i !== index);
                onUpdate('columns', newColumns);
              }}
            >
              <nr-icon name="trash-2" size="small"></nr-icon>
            </button>
          </div>
        `)}
        <button
          class="add-column-btn"
          @click=${() => {
            const newColumns = [...columns, { name: '', type: 'VARCHAR(255)', nullable: true }];
            onUpdate('columns', newColumns);
          }}
        >
          <nr-icon name="plus" size="small"></nr-icon>
          Add Column
        </button>
      </div>
    </div>
  `;
}

/**
 * Render View node specific configuration fields
 */
function renderViewNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <!-- View Name Section -->
    <div class="config-section">
      <div class="config-field">
        <label>View Name</label>
        <nr-input
          .value=${(config.viewName as string) || ''}
          placeholder="e.g., active_users_view"
          @nr-input=${(e: CustomEvent) => onUpdate('viewName', e.detail.value)}
        ></nr-input>
        <span class="field-description">Name of the database view</span>
      </div>
    </div>

    <!-- Query Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Query Definition</span>
      </div>
      <div class="config-field">
        <label>SQL Query</label>
        <nr-input
          .value=${(config.query as string) || ''}
          placeholder="SELECT * FROM users WHERE status = 'active'"
          @nr-input=${(e: CustomEvent) => onUpdate('query', e.detail.value)}
        ></nr-input>
        <span class="field-description">The SELECT statement that defines this view</span>
      </div>
    </div>

    <!-- Options Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Options</span>
      </div>
      <nr-feature-toggle
        label="Materialized View"
        description="Store the view results physically for faster queries"
        .checked=${config.materialized === true}
        @toggle-change=${(e: CustomEvent) => onUpdate('materialized', e.detail.checked)}
      ></nr-feature-toggle>
    </div>
  `;
}

/**
 * Render Index node specific configuration fields
 */
function renderIndexNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const indexColumns = (config.indexColumns as string[]) || [];

  return html`
    <!-- Index Name Section -->
    <div class="config-section">
      <div class="config-field">
        <label>Index Name</label>
        <nr-input
          .value=${(config.indexName as string) || ''}
          placeholder="e.g., idx_users_email"
          @nr-input=${(e: CustomEvent) => onUpdate('indexName', e.detail.value)}
        ></nr-input>
        <span class="field-description">Name of the index</span>
      </div>
    </div>

    <!-- Index Columns Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Indexed Columns</span>
        <span class="config-section-desc">Columns included in this index</span>
      </div>
      <div class="config-columns-list">
        ${indexColumns.map((col, index) => html`
          <div class="config-column-item">
            <nr-input
              .value=${col}
              placeholder="Column name"
              @nr-input=${(e: CustomEvent) => {
                const newColumns = [...indexColumns];
                newColumns[index] = e.detail.value;
                onUpdate('indexColumns', newColumns);
              }}
            ></nr-input>
            <button
              class="remove-column-btn"
              @click=${() => {
                const newColumns = indexColumns.filter((_, i) => i !== index);
                onUpdate('indexColumns', newColumns);
              }}
            >
              <nr-icon name="trash-2" size="small"></nr-icon>
            </button>
          </div>
        `)}
        <button
          class="add-column-btn"
          @click=${() => {
            onUpdate('indexColumns', [...indexColumns, '']);
          }}
        >
          <nr-icon name="plus" size="small"></nr-icon>
          Add Column
        </button>
      </div>
    </div>

    <!-- Index Options Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Index Options</span>
      </div>
      <nr-feature-toggle
        label="Unique Index"
        description="Enforce uniqueness on indexed columns"
        .checked=${config.unique === true}
        @toggle-change=${(e: CustomEvent) => onUpdate('unique', e.detail.checked)}
      ></nr-feature-toggle>

      <div class="config-field">
        <label>Index Type</label>
        <nr-input
          .value=${(config.indexType as string) || 'BTREE'}
          placeholder="BTREE, HASH, GIN, GIST"
          @nr-input=${(e: CustomEvent) => onUpdate('indexType', e.detail.value)}
        ></nr-input>
        <span class="field-description">Type of index algorithm</span>
      </div>
    </div>
  `;
}

/**
 * Render Relationship node specific configuration fields
 */
function renderRelationshipNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  return html`
    <!-- Relationship Type Section -->
    <div class="config-section">
      <div class="config-field">
        <label>Relationship Type</label>
        <nr-input
          .value=${(config.relationshipType as string) || 'ONE_TO_MANY'}
          placeholder="ONE_TO_ONE, ONE_TO_MANY, MANY_TO_MANY"
          @nr-input=${(e: CustomEvent) => onUpdate('relationshipType', e.detail.value)}
        ></nr-input>
        <span class="field-description">Type of relationship between tables</span>
      </div>
    </div>

    <!-- Column Mapping Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Column Mapping</span>
      </div>
      <div class="config-field">
        <label>Source Column</label>
        <nr-input
          .value=${(config.sourceColumn as string) || ''}
          placeholder="e.g., id"
          @nr-input=${(e: CustomEvent) => onUpdate('sourceColumn', e.detail.value)}
        ></nr-input>
        <span class="field-description">Column in the source table</span>
      </div>
      <div class="config-field">
        <label>Target Column</label>
        <nr-input
          .value=${(config.targetColumn as string) || ''}
          placeholder="e.g., user_id"
          @nr-input=${(e: CustomEvent) => onUpdate('targetColumn', e.detail.value)}
        ></nr-input>
        <span class="field-description">Column in the target table (foreign key)</span>
      </div>
    </div>

    <!-- Referential Actions Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Referential Actions</span>
      </div>
      <div class="config-field">
        <label>On Delete</label>
        <nr-input
          .value=${(config.onDelete as string) || 'CASCADE'}
          placeholder="CASCADE, SET_NULL, RESTRICT, NO_ACTION"
          @nr-input=${(e: CustomEvent) => onUpdate('onDelete', e.detail.value)}
        ></nr-input>
        <span class="field-description">Action when parent record is deleted</span>
      </div>
      <div class="config-field">
        <label>On Update</label>
        <nr-input
          .value=${(config.onUpdate as string) || 'CASCADE'}
          placeholder="CASCADE, SET_NULL, RESTRICT, NO_ACTION"
          @nr-input=${(e: CustomEvent) => onUpdate('onUpdate', e.detail.value)}
        ></nr-input>
        <span class="field-description">Action when parent record is updated</span>
      </div>
    </div>
  `;
}

/**
 * Render Constraint node specific configuration fields
 */
function renderConstraintNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const constraintColumns = (config.constraintColumns as string[]) || [];
  const constraintType = (config.constraintType as string) || 'UNIQUE';

  return html`
    <!-- Constraint Name Section -->
    <div class="config-section">
      <div class="config-field">
        <label>Constraint Name</label>
        <nr-input
          .value=${(config.constraintName as string) || ''}
          placeholder="e.g., uq_users_email"
          @nr-input=${(e: CustomEvent) => onUpdate('constraintName', e.detail.value)}
        ></nr-input>
        <span class="field-description">Name of the constraint</span>
      </div>
    </div>

    <!-- Constraint Type Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Constraint Type</span>
      </div>
      <div class="config-field">
        <label>Type</label>
        <nr-input
          .value=${constraintType}
          placeholder="UNIQUE, CHECK, FOREIGN_KEY"
          @nr-input=${(e: CustomEvent) => onUpdate('constraintType', e.detail.value)}
        ></nr-input>
        <span class="field-description">Type of constraint to apply</span>
      </div>
    </div>

    <!-- Columns Section (for UNIQUE and FOREIGN_KEY) -->
    ${constraintType !== 'CHECK' ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Constraint Columns</span>
        </div>
        <div class="config-columns-list">
          ${constraintColumns.map((col, index) => html`
            <div class="config-column-item">
              <nr-input
                .value=${col}
                placeholder="Column name"
                @nr-input=${(e: CustomEvent) => {
                  const newColumns = [...constraintColumns];
                  newColumns[index] = e.detail.value;
                  onUpdate('constraintColumns', newColumns);
                }}
              ></nr-input>
              <button
                class="remove-column-btn"
                @click=${() => {
                  const newColumns = constraintColumns.filter((_, i) => i !== index);
                  onUpdate('constraintColumns', newColumns);
                }}
              >
                <nr-icon name="trash-2" size="small"></nr-icon>
              </button>
            </div>
          `)}
          <button
            class="add-column-btn"
            @click=${() => {
              onUpdate('constraintColumns', [...constraintColumns, '']);
            }}
          >
            <nr-icon name="plus" size="small"></nr-icon>
            Add Column
          </button>
        </div>
      </div>
    ` : nothing}

    <!-- Check Expression Section (for CHECK constraint) -->
    ${constraintType === 'CHECK' ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Check Expression</span>
        </div>
        <div class="config-field">
          <label>Expression</label>
          <nr-input
            .value=${(config.checkExpression as string) || ''}
            placeholder="e.g., age >= 18"
            @nr-input=${(e: CustomEvent) => onUpdate('checkExpression', e.detail.value)}
          ></nr-input>
          <span class="field-description">SQL expression that must evaluate to true</span>
        </div>
      </div>
    ` : nothing}
  `;
}

/**
 * Render Query node specific configuration fields
 */
function renderQueryNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const parameters = (config.parameters as Array<{name: string; type: string; defaultValue?: unknown}>) || [];

  return html`
    <!-- Query Name Section -->
    <div class="config-section">
      <div class="config-field">
        <label>Query Name</label>
        <nr-input
          .value=${(config.queryName as string) || ''}
          placeholder="e.g., get_active_users"
          @nr-input=${(e: CustomEvent) => onUpdate('queryName', e.detail.value)}
        ></nr-input>
        <span class="field-description">Name of the saved query or stored procedure</span>
      </div>
    </div>

    <!-- Query Text Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Query Definition</span>
      </div>
      <div class="config-field">
        <label>SQL Query</label>
        <nr-input
          .value=${(config.queryText as string) || ''}
          placeholder="SELECT * FROM users WHERE status = :status"
          @nr-input=${(e: CustomEvent) => onUpdate('queryText', e.detail.value)}
        ></nr-input>
        <span class="field-description">SQL query with optional parameter placeholders (:param)</span>
      </div>
    </div>

    <!-- Parameters Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Parameters</span>
        <span class="config-section-desc">Define query parameters</span>
      </div>
      <div class="config-columns-list">
        ${parameters.map((param, index) => html`
          <div class="config-column-item">
            <div class="config-field">
              <label>Parameter ${index + 1}</label>
              <div class="column-inputs">
                <nr-input
                  .value=${param.name || ''}
                  placeholder="Parameter name"
                  @nr-input=${(e: CustomEvent) => {
                    const newParams = [...parameters];
                    newParams[index] = { ...newParams[index], name: e.detail.value };
                    onUpdate('parameters', newParams);
                  }}
                ></nr-input>
                <nr-input
                  .value=${param.type || ''}
                  placeholder="Type (VARCHAR, INT, etc.)"
                  @nr-input=${(e: CustomEvent) => {
                    const newParams = [...parameters];
                    newParams[index] = { ...newParams[index], type: e.detail.value };
                    onUpdate('parameters', newParams);
                  }}
                ></nr-input>
              </div>
            </div>
            <button
              class="remove-column-btn"
              @click=${() => {
                const newParams = parameters.filter((_, i) => i !== index);
                onUpdate('parameters', newParams);
              }}
            >
              <nr-icon name="trash-2" size="small"></nr-icon>
            </button>
          </div>
        `)}
        <button
          class="add-column-btn"
          @click=${() => {
            const newParams = [...parameters, { name: '', type: 'VARCHAR' }];
            onUpdate('parameters', newParams);
          }}
        >
          <nr-icon name="plus" size="small"></nr-icon>
          Add Parameter
        </button>
      </div>
    </div>
  `;
}

/**
 * Render Debug Node specific configuration fields
 * Shows execution context data (input, variables, node outputs)
 */
function renderDebugNodeFields(
  config: NodeConfiguration,
  _onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  // Debug output comes from execution - show last execution data if available
  const debugData = config.lastDebugOutput as {
    input?: unknown;
    variables?: unknown;
    nodeOutputs?: unknown;
    execution?: unknown;
  } | null;

  const formatJson = (data: unknown): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Debug Info</span>
        <span class="config-section-desc">Displays execution context when workflow runs</span>
      </div>

      ${!debugData ? html`
        <div class="debug-placeholder">
          <nr-icon name="info" size="small"></nr-icon>
          <span>Run the workflow to see debug information here</span>
        </div>
      ` : html`
        <!-- Input Data -->
        <div class="debug-section">
          <div class="debug-section-title">
            <nr-icon name="log-in" size="small"></nr-icon>
            <span>Input</span>
          </div>
          <pre class="debug-output">${formatJson(debugData.input)}</pre>
        </div>

        <!-- Variables -->
        <div class="debug-section">
          <div class="debug-section-title">
            <nr-icon name="box" size="small"></nr-icon>
            <span>Variables</span>
          </div>
          <pre class="debug-output">${formatJson(debugData.variables)}</pre>
        </div>

        <!-- Node Outputs -->
        <div class="debug-section">
          <div class="debug-section-title">
            <nr-icon name="layers" size="small"></nr-icon>
            <span>Node Outputs</span>
          </div>
          <pre class="debug-output">${formatJson(debugData.nodeOutputs)}</pre>
        </div>

        <!-- Execution Info -->
        <div class="debug-section">
          <div class="debug-section-title">
            <nr-icon name="activity" size="small"></nr-icon>
            <span>Execution</span>
          </div>
          <pre class="debug-output">${formatJson(debugData.execution)}</pre>
        </div>
      `}
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

    case WorkflowNodeType.DEBUG:
      return renderDebugNodeFields(config, onUpdate);

    case WorkflowNodeType.DATABASE:
      return renderDataNodeFields(config, onUpdate);

    case WorkflowNodeType.CHATBOT:
      return renderChatbotTriggerFields(config, onUpdate);

    // DB Designer nodes
    case DbDesignerNodeType.TABLE:
      return renderTableNodeFields(config, onUpdate);

    case DbDesignerNodeType.VIEW:
      return renderViewNodeFields(config, onUpdate);

    case DbDesignerNodeType.INDEX:
      return renderIndexNodeFields(config, onUpdate);

    case DbDesignerNodeType.RELATIONSHIP:
      return renderRelationshipNodeFields(config, onUpdate);

    case DbDesignerNodeType.CONSTRAINT:
      return renderConstraintNodeFields(config, onUpdate);

    case DbDesignerNodeType.QUERY:
      return renderQueryNodeFields(config, onUpdate);

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
