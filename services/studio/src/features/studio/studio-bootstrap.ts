/**
 * Studio Bootstrap
 * Initializes the studio editor when on studio paths.
 */

import { $components } from '../runtime/redux/store/component/store';
import { $currentApplication } from '../runtime/redux/store/apps';
import { getAppMembersData } from '../runtime/redux/store/app-members';
import { eventDispatcher } from '../runtime/utils/change-detection';
import { registerStudioComponents } from './register-studio-components';
import { presenceClient, PresenceIndicator } from '../runtime/presence';
import { ComponentRegistry } from '../runtime/utils/component-registry';

export function initializeStudio(): void {
  const isServer = typeof window === "undefined";

  if (!isServer) {
    const isStudioPath = document.location.pathname.startsWith("/app/studio/");

    if (isStudioPath) {
      registerStudioComponents();

      // Register presence indicator component
      ComponentRegistry.register({
        type: 'presence_indicator',
        tagName: 'presence-indicator',
        componentClass: PresenceIndicator,
      });

      // Preload app members data for the current application (for roles dropdown, etc.)
      const currentApp = $currentApplication.get() as any;
      if (currentApp?.uuid) {
        getAppMembersData(currentApp.uuid);

        // Initialize presence for collaborative editing
        initializePresence(currentApp.uuid);
      }

      import("./studio-entrypoint").then(studioModule => {
        $components.setKey("1", studioModule.default as any);
        eventDispatcher.emit('component:refresh');
      });
    }
  }
}

/**
 * Initialize presence tracking for the studio
 */
function initializePresence(applicationId: string): void {
  // Connect to presence server
  presenceClient.connect();

  // Join the application room once connected
  // The client handles reconnection and rejoin automatically
  setTimeout(() => {
    presenceClient.joinApplication(applicationId, {
      pageName: 'Studio Editor',
    });
  }, 500);

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    presenceClient.disconnect();
  });
}

// Auto-initialize when module is loaded on client-side
if (typeof window !== "undefined") {
  initializeStudio();
}
