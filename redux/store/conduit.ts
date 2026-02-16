import { atom } from "nanostores";
import type {
  SchemaDTO,
  TableDTO,
  ColumnDTO,
  RelationshipDTO,
  QueryRequest,
  QueryResult,
} from "./database";
import {
  getSchemas,
  getTables,
  getColumns,
  getRelationships,
  executeQuery,
  testConnectionFromKv,
} from "./database";
import { getKvEntry, setKvEntry } from "./kv";

// ============================================================================
// Types
// ============================================================================

export interface DatabaseConnection {
  path: string; // KV path e.g. "postgresql/prod-db"
  type: string; // Database type e.g. "postgresql"
  name: string; // Display name e.g. "prod-db"
  status: 'unknown' | 'connected' | 'error';
  lastError?: string;
  lastTestedAt?: number;
}

export interface DatabaseCanvasViewport {
  zoom: number;
  panX: number;
  panY: number;
}

export interface TablePosition {
  x: number;
  y: number;
}

export type TablePositions = Record<string, TablePosition>;

export interface QueryHistoryItem {
  id: string;
  connectionPath: string;
  request: QueryRequest;
  result?: QueryResult;
  executedAt: string;
}

export interface ConduitState {
  // Current selection
  currentConnection: DatabaseConnection | null;
  currentSchema: string | null;
  currentTable: string | null;

  // Loaded data
  schemas: SchemaDTO[];
  tables: TableDTO[];
  columns: ColumnDTO[];
  relationships: RelationshipDTO[];

  // Query state
  queryResult: QueryResult | null;
  isExecutingQuery: boolean;

  // Loading states
  loadingSchemas: boolean;
  loadingTables: boolean;
  loadingColumns: boolean;
}

// ============================================================================
// Stores
// ============================================================================

/**
 * Main conduit state
 */
export const $conduitState = atom<ConduitState>({
  currentConnection: null,
  currentSchema: null,
  currentTable: null,
  schemas: [],
  tables: [],
  columns: [],
  relationships: [],
  queryResult: null,
  isExecutingQuery: false,
  loadingSchemas: false,
  loadingTables: false,
  loadingColumns: false,
});

/**
 * List of available database connections (from KV store)
 */
export const $databaseConnections = atom<DatabaseConnection[]>([]);

/**
 * Query history
 */
export const $queryHistory = atom<QueryHistoryItem[]>([]);

/**
 * Environment detection flag
 */
const isServer: boolean = typeof window === "undefined";

// ============================================================================
// Actions
// ============================================================================

/**
 * Set available database connections (called when KV entries are loaded)
 */
export function setDatabaseConnections(connections: DatabaseConnection[]): void {
  $databaseConnections.set(connections);
}

/**
 * Select a database connection
 */
export async function selectConnection(
  connection: DatabaseConnection,
  applicationId: string
): Promise<void> {
  const state = $conduitState.get();

  $conduitState.set({
    ...state,
    currentConnection: connection,
    currentSchema: null,
    currentTable: null,
    schemas: [],
    tables: [],
    columns: [],
    relationships: [],
    queryResult: null,
    loadingSchemas: true,
  });

  // Load schemas for this connection
  try {
    const schemas = await getSchemas(connection.path, applicationId);

    const currentState = $conduitState.get();
    // Only update if still on same connection
    if (currentState.currentConnection?.path === connection.path) {
      $conduitState.set({
        ...currentState,
        schemas,
        loadingSchemas: false,
        // Auto-select 'public' schema for PostgreSQL if available
        currentSchema: schemas.find(s => s.name === 'public')?.name || schemas[0]?.name || null,
      });

      // If a schema was auto-selected, load its tables
      const updatedState = $conduitState.get();
      if (updatedState.currentSchema) {
        await selectSchema(updatedState.currentSchema, applicationId);
      }
    }
  } catch (error) {
    console.error('Failed to load schemas:', error);
    const currentState = $conduitState.get();
    $conduitState.set({
      ...currentState,
      loadingSchemas: false,
    });
  }
}

/**
 * Select a schema
 */
export async function selectSchema(
  schemaName: string,
  applicationId: string
): Promise<void> {
  const state = $conduitState.get();
  if (!state.currentConnection) return;

  $conduitState.set({
    ...state,
    currentSchema: schemaName,
    currentTable: null,
    tables: [],
    columns: [],
    relationships: [],
    loadingTables: true,
  });

  try {
    const tables = await getTables(state.currentConnection.path, applicationId, schemaName);

    const currentState = $conduitState.get();
    if (currentState.currentSchema === schemaName) {
      $conduitState.set({
        ...currentState,
        tables,
        loadingTables: false,
      });
    }
  } catch (error) {
    console.error('Failed to load tables:', error);
    const currentState = $conduitState.get();
    $conduitState.set({
      ...currentState,
      loadingTables: false,
    });
  }
}

/**
 * Select a table
 */
export async function selectTable(
  tableName: string,
  applicationId: string
): Promise<void> {
  const state = $conduitState.get();
  if (!state.currentConnection || !state.currentSchema) return;

  $conduitState.set({
    ...state,
    currentTable: tableName,
    columns: [],
    relationships: [],
    loadingColumns: true,
  });

  try {
    const [columns, relationships] = await Promise.all([
      getColumns(state.currentConnection.path, applicationId, tableName, state.currentSchema),
      getRelationships(state.currentConnection.path, applicationId, tableName, state.currentSchema),
    ]);

    const currentState = $conduitState.get();
    if (currentState.currentTable === tableName) {
      $conduitState.set({
        ...currentState,
        columns,
        relationships,
        loadingColumns: false,
      });
    }
  } catch (error) {
    console.error('Failed to load columns:', error);
    const currentState = $conduitState.get();
    $conduitState.set({
      ...currentState,
      loadingColumns: false,
    });
  }
}

/**
 * Execute a query
 */
export async function runQuery(
  applicationId: string,
  query: QueryRequest
): Promise<QueryResult | null> {
  const state = $conduitState.get();
  if (!state.currentConnection) return null;

  $conduitState.set({
    ...state,
    isExecutingQuery: true,
    // Keep previous queryResult to avoid table blink during loading
  });

  try {
    const result = await executeQuery(state.currentConnection.path, applicationId, query);

    const currentState = $conduitState.get();
    $conduitState.set({
      ...currentState,
      queryResult: result,
      isExecutingQuery: false,
    });

    // Add to history
    const historyItem: QueryHistoryItem = {
      id: (crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`),
      connectionPath: state.currentConnection.path,
      request: query,
      result,
      executedAt: new Date().toISOString(),
    };
    $queryHistory.set([historyItem, ...$queryHistory.get().slice(0, 49)]); // Keep last 50

    return result;
  } catch (error: any) {
    console.error('Query execution failed:', error);
    const currentState = $conduitState.get();
    const errorResult: QueryResult = {
      success: false,
      error: error.message || 'Query execution failed',
    };
    $conduitState.set({
      ...currentState,
      queryResult: errorResult,
      isExecutingQuery: false,
    });
    return errorResult;
  }
}

/**
 * Test the current connection
 */
export async function testCurrentConnection(applicationId: string): Promise<boolean> {
  const state = $conduitState.get();
  if (!state.currentConnection) return false;

  const result = await testConnectionFromKv(state.currentConnection.path, applicationId);

  // Update connection status
  const connections = $databaseConnections.get();
  const updatedConnections = connections.map(c =>
    c.path === state.currentConnection?.path
      ? {
          ...c,
          status: result.success ? 'connected' : 'error',
          lastError: result.error,
          lastTestedAt: Date.now(),
        } as DatabaseConnection
      : c
  );
  $databaseConnections.set(updatedConnections);

  // Update current connection in state
  $conduitState.set({
    ...state,
    currentConnection: {
      ...state.currentConnection,
      status: result.success ? 'connected' : 'error',
      lastError: result.error,
      lastTestedAt: Date.now(),
    },
  });

  return result.success;
}

/**
 * Clear current selection
 */
export function clearConduitState(): void {
  $conduitState.set({
    currentConnection: null,
    currentSchema: null,
    currentTable: null,
    schemas: [],
    tables: [],
    columns: [],
    relationships: [],
    queryResult: null,
    isExecutingQuery: false,
    loadingSchemas: false,
    loadingTables: false,
    loadingColumns: false,
  });
}

/**
 * Parse KV entries into database connections
 */
export function parseKvEntriesToConnections(kvEntries: any[]): DatabaseConnection[] {
  return kvEntries
    .filter(entry => entry.keyPath?.startsWith('database/') && entry.isSecret)
    .map(entry => ({
      path: entry.keyPath,
      type: entry.value?.type || 'postgresql',
      name: entry.keyPath.replace('database/', ''),
      status: 'unknown' as const,
    }));
}

// ============================================================================
// Sync to runtime Vars
// ============================================================================

$conduitState.subscribe((state) => {
  if (isServer) return;
  const instance = (globalThis as any).__NURALY_EXECUTE_INSTANCE__;
  if (instance?.VarsProxy) {
    instance.VarsProxy.currentDatabaseConnection = state.currentConnection ? { ...state.currentConnection } : null;
    instance.VarsProxy.currentSchema = state.currentSchema;
    instance.VarsProxy.currentTable = state.currentTable;
  }
});

$databaseConnections.subscribe((connections) => {
  if (isServer) return;
  const instance = (globalThis as any).__NURALY_EXECUTE_INSTANCE__;
  if (instance?.VarsProxy) {
    instance.VarsProxy.databaseConnections = [...connections];
  }
});

// ============================================================================
// Database Canvas Viewport (per user, per connection)
// ============================================================================

/**
 * In-memory cache for viewports
 */
export const $databaseViewports = atom<Record<string, DatabaseCanvasViewport>>({});

/**
 * Build KV key path for viewport
 */
function buildViewportKeyPath(connectionPath: string): string {
  // Encode connection path to be URL-safe
  const encodedPath = connectionPath.replace(/\//g, '__');
  return `_user_prefs/db_viewport/${encodedPath}`;
}

/**
 * Get viewport for a connection (from cache or KV)
 */
export async function getDatabaseViewport(
  connectionPath: string,
  applicationId: string
): Promise<DatabaseCanvasViewport | null> {
  // Check in-memory cache first
  const cached = $databaseViewports.get()[connectionPath];
  if (cached) return cached;

  // Fetch from KV
  const keyPath = buildViewportKeyPath(connectionPath);
  const entry = await getKvEntry(applicationId, keyPath);

  if (entry?.value) {
    const viewport = entry.value as DatabaseCanvasViewport;
    // Update cache
    $databaseViewports.set({
      ...$databaseViewports.get(),
      [connectionPath]: viewport,
    });
    return viewport;
  }

  return null;
}

/**
 * Save viewport for a connection to KV
 */
export async function saveDatabaseViewport(
  connectionPath: string,
  applicationId: string,
  viewport: DatabaseCanvasViewport
): Promise<boolean> {
  // Update in-memory cache immediately
  $databaseViewports.set({
    ...$databaseViewports.get(),
    [connectionPath]: viewport,
  });

  // Persist to KV with user scope
  const keyPath = buildViewportKeyPath(connectionPath);
  const result = await setKvEntry(keyPath, {
    applicationId,
    scope: 'user',
    value: viewport,
    isSecret: false,
  });

  return result !== null;
}

/**
 * Get default viewport
 */
export function getDefaultViewport(): DatabaseCanvasViewport {
  return {
    zoom: 1,
    panX: 0,
    panY: 0,
  };
}

// ============================================================================
// Database Table Positions (per user, per connection, per schema)
// ============================================================================

/**
 * In-memory cache for table positions
 */
export const $databaseTablePositions = atom<Record<string, TablePositions>>({});

/**
 * Build KV key path for table positions
 */
function buildTablePositionsKeyPath(connectionPath: string, schemaName: string): string {
  const encodedPath = connectionPath.replace(/\//g, '__');
  const encodedSchema = schemaName.replace(/\//g, '__');
  return `_user_prefs/db_positions/${encodedPath}/${encodedSchema}`;
}

/**
 * Build cache key for table positions
 */
function buildTablePositionsCacheKey(connectionPath: string, schemaName: string): string {
  return `${connectionPath}::${schemaName}`;
}

/**
 * Get table positions for a connection and schema (from cache or KV)
 */
export async function getDatabaseTablePositions(
  connectionPath: string,
  schemaName: string,
  applicationId: string
): Promise<TablePositions | null> {
  const cacheKey = buildTablePositionsCacheKey(connectionPath, schemaName);

  // Check in-memory cache first
  const cached = $databaseTablePositions.get()[cacheKey];
  if (cached) return cached;

  // Fetch from KV
  const keyPath = buildTablePositionsKeyPath(connectionPath, schemaName);
  const entry = await getKvEntry(applicationId, keyPath);

  if (entry?.value) {
    const positions = entry.value as TablePositions;
    // Update cache
    $databaseTablePositions.set({
      ...$databaseTablePositions.get(),
      [cacheKey]: positions,
    });
    return positions;
  }

  return null;
}

/**
 * Save table positions for a connection and schema to KV
 */
export async function saveDatabaseTablePositions(
  connectionPath: string,
  schemaName: string,
  applicationId: string,
  positions: TablePositions
): Promise<boolean> {
  const cacheKey = buildTablePositionsCacheKey(connectionPath, schemaName);

  // Update in-memory cache immediately
  $databaseTablePositions.set({
    ...$databaseTablePositions.get(),
    [cacheKey]: positions,
  });

  // Persist to KV with user scope
  const keyPath = buildTablePositionsKeyPath(connectionPath, schemaName);
  const result = await setKvEntry(keyPath, {
    applicationId,
    scope: 'user',
    value: positions,
    isSecret: false,
  });

  return result !== null;
}
