/**
 * Studio Bootstrap
 * Initializes the studio editor when on studio paths.
 */

import { $components } from '../runtime/redux/store/component/store';
import { $currentApplication } from '../runtime/redux/store/apps';
import { getAppMembersData } from '../runtime/redux/store/app-members';
import { eventDispatcher } from '../runtime/utils/change-detection';
import { registerStudioComponents } from './register-studio-components';

export function initializeStudio(): void {
  const isServer = typeof window === "undefined";

  if (!isServer) {
    const isStudioPath = document.location.pathname.startsWith("/app/studio/");

    if (isStudioPath) {
      registerStudioComponents();

      // Preload app members data for the current application (for roles dropdown, etc.)
      const currentApp = $currentApplication.get() as any;
      if (currentApp?.uuid) {
        getAppMembersData(currentApp.uuid);
      }

      import("./studio-entrypoint").then(studioModule => {
        $components.setKey("1", studioModule.default as any);
        eventDispatcher.emit('component:refresh');
      });
    }
  }
}

// Auto-initialize when module is loaded on client-side
if (typeof window !== "undefined") {
  initializeStudio();
}
