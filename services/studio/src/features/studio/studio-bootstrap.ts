/**
 * Studio Bootstrap
 * Initializes the studio editor when on studio paths.
 */

import { $currentApplication, $editorState } from '../runtime/redux/store/apps';
import { getAppMembersData } from '../runtime/redux/store/app-members';
import { refreshWorkflows } from '../runtime/redux/store/workflow';
import { registerStudioComponents } from './register-studio-components';
import { presenceClient, PresenceIndicator } from '../runtime/presence';
import { ComponentRegistry } from '../runtime/utils/component-registry';
import { initLocale } from '../runtime/state/locale.store';

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

        // Initialize i18n if configured
        if (currentApp.i18n) {
          initLocale(currentApp.i18n);
        }

        // Initialize presence for collaborative editing
        initializePresence(currentApp.uuid);

        // Preload workflows for the application (for workflow dropdown in properties panel)
        refreshWorkflows(currentApp.uuid);
      }

      // Set initial tab based on URL routing
      initializeTabFromUrl();

    }
  }
}

/**
 * Initialize the editor tab based on URL routing
 * Reads window.__TAB_TYPE__ and window.__WORKFLOW_ID__ set by the Astro page
 */
function initializeTabFromUrl(): void {
  const tabType = (window as any).__TAB_TYPE__ as string | undefined;
  const workflowId = (window as any).__WORKFLOW_ID__ as string | undefined;

  if (!tabType) return;

  // Get appId from current application for passing to flow tab
  const currentApp = $currentApplication.get() as any;
  const appId = currentApp?.uuid;

  console.log('[StudioBootstrap] initializeTabFromUrl:', { tabType, workflowId, appId });

  const tabConfigs: Record<string, { id: string; label: string; type: string; detail?: any }> = {
    page: { id: "0", label: "Page editor", type: "page" },
    flow: { id: "flow", label: "Workflows", type: "flow", detail: { appId, workflowId } },
    database: { id: "database", label: "Database", type: "database" },
    journal: { id: "journal", label: "Journal", type: "journal" },
  };

  const tabConfig = tabConfigs[tabType];
  if (!tabConfig) return;

  const currentState = $editorState.get();

  // Update tabs list - replace existing tab with same id to ensure detail is updated
  const tabIndex = currentState.tabs.findIndex(t => t.id === tabConfig.id);
  let updatedTabs: typeof currentState.tabs;
  if (tabIndex >= 0) {
    // Replace existing tab with new config (which has detail)
    updatedTabs = [...currentState.tabs];
    updatedTabs[tabIndex] = tabConfig;
  } else {
    // Add new tab
    updatedTabs = [...currentState.tabs, tabConfig];
  }

  // Set the current tab and update tabs list
  $editorState.set({
    ...currentState,
    tabs: updatedTabs,
    currentTab: tabConfig,
  });
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
