import { map } from "nanostores";

/**
 * KV Value types
 */
export type KvValueType = 'STRING' | 'JSON' | 'NUMBER' | 'BOOLEAN' | 'BINARY';

/**
 * KV Namespace interface
 */
export interface KvNamespace {
  id: string;
  name: string;
  description?: string;
  applicationId: string;
  isSecretNamespace: boolean;
  defaultTtlSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * KV Entry interface
 */
export interface KvEntry {
  id: string;
  namespaceId: string;
  keyPath: string;
  value: any;
  valueType: KvValueType;
  isEncrypted: boolean;
  version: number;
  expiresAt?: string;
  metadata?: Record<string, any>;
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
  changeReason: 'UPDATE' | 'ROTATION' | 'ROLLBACK';
  changedBy?: string;
  createdAt: string;
}

/**
 * KV Data structure for cache
 */
export interface KvData {
  namespaces: KvNamespace[];
  entries: Record<string, KvEntry[]>; // Key: namespaceId
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
const pendingNamespaceRequests = new Map<string, Promise<KvNamespace[] | null>>();
const pendingEntryRequests = new Map<string, Promise<KvEntry[] | null>>();

/**
 * Fetch namespaces from API
 */
async function fetchNamespacesFromAPI(appId: string): Promise<KvNamespace[] | null> {
  try {
    const response = await fetch(`/api/v1/kv/namespaces?applicationId=${appId}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch namespaces');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch KV namespaces:', error);
    return null;
  }
}

/**
 * Fetch entries from API for a namespace
 */
async function fetchEntriesFromAPI(namespaceId: string): Promise<KvEntry[] | null> {
  try {
    const response = await fetch(`/api/v1/kv/${namespaceId}/entries`, {
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
 * Get KV namespaces from cache or fetch
 */
export async function getKvNamespaces(
  appId: string,
  forceRefresh = false
): Promise<KvNamespace[] | null> {
  if (!appId) return null;

  const cache = $kvCache.get();
  const now = Date.now();

  // Check cache first (unless force refresh)
  if (!forceRefresh && cache[appId]) {
    const entry = cache[appId];
    if (now - entry.timestamp < CACHE_DURATION && entry.namespaces.length > 0) {
      return entry.namespaces;
    }
  }

  // Check if there's already a pending request for this app
  if (pendingNamespaceRequests.has(appId)) {
    return pendingNamespaceRequests.get(appId)!;
  }

  // Mark as loading in cache (preserve existing data if any)
  const existingData = cache[appId] || { namespaces: [], entries: {} };
  $kvCache.setKey(appId, {
    ...existingData,
    loading: true,
    timestamp: now
  });

  // Create the fetch promise
  const fetchPromise = fetchNamespacesFromAPI(appId)
    .then((namespaces) => {
      const currentCache = $kvCache.get();
      const currentData = currentCache[appId] || { namespaces: [], entries: {} };

      if (namespaces) {
        $kvCache.setKey(appId, {
          ...currentData,
          namespaces,
          loading: false,
          timestamp: Date.now()
        });
      } else {
        $kvCache.setKey(appId, {
          ...currentData,
          namespaces: [],
          loading: false,
          timestamp: Date.now()
        });
      }
      return namespaces;
    })
    .finally(() => {
      pendingNamespaceRequests.delete(appId);
    });

  pendingNamespaceRequests.set(appId, fetchPromise);

  return fetchPromise;
}

/**
 * Get KV entries for a namespace from cache or fetch
 */
export async function getKvEntries(
  appId: string,
  namespaceId: string,
  forceRefresh = false
): Promise<KvEntry[] | null> {
  if (!appId || !namespaceId) return null;

  const cache = $kvCache.get();
  const now = Date.now();

  // Check cache first (unless force refresh)
  if (!forceRefresh && cache[appId]?.entries[namespaceId]) {
    const entry = cache[appId];
    if (now - entry.timestamp < CACHE_DURATION) {
      return entry.entries[namespaceId];
    }
  }

  // Check if there's already a pending request for this namespace
  const requestKey = `${appId}:${namespaceId}`;
  if (pendingEntryRequests.has(requestKey)) {
    return pendingEntryRequests.get(requestKey)!;
  }

  // Create the fetch promise
  const fetchPromise = fetchEntriesFromAPI(namespaceId)
    .then((entries) => {
      const currentCache = $kvCache.get();
      const currentData = currentCache[appId] || { namespaces: [], entries: {}, loading: false, timestamp: 0 };

      if (entries) {
        $kvCache.setKey(appId, {
          ...currentData,
          entries: {
            ...currentData.entries,
            [namespaceId]: entries
          },
          timestamp: Date.now()
        });
      }
      return entries;
    })
    .finally(() => {
      pendingEntryRequests.delete(requestKey);
    });

  pendingEntryRequests.set(requestKey, fetchPromise);

  return fetchPromise;
}

/**
 * Invalidate KV cache for a specific app
 */
export function invalidateKvCache(appId: string): void {
  const cache = $kvCache.get();
  if (cache[appId]) {
    const { [appId]: _, ...rest } = cache;
    $kvCache.set(rest);
  }
}

/**
 * Invalidate entries cache for a specific namespace
 */
export function invalidateEntriesCache(appId: string, namespaceId: string): void {
  const cache = $kvCache.get();
  const appData = cache[appId];
  if (appData?.entries[namespaceId]) {
    const { [namespaceId]: _, ...restEntries } = appData.entries;
    $kvCache.setKey(appId, {
      ...appData,
      entries: restEntries
    });
  }
}

/**
 * Refresh namespaces (invalidate + fetch)
 */
export async function refreshKvNamespaces(appId: string): Promise<KvNamespace[] | null> {
  return getKvNamespaces(appId, true);
}

/**
 * Refresh entries (invalidate + fetch)
 */
export async function refreshKvEntries(appId: string, namespaceId: string): Promise<KvEntry[] | null> {
  return getKvEntries(appId, namespaceId, true);
}

/**
 * Get cached namespaces synchronously
 */
export function getCachedKvNamespaces(appId: string): KvNamespace[] | null {
  if (!appId) return null;

  const cache = $kvCache.get();
  const entry = cache[appId];

  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.namespaces;
  }

  return null;
}

/**
 * Get cached entries synchronously
 */
export function getCachedKvEntries(appId: string, namespaceId: string): KvEntry[] | null {
  if (!appId || !namespaceId) return null;

  const cache = $kvCache.get();
  const appData = cache[appId];

  if (appData && Date.now() - appData.timestamp < CACHE_DURATION) {
    return appData.entries[namespaceId] || null;
  }

  return null;
}

/**
 * Update namespaces in cache
 */
export function updateCachedNamespaces(appId: string, namespaces: KvNamespace[]): void {
  const cache = $kvCache.get();
  const entry = cache[appId] || { namespaces: [], entries: {}, loading: false, timestamp: 0 };
  $kvCache.setKey(appId, {
    ...entry,
    namespaces,
    timestamp: Date.now()
  });
}

/**
 * Update entries in cache for a namespace
 */
export function updateCachedEntries(appId: string, namespaceId: string, entries: KvEntry[]): void {
  const cache = $kvCache.get();
  const appData = cache[appId] || { namespaces: [], entries: {}, loading: false, timestamp: 0 };
  $kvCache.setKey(appId, {
    ...appData,
    entries: {
      ...appData.entries,
      [namespaceId]: entries
    },
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
