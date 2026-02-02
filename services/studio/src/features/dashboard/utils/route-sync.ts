/**
 * Dashboard Route Sync Utilities
 * Handles URL <-> Tab state synchronization
 */

import {
  type DashboardTab,
  type DashboardTabType,
  type AppSubTab,
  $dashboardTabs,
  openTab,
  switchTab,
  updateTabSubTab,
  generateTabId
} from '../stores/dashboard-tabs.store';

/**
 * Parsed route information
 */
export interface ParsedRoute {
  type: DashboardTabType;
  resourceId?: string;
  subTab?: AppSubTab;
  filters?: Record<string, string>;
}

/**
 * Parse dashboard URL pathname and search params
 */
export function parseRoute(pathname: string, search: string = ''): ParsedRoute {
  // Remove trailing slash
  const path = pathname.replace(/\/$/, '');
  const searchParams = new URLSearchParams(search);

  // /dashboard or /dashboard/
  if (path === '/dashboard' || path === '') {
    return { type: 'overview' };
  }

  // /dashboard/app/{appId} or /dashboard/app/{appId}/{subTab}
  const appMatch = path.match(/^\/dashboard\/app\/([^/]+)(?:\/(.+))?$/);
  if (appMatch) {
    const [, appId, subTabPath] = appMatch;
    const subTab = (subTabPath as AppSubTab) || 'pages';
    return {
      type: 'app',
      resourceId: appId,
      subTab: ['pages', 'workflows', 'database', 'kv'].includes(subTab) ? subTab : 'pages'
    };
  }

  // /dashboard/workflow/{wfId}
  const workflowMatch = path.match(/^\/dashboard\/workflow\/([^/]+)$/);
  if (workflowMatch) {
    return {
      type: 'workflow',
      resourceId: workflowMatch[1]
    };
  }

  // /dashboard/database/{dbId}
  const databaseMatch = path.match(/^\/dashboard\/database\/([^/]+)$/);
  if (databaseMatch) {
    return {
      type: 'database',
      resourceId: databaseMatch[1]
    };
  }

  // /dashboard/kv
  if (path === '/dashboard/kv') {
    const filters: Record<string, string> = {};
    if (searchParams.has('app')) filters.app = searchParams.get('app')!;
    if (searchParams.has('workflow')) filters.workflow = searchParams.get('workflow')!;
    if (searchParams.has('key')) filters.key = searchParams.get('key')!;
    return {
      type: 'kv',
      filters: Object.keys(filters).length > 0 ? filters : undefined
    };
  }

  // Default to overview
  return { type: 'overview' };
}

/**
 * Convert a tab to its URL path
 */
export function tabToRoute(tab: DashboardTab): string {
  switch (tab.type) {
    case 'overview':
      return '/dashboard';

    case 'app':
      if (tab.subTab && tab.subTab !== 'pages') {
        return `/dashboard/app/${tab.resourceId}/${tab.subTab}`;
      }
      return `/dashboard/app/${tab.resourceId}`;

    case 'workflow':
      return `/dashboard/workflow/${tab.resourceId}`;

    case 'database':
      return `/dashboard/database/${tab.resourceId}`;

    case 'kv':
      if (tab.filters && Object.keys(tab.filters).length > 0) {
        const params = new URLSearchParams(tab.filters);
        return `/dashboard/kv?${params.toString()}`;
      }
      return '/dashboard/kv';

    default:
      return '/dashboard';
  }
}

/**
 * Navigate to a tab's route (updates URL without page reload)
 */
export function navigateToTab(tab: DashboardTab): void {
  if (typeof window === 'undefined') return;

  const newPath = tabToRoute(tab);
  const currentPath = window.location.pathname + window.location.search;

  if (newPath !== currentPath) {
    window.history.pushState({ tabId: tab.id }, '', newPath);
  }
}

/**
 * Sync state from URL - called on initial load or popstate
 * Returns the tab that should be active (may need data fetching)
 */
export function syncFromURL(pathname: string, search: string = ''): ParsedRoute {
  const parsed = parseRoute(pathname, search);
  const state = $dashboardTabs.get();
  const tabId = generateTabId(parsed.type, parsed.resourceId);

  // Check if tab already exists
  const existingTab = state.tabs.find(t => t.id === tabId);

  if (existingTab) {
    // Tab exists - just activate it
    switchTab(tabId);

    // Update sub-tab if it's an app tab
    if (parsed.type === 'app' && parsed.subTab) {
      updateTabSubTab(tabId, parsed.subTab);
    }
  }
  // If tab doesn't exist, caller needs to fetch data and create it

  return parsed;
}

/**
 * Create a tab from parsed route (after data is fetched)
 */
export function createTabFromRoute(
  parsed: ParsedRoute,
  label: string,
  appId?: string | null,
  appName?: string | null
): DashboardTab {
  return openTab({
    type: parsed.type,
    resourceId: parsed.resourceId,
    label,
    appId,
    appName,
    subTab: parsed.subTab,
    filters: parsed.filters
  });
}

/**
 * Initialize popstate listener for browser back/forward
 */
export function initRouteListener(onRouteChange: (parsed: ParsedRoute) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handlePopState = () => {
    const parsed = parseRoute(window.location.pathname, window.location.search);
    onRouteChange(parsed);
  };

  window.addEventListener('popstate', handlePopState);

  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
}

/**
 * Get the "Open in Studio" URL for a resource
 */
export function getStudioUrl(
  type: 'workflow' | 'database' | 'app',
  resourceId: string,
  appId?: string | null
): string | null {
  switch (type) {
    case 'app':
      return `/app/studio/${resourceId}`;

    case 'workflow':
      if (appId) {
        return `/app/studio/${appId}/workflow?wf=${resourceId}`;
      }
      // Standalone workflow
      return `/studio/workflow/${resourceId}`;

    case 'database':
      if (appId) {
        return `/app/studio/${appId}/database`;
      }
      return null; // No standalone database studio

    default:
      return null;
  }
}
