/**
 * Studio Bootstrap
 *
 * Initializes the studio editor by loading studio components
 * into the global component store when on studio paths.
 *
 * This module handles:
 * - Conditional client-side loading
 * - Path-based initialization
 * - Dynamic import for code splitting
 * - Component registration
 * - Event emission for runtime context update
 */

import { $components } from '../runtime/redux/store/component/store';
import { eventDispatcher } from '../runtime/utils/change-detection';

/**
 * Initialize studio components
 * This function should be called on the client-side only
 */
export function initializeStudio(): void {
  // Only run on client-side
  const isServer = typeof window === "undefined";

  if (!isServer) {
    // Check if we're on a studio path (defensive check even though imported by studio page)
    const isStudioPath = document.location.pathname.startsWith("/app/studio/");

    if (isStudioPath) {
      // Dynamically import studio components only when needed (code splitting)
      import("./studio-entrypoint").then(studioModule => {
        // Register studio components with application ID "1" (reserved for studio)
        $components.setKey("1", studioModule.default as any);

        // Emit event to trigger RuntimeContext to re-register applications
        eventDispatcher.emit('component:refresh');
      });
    }
  }
}

// Auto-initialize when module is loaded on client-side
if (typeof window !== "undefined") {
  initializeStudio();
}
