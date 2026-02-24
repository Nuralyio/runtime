/**
 * API Layer
 * 
 * Centralized API service layer organized by domain.
 * 
 * Structure:
 * - applications/ - Application-related API calls
 * - components/ - Component-related API calls
 * - pages/ - Page-related API calls
 * 
 * @example
 * ```typescript
 * import { fetchApplicationById, fetchAllApplications } from './';
 * 
 * // Or import from specific domain
 * import { fetchApplicationById } from './applications';
 * ```
 */

// Re-export all application services
export * from './applications';

// Re-export all component services
export * from './components';

// Re-export all page services
export * from './pages';

// Re-export all revision services
export * from './revisions';

// Re-export constants
export { APIS_URL } from './constants';
