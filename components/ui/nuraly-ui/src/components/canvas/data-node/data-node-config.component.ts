/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, css, nothing } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import {
  DataOperation,
  DATABASE_TYPES,
  type DatabaseType,
  type DataNodeConfiguration,
  type ColumnDTO,
  type DatabaseProvider,
} from './data-node.types.js';

// Import child components
import './schema-select.component.js';
import './table-select.component.js';
import '../../db-connection-select/db-connection-select.component.js';
import './data-node-fields.component.js';

/**
 * Convert ColumnDTO to DataField format for child components
 */
function columnToField(column: ColumnDTO): { id: string; name: string; type: string } {
  // Map database types to simple field types
  const typeMap: Record<string, string> = {
    'integer': 'number',
    'bigint': 'number',
    'smallint': 'number',
    'decimal': 'number',
    'numeric': 'number',
    'real': 'number',
    'double precision': 'number',
    'serial': 'number',
    'bigserial': 'number',
    'int': 'number',
    'int4': 'number',
    'int8': 'number',
    'float': 'number',
    'float4': 'number',
    'float8': 'number',
    'varchar': 'string',
    'character varying': 'string',
    'text': 'string',
    'char': 'string',
    'character': 'string',
    'uuid': 'string',
    'boolean': 'boolean',
    'bool': 'boolean',
    'date': 'date',
    'timestamp': 'datetime',
    'timestamp without time zone': 'datetime',
    'timestamp with time zone': 'datetime',
    'timestamptz': 'datetime',
    'time': 'datetime',
    'time without time zone': 'datetime',
    'time with time zone': 'datetime',
    'timetz': 'datetime',
    'json': 'json',
    'jsonb': 'json',
    'array': 'array',
    'bytea': 'binary',
  };

  const lowerType = column.type.toLowerCase();
  const mappedType = typeMap[lowerType] || 'string';

  return {
    id: column.name,
    name: column.name,
    type: mappedType,
  };
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
 * Data Node Configuration Component
 *
 * A stateful component that manages the entire data node configuration UI,
 * including database type, connection, schema, table selection and column-aware
 * field components.
 *
 * @example
 * ```html
 * <nr-data-node-config
 *   .config=${nodeConfig}
 *   @config-update=${(e) => handleUpdate(e.detail.key, e.detail.value)}
 * ></nr-data-node-config>
 * ```
 *
 * @fires config-update - Fired when any config value changes
 */
@customElement('nr-data-node-config')
export class NrDataNodeConfig extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .config-section {
      margin-bottom: 16px;
    }

    .config-section-header {
      margin-bottom: 8px;
    }

    .config-section-title {
      font-weight: 600;
      font-size: 13px;
      color: var(--text-primary, #1f2937);
    }

    .config-section-desc {
      display: block;
      font-size: 12px;
      color: var(--text-secondary, #6b7280);
      margin-top: 2px;
    }

    .config-field {
      margin-bottom: 12px;
    }

    .config-field label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-secondary, #6b7280);
      margin-bottom: 4px;
    }

    .field-description {
      display: block;
      font-size: 11px;
      color: var(--text-tertiary, #9ca3af);
      margin-top: 4px;
    }

    .loading-columns {
      padding: 12px;
      text-align: center;
      color: var(--text-secondary, #6b7280);
      font-size: 13px;
      background: var(--bg-secondary, #f9fafb);
      border-radius: 6px;
    }

    .no-table-selected {
      padding: 12px;
      text-align: center;
      color: var(--text-secondary, #6b7280);
      font-size: 13px;
      background: var(--bg-secondary, #f9fafb);
      border-radius: 6px;
      border: 1px dashed var(--border-color, #e5e7eb);
    }
  `;

  /** Current node configuration */
  @property({ type: Object })
  config: Partial<DataNodeConfiguration> = {};

  /** Application ID (host-provided, replaces getVarValue) */
  @property({ type: String })
  applicationId: string = '';

  /** Database provider for introspection (host-provided) */
  @property({ attribute: false })
  databaseProvider?: DatabaseProvider;

  /** KV entries for connection selects (host-provided) */
  @property({ attribute: false })
  kvEntries: { keyPath: string; value?: any; isSecret: boolean }[] = [];

  /** Callback when a KV entry needs to be created */
  @property({ attribute: false })
  onCreateKvEntry?: (detail: { keyPath: string; value: any; scope: string; isSecret: boolean }) => void;

  @state() private columns: ColumnDTO[] = [];
  @state() private loadingColumns = false;

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('config')) {
      const oldConfig = changedProperties.get('config') as Partial<DataNodeConfiguration> | undefined;
      const connectionPath = this.config.connectionPath;
      const schema = this.config.schema;
      const entity = this.config.entity;

      // Check if relevant fields changed
      const connectionChanged = oldConfig?.connectionPath !== connectionPath;
      const schemaChanged = oldConfig?.schema !== schema;
      const entityChanged = oldConfig?.entity !== entity;

      if (connectionChanged || schemaChanged || entityChanged) {
        this.loadColumns();
      }
    }
  }

  private async loadColumns(): Promise<void> {
    const appId = this.applicationId;
    const connectionPath = this.config.connectionPath;
    const entity = this.config.entity;

    if (!appId || !connectionPath || !entity || !this.databaseProvider) {
      this.columns = [];
      return;
    }

    this.loadingColumns = true;

    try {
      const columns = await this.databaseProvider.getColumns(
        connectionPath,
        appId,
        entity,
        this.config.schema || undefined
      );
      this.columns = columns;
    } catch (err) {
      console.error('Failed to load columns:', err);
      this.columns = [];
    }

    this.loadingColumns = false;
  }

  private onUpdate(key: string, value: unknown): void {
    this.dispatchEvent(new CustomEvent('config-update', {
      detail: { key, value },
      bubbles: true,
      composed: true
    }));
  }

  private renderDatabaseTypeSelect() {
    const options = DATABASE_TYPES.map(db => ({
      label: db.label,
      value: db.value,
      icon: db.icon
    }));

    return html`
      <div class="config-field">
        <label>Database Type</label>
        <nr-select
          .value=${this.config.dbType || ''}
          .options=${options}
          placeholder="Select database type..."
          @nr-change=${(e: CustomEvent) => this.onUpdate('dbType', e.detail.value)}
        ></nr-select>
      </div>
    `;
  }

  private renderConnectionSelect() {
    const dbType = this.config.dbType as DatabaseType;
    if (!dbType) {
      return html`
        <div class="config-field">
          <label>Connection</label>
          <nr-select
            .options=${[]}
            placeholder="Select database type first..."
            ?disabled=${true}
          ></nr-select>
        </div>
      `;
    }

    const dbEntries = this.kvEntries.filter(e => e.keyPath.startsWith('database/'));

    return html`
      <div class="config-field">
        <label>Connection</label>
        <nr-db-connection-select
          .dbType=${dbType}
          .entries=${dbEntries}
          .value=${this.config.connectionPath || ''}
          placeholder="Select or create connection..."
          @value-change=${(e: CustomEvent) => this.onUpdate('connectionPath', e.detail.value)}
          @create-entry=${(e: CustomEvent) => this.onCreateKvEntry?.(e.detail)}
        ></nr-db-connection-select>
      </div>
    `;
  }

  private renderSchemaSelect() {
    const connectionPath = this.config.connectionPath;
    const dbType = this.config.dbType;

    // Only show schema select for databases that support schemas
    const supportsSchemas = ['postgresql', 'mssql', 'oracle'].includes(dbType || '');
    if (!supportsSchemas) {
      return nothing;
    }

    return html`
      <div class="config-field">
        <label>Schema</label>
        <nr-schema-select
          .connectionPath=${connectionPath || ''}
          .applicationId=${this.applicationId}
          .databaseProvider=${this.databaseProvider}
          .value=${this.config.schema || ''}
          placeholder="Select schema..."
          @value-change=${(e: CustomEvent) => this.onUpdate('schema', e.detail.value)}
        ></nr-schema-select>
      </div>
    `;
  }

  private renderTableSelect() {
    const connectionPath = this.config.connectionPath;
    const schema = this.config.schema;

    return html`
      <div class="config-field">
        <label>Table / Collection</label>
        <nr-table-select
          .connectionPath=${connectionPath || ''}
          .schema=${schema || ''}
          .applicationId=${this.applicationId}
          .databaseProvider=${this.databaseProvider}
          .value=${this.config.entity || ''}
          placeholder="Select table..."
          @value-change=${(e: CustomEvent) => this.onUpdate('entity', e.detail.value)}
        ></nr-table-select>
        <span class="field-description">Table or collection to query</span>
      </div>
    `;
  }

  private renderColumnDependentSections() {
    const operation = (this.config.operation as DataOperation) || DataOperation.QUERY;
    const entity = this.config.entity;

    if (!entity) {
      return html`
        <div class="no-table-selected">
          Select a table to configure filters and fields
        </div>
      `;
    }

    if (this.loadingColumns) {
      return html`
        <div class="loading-columns">
          Loading columns...
        </div>
      `;
    }

    const fields = this.columns.map(columnToField);

    return html`
      <!-- Filter Section -->
      ${shouldShowSection('filter', operation) ? html`
        <div class="config-section">
          <div class="config-section-header">
            <span class="config-section-title">Filter</span>
            <span class="config-section-desc">Define conditions to filter records</span>
          </div>
          <nr-filter-builder
            .value=${this.config.filter || null}
            .fields=${fields}
            allowExpressions
            description="Add conditions to filter records"
            @value-change=${(e: CustomEvent) => this.onUpdate('filter', e.detail.value)}
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
            .value=${this.config.fields || {}}
            .fields=${fields}
            allowExpressions
            description="Map values to database fields"
            @value-change=${(e: CustomEvent) => this.onUpdate('fields', e.detail.value)}
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
            .value=${this.config.select || []}
            .fields=${fields}
            placeholder="All fields"
            description="Leave empty to return all fields"
            @value-change=${(e: CustomEvent) => this.onUpdate('select', e.detail.value)}
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
            .value=${this.config.orderBy || []}
            .fields=${fields}
            @value-change=${(e: CustomEvent) => this.onUpdate('orderBy', e.detail.value)}
          ></nr-sort-builder>
        </div>
      ` : nothing}
    `;
  }

  override render() {
    const operation = (this.config.operation as DataOperation) || DataOperation.QUERY;

    return html`
      <!-- Basic Section -->
      <div class="config-section">
        <div class="config-field">
          <label>Operation</label>
          <nr-operation-select
            .value=${operation}
            @value-change=${(e: CustomEvent) => this.onUpdate('operation', e.detail.value)}
          ></nr-operation-select>
        </div>

        ${this.renderDatabaseTypeSelect()}
        ${this.renderConnectionSelect()}
        ${this.renderSchemaSelect()}
        ${this.renderTableSelect()}
      </div>

      ${this.renderColumnDependentSections()}

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
              .value=${String(this.config.limit || '')}
              placeholder="No limit"
              @nr-input=${(e: CustomEvent) => this.onUpdate('limit', e.detail.value ? parseInt(e.detail.value) : null)}
            ></nr-input>
            <span class="field-description">Maximum records to return</span>
          </div>
          <div class="config-field">
            <label>Offset</label>
            <nr-input
              type="number"
              .value=${String(this.config.offset || '')}
              placeholder="0"
              @nr-input=${(e: CustomEvent) => this.onUpdate('offset', e.detail.value ? parseInt(e.detail.value) : null)}
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
          .value=${this.config.outputVariable || 'results'}
          placeholder="results"
          description="Variable name to store the result"
          @value-change=${(e: CustomEvent) => this.onUpdate('outputVariable', e.detail.value)}
        ></nr-variable-name-input>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-data-node-config': NrDataNodeConfig;
  }
}
