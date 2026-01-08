import { map } from "nanostores";
import { setVar } from "./context";

const isServer = typeof window === "undefined";

/**
 * Member interface
 */
export interface AppMember {
  id: number;
  userId: string;
  applicationId: string;
  user?: {
    name: string;
    email: string;
  };
  role: {
    id: number;
    name: string;
    displayName: string;
    hierarchy: number;
  };
  createdAt: string;
}

/**
 * Role interface
 */
export interface AppRole {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  permissions: string[];
  hierarchy: number;
  isSystem: boolean;
}

/**
 * Pending invite interface
 */
export interface PendingInvite {
  id: number;
  email: string;
  applicationId: string;
  role: {
    id: number;
    name: string;
    displayName: string;
    hierarchy: number;
  };
  expiresAt: string;
  createdAt: string;
}

/**
 * App members data structure
 */
export interface AppMembersData {
  members: AppMember[];
  roles: AppRole[];
  pendingInvites: PendingInvite[];
  loading: boolean;
  timestamp: number;
}

/**
 * Cache duration in milliseconds (5 minutes)
 */
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Store for app members data cache
 * Key: applicationId
 */
export const $appMembersCache = map<Record<string, AppMembersData>>({});

// Sync roles to context for handler access via GetVar("_appRoles")
if (!isServer) {
  $appMembersCache.subscribe((cache) => {
    // Find the first app with roles and expose them
    for (const appId in cache) {
      const data = cache[appId];
      if (data?.roles?.length > 0) {
        setVar("global", "_appRoles", data.roles);
        break;
      }
    }
  });
}

/**
 * Track in-flight requests to prevent duplicate fetches
 */
const pendingRequests = new Map<string, Promise<AppMembersData | null>>();

/**
 * Fetch app members data from API
 */
async function fetchAppMembersFromAPI(appId: string): Promise<AppMembersData | null> {
  try {
    const [membersRes, pendingRes, rolesRes] = await Promise.all([
      fetch(`/api/applications/${appId}/members`, { credentials: 'include' }),
      fetch(`/api/applications/${appId}/pending-invites`, { credentials: 'include' }),
      fetch(`/api/applications/${appId}/roles`, { credentials: 'include' }),
    ]);

    const members = membersRes.ok ? await membersRes.json() : [];
    const pendingInvites = pendingRes.ok ? await pendingRes.json() : [];
    const roles = rolesRes.ok ? await rolesRes.json() : [];

    return {
      members,
      roles,
      pendingInvites,
      loading: false,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Failed to fetch app members data:', error);
    return null;
  }
}

/**
 * Get app members data from cache or fetch
 * @param appId - Application ID
 * @param forceRefresh - Skip cache and fetch fresh data
 */
export async function getAppMembersData(
  appId: string,
  forceRefresh = false
): Promise<AppMembersData | null> {
  if (!appId) return null;

  const cache = $appMembersCache.get();
  const now = Date.now();

  // Check cache first (unless force refresh)
  if (!forceRefresh && cache[appId]) {
    const entry = cache[appId];
    if (now - entry.timestamp < CACHE_DURATION) {
      return entry;
    }
  }

  // Check if there's already a pending request for this app
  if (pendingRequests.has(appId)) {
    return pendingRequests.get(appId)!;
  }

  // Mark as loading in cache (preserve existing data if any)
  const existingData = cache[appId] || { members: [], roles: [], pendingInvites: [] };
  $appMembersCache.setKey(appId, {
    ...existingData,
    loading: true,
    timestamp: now
  });

  // Create the fetch promise
  const fetchPromise = fetchAppMembersFromAPI(appId)
    .then((data) => {
      if (data) {
        $appMembersCache.setKey(appId, data);
      } else {
        // On error, clear loading state but keep empty data
        $appMembersCache.setKey(appId, {
          members: [],
          roles: [],
          pendingInvites: [],
          loading: false,
          timestamp: Date.now()
        });
      }
      return data;
    })
    .finally(() => {
      pendingRequests.delete(appId);
    });

  pendingRequests.set(appId, fetchPromise);

  return fetchPromise;
}

/**
 * Invalidate cache for a specific app
 */
export function invalidateAppMembersCache(appId: string): void {
  const cache = $appMembersCache.get();
  if (cache[appId]) {
    const { [appId]: _, ...rest } = cache;
    $appMembersCache.set(rest);
  }
}

/**
 * Refresh app members data (invalidate + fetch)
 */
export async function refreshAppMembersData(appId: string): Promise<AppMembersData | null> {
  invalidateAppMembersCache(appId);
  return getAppMembersData(appId, true);
}

/**
 * Get cached data synchronously
 */
export function getCachedAppMembersData(appId: string): AppMembersData | null {
  if (!appId) return null;

  const cache = $appMembersCache.get();
  const entry = cache[appId];

  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry;
  }

  return null;
}

/**
 * Update members in cache (after adding/removing)
 */
export function updateCachedMembers(appId: string, members: AppMember[]): void {
  const cache = $appMembersCache.get();
  const entry = cache[appId];
  if (entry) {
    $appMembersCache.setKey(appId, {
      ...entry,
      members,
      timestamp: Date.now()
    });
  }
}

/**
 * Update pending invites in cache
 */
export function updateCachedPendingInvites(appId: string, pendingInvites: PendingInvite[]): void {
  const cache = $appMembersCache.get();
  const entry = cache[appId];
  if (entry) {
    $appMembersCache.setKey(appId, {
      ...entry,
      pendingInvites,
      timestamp: Date.now()
    });
  }
}

/**
 * Update roles in cache
 */
export function updateCachedRoles(appId: string, roles: AppRole[]): void {
  const cache = $appMembersCache.get();
  const entry = cache[appId];
  if (entry) {
    $appMembersCache.setKey(appId, {
      ...entry,
      roles,
      timestamp: Date.now()
    });
  }
}
