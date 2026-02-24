import { atom, map } from "nanostores";

/**
 * Permission data structure
 */
export interface ResourcePermission {
  id?: number;
  resource_id: string;
  resource_type: 'page' | 'component' | 'application' | 'function';
  grantee_type: 'user' | 'role' | 'public' | 'anonymous';
  grantee_id: string | null;
  permission: string;
}

export interface ParsedPermissions {
  is_public: boolean;
  is_anonymous: boolean;
  role_permissions: Array<{
    role_name: string;
    permission: string;
    is_system: boolean;
  }>;
  raw: ResourcePermission[];
}

interface PermissionsCacheEntry {
  data: ParsedPermissions;
  timestamp: number;
}

/**
 * Cache duration in milliseconds (5 minutes)
 */
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Store for resource permissions cache
 * Key format: `${resourceType}:${resourceId}`
 */
export const $permissionsCache = map<Record<string, PermissionsCacheEntry>>({});

/**
 * Store for tracking in-flight requests to prevent duplicate fetches
 */
const pendingRequests = new Map<string, Promise<ParsedPermissions | null>>();

/**
 * Store for loading state per resource
 */
export const $permissionsLoading = map<Record<string, boolean>>({});

/**
 * Generate cache key for a resource
 */
function getCacheKey(resourceType: string, resourceId: string): string {
  return `${resourceType}:${resourceId}`;
}

/**
 * Parse raw permissions array into structured format
 */
function parsePermissions(permissions: any[]): ParsedPermissions {
  const is_public = permissions.some((p: any) => p.granteeType === 'public');
  const is_anonymous = permissions.some((p: any) => p.granteeType === 'anonymous');
  const role_permissions = permissions
    .filter((p: any) => p.granteeType === 'role')
    .map((p: any) => ({
      role_name: p.granteeId,
      permission: p.permission,
      is_system: ['owner', 'admin', 'editor', 'viewer'].includes(p.granteeId)
    }));

  return {
    is_public,
    is_anonymous,
    role_permissions,
    raw: permissions
  };
}

/**
 * Fetch permissions from API
 */
async function fetchPermissionsFromAPI(
  resourceType: string,
  resourceId: string
): Promise<ParsedPermissions | null> {
  try {
    const response = await fetch(`/api/resources/${resourceType}/${resourceId}/permissions`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('Failed to fetch permissions:', response.status);
      return null;
    }

    const permissions = await response.json();
    if (permissions && Array.isArray(permissions)) {
      return parsePermissions(permissions);
    }
    return null;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return null;
  }
}

/**
 * Get permissions for a resource from cache or fetch
 * @param resourceType - Type of resource (page, component, application, function)
 * @param resourceId - ID of the resource
 * @param forceRefresh - Skip cache and fetch fresh data
 * @returns Parsed permissions or null
 */
export async function getResourcePermissions(
  resourceType: string,
  resourceId: string,
  forceRefresh = false
): Promise<ParsedPermissions | null> {
  if (!resourceId || !resourceType) return null;

  const cacheKey = getCacheKey(resourceType, resourceId);
  const cache = $permissionsCache.get();
  const now = Date.now();

  // Check cache first (unless force refresh)
  if (!forceRefresh && cache[cacheKey]) {
    const entry = cache[cacheKey];
    if (now - entry.timestamp < CACHE_DURATION) {
      return entry.data;
    }
  }

  // Check if there's already a pending request for this resource
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!;
  }

  // Mark as loading
  $permissionsLoading.setKey(cacheKey, true);

  // Create the fetch promise
  const fetchPromise = fetchPermissionsFromAPI(resourceType, resourceId)
    .then((data) => {
      if (data) {
        // Update cache
        $permissionsCache.setKey(cacheKey, {
          data,
          timestamp: Date.now()
        });
      }
      return data;
    })
    .finally(() => {
      // Clear pending request
      pendingRequests.delete(cacheKey);
      // Clear loading state
      $permissionsLoading.setKey(cacheKey, false);
    });

  // Store pending request
  pendingRequests.set(cacheKey, fetchPromise);

  return fetchPromise;
}

/**
 * Invalidate cache for a specific resource
 * Call this after modifying permissions
 */
export function invalidateResourcePermissions(resourceType: string, resourceId: string): void {
  const cacheKey = getCacheKey(resourceType, resourceId);
  const cache = $permissionsCache.get();

  if (cache[cacheKey]) {
    const { [cacheKey]: _, ...rest } = cache;
    $permissionsCache.set(rest);
  }
}

/**
 * Refresh permissions for a resource (invalidate + fetch)
 */
export async function refreshResourcePermissions(
  resourceType: string,
  resourceId: string
): Promise<ParsedPermissions | null> {
  invalidateResourcePermissions(resourceType, resourceId);
  return getResourcePermissions(resourceType, resourceId, true);
}

/**
 * Get cached permissions synchronously (for reactive subscriptions)
 * Returns null if not cached
 */
export function getCachedPermissions(
  resourceType: string,
  resourceId: string
): ParsedPermissions | null {
  if (!resourceId || !resourceType) return null;

  const cacheKey = getCacheKey(resourceType, resourceId);
  const cache = $permissionsCache.get();
  const entry = cache[cacheKey];

  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data;
  }

  return null;
}

/**
 * Subscribe to permissions for a resource
 * Returns an unsubscribe function
 */
export function subscribeToPermissions(
  resourceType: string,
  resourceId: string,
  callback: (permissions: ParsedPermissions | null) => void
): () => void {
  const cacheKey = getCacheKey(resourceType, resourceId);

  // Initial fetch if not cached
  const cached = getCachedPermissions(resourceType, resourceId);
  if (cached) {
    callback(cached);
  } else {
    getResourcePermissions(resourceType, resourceId).then(callback);
  }

  // Subscribe to changes
  return $permissionsCache.subscribe((cache) => {
    const entry = cache[cacheKey];
    if (entry) {
      callback(entry.data);
    }
  });
}

/**
 * Clear all cached permissions
 */
export function clearPermissionsCache(): void {
  $permissionsCache.set({});
}
