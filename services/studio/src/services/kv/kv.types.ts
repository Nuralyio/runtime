/**
 * KV Store Types
 * Shared type definitions for the KV storage system.
 */

/**
 * KV Value types (auto-detected by backend)
 */
export type KvValueType = 'STRING' | 'JSON' | 'NUMBER' | 'BOOLEAN' | 'BINARY';

/**
 * KV Entry interface - flat structure without namespaces
 */
export interface KvEntry {
  id: string;
  applicationId: string;
  scope?: string;
  scopedResourceId?: string;
  keyPath: string;
  value: any;
  valueType: KvValueType;
  isSecret: boolean;
  isEncrypted: boolean;
  version: number;
  expiresAt?: string;
  metadata?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * KV Entry Version (for secret history)
 */
export interface KvEntryVersion {
  id: string;
  entryId: string;
  version: number;
  changeReason: string;
  changedBy?: string;
  createdAt: string;
}

/**
 * Options for fetching KV entries
 */
export interface FetchEntriesOptions {
  scope?: string;
  scopedResourceId?: string;
  prefix?: string;
}

/**
 * Request to set an entry
 */
export interface SetEntryRequest {
  applicationId: string;
  scope?: string;
  scopedResourceId?: string;
  value: any;
  isSecret?: boolean;
  ttlSeconds?: number;
  metadata?: string;
  expectedVersion?: number;
}
