/**
 * User Preferences Service
 * Manages user preferences stored in KV storage
 * Provides caching and convenience functions for dashboard preferences
 */

import { getUserPreference, setUserPreference } from '../../../services/kv/kv.service';

/**
 * Dashboard user preferences interface
 */
export interface DashboardPreferences {
  pinnedApplications: string[];
  pinnedWorkflows: string[];
  applicationsViewMode: 'cards' | 'table';
  workflowsViewMode: 'cards' | 'table';
}

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES: DashboardPreferences = {
  pinnedApplications: [],
  pinnedWorkflows: [],
  applicationsViewMode: 'cards',
  workflowsViewMode: 'table',
};

/**
 * KV key paths for preferences
 */
const PREFERENCE_KEYS = {
  pinnedApplications: 'pinned-applications',
  pinnedWorkflows: 'pinned-workflows',
  applicationsViewMode: 'view-mode-applications',
  workflowsViewMode: 'view-mode-workflows',
} as const;

/**
 * In-memory cache for preferences
 */
let preferencesCache: Partial<DashboardPreferences> = {};
let cacheInitialized = false;

/**
 * Load all user preferences from KV into cache
 */
export async function loadAllPreferences(): Promise<DashboardPreferences> {
  const [pinnedApps, pinnedWorkflows, appsViewMode, workflowsViewMode] = await Promise.all([
    getUserPreference<string[]>(PREFERENCE_KEYS.pinnedApplications),
    getUserPreference<string[]>(PREFERENCE_KEYS.pinnedWorkflows),
    getUserPreference<'cards' | 'table'>(PREFERENCE_KEYS.applicationsViewMode),
    getUserPreference<'cards' | 'table'>(PREFERENCE_KEYS.workflowsViewMode),
  ]);

  preferencesCache = {
    pinnedApplications: pinnedApps ?? DEFAULT_PREFERENCES.pinnedApplications,
    pinnedWorkflows: pinnedWorkflows ?? DEFAULT_PREFERENCES.pinnedWorkflows,
    applicationsViewMode: appsViewMode ?? DEFAULT_PREFERENCES.applicationsViewMode,
    workflowsViewMode: workflowsViewMode ?? DEFAULT_PREFERENCES.workflowsViewMode,
  };
  cacheInitialized = true;

  return preferencesCache as DashboardPreferences;
}

/**
 * Get a specific preference value
 */
export async function getPreference<K extends keyof DashboardPreferences>(
  key: K
): Promise<DashboardPreferences[K]> {
  // Return from cache if available
  if (cacheInitialized && preferencesCache[key] !== undefined) {
    return preferencesCache[key] as DashboardPreferences[K];
  }

  // Fetch from KV
  const value = await getUserPreference<DashboardPreferences[K]>(PREFERENCE_KEYS[key]);
  const result = value ?? DEFAULT_PREFERENCES[key];

  // Update cache
  preferencesCache[key] = result;

  return result;
}

/**
 * Set a specific preference value
 */
export async function setPreference<K extends keyof DashboardPreferences>(
  key: K,
  value: DashboardPreferences[K]
): Promise<boolean> {
  const success = await setUserPreference(PREFERENCE_KEYS[key], value);

  if (success) {
    // Update cache
    preferencesCache[key] = value;
  }

  return success;
}

/**
 * Clear preferences cache (force reload from KV)
 */
export function clearPreferencesCache(): void {
  preferencesCache = {};
  cacheInitialized = false;
}

// ============================================
// Pinned Applications Functions
// ============================================

/**
 * Get pinned application IDs as a Set
 */
export async function getPinnedApplicationIds(): Promise<Set<string>> {
  const pinned = await getPreference('pinnedApplications');
  return new Set(pinned);
}

/**
 * Toggle pinned status for an application
 * @returns The new pinned status (true if now pinned, false if unpinned)
 */
export async function toggleApplicationPinned(appId: string): Promise<boolean> {
  const pinned = await getPreference('pinnedApplications');
  const pinnedSet = new Set(pinned);
  const wasPinned = pinnedSet.has(appId);

  if (wasPinned) {
    pinnedSet.delete(appId);
  } else {
    pinnedSet.add(appId);
  }

  await setPreference('pinnedApplications', [...pinnedSet]);
  return !wasPinned;
}

/**
 * Clean up pinned application IDs by removing deleted applications
 */
export async function cleanupPinnedApplications(validAppIds: Set<string>): Promise<void> {
  const pinned = await getPreference('pinnedApplications');
  const filtered = pinned.filter(id => validAppIds.has(id));

  if (filtered.length !== pinned.length) {
    await setPreference('pinnedApplications', filtered);
  }
}

// ============================================
// Pinned Workflows Functions
// ============================================

/**
 * Get pinned workflow IDs as a Set
 */
export async function getPinnedWorkflowIds(): Promise<Set<string>> {
  const pinned = await getPreference('pinnedWorkflows');
  return new Set(pinned);
}

/**
 * Toggle pinned status for a workflow
 * @returns The new pinned status (true if now pinned, false if unpinned)
 */
export async function toggleWorkflowPinned(workflowId: string): Promise<boolean> {
  const pinned = await getPreference('pinnedWorkflows');
  const pinnedSet = new Set(pinned);
  const wasPinned = pinnedSet.has(workflowId);

  if (wasPinned) {
    pinnedSet.delete(workflowId);
  } else {
    pinnedSet.add(workflowId);
  }

  await setPreference('pinnedWorkflows', [...pinnedSet]);
  return !wasPinned;
}

/**
 * Clean up pinned workflow IDs by removing deleted workflows
 */
export async function cleanupPinnedWorkflows(validWorkflowIds: Set<string>): Promise<void> {
  const pinned = await getPreference('pinnedWorkflows');
  const filtered = pinned.filter(id => validWorkflowIds.has(id));

  if (filtered.length !== pinned.length) {
    await setPreference('pinnedWorkflows', filtered);
  }
}

// ============================================
// View Mode Functions
// ============================================

/**
 * Get view mode for a section
 */
export async function getViewMode(
  section: 'applications' | 'workflows'
): Promise<'cards' | 'table'> {
  if (section === 'applications') {
    return getPreference('applicationsViewMode');
  }
  return getPreference('workflowsViewMode');
}

/**
 * Set view mode for a section
 */
export async function setViewMode(
  section: 'applications' | 'workflows',
  mode: 'cards' | 'table'
): Promise<void> {
  if (section === 'applications') {
    await setPreference('applicationsViewMode', mode);
  } else {
    await setPreference('workflowsViewMode', mode);
  }
}

// ============================================
// Migration from localStorage
// ============================================

const MIGRATION_KEY = 'nuraly_preferences_migrated_to_kv';

/**
 * Migrate preferences from localStorage to KV (one-time)
 */
export async function migrateFromLocalStorage(): Promise<void> {
  // Check if already migrated
  if (localStorage.getItem(MIGRATION_KEY)) {
    return;
  }

  try {
    // Migrate pinned applications
    const pinnedAppsStr = localStorage.getItem('nuraly_pinned_applications');
    if (pinnedAppsStr) {
      const pinnedApps = JSON.parse(pinnedAppsStr);
      if (Array.isArray(pinnedApps) && pinnedApps.length > 0) {
        await setPreference('pinnedApplications', pinnedApps);
      }
      localStorage.removeItem('nuraly_pinned_applications');
    }

    // Migrate pinned workflows
    const pinnedWorkflowsStr = localStorage.getItem('nuraly_pinned_workflows');
    if (pinnedWorkflowsStr) {
      const pinnedWorkflows = JSON.parse(pinnedWorkflowsStr);
      if (Array.isArray(pinnedWorkflows) && pinnedWorkflows.length > 0) {
        await setPreference('pinnedWorkflows', pinnedWorkflows);
      }
      localStorage.removeItem('nuraly_pinned_workflows');
    }

    // Mark migration as complete
    localStorage.setItem(MIGRATION_KEY, 'true');
    console.log('User preferences migrated from localStorage to KV');
  } catch (error) {
    console.error('Failed to migrate preferences from localStorage:', error);
  }
}
