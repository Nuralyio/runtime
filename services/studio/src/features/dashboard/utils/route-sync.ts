/**
 * Dashboard Route Sync Utilities
 * Handles URL parsing and navigation
 */

import { type DashboardTabType, type AppSubTab } from '../stores/dashboard-tabs.store';

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
 * Build a route path from parsed route
 */
export function buildRoutePath(route: ParsedRoute): string {
  switch (route.type) {
    case 'overview':
      return '/dashboard';

    case 'app':
      if (route.subTab && route.subTab !== 'pages') {
        return `/dashboard/app/${route.resourceId}/${route.subTab}`;
      }
      return `/dashboard/app/${route.resourceId}`;

    case 'workflow':
      return `/dashboard/workflow/${route.resourceId}`;

    case 'database':
      return `/dashboard/database/${route.resourceId}`;

    case 'kv':
      if (route.filters && Object.keys(route.filters).length > 0) {
        const params = new URLSearchParams(route.filters);
        return `/dashboard/kv?${params.toString()}`;
      }
      return '/dashboard/kv';

    default:
      return '/dashboard';
  }
}

/**
 * Navigate to a route path (updates URL without page reload)
 */
export function navigateToPath(path: string): void {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname + window.location.search;

  if (path !== currentPath) {
    window.history.pushState({}, '', path);
  }
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
      return `/workflow/${resourceId}`;

    case 'database':
      if (appId) {
        return `/app/studio/${appId}/database`;
      }
      // Standalone database
      return `/database/${resourceId}`;

    default:
      return null;
  }
}
