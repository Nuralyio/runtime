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
  pinnedWhiteboards: string[];
  applicationsViewMode: 'cards' | 'table';
  workflowsViewMode: 'cards' | 'table';
  whiteboardsViewMode: 'cards' | 'table';
  folderSectionVisible: boolean;
}

/**
 * Default preferences
 */
const DEFAULT_PREFERENCES: DashboardPreferences = {
  pinnedApplications: [],
  pinnedWorkflows: [],
  pinnedWhiteboards: [],
  applicationsViewMode: 'cards',
  workflowsViewMode: 'table',
  whiteboardsViewMode: 'cards',
  folderSectionVisible: true,
};

/**
 * KV key paths for preferences
 */
const PREFERENCE_KEYS = {
  pinnedApplications: 'pinned-applications',
  pinnedWorkflows: 'pinned-workflows',
  pinnedWhiteboards: 'pinned-whiteboards',
  applicationsViewMode: 'view-mode-applications',
  workflowsViewMode: 'view-mode-workflows',
  whiteboardsViewMode: 'view-mode-whiteboards',
  folderSectionVisible: 'folder-section-visible',
} as const;

// ============================================
// localStorage cache
// ============================================

const LOCAL_STORAGE_KEY = 'nuraly_user_preferences_cache';

/**
 * Save preferences snapshot to localStorage for instant hydration on next page load.
 */
function saveToLocalStorage(prefs: DashboardPreferences): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // quota exceeded or private browsing — ignore
  }
}

/**
 * Load cached preferences from localStorage (synchronous, instant).
 * Returns null if nothing cached.
 */
export function loadFromLocalStorage(): DashboardPreferences | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DashboardPreferences;
  } catch {
    return null;
  }
}

// ============================================
// In-memory cache
// ============================================

/**
 * In-memory cache for preferences
 */
let preferencesCache: Partial<DashboardPreferences> = {};
let cacheInitialized = false;

/**
 * Load all user preferences from KV into cache
 */
export async function loadAllPreferences(): Promise<DashboardPreferences> {
  const [pinnedApps, pinnedWorkflows, pinnedWhiteboards, appsViewMode, workflowsViewMode, whiteboardsViewMode, folderVisible] = await Promise.all([
    getUserPreference<string[]>(PREFERENCE_KEYS.pinnedApplications),
    getUserPreference<string[]>(PREFERENCE_KEYS.pinnedWorkflows),
    getUserPreference<string[]>(PREFERENCE_KEYS.pinnedWhiteboards),
    getUserPreference<'cards' | 'table'>(PREFERENCE_KEYS.applicationsViewMode),
    getUserPreference<'cards' | 'table'>(PREFERENCE_KEYS.workflowsViewMode),
    getUserPreference<'cards' | 'table'>(PREFERENCE_KEYS.whiteboardsViewMode),
    getUserPreference<boolean>(PREFERENCE_KEYS.folderSectionVisible),
  ]);

  preferencesCache = {
    pinnedApplications: pinnedApps ?? DEFAULT_PREFERENCES.pinnedApplications,
    pinnedWorkflows: pinnedWorkflows ?? DEFAULT_PREFERENCES.pinnedWorkflows,
    pinnedWhiteboards: pinnedWhiteboards ?? DEFAULT_PREFERENCES.pinnedWhiteboards,
    applicationsViewMode: appsViewMode ?? DEFAULT_PREFERENCES.applicationsViewMode,
    workflowsViewMode: workflowsViewMode ?? DEFAULT_PREFERENCES.workflowsViewMode,
    whiteboardsViewMode: whiteboardsViewMode ?? DEFAULT_PREFERENCES.whiteboardsViewMode,
    folderSectionVisible: folderVisible ?? DEFAULT_PREFERENCES.folderSectionVisible,
  };
  cacheInitialized = true;

  // Persist to localStorage so the next page load is instant
  saveToLocalStorage(preferencesCache as DashboardPreferences);

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
  // Update caches immediately (optimistic)
  preferencesCache[key] = value;
  if (cacheInitialized) {
    saveToLocalStorage(preferencesCache as DashboardPreferences);
  }

  const success = await setUserPreference(PREFERENCE_KEYS[key], value);

  if (!success) {
    // KV write failed — caches already have the value the store will revert,
    // so no extra rollback needed here; the store handles rollback.
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
// Pinned Whiteboards Functions
// ============================================

/**
 * Get pinned whiteboard IDs as a Set
 */
export async function getPinnedWhiteboardIds(): Promise<Set<string>> {
  const pinned = await getPreference('pinnedWhiteboards');
  return new Set(pinned);
}

/**
 * Toggle pinned status for a whiteboard
 * @returns The new pinned status (true if now pinned, false if unpinned)
 */
export async function toggleWhiteboardPinned(whiteboardId: string): Promise<boolean> {
  const pinned = await getPreference('pinnedWhiteboards');
  const pinnedSet = new Set(pinned);
  const wasPinned = pinnedSet.has(whiteboardId);

  if (wasPinned) {
    pinnedSet.delete(whiteboardId);
  } else {
    pinnedSet.add(whiteboardId);
  }

  await setPreference('pinnedWhiteboards', [...pinnedSet]);
  return !wasPinned;
}

/**
 * Clean up pinned whiteboard IDs by removing deleted whiteboards
 */
export async function cleanupPinnedWhiteboards(validWhiteboardIds: Set<string>): Promise<void> {
  const pinned = await getPreference('pinnedWhiteboards');
  const filtered = pinned.filter(id => validWhiteboardIds.has(id));

  if (filtered.length !== pinned.length) {
    await setPreference('pinnedWhiteboards', filtered);
  }
}

// ============================================
// View Mode Functions
// ============================================

/**
 * Get view mode for a section
 */
export async function getViewMode(
  section: 'applications' | 'workflows' | 'whiteboards'
): Promise<'cards' | 'table'> {
  if (section === 'applications') {
    return getPreference('applicationsViewMode');
  }
  if (section === 'whiteboards') {
    return getPreference('whiteboardsViewMode');
  }
  return getPreference('workflowsViewMode');
}

/**
 * Set view mode for a section
 */
export async function setViewMode(
  section: 'applications' | 'workflows' | 'whiteboards',
  mode: 'cards' | 'table'
): Promise<void> {
  if (section === 'applications') {
    await setPreference('applicationsViewMode', mode);
  } else if (section === 'whiteboards') {
    await setPreference('whiteboardsViewMode', mode);
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
