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

// Export MicroApp component for programmatic access
export { MicroApp };

// Export related types and utilities
export { MicroAppStoreContext } from './micro-app/state/MicroAppStoreContext';
export { MicroAppRuntimeContext } from './micro-app/state/MicroAppRuntimeContext';
export { MicroAppPageManager } from './micro-app/state/MicroAppPageManager';
export { MicroAppMessageBus } from './micro-app/messaging/MicroAppMessageBus';

// Ensure the component is registered by accessing it
// This prevents tree-shaking from removing the registration
if (typeof window !== 'undefined') {
  // Touch the class to ensure it's not tree-shaken
  void MicroApp;

  console.log('[MicroApp Bundle] Loaded. MicroApp registered:', customElements.get('micro-app') !== undefined);
  console.log('[MicroApp Bundle] ButtonBlock registered:', customElements.get('button-block') !== undefined);
  console.log('[MicroApp Bundle] TextLabelBlock registered:', customElements.get('text-label-block') !== undefined);
  console.log('[MicroApp Bundle] Container registered:', customElements.get('vertical-container-block') !== undefined);
}
