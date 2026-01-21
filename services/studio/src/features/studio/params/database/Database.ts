import { customElement, state } from "lit/decorators.js";
import { html, LitElement, css } from "lit";
import { $currentApplication } from "../../../runtime/redux/store/apps";
import "../../../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.component";
import "../../../runtime/components/ui/nuraly-ui/src/components/select/select.component";
import "../../../runtime/components/ui/nuraly-ui/src/components/table/table.component";
import type { SelectOption } from "../../../runtime/components/ui/nuraly-ui/src/components/select/select.types";
import type { IHeader } from "../../../runtime/components/ui/nuraly-ui/src/components/table/table.types";
import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
} from "../../../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types";
import {
  DbDesignerNodeType,
  PortType,
} from "../../../runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types";
import {
  $conduitState,
  $databaseConnections,
  selectConnection,
  selectSchema,
  runQuery,
  testCurrentConnection,
  parseKvEntriesToConnections,
  type DatabaseConnection,
} from "../../../runtime/redux/store/conduit";
import type {
  SchemaDTO,
  TableDTO,
  ColumnDTO,
  RelationshipDTO,
  QueryRequest,
} from "../../../runtime/redux/store/database";
import {
  getSchemas,
  getTables,
  getColumns,
  getRelationships,
} from "../../../runtime/redux/store/database";
import { getKvEntries } from "../../../runtime/redux/store/kv";

@customElement("database-page")
export class DatabasePage extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .database-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--n-color-surface-secondary, #f9fafb);
    }

    .database-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background: var(--n-color-surface, #fff);
      border-bottom: 1px solid var(--n-color-border, #e5e7eb);
      gap: 12px;
    }

    .database-toolbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .database-toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .connection-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .connection-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--n-color-text, #111827);
    }

    .schema-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    nr-select {
      min-width: 180px;
    }

    .connection-status {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .connection-status.connected {
      color: var(--n-color-success, #22c55e);
      background: var(--n-color-success-bg, #f0fdf4);
    }

    .connection-status.error {
      color: var(--n-color-error, #ef4444);
      background: var(--n-color-error-bg, #fef2f2);
    }

    .connection-status.unknown {
      color: var(--n-color-text-muted, #6b7280);
      background: var(--n-color-surface-secondary, #f3f4f6);
    }

    .toolbar-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .toolbar-button.primary {
      background: var(--n-color-primary, #3b82f6);
      color: white;
    }

    .toolbar-button.primary:hover {
      background: var(--n-color-primary-dark, #2563eb);
    }

    .toolbar-button.primary:disabled {
      background: var(--n-color-disabled, #9ca3af);
      cursor: not-allowed;
    }

    .toolbar-button.secondary {
      background: var(--n-color-surface, #fff);
      color: var(--n-color-text, #111827);
      border: 1px solid var(--n-color-border, #e5e7eb);
    }

    .toolbar-button.secondary:hover {
      background: var(--n-color-surface-hover, #f9fafb);
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .canvas-container {
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    workflow-canvas {
      width: 100%;
      height: 100%;
    }

    .query-panel {
      background: var(--n-color-surface, #fff);
      border-top: 1px solid var(--n-color-border, #e5e7eb);
      display: flex;
      flex-direction: column;
      max-height: 300px;
    }

    .query-panel-header {
      padding: 8px 16px;
      font-weight: 600;
      font-size: 13px;
      color: var(--n-color-text, #111827);
      border-bottom: 1px solid var(--n-color-border, #e5e7eb);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
    }

    .query-panel-header:hover {
      background: var(--n-color-surface-hover, #f9fafb);
    }

    .query-panel-content {
      flex: 1;
      overflow: auto;
      padding: 12px;
    }

    .query-panel-content nr-table {
      --nuraly-table-max-height: 200px;
    }

    .results-meta {
      font-size: 12px;
      color: var(--n-color-text-muted, #6b7280);
    }

    .error-message {
      color: var(--n-color-error, #ef4444);
      padding: 12px;
      background: var(--n-color-error-bg, #fef2f2);
      border-radius: 6px;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.8);
      z-index: 100;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--n-color-border, #e5e7eb);
      border-top-color: var(--n-color-primary, #3b82f6);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--n-color-text-muted, #6b7280);
      padding: 48px;
      text-align: center;
    }

    .empty-state-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.4;
    }

    .empty-state-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--n-color-text, #111827);
      margin-bottom: 8px;
    }

    .empty-state-text {
      font-size: 14px;
      max-width: 400px;
    }

    .toggle-icon {
      transition: transform 0.2s;
    }

    .toggle-icon.collapsed {
      transform: rotate(-90deg);
    }
  `;

  @state()
  private loading = true;

  @state()
  private loadingSchema = false;

  @state()
  private currentConnection: DatabaseConnection | null = null;

  @state()
  private connections: DatabaseConnection[] = [];

  @state()
  private schemas: SchemaDTO[] = [];

  @state()
  private currentSchema: string | null = null;

  @state()
  private tables: TableDTO[] = [];

  @state()
  private tableColumns: Map<string, ColumnDTO[]> = new Map();

  @state()
  private tableRelationships: Map<string, RelationshipDTO[]> = new Map();

  @state()
  private schemaWorkflow: Workflow | null = null;

  @state()
  private queryResult: any = null;

  @state()
  private isExecutingQuery = false;

  @state()
  private showQueryPanel = true;

  @state()
  private selectedTableName: string | null = null;

  @state()
  private queryPage = 1;

  @state()
  private queryLimit = 20;

  private unsubscribeState: (() => void) | null = null;
  private unsubscribeConnections: (() => void) | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this.loadConnections();

    // Subscribe to conduit state
    this.unsubscribeState = $conduitState.subscribe((state) => {
      this.currentConnection = state.currentConnection;
      this.currentSchema = state.currentSchema;
      this.queryResult = state.queryResult;
      this.isExecutingQuery = state.isExecutingQuery;
    });

    // Subscribe to connections list
    this.unsubscribeConnections = $databaseConnections.subscribe((connections) => {
      this.connections = connections;
    });
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribeState) this.unsubscribeState();
    if (this.unsubscribeConnections) this.unsubscribeConnections();
  }

  private async loadConnections() {
    this.loading = true;
    const appId = $currentApplication.get()?.uuid;

    if (appId) {
      const kvEntries = await getKvEntries(appId, {});
      const connections = parseKvEntriesToConnections(kvEntries || []);
      $databaseConnections.set(connections);

      if (connections.length > 0) {
        await this.handleConnectionSelect(connections[0]);
      }
    }

    this.loading = false;
  }

  private async handleConnectionSelect(connection: DatabaseConnection) {
    const appId = $currentApplication.get()?.uuid;
    if (!appId) return;

    this.loadingSchema = true;

    try {
      // Use store action to select connection - this sets $conduitState.currentConnection
      await selectConnection(connection, appId);

      // Get updated state
      const state = $conduitState.get();
      this.currentConnection = state.currentConnection;
      this.schemas = state.schemas;
      this.currentSchema = state.currentSchema;

      // Load tables for the auto-selected schema
      if (state.currentSchema) {
        await this.loadSchemaData(state.currentSchema);
      }
    } catch (error) {
      console.error('Failed to load schemas:', error);
    }

    this.loadingSchema = false;
  }

  private async handleSchemaSelect(schemaName: string) {
    const appId = $currentApplication.get()?.uuid;
    if (!appId || !this.currentConnection) return;

    this.loadingSchema = true;

    try {
      // Use store action to select schema - this sets $conduitState.currentSchema
      await selectSchema(schemaName, appId);
      this.currentSchema = schemaName;

      // Load full schema data
      await this.loadSchemaData(schemaName);
    } catch (error) {
      console.error('Failed to load schema:', error);
    }

    this.loadingSchema = false;
  }

  private async loadSchemaData(schemaName: string) {
    const appId = $currentApplication.get()?.uuid;
    if (!appId || !this.currentConnection) return;

    // Load tables
    const tables = await getTables(this.currentConnection.path, appId, schemaName);
    this.tables = tables;

    // Load columns and relationships for each table
    const columnsMap = new Map<string, ColumnDTO[]>();
    const relationshipsMap = new Map<string, RelationshipDTO[]>();

    await Promise.all(tables.map(async (table) => {
      const [columns, relationships] = await Promise.all([
        getColumns(this.currentConnection!.path, appId, table.name, schemaName),
        getRelationships(this.currentConnection!.path, appId, table.name, schemaName),
      ]);
      columnsMap.set(table.name, columns);
      relationshipsMap.set(table.name, relationships);
    }));

    this.tableColumns = columnsMap;
    this.tableRelationships = relationshipsMap;

    // Build the canvas workflow
    this.buildSchemaWorkflow();
  }

  private buildSchemaWorkflow() {
    const nodes: WorkflowNode[] = [];
    const edges: WorkflowEdge[] = [];
    const tablePositions = new Map<string, { x: number; y: number }>();

    // Calculate grid positions for tables
    const gridCols = 3;
    const nodeWidth = 250;
    const nodeHeight = 200;
    const paddingX = 50;
    const paddingY = 50;

    this.tables.forEach((table, index) => {
      const col = index % gridCols;
      const row = Math.floor(index / gridCols);
      const x = paddingX + col * (nodeWidth + paddingX);
      const y = paddingY + row * (nodeHeight + paddingY);
      tablePositions.set(table.name, { x, y });

      const columns = this.tableColumns.get(table.name) || [];
      const primaryKeyCol = columns.find(c => c.primaryKey)?.name;

      nodes.push({
        id: `table-${table.name}`,
        name: table.name,
        type: DbDesignerNodeType.TABLE,
        position: { x, y },
        configuration: {
          tableName: table.name,
          columns: columns.map(col => ({
            name: col.name,
            type: col.type,
            nullable: col.nullable,
            defaultValue: col.defaultValue,
          })),
          primaryKey: primaryKeyCol,
        },
        ports: {
          inputs: [{ id: 'in', type: PortType.INPUT, label: 'FK Target' }],
          outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Reference' }],
        },
        metadata: {
          description: table.description || `${table.type}: ${columns.length} columns`,
          icon: table.type === 'view' ? 'eye' : 'table',
        },
      });
    });

    // Create edges for relationships (foreign keys)
    this.tableRelationships.forEach((relationships, tableName) => {
      relationships.forEach((rel, idx) => {
        const sourceTableId = `table-${tableName}`;
        const targetTableId = `table-${rel.targetTable}`;

        // Only create edge if both tables exist
        if (tablePositions.has(tableName) && tablePositions.has(rel.targetTable)) {
          edges.push({
            id: `rel-${tableName}-${rel.targetTable}-${idx}`,
            sourceNodeId: sourceTableId,
            sourcePortId: 'out',
            targetNodeId: targetTableId,
            targetPortId: 'in',
            label: `${rel.sourceColumn} → ${rel.targetColumn}`,
          });
        }
      });
    });

    this.schemaWorkflow = {
      id: `schema-${this.currentSchema}`,
      name: this.currentSchema || 'Schema',
      nodes,
      edges,
    };
  }

  private handleCanvasWorkflowChanged(event: CustomEvent<{ workflow: Workflow }>) {
    const { workflow } = event.detail;
    this.schemaWorkflow = workflow;
    // TODO: Implement schema editing - sync changes back to database
  }

  private handleNodeSelected(event: CustomEvent<{ node: WorkflowNode }>) {
    const { node } = event.detail;
    if (node.configuration.tableName) {
      this.selectedTableName = node.configuration.tableName as string;
    }
  }

  private async handleRunQuery(offset = 0, limit = this.queryLimit) {
    const appId = $currentApplication.get()?.uuid;
    if (!appId || !this.currentSchema || !this.selectedTableName) return;

    // Reset page to 1 when starting a fresh query
    if (offset === 0) {
      this.queryPage = 1;
    }

    // Get non-binary columns for preview (exclude embedding, bytea, etc.)
    const columns = this.tableColumns.get(this.selectedTableName) || [];
    const safeColumns = columns
      .filter(col => !['bytea', 'vector', 'embedding'].some(t => col.type.toLowerCase().includes(t)))
      .map(col => col.name);

    const query: QueryRequest = {
      operation: 'QUERY',
      schema: this.currentSchema,
      table: this.selectedTableName,
      select: safeColumns.length > 0 ? safeColumns : undefined,
      limit,
      offset,
    };

    await runQuery(appId, query);
  }

  private handlePaginate(e: CustomEvent) {
    const { page, limit, offset } = e.detail;
    this.queryPage = page;
    this.queryLimit = limit;
    this.handleRunQuery(offset, limit);
  }

  private async handleTestConnection() {
    const appId = $currentApplication.get()?.uuid;
    if (appId) {
      await testCurrentConnection(appId);
    }
  }

  private getStatusLabel(): string {
    if (!this.currentConnection) return '';
    switch (this.currentConnection.status) {
      case 'connected': return 'Connected';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  }

  private get connectionOptions(): SelectOption[] {
    return this.connections.map(conn => ({
      value: conn.path,
      label: `${conn.name} (${conn.type})`,
      icon: 'database',
    }));
  }

  private get schemaOptions(): SelectOption[] {
    return this.schemas.map(schema => ({
      value: schema.name,
      label: `${schema.name} (${schema.tableCount} tables)`,
    }));
  }

  private handleConnectionChange(e: CustomEvent) {
    const value = e.detail?.value || (e.target as any)?.value;
    const conn = this.connections.find(c => c.path === value);
    if (conn) this.handleConnectionSelect(conn);
  }

  private handleSchemaChange(e: CustomEvent) {
    const value = e.detail?.value || (e.target as any)?.value;
    if (value) this.handleSchemaSelect(value);
  }

  private get queryTableHeaders(): IHeader[] {
    if (!this.queryResult?.rows?.length) return [];
    return Object.keys(this.queryResult.rows[0] || {}).map(key => ({
      name: key,
      key: key,
    }));
  }

  private get queryTableRows(): any[] {
    if (!this.queryResult?.rows?.length) return [];
    return this.queryResult.rows;
  }

  override render() {
    if (this.loading) {
      return html`
        <div class="database-container">
          <div class="loading-overlay">
            <div class="loading-spinner"></div>
          </div>
        </div>
      `;
    }

    if (this.connections.length === 0) {
      return html`
        <div class="database-container">
          <div class="empty-state">
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
            <div class="empty-state-title">No Database Connections</div>
            <div class="empty-state-text">
              Create a database connection in KV Storage to get started.
              Use path format: postgresql/my-connection
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="database-container">
        <div class="database-toolbar">
          <div class="database-toolbar-left">
            <div class="connection-info">
              <nr-select
                .options=${this.connectionOptions}
                .value=${this.currentConnection?.path || ''}
                placeholder="Select connection"
                size="small"
                @nr-change=${this.handleConnectionChange}
              ></nr-select>
              ${this.currentConnection ? html`
                <span class="connection-status ${this.currentConnection.status}">
                  ${this.getStatusLabel()}
                </span>
              ` : ''}
            </div>

            ${this.schemas.length > 0 ? html`
              <div class="schema-selector">
                <nr-select
                  .options=${this.schemaOptions}
                  .value=${this.currentSchema || ''}
                  placeholder="Select schema"
                  size="small"
                  @nr-change=${this.handleSchemaChange}
                ></nr-select>
              </div>
            ` : ''}
          </div>
          <div class="database-toolbar-right">
            <button
              class="toolbar-button secondary"
              @click=${this.handleTestConnection}
              ?disabled=${!this.currentConnection}
            >
              Test Connection
            </button>
            <button
              class="toolbar-button primary"
              @click=${() => this.handleRunQuery()}
              ?disabled=${!this.selectedTableName || this.isExecutingQuery}
            >
              ${this.isExecutingQuery ? 'Running...' : `Query ${this.selectedTableName || 'Table'}`}
            </button>
          </div>
        </div>

        <div class="main-content">
          <div class="canvas-container">
            ${this.loadingSchema ? html`
              <div class="loading-overlay">
                <div class="loading-spinner"></div>
              </div>
            ` : this.schemaWorkflow ? html`
              <workflow-canvas
                .workflow=${this.schemaWorkflow}
                .canvasType=${'DATABASE'}
                .showPalette=${false}
                .showToolbar=${true}
                @workflow-changed=${this.handleCanvasWorkflowChanged}
                @node-selected=${this.handleNodeSelected}
              ></workflow-canvas>
            ` : html`
              <div class="empty-state">
                <div class="empty-state-title">No Tables Found</div>
                <div class="empty-state-text">
                  Select a schema with tables to visualize.
                </div>
              </div>
            `}
          </div>

          ${this.showQueryPanel ? html`
            <div class="query-panel">
              <div class="query-panel-header" @click=${() => this.showQueryPanel = !this.showQueryPanel}>
                <span>
                  Query Results
                  ${this.queryResult ? html`
                    <span class="results-meta">
                      - ${this.queryResult.totalCount != null
                        ? `${this.queryResult.rowCount || 0} of ${this.queryResult.totalCount} rows`
                        : `${this.queryResult.rowCount || 0} rows`}
                      ${this.queryResult.executionTimeMs ? ` in ${this.queryResult.executionTimeMs}ms` : ''}
                    </span>
                  ` : ''}
                </span>
                <svg class="toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div class="query-panel-content">
                ${this.queryResult?.error ? html`
                  <div class="error-message">${this.queryResult.error}</div>
                ` : this.queryResult?.rows?.length > 0 ? html`
                  <nr-table
                    .headers=${this.queryTableHeaders}
                    .rows=${this.queryTableRows}
                    size="small"
                    fixedHeader
                    .scrollConfig=${{ y: 200 }}
                    emptyText="No results"
                    serverSide
                    .totalCount=${this.queryResult?.totalCount || 0}
                    @onPaginate=${this.handlePaginate}
                  ></nr-table>
                ` : html`
                  <div class="empty-state" style="padding: 24px;">
                    <div class="empty-state-text">Select a table and click "Query" to see results</div>
                  </div>
                `}
              </div>
            </div>
          ` : html`
            <div class="query-panel-header" @click=${() => this.showQueryPanel = true} style="border-top: 1px solid var(--n-color-border, #e5e7eb); background: var(--n-color-surface, #fff);">
              <span>Query Results ${this.queryResult ? `(${this.queryResult.totalCount != null ? `${this.queryResult.rowCount || 0} of ${this.queryResult.totalCount}` : this.queryResult.rowCount || 0} rows)` : ''}</span>
              <svg class="toggle-icon collapsed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          `}
        </div>
      </div>
    `;
  }
}
