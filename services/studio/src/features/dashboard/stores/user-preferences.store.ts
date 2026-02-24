/**
 * User Preferences Store
 * Reactive nanostores for user preferences with KV persistence
 */

import { atom } from 'nanostores';
import {
  loadAllPreferences,
  loadFromLocalStorage,
  setPreference,
  migrateFromLocalStorage,
  cleanupPinnedApplications as cleanupApps,
  cleanupPinnedWorkflows as cleanupWorkflows,
  cleanupPinnedWhiteboards as cleanupWhiteboardsPref,
} from '../services/user-preferences.service';

// ============================================
// Atoms
// ============================================

/**
 * Set of pinned application IDs
 */
export const $pinnedApplications = atom<Set<string>>(new Set());

/**
 * Set of pinned workflow IDs
 */
export const $pinnedWorkflows = atom<Set<string>>(new Set());

/**
 * Set of pinned whiteboard IDs
 */
export const $pinnedWhiteboards = atom<Set<string>>(new Set());

/**
 * View mode for applications section
 */
export const $applicationsViewMode = atom<'cards' | 'table'>('cards');

/**
 * View mode for workflows section
 */
export const $workflowsViewMode = atom<'cards' | 'table'>('table');

/**
 * View mode for whiteboards section
 */
export const $whiteboardsViewMode = atom<'cards' | 'table'>('cards');

/**
 * Whether the folder section is visible
 */
export const $folderSectionVisible = atom<boolean>(true);

/**
 * Loading state for preferences
 */
export const $preferencesLoading = atom<boolean>(true);

/**
 * Error state for preferences
 */
export const $preferencesError = atom<string | null>(null);

// ============================================
// Initialization
// ============================================

let initialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Apply a preferences object to all stores
 */
function applyPreferences(prefs: {
  pinnedApplications: string[];
  pinnedWorkflows: string[];
  pinnedWhiteboards: string[];
  applicationsViewMode: 'cards' | 'table';
  workflowsViewMode: 'cards' | 'table';
  whiteboardsViewMode: 'cards' | 'table';
  folderSectionVisible: boolean;
}): void {
  $pinnedApplications.set(new Set(prefs.pinnedApplications));
  $pinnedWorkflows.set(new Set(prefs.pinnedWorkflows));
  $pinnedWhiteboards.set(new Set(prefs.pinnedWhiteboards));
  $applicationsViewMode.set(prefs.applicationsViewMode);
  $workflowsViewMode.set(prefs.workflowsViewMode);
  $whiteboardsViewMode.set(prefs.whiteboardsViewMode);
  $folderSectionVisible.set(prefs.folderSectionVisible);
}

/**
 * Initialize user preferences.
 * 1. Instantly hydrates from localStorage (no loading flash).
 * 2. Revalidates from KV in the background and updates stores + localStorage.
 * Safe to call multiple times — will only initialize once.
 */
export async function initUserPreferences(): Promise<void> {
  if (initialized) return;

  // Return existing promise if initialization is in progress
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      $preferencesError.set(null);

      // Step 1: Instant hydration from localStorage cache
      const cached = loadFromLocalStorage();
      if (cached) {
        applyPreferences(cached);
        $preferencesLoading.set(false);
      } else {
        $preferencesLoading.set(true);
      }

      // Step 2: One-time migration (no-op if already done)
      await migrateFromLocalStorage();

      // Step 3: Revalidate from KV (also persists to localStorage)
      const prefs = await loadAllPreferences();
      applyPreferences(prefs);

      initialized = true;
    } catch (error) {
      console.error('Failed to initialize user preferences:', error);
      $preferencesError.set('Failed to load preferences');
    } finally {
      $preferencesLoading.set(false);
    }
  })();

  return initPromise;
}

/**
 * Force reload preferences from KV
 */
export async function reloadUserPreferences(): Promise<void> {
  initialized = false;
  initPromise = null;
  await initUserPreferences();
}

// ============================================
// Pinned Applications Actions
// ============================================

/**
 * Toggle pinned status for an application
 * Updates both the store and KV
 * @returns The new pinned status
 */
export async function togglePinnedApplication(appId: string): Promise<boolean> {
  const current = $pinnedApplications.get();
  const newSet = new Set(current);
  const wasPinned = newSet.has(appId);

  if (wasPinned) {
    newSet.delete(appId);
  } else {
    newSet.add(appId);
  }

  // Update store immediately for responsive UI
  $pinnedApplications.set(newSet);

  // Persist to KV
  const success = await setPreference('pinnedApplications', [...newSet]);

  if (!success) {
    // Revert on failure
    $pinnedApplications.set(current);
    console.error('Failed to persist pinned application change');
    return wasPinned;
  }

  return !wasPinned;
}

/**
 * Clean up pinned applications by removing deleted ones
 */
export async function cleanupPinnedApplications(validAppIds: Set<string>): Promise<void> {
  const current = $pinnedApplications.get();
  const filtered = new Set([...current].filter(id => validAppIds.has(id)));

  if (filtered.size !== current.size) {
    $pinnedApplications.set(filtered);
    await cleanupApps(validAppIds);
  }
}

// ============================================
// Pinned Workflows Actions
// ============================================

/**
 * Toggle pinned status for a workflow
 * Updates both the store and KV
 * @returns The new pinned status
 */
export async function togglePinnedWorkflow(workflowId: string): Promise<boolean> {
  const current = $pinnedWorkflows.get();
  const newSet = new Set(current);
  const wasPinned = newSet.has(workflowId);

  if (wasPinned) {
    newSet.delete(workflowId);
  } else {
    newSet.add(workflowId);
  }

  // Update store immediately for responsive UI
  $pinnedWorkflows.set(newSet);

  // Persist to KV
  const success = await setPreference('pinnedWorkflows', [...newSet]);

  if (!success) {
    // Revert on failure
    $pinnedWorkflows.set(current);
    console.error('Failed to persist pinned workflow change');
    return wasPinned;
  }

  return !wasPinned;
}

/**
 * Clean up pinned workflows by removing deleted ones
 */
export async function cleanupPinnedWorkflows(validWorkflowIds: Set<string>): Promise<void> {
  const current = $pinnedWorkflows.get();
  const filtered = new Set([...current].filter(id => validWorkflowIds.has(id)));

  if (filtered.size !== current.size) {
    $pinnedWorkflows.set(filtered);
    await cleanupWorkflows(validWorkflowIds);
  }
}

// ============================================
// Pinned Whiteboards Actions
// ============================================

/**
 * Toggle pinned status for a whiteboard
 * Updates both the store and KV
 * @returns The new pinned status
 */
export async function togglePinnedWhiteboard(whiteboardId: string): Promise<boolean> {
  const current = $pinnedWhiteboards.get();
  const newSet = new Set(current);
  const wasPinned = newSet.has(whiteboardId);

  if (wasPinned) {
    newSet.delete(whiteboardId);
  } else {
    newSet.add(whiteboardId);
  }

  // Update store immediately for responsive UI
  $pinnedWhiteboards.set(newSet);

  // Persist to KV
  const success = await setPreference('pinnedWhiteboards', [...newSet]);

  if (!success) {
    // Revert on failure
    $pinnedWhiteboards.set(current);
    console.error('Failed to persist pinned whiteboard change');
    return wasPinned;
  }

  return !wasPinned;
}

/**
 * Clean up pinned whiteboards by removing deleted ones
 */
export async function cleanupPinnedWhiteboards(validWhiteboardIds: Set<string>): Promise<void> {
  const current = $pinnedWhiteboards.get();
  const filtered = new Set([...current].filter(id => validWhiteboardIds.has(id)));

  if (filtered.size !== current.size) {
    $pinnedWhiteboards.set(filtered);
    await cleanupWhiteboardsPref(validWhiteboardIds);
  }
}

// ============================================
// View Mode Actions
// ============================================

/**
 * Set view mode for applications section
 */
export async function setApplicationsViewMode(mode: 'cards' | 'table'): Promise<void> {
  const current = $applicationsViewMode.get();
  if (current === mode) return;

  // Update store immediately
  $applicationsViewMode.set(mode);

  // Persist to KV
  const success = await setPreference('applicationsViewMode', mode);

  if (!success) {
    // Revert on failure
    $applicationsViewMode.set(current);
    console.error('Failed to persist applications view mode');
  }
}

/**
 * Set view mode for workflows section
 */
export async function setWorkflowsViewMode(mode: 'cards' | 'table'): Promise<void> {
  const current = $workflowsViewMode.get();
  if (current === mode) return;

  // Update store immediately
  $workflowsViewMode.set(mode);

  // Persist to KV
  const success = await setPreference('workflowsViewMode', mode);

  if (!success) {
    // Revert on failure
    $workflowsViewMode.set(current);
    console.error('Failed to persist workflows view mode');
  }
}

/**
 * Set view mode for whiteboards section
 */
export async function setWhiteboardsViewMode(mode: 'cards' | 'table'): Promise<void> {
  const current = $whiteboardsViewMode.get();
  if (current === mode) return;

  // Update store immediately
  $whiteboardsViewMode.set(mode);

  // Persist to KV
  const success = await setPreference('whiteboardsViewMode', mode);

  if (!success) {
    // Revert on failure
    $whiteboardsViewMode.set(current);
    console.error('Failed to persist whiteboards view mode');
  }
}

// ============================================
// Folder Section Visibility
// ============================================

/**
 * Toggle folder section visibility
 */
export async function toggleFolderSectionVisible(): Promise<void> {
  const current = $folderSectionVisible.get();
  const next = !current;

  $folderSectionVisible.set(next);

  const success = await setPreference('folderSectionVisible', next);

  if (!success) {
    $folderSectionVisible.set(current);
    console.error('Failed to persist folder section visibility');
  }
}
