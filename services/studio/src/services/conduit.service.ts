import { APIS_URL } from './constants';

// ============================================================================
// Types / DTOs
// ============================================================================

export type DatabaseType = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'mssql' | 'oracle';

export interface DatabaseCredential {
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  ssl?: boolean;
  sslMode?: string;
  connectionTimeout?: number;
  maxPoolSize?: number;
  // Cloud-specific
  projectId?: string;
  region?: string;
  authSource?: string; // MongoDB
}

export interface SchemaDTO {
  name: string;
  tableCount: number;
  owner?: string;
}

export interface TableDTO {
  name: string;
  schema: string;
  type: 'table' | 'view' | 'collection';
  rowCount?: number;
  description?: string;
}

export interface ColumnDTO {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  defaultValue?: string;
  description?: string;
  ordinalPosition?: number;
  maxLength?: number;
  precision?: number;
  scale?: number;
}

export interface RelationshipDTO {
  name: string;
  sourceColumn: string;
  targetTable: string;
  targetSchema?: string;
  targetColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  onDelete?: string;
  onUpdate?: string;
}

export interface QueryRequest {
  operation: 'QUERY' | 'INSERT' | 'UPDATE' | 'DELETE';
  schema?: string;
  table: string;
  filter?: Record<string, unknown>;
  fields?: Record<string, unknown>;
  select?: string[];
  orderBy?: Array<{ column: string; direction: 'ASC' | 'DESC' }>;
  limit?: number;
  offset?: number;
}

export interface QueryResult {
  rows: Record<string, unknown>[];
  rowCount: number;
  affectedRows?: number;
  generatedKeys?: unknown[];
  executionTimeMs: number;
  success: boolean;
  error?: string;
}

export interface TestConnectionRequest {
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  sslMode?: string;
}

export interface TestConnectionResult {
  success: boolean;
  error?: string;
  databaseVersion?: string;
  latencyMs?: number;
}

export interface PoolStats {
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  pendingRequests: number;
  maxPoolSize: number;
}

// Canvas representation of a database schema
export interface DatabaseCanvas {
  id: string;
  name: string;
  connectionPath: string;
  applicationId: string;
  schemas: SchemaDTO[];
  selectedSchema?: string;
  tables: TableDTO[];
  selectedTable?: string;
  columns: ColumnDTO[];
  relationships: RelationshipDTO[];
  queryHistory: QueryHistoryItem[];
  viewport?: { zoom: number; panX: number; panY: number };
}

export interface QueryHistoryItem {
  id: string;
  query: QueryRequest;
  result?: QueryResult;
  executedAt: string;
}

// ============================================================================
// API Response Handler
// ============================================================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// ============================================================================
// Conduit Service
// ============================================================================

export const conduitService = {
  // -------------------------------------------------------------------------
  // Connection Testing
  // -------------------------------------------------------------------------

  /**
   * Test connection using credentials stored in KV
   */
  async testConnection(applicationId: string, connectionPath: string): Promise<TestConnectionResult> {
    const response = await fetch(APIS_URL.testDbConnection(applicationId, connectionPath), {
      method: 'POST',
    });
    return handleResponse<TestConnectionResult>(response);
  },

  /**
   * Test connection with inline credentials (without saving to KV)
   */
  async testConnectionInline(request: TestConnectionRequest): Promise<TestConnectionResult> {
    const response = await fetch(APIS_URL.testDbConnectionInline(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return handleResponse<TestConnectionResult>(response);
  },

  // -------------------------------------------------------------------------
  // Schema Introspection
  // -------------------------------------------------------------------------

  /**
   * List all schemas in the database
   */
  async listSchemas(applicationId: string, connectionPath: string): Promise<SchemaDTO[]> {
    const response = await fetch(APIS_URL.listDbSchemas(applicationId, connectionPath));
    return handleResponse<SchemaDTO[]>(response);
  },

  /**
   * List tables in a schema (or all tables if schema not specified)
   */
  async listTables(applicationId: string, connectionPath: string, schema?: string): Promise<TableDTO[]> {
    const response = await fetch(APIS_URL.listDbTables(applicationId, connectionPath, schema));
    return handleResponse<TableDTO[]>(response);
  },

  /**
   * Get columns for a specific table
   */
  async getColumns(
    applicationId: string,
    connectionPath: string,
    schema: string,
    table: string
  ): Promise<ColumnDTO[]> {
    const response = await fetch(APIS_URL.getDbColumns(applicationId, connectionPath, schema, table));
    return handleResponse<ColumnDTO[]>(response);
  },

  /**
   * Get relationships (foreign keys) for a specific table
   */
  async getRelationships(
    applicationId: string,
    connectionPath: string,
    schema: string,
    table: string
  ): Promise<RelationshipDTO[]> {
    const response = await fetch(APIS_URL.getDbRelationships(applicationId, connectionPath, schema, table));
    return handleResponse<RelationshipDTO[]>(response);
  },

  // -------------------------------------------------------------------------
  // Query Execution
  // -------------------------------------------------------------------------

  /**
   * Execute a query against the database
   */
  async executeQuery(
    applicationId: string,
    connectionPath: string,
    query: QueryRequest
  ): Promise<QueryResult> {
    const response = await fetch(APIS_URL.executeDbQuery(applicationId, connectionPath), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    });
    return handleResponse<QueryResult>(response);
  },

  // -------------------------------------------------------------------------
  // Connection Pool Management
  // -------------------------------------------------------------------------

  /**
   * Get pool statistics for a connection
   */
  async getPoolStats(applicationId: string, connectionPath: string): Promise<PoolStats> {
    const response = await fetch(APIS_URL.getDbPoolStats(applicationId, connectionPath));
    return handleResponse<PoolStats>(response);
  },

  /**
   * Close a connection pool
   */
  async closePool(applicationId: string, connectionPath: string): Promise<void> {
    const response = await fetch(APIS_URL.closeDbPool(applicationId, connectionPath), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to close connection pool');
    }
  },

  // -------------------------------------------------------------------------
  // Health Check
  // -------------------------------------------------------------------------

  /**
   * Check if the conduit service is healthy
   */
  async healthCheck(): Promise<{ status: string }> {
    const response = await fetch(APIS_URL.dbHealth());
    return handleResponse<{ status: string }>(response);
  },
};
