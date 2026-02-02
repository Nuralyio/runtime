/**
 * Dashboard Types
 * Type definitions for dashboard routing and views
 */

/**
 * Tab types supported in the dashboard routes
 */
export type DashboardTabType = 'overview' | 'workflow' | 'database' | 'app' | 'kv';

/**
 * Sub-tab types for app view (used with nr-tabs)
 */
export type AppSubTab = 'pages' | 'workflows' | 'database' | 'kv';
