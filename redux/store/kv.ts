import { map } from "nanostores";

/**
 * KV Value types (auto-detected, but exposed for reference)
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

/**
 * KV Data structure for cache
 */
export interface KvData {
  entries: KvEntry[];
  loading: boolean;
  timestamp: number;
}

/**
 * Cache duration in milliseconds (5 minutes)
 */
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Store for KV data cache
 * Key: applicationId
 */
export const $kvCache = map<Record<string, KvData>>({});

/**
 * Store for KV modal visibility
 */
export const $showKvModal = map<boolean>(false);

/**
 * Track in-flight requests to prevent duplicate fetches
 */
const pendingEntryRequests = new Map<string, Promise<KvEntry[] | null>>();

/**
 * Build cache key for entries
 */
function buildCacheKey(appId: string, options?: FetchEntriesOptions): string {
  const parts = [appId];
  if (options?.scope) parts.push(options.scope);
  if (options?.scopedResourceId) parts.push(options.scopedResourceId);
  if (options?.prefix) parts.push(options.prefix);
  return parts.join(':');
}

/**
 * Fetch all entries from API (without applicationId filter)
 */
export async function getAllKvEntries(prefix?: string): Promise<KvEntry[] | null> {
  try {
    const params = new URLSearchParams();
    if (prefix) {
      params.append('prefix', prefix);
    }
    const queryString = params.toString();
    const response = await fetch(`/api/v1/kv/entries${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch all entries');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch all KV entries:', error);
    return null;
  }
}

/**
 * Fetch entries from API
 */
async function fetchEntriesFromAPI(appId: string, options?: FetchEntriesOptions): Promise<KvEntry[] | null> {
  try {
    const params = new URLSearchParams({ applicationId: appId });
    if (options?.scope) {
      params.append('scope', options.scope);
    }
    if (options?.scopedResourceId) {
      params.append('scopedResourceId', options.scopedResourceId);
    }
    if (options?.prefix) {
      params.append('prefix', options.prefix);
    }
    const response = await fetch(`/api/v1/kv/entries?${params.toString()}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch entries');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch KV entries:', error);
    return null;
  }
}

/**
 * Get a single entry from API
 */
export async function getKvEntry(appId: string, keyPath: string): Promise<KvEntry | null> {
  try {
    const params = new URLSearchParams({ applicationId: appId });
    const response = await fetch(`/api/v1/kv/entries/${encodeURIComponent(keyPath)}?${params.toString()}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch entry');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch KV entry:', error);
    return null;
  }
}

/**
 * Get KV entries from cache or fetch
 */
export async function getKvEntries(
  appId: string,
  options?: FetchEntriesOptions,
  forceRefresh = false
): Promise<KvEntry[] | null> {
  if (!appId) return null;

  const cacheKey = buildCacheKey(appId, options);
  const cache = $kvCache.get();
  const now = Date.now();

  // Check cache first (unless force refresh)
  if (!forceRefresh && cache[cacheKey]) {
    const entry = cache[cacheKey];
    if (now - entry.timestamp < CACHE_DURATION && entry.entries.length > 0) {
      return entry.entries;
    }
  }

  // Check if there's already a pending request
  if (pendingEntryRequests.has(cacheKey)) {
    return pendingEntryRequests.get(cacheKey)!;
  }

  // Mark as loading in cache
  const existingData = cache[cacheKey] || { entries: [] };
  $kvCache.setKey(cacheKey, {
    ...existingData,
    loading: true,
    timestamp: now
  });

  // Create the fetch promise
  const fetchPromise = fetchEntriesFromAPI(appId, options)
    .then((entries) => {
      const currentCache = $kvCache.get();
      const currentData = currentCache[cacheKey] || { entries: [] };

      $kvCache.setKey(cacheKey, {
        ...currentData,
        entries: entries || [],
        loading: false,
        timestamp: Date.now()
      });
      return entries;
    })
    .finally(() => {
      pendingEntryRequests.delete(cacheKey);
    });

  pendingEntryRequests.set(cacheKey, fetchPromise);

  return fetchPromise;
}

/**
 * Set an entry value
 */
export async function setKvEntry(keyPath: string, request: SetEntryRequest): Promise<KvEntry | null> {
  try {
    const response = await fetch(`/api/v1/kv/entries/${encodeURIComponent(keyPath)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(request)
    });
    if (!response.ok) {
      throw new Error('Failed to set entry');
    }
    // Invalidate cache for this app
    invalidateKvCache(request.applicationId);
    return await response.json();
  } catch (error) {
    console.error('Failed to set KV entry:', error);
    return null;
  }
}

/**
 * Delete an entry
 */
export async function deleteKvEntry(appId: string, keyPath: string): Promise<boolean> {
  try {
    const params = new URLSearchParams({ applicationId: appId });
    const response = await fetch(`/api/v1/kv/entries/${encodeURIComponent(keyPath)}?${params.toString()}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to delete entry');
    }
    // Invalidate cache
    invalidateKvCache(appId);
    return true;
  } catch (error) {
    console.error('Failed to delete KV entry:', error);
    return false;
  }
}

/**
 * Rotate a secret value
 */
export async function rotateKvSecret(appId: string, keyPath: string, newValue: any): Promise<KvEntry | null> {
  try {
    const params = new URLSearchParams({ applicationId: appId });
    const response = await fetch(`/api/v1/kv/entries/${encodeURIComponent(keyPath)}/rotate?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ value: newValue })
    });
    if (!response.ok) {
      throw new Error('Failed to rotate secret');
    }
    // Invalidate cache
    invalidateKvCache(appId);
    return await response.json();
  } catch (error) {
    console.error('Failed to rotate KV secret:', error);
    return null;
  }
}

/**
 * Get version history for an entry
 */
export async function getKvVersionHistory(appId: string, keyPath: string): Promise<KvEntryVersion[] | null> {
  try {
    const params = new URLSearchParams({ applicationId: appId });
    const response = await fetch(`/api/v1/kv/entries/${encodeURIComponent(keyPath)}/versions?${params.toString()}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch version history');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch KV version history:', error);
    return null;
  }
}

/**
 * Invalidate KV cache for a specific app
 */
export function invalidateKvCache(appId: string): void {
  const cache = $kvCache.get();
  const keysToRemove = Object.keys(cache).filter(key => key.startsWith(appId));
  if (keysToRemove.length > 0) {
    const newCache = { ...cache };
    keysToRemove.forEach(key => delete newCache[key]);
    $kvCache.set(newCache);
  }
}

/**
 * Refresh entries (invalidate + fetch)
 */
export async function refreshKvEntries(appId: string, options?: FetchEntriesOptions): Promise<KvEntry[] | null> {
  return getKvEntries(appId, options, true);
}

/**
 * Get cached entries synchronously
 */
export function getCachedKvEntries(appId: string, options?: FetchEntriesOptions): KvEntry[] | null {
  if (!appId) return null;

  const cacheKey = buildCacheKey(appId, options);
  const cache = $kvCache.get();
  const entry = cache[cacheKey];

  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.entries;
  }

  return null;
}

/**
 * Update entries in cache
 */
export function updateCachedEntries(appId: string, entries: KvEntry[], options?: FetchEntriesOptions): void {
  const cacheKey = buildCacheKey(appId, options);
  const cache = $kvCache.get();
  const entry = cache[cacheKey] || { entries: [], loading: false, timestamp: 0 };
  $kvCache.setKey(cacheKey, {
    ...entry,
    entries,
    timestamp: Date.now()
  });
}

/**
 * Show KV modal
 */
export function showKvModal(): void {
  $showKvModal.set(true);
}

/**
 * Close KV modal
 */
export function closeKvModal(): void {
  $showKvModal.set(false);
}
