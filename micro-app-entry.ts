/**
 * Standalone MicroApp Entry Point
 *
 * This file exports the MicroApp component for standalone usage.
 * Import this file to auto-register the <micro-app> web component.
 */

// CRITICAL: Register all components first (must happen before any component usage)
import './utils/register-components';

// Import MicroApp component to trigger registration
// The @customElement decorator will register it when the class is imported
import { MicroApp } from './components/ui/components/runtime/MicroApp/MicroApp';
import { MicroComponents } from './components/ui/components/runtime/MicroComponents/MicroComponents';

// Export MicroApp and MicroComponents components for programmatic access
export { MicroApp, MicroComponents };

// Export related types and utilities
export { MicroAppStoreContext } from './micro-app/state/MicroAppStoreContext';
export { MicroAppRuntimeContext } from './micro-app/state/MicroAppRuntimeContext';
export { MicroAppPageManager } from './micro-app/state/MicroAppPageManager';
export { MicroAppMessageBus } from './micro-app/messaging/MicroAppMessageBus';

// Ensure the components are registered by accessing them
// This prevents tree-shaking from removing the registration
if (typeof window !== 'undefined') {
  // Touch the classes to ensure they're not tree-shaken
  void MicroApp;
  void MicroComponents;
}
