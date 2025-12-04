/**
 * Studio Feature - Main Entry Point
 * 
 * This is the visual editor feature for Nuraly.
 * Import from @features/studio for studio-related components and utilities.
 * 
 * Structure:
 * - components/ - Studio feature components (function, flow, database, files, page, editor-micro-apps)
 * - panels/ - Studio UI panels (control-panel, layout, main-panel, log-panel, screen-panel, top-bar, etc.)
 * - blocks/ - Configuration blocks
 * - core/ - Core studio utilities and helpers
 * - factories/ - Component factories
 * - processors/ - Data processors
 */

// Main studio entrypoint
export { default as StudioEntrypoint } from './studio-entrypoint';

// Studio bootstrap initialization
export { initializeStudio } from './studio-bootstrap';

// Re-export commonly used utilities and types as needed
// Add more exports here as the feature API grows
