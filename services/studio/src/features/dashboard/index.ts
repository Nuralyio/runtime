/**
 * Dashboard Feature Module
 * Main entry point for the dashboard feature
 */

// Register dashboard components
import './components/Dashboard';
import './components/ApplicationsGrid/ApplicationsGrid';
import './components/ApplicationsGrid/ApplicationCard';
import './components/WorkflowsList/WorkflowsList';
import './components/KVEntriesList/KVEntriesList';

// Export types and services
export * from './services/dashboard.service';
export { Dashboard } from './components/Dashboard';
