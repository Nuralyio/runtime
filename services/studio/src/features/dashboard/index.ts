/**
 * Dashboard Feature Module
 * Main entry point for the dashboard feature
 */

// Register dashboard components - simplified routing-based layout
import './components/DashboardLayout';
import './components/DashboardOverview';
import './components/DashboardAppView';
import './components/DashboardWorkflowView';
import './components/DashboardWhiteboardView';
import './components/DashboardDatabaseView';
import './components/DashboardKVView';
import './components/DashboardProfileView';
import './components/DashboardAdminView';

// Register legacy dashboard component (for backwards compatibility)
import './components/Dashboard';
import './components/ApplicationsGrid/ApplicationsGrid';
import './components/ApplicationsGrid/ApplicationCard';
import './components/WorkflowsList/WorkflowsList';
import './components/WhiteboardsList/WhiteboardsList';
import './components/KVEntriesList/KVEntriesList';

// Export types and services
export * from './services/dashboard.service';
export * from './services/user-preferences.service';
export * from './stores/dashboard-tabs.store';
export * from './stores/user-preferences.store';
export * from './utils/route-sync';

// Export components
export { Dashboard } from './components/Dashboard';
export { DashboardLayout } from './components/DashboardLayout';
export { DashboardOverview } from './components/DashboardOverview';
export { DashboardAppView } from './components/DashboardAppView';
export { DashboardWorkflowView } from './components/DashboardWorkflowView';
export { DashboardWhiteboardView } from './components/DashboardWhiteboardView';
export { DashboardDatabaseView } from './components/DashboardDatabaseView';
export { DashboardKVView } from './components/DashboardKVView';
export { DashboardProfileView } from './components/DashboardProfileView';
export { DashboardAdminView } from './components/DashboardAdminView';
