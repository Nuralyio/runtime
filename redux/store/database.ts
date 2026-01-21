import { map } from "nanostores";

/**
 * Database schema information
 */
export interface SchemaDTO {
  name: string;
  tableCount: number;
  owner?: string;
}

/**
 * Table information
 */
export interface TableDTO {
  name: string;
  schema?: string;
  type: 'table' | 'view' | 'collection';
  rowCount?: number;
  description?: string;
}

/**
 * Column information
 */
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

/**
 * Relationship (foreign key) information
 */
export interface RelationshipDTO {
  name: string;
  sourceColumn: string;
  targetTable: string;
  targetSchema?: string;
  targetColumn: string;
  type: string;
  onDelete?: string;
  onUpdate?: string;
}

/**
 * Test connection request
 */
export interface TestConnectionRequest {
  type: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  sslMode?: string;
}

/**
 * Test connection result
 */
export interface TestConnectionResult {
  success: boolean;
  error?: string;
  databaseVersion?: string;
  latencyMs?: number;
}

/**
 * Query request
 */
export interface QueryRequest {
  operation: string;
  schema?: string;
  table: string;
  filter?: any;
  fields?: Record<string, any>;
  select?: string[];
  orderBy?: { field: string; dir: string }[];
  limit?: number;
  offset?: number;
}

/**
 * Query result
 */
export interface QueryResult {
  rows?: Record<string, any>[];
  rowCount?: number;
  totalCount?: number;
  affectedRows?: number;
  generatedKeys?: any[];
  executionTimeMs?: number;
  success: boolean;
  error?: string;
}

/**
 * Cache entry for database introspection
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Cache duration in milliseconds (2 minutes)
 */
const CACHE_DURATION = 2 * 60 * 1000;

/**
 * Store for schemas cache
 * Key: `${applicationId}:${connectionPath}`
 */
export const $schemasCache = map<Record<string, CacheEntry<SchemaDTO[]>>>({});

/**
 * Store for tables cache
 * Key: `${applicationId}:${connectionPath}:${schema}`
 */
export const $tablesCache = map<Record<string, CacheEntry<TableDTO[]>>>({});

/**
 * Store for columns cache
 * Key: `${applicationId}:${connectionPath}:${schema}:${table}`
 */
export const $columnsCache = map<Record<string, CacheEntry<ColumnDTO[]>>>({});

/**
 * Store for relationships cache
 * Key: `${applicationId}:${connectionPath}:${schema}:${table}`
 */
export const $relationshipsCache = map<Record<string, CacheEntry<RelationshipDTO[]>>>({});

/**
 * Track in-flight requests
 */
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Get the base URL for the db-manager API
 */
function getDbManagerUrl(): string {
  // In dev, go through the gateway
  return '/api/v1/db';
}

/**
 * Test a database connection inline (without saving to KV)
 */
export async function testConnection(request: TestConnectionRequest): Promise<TestConnectionResult> {
  try {
    const response = await fetch(`${getDbManagerUrl()}/test-connection/inline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: text || `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection test failed' };
  }
}

/**
 * Test a database connection using credentials from KV
 */
export async function testConnectionFromKv(
  connectionPath: string,
  applicationId: string
): Promise<TestConnectionResult> {
  try {
    const params = new URLSearchParams({
      applicationId,
      connectionPath,
    });

    const response = await fetch(`${getDbManagerUrl()}/test-connection?${params}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: text || `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection test failed' };
  }
}

/**
 * Get schemas for a database connection
 */
export async function getSchemas(
  connectionPath: string,
  applicationId: string
): Promise<SchemaDTO[]> {
  const cacheKey = `${applicationId}:${connectionPath}`;

  // Check cache
  const cache = $schemasCache.get()[cacheKey];
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  // Check for pending request
  const pendingKey = `schemas:${cacheKey}`;
  if (pendingRequests.has(pendingKey)) {
    return pendingRequests.get(pendingKey);
  }

  // Make request
  const request = (async () => {
    try {
      const params = new URLSearchParams({
        applicationId,
        connectionPath,
      });

      const response = await fetch(`${getDbManagerUrl()}/schemas?${params}`);

      if (!response.ok) {
        console.error('Failed to fetch schemas:', response.statusText);
        return [];
      }

      const schemas: SchemaDTO[] = await response.json();

      // Update cache
      $schemasCache.setKey(cacheKey, {
        data: schemas,
        timestamp: Date.now(),
      });

      return schemas;
    } catch (err) {
      console.error('Failed to fetch schemas:', err);
      return [];
    } finally {
      pendingRequests.delete(pendingKey);
    }
  })();

  pendingRequests.set(pendingKey, request);
  return request;
}

/**
 * Get tables for a schema
 */
export async function getTables(
  connectionPath: string,
  applicationId: string,
  schema?: string
): Promise<TableDTO[]> {
  const cacheKey = `${applicationId}:${connectionPath}:${schema || 'default'}`;

  // Check cache
  const cache = $tablesCache.get()[cacheKey];
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  // Check for pending request
  const pendingKey = `tables:${cacheKey}`;
  if (pendingRequests.has(pendingKey)) {
    return pendingRequests.get(pendingKey);
  }

  // Make request
  const request = (async () => {
    try {
      const params = new URLSearchParams({
        applicationId,
        connectionPath,
      });
      if (schema) {
        params.set('schema', schema);
      }

      const response = await fetch(`${getDbManagerUrl()}/tables?${params}`);

      if (!response.ok) {
        console.error('Failed to fetch tables:', response.statusText);
        return [];
      }

      const tables: TableDTO[] = await response.json();

      // Update cache
      $tablesCache.setKey(cacheKey, {
        data: tables,
        timestamp: Date.now(),
      });

      return tables;
    } catch (err) {
      console.error('Failed to fetch tables:', err);
      return [];
    } finally {
      pendingRequests.delete(pendingKey);
    }
  })();

  pendingRequests.set(pendingKey, request);
  return request;
}

/**
 * Get columns for a table
 */
export async function getColumns(
  connectionPath: string,
  applicationId: string,
  table: string,
  schema?: string
): Promise<ColumnDTO[]> {
  const cacheKey = `${applicationId}:${connectionPath}:${schema || 'default'}:${table}`;

  // Check cache
  const cache = $columnsCache.get()[cacheKey];
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  // Check for pending request
  const pendingKey = `columns:${cacheKey}`;
  if (pendingRequests.has(pendingKey)) {
    return pendingRequests.get(pendingKey);
  }

  // Make request
  const request = (async () => {
    try {
      const params = new URLSearchParams({
        applicationId,
        connectionPath,
        table,
      });
      if (schema) {
        params.set('schema', schema);
      }

      const response = await fetch(`${getDbManagerUrl()}/columns?${params}`);

      if (!response.ok) {
        console.error('Failed to fetch columns:', response.statusText);
        return [];
      }

      const columns: ColumnDTO[] = await response.json();

      // Update cache
      $columnsCache.setKey(cacheKey, {
        data: columns,
        timestamp: Date.now(),
      });

      return columns;
    } catch (err) {
      console.error('Failed to fetch columns:', err);
      return [];
    } finally {
      pendingRequests.delete(pendingKey);
    }
  })();

  pendingRequests.set(pendingKey, request);
  return request;
}

/**
 * Get relationships for a table
 */
export async function getRelationships(
  connectionPath: string,
  applicationId: string,
  table: string,
  schema?: string
): Promise<RelationshipDTO[]> {
  const cacheKey = `${applicationId}:${connectionPath}:${schema || 'default'}:${table}`;

  // Check cache
  const cache = $relationshipsCache.get()[cacheKey];
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  // Check for pending request
  const pendingKey = `relationships:${cacheKey}`;
  if (pendingRequests.has(pendingKey)) {
    return pendingRequests.get(pendingKey);
  }

  // Make request
  const request = (async () => {
    try {
      const params = new URLSearchParams({
        applicationId,
        connectionPath,
        table,
      });
      if (schema) {
        params.set('schema', schema);
      }

      const response = await fetch(`${getDbManagerUrl()}/relationships?${params}`);

      if (!response.ok) {
        console.error('Failed to fetch relationships:', response.statusText);
        return [];
      }

      const relationships: RelationshipDTO[] = await response.json();

      // Update cache
      $relationshipsCache.setKey(cacheKey, {
        data: relationships,
        timestamp: Date.now(),
      });

      return relationships;
    } catch (err) {
      console.error('Failed to fetch relationships:', err);
      return [];
    } finally {
      pendingRequests.delete(pendingKey);
    }
  })();

  pendingRequests.set(pendingKey, request);
  return request;
}

/**
 * Execute a database query
 */
export async function executeQuery(
  connectionPath: string,
  applicationId: string,
  request: QueryRequest,
  timeoutMs: number = 30000
): Promise<QueryResult> {
  try {
    const params = new URLSearchParams({
      applicationId,
      connectionPath,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${getDbManagerUrl()}/execute?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      return { success: false, error: text || `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return { success: false, error: `Query timed out after ${timeoutMs / 1000}s` };
    }
    return { success: false, error: err.message || 'Query execution failed' };
  }
}

/**
 * Clear all caches for a connection
 */
export function clearConnectionCache(connectionPath: string, applicationId: string): void {
  const prefix = `${applicationId}:${connectionPath}`;

  // Clear schemas cache
  const schemasCache = $schemasCache.get();
  Object.keys(schemasCache)
    .filter(key => key.startsWith(prefix))
    .forEach(key => delete schemasCache[key]);
  $schemasCache.set(schemasCache);

  // Clear tables cache
  const tablesCache = $tablesCache.get();
  Object.keys(tablesCache)
    .filter(key => key.startsWith(prefix))
    .forEach(key => delete tablesCache[key]);
  $tablesCache.set(tablesCache);

  // Clear columns cache
  const columnsCache = $columnsCache.get();
  Object.keys(columnsCache)
    .filter(key => key.startsWith(prefix))
    .forEach(key => delete columnsCache[key]);
  $columnsCache.set(columnsCache);

  // Clear relationships cache
  const relationshipsCache = $relationshipsCache.get();
  Object.keys(relationshipsCache)
    .filter(key => key.startsWith(prefix))
    .forEach(key => delete relationshipsCache[key]);
  $relationshipsCache.set(relationshipsCache);
}

/**
 * Clear all database introspection caches
 */
export function clearAllDatabaseCaches(): void {
  $schemasCache.set({});
  $tablesCache.set({});
  $columnsCache.set({});
  $relationshipsCache.set({});
}
