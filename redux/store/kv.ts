import { map } from "nanostores";
import * as kvService from "../../services/kv/kv.service";

// Re-export types from the service layer — single source of truth
export type { KvValueType, KvEntry, KvEntryVersion, FetchEntriesOptions, SetEntryRequest } from "../../services/kv/kv.types";
import type { KvEntry, FetchEntriesOptions, SetEntryRequest, KvEntryVersion } from "../../services/kv/kv.types";

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

// ============================================
// Delegating functions (cache + service calls)
// ============================================

/**
 * Fetch all entries from API (without applicationId filter)
 */
export async function getAllKvEntries(prefix?: string): Promise<KvEntry[] | null> {
  return kvService.getAllKvEntries(prefix);
}

/**
 * Get a single entry from API
 */
export async function getKvEntry(appId: string, keyPath: string): Promise<KvEntry | null> {
  return kvService.fetchEntry(appId, keyPath);
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

  // Create the fetch promise — delegates to service
  const fetchPromise = kvService.fetchEntries(appId, options)
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
  const result = await kvService.setEntry(keyPath, request);
  if (result) {
    invalidateKvCache(request.applicationId);
  }
  return result;
}

/**
 * Delete an entry
 */
export async function deleteKvEntry(appId: string, keyPath: string): Promise<boolean> {
  const result = await kvService.deleteEntry(appId, keyPath);
  if (result) {
    invalidateKvCache(appId);
  }
  return result;
}

/**
 * Rotate a secret value
 */
export async function rotateKvSecret(appId: string, keyPath: string, newValue: any): Promise<KvEntry | null> {
  const result = await kvService.rotateSecret(appId, keyPath, newValue);
  if (result) {
    invalidateKvCache(appId);
  }
  return result;
}

/**
 * Get version history for an entry
 */
export async function getKvVersionHistory(appId: string, keyPath: string): Promise<KvEntryVersion[] | null> {
  return kvService.getVersionHistory(appId, keyPath);
}

// ============================================
// Cache operations (stay in the store)
// ============================================

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

// ============================================
// User Preferences API — delegates to service
// ============================================

export async function getUserPreference<T = any>(keyPath: string): Promise<T | null> {
  return kvService.getUserPreference<T>(keyPath);
}

export async function setUserPreference<T = any>(keyPath: string, value: T): Promise<boolean> {
  return kvService.setUserPreference(keyPath, value);
}

export async function deleteUserPreference(keyPath: string): Promise<boolean> {
  return kvService.deleteUserPreference(keyPath);
}
