/**
 * Dashboard Tabs Store
 * Manages tab state for the dashboard multi-tab interface
 */

import { atom, computed } from 'nanostores';

/**
 * Tab types supported in the dashboard
 */
export type DashboardTabType = 'overview' | 'workflow' | 'database' | 'app' | 'kv';

/**
 * Sub-tab types for app view
 */
export type AppSubTab = 'pages' | 'workflows' | 'database' | 'kv';

/**
 * Dashboard tab interface
 */
export interface DashboardTab {
  id: string;
  type: DashboardTabType;
  resourceId?: string;      // workflowId, databaseId, or appId
  appId?: string | null;    // resolved from API for workflow/database, null for standalone
  label: string;
  appName?: string | null;  // null for standalone workflows
  subTab?: AppSubTab;       // only for app type
  filters?: Record<string, string>;  // for KV tab filters
}

/**
 * Dashboard tabs state
 */
export interface DashboardTabsState {
  tabs: DashboardTab[];
  activeTabId: string;
}

/**
 * Storage key for persisting tabs
 */
const STORAGE_KEY = 'nuraly-dashboard-tabs';

/**
 * Default overview tab
 */
const DEFAULT_OVERVIEW_TAB: DashboardTab = {
  id: 'overview',
  type: 'overview',
  label: 'Overview'
};

/**
 * Load tabs from localStorage
 */
function loadFromStorage(): DashboardTabsState {
  if (typeof window === 'undefined') {
    return { tabs: [DEFAULT_OVERVIEW_TAB], activeTabId: 'overview' };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const state = JSON.parse(stored) as DashboardTabsState;
      // Ensure overview tab always exists
      const hasOverview = state.tabs.some(t => t.type === 'overview');
      if (!hasOverview) {
        state.tabs.unshift(DEFAULT_OVERVIEW_TAB);
      }
      return state;
    }
  } catch (e) {
    console.error('[dashboard-tabs] Failed to load from storage:', e);
  }

  return { tabs: [DEFAULT_OVERVIEW_TAB], activeTabId: 'overview' };
}

/**
 * Save tabs to localStorage
 */
function saveToStorage(state: DashboardTabsState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('[dashboard-tabs] Failed to save to storage:', e);
  }
}

/**
 * Generate a unique tab ID
 */
export function generateTabId(type: DashboardTabType, resourceId?: string): string {
  switch (type) {
    case 'overview':
      return 'overview';
    case 'app':
      return `app-${resourceId}`;
    case 'workflow':
      return `wf-${resourceId}`;
    case 'database':
      return `db-${resourceId}`;
    case 'kv':
      return 'kv';
    default:
      return `${type}-${resourceId || Date.now()}`;
  }
}

/**
 * Main dashboard tabs store
 */
export const $dashboardTabs = atom<DashboardTabsState>(loadFromStorage());

/**
 * Computed store for the active tab
 */
export const $activeTab = computed($dashboardTabs, (state) => {
  return state.tabs.find(t => t.id === state.activeTabId) || state.tabs[0];
});

/**
 * Subscribe to changes and persist
 */
if (typeof window !== 'undefined') {
  $dashboardTabs.subscribe((state) => {
    saveToStorage(state);
  });
}

/**
 * Open a new tab or activate existing one
 */
export function openTab(tab: Omit<DashboardTab, 'id'>): DashboardTab {
  const state = $dashboardTabs.get();
  const id = generateTabId(tab.type, tab.resourceId);

  // Check if tab already exists
  const existingTab = state.tabs.find(t => t.id === id);
  if (existingTab) {
    // Just activate it
    $dashboardTabs.set({
      ...state,
      activeTabId: id
    });
    return existingTab;
  }

  // Create new tab
  const newTab: DashboardTab = { ...tab, id };

  $dashboardTabs.set({
    tabs: [...state.tabs, newTab],
    activeTabId: id
  });

  return newTab;
}

/**
 * Close a tab
 */
export function closeTab(tabId: string): void {
  const state = $dashboardTabs.get();

  // Don't close the overview tab
  if (tabId === 'overview') return;

  const tabIndex = state.tabs.findIndex(t => t.id === tabId);
  if (tabIndex === -1) return;

  const newTabs = state.tabs.filter(t => t.id !== tabId);

  // If closing active tab, activate the previous one or overview
  let newActiveTabId = state.activeTabId;
  if (state.activeTabId === tabId) {
    const newActiveIndex = Math.max(0, tabIndex - 1);
    newActiveTabId = newTabs[newActiveIndex]?.id || 'overview';
  }

  $dashboardTabs.set({
    tabs: newTabs,
    activeTabId: newActiveTabId
  });
}

/**
 * Switch to a tab
 */
export function switchTab(tabId: string): void {
  const state = $dashboardTabs.get();
  const tab = state.tabs.find(t => t.id === tabId);

  if (!tab) return;

  $dashboardTabs.set({
    ...state,
    activeTabId: tabId
  });
}

/**
 * Update a tab's sub-tab (for app view)
 */
export function updateTabSubTab(tabId: string, subTab: AppSubTab): void {
  const state = $dashboardTabs.get();

  $dashboardTabs.set({
    ...state,
    tabs: state.tabs.map(t =>
      t.id === tabId ? { ...t, subTab } : t
    )
  });
}

/**
 * Update a tab's data (e.g., after fetching app info)
 */
export function updateTab(tabId: string, updates: Partial<DashboardTab>): void {
  const state = $dashboardTabs.get();

  $dashboardTabs.set({
    ...state,
    tabs: state.tabs.map(t =>
      t.id === tabId ? { ...t, ...updates } : t
    )
  });
}

/**
 * Find tab by resource
 */
export function findTabByResource(type: DashboardTabType, resourceId?: string): DashboardTab | undefined {
  const state = $dashboardTabs.get();
  const id = generateTabId(type, resourceId);
  return state.tabs.find(t => t.id === id);
}

/**
 * Get tab by ID
 */
export function getTab(tabId: string): DashboardTab | undefined {
  const state = $dashboardTabs.get();
  return state.tabs.find(t => t.id === tabId);
}

/**
 * Reset to default state (overview only)
 */
export function resetTabs(): void {
  $dashboardTabs.set({
    tabs: [DEFAULT_OVERVIEW_TAB],
    activeTabId: 'overview'
  });
}
