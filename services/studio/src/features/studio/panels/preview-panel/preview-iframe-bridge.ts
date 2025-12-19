/**
 * Preview IFrame Bridge
 *
 * This module handles communication between the iframe preview and the parent editor.
 * It should be imported in the preview route.
 */

import { $currentApplication } from '@nuraly/runtime/redux/store';
import { $components } from '@nuraly/runtime/redux/store/component/store';
import { ExecuteInstance } from '@nuraly/runtime';
import { eventDispatcher } from '@nuraly/runtime/utils';

export interface PreviewMessage {
  type: 'COMPONENTS_UPDATE' | 'COMPONENT_UPDATE_SINGLE' | 'COMPONENT_SELECTED' | 'SET_MODE' | 'SELECT_COMPONENT' | 'READY' | 'COMPONENT_CLICKED' | 'COMPONENT_UPDATED' | 'COMPONENT_HOVERED';
  payload?: any;
}

// Track UUIDs of components being updated from parent to prevent loops
const updatesFromParent = new Set<string>();

/**
 * Initialize the iframe bridge for communication with parent editor
 */
export function initializePreviewBridge() {
  // Only initialize if we're in an iframe
  if (window.self === window.top) {
    return;
  }

  // Default to edit mode - parent will override if needed
  ExecuteInstance.VarsProxy.currentEditingMode = 'edit';

  // Set up message listener for parent communication
  window.addEventListener('message', handleParentMessage);

  // Set up click listener for component selection
  setupClickToSelect();

  // Set up hover listener for component hover
  setupHoverDetection();

  // Notify parent that iframe is ready
  sendMessageToParent({ type: 'READY' });

  // Listen for component updates and forward to parent (only for local changes, not parent-triggered)
  eventDispatcher.on('component:updated', (data: { uuid?: string; fromParent?: boolean }) => {
    // Don't forward updates that came from parent to avoid loops
    if (data?.uuid && updatesFromParent.has(data.uuid)) {
      updatesFromParent.delete(data.uuid);
      return;
    }
    sendMessageToParent({
      type: 'COMPONENT_UPDATED',
      payload: data
    });
  });
}

function handleParentMessage(event: MessageEvent) {
  // Verify the origin of the message
  if (event.origin !== window.location.origin) {
    return;
  }

  const message = event.data as PreviewMessage;

  if (!message || typeof message !== 'object' || !message.type) {
    return;
  }

  switch (message.type) {
    case 'SET_MODE':
      // Update editing mode
      if (message.payload) {
        ExecuteInstance.VarsProxy.currentEditingMode = message.payload;
      }
      break;

    case 'COMPONENTS_UPDATE':
      // Update all components from parent (used for initial sync)
      if (message.payload) {
        const appId = $currentApplication.get()?.uuid;
        if (appId) {
          $components.setKey(appId, message.payload);
          // Mark all as from parent to prevent loop
          message.payload.forEach((c: any) => updatesFromParent.add(c.uuid));
          queueMicrotask(() => {
            eventDispatcher.emit('component:updated', {});
            // Clear after emit
            message.payload.forEach((c: any) => updatesFromParent.delete(c.uuid));
          });
        }
      }
      break;

    case 'COMPONENT_UPDATE_SINGLE':
      // Update a single component from parent (efficient updates)
      if (message.payload) {
        const appId = $currentApplication.get()?.uuid;
        console.log('[PreviewBridge] COMPONENT_UPDATE_SINGLE received, uuid:', message.payload?.uuid);
        if (appId) {
          const currentComponents = $components.get()[appId] || [];
          const updatedComponent = message.payload;
          const index = currentComponents.findIndex(c => c.uuid === updatedComponent.uuid);
          if (index !== -1) {
            // Replace the component at the found index
            const newComponents = [...currentComponents];
            newComponents[index] = updatedComponent;
            $components.setKey(appId, newComponents);
            console.log('[PreviewBridge] Store updated');
          }
          // Mark this UUID as coming from parent to prevent loop
          updatesFromParent.add(updatedComponent.uuid);
          queueMicrotask(() => {
            console.log('[PreviewBridge] Emitting component:updated');
            eventDispatcher.emit('component:updated', { uuid: updatedComponent.uuid });
          });
        }
      }
      break;

    case 'SELECT_COMPONENT':
      // Select a component from parent
      if (message.payload?.uuid) {
        const appId = $currentApplication.get()?.uuid;
        if (appId) {
          const components = $components.get()[appId] || [];
          const component = components.find(c => c.uuid === message.payload.uuid);
          if (component) {
            ExecuteInstance.VarsProxy.selectedComponents = [component];
          }
        }
      }
      break;
  }
}

function sendMessageToParent(message: PreviewMessage) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(message, window.location.origin);
  }
}

/**
 * Set up click-to-select functionality
 * When user clicks on a component in preview, notify parent to select it
 */
function setupClickToSelect() {
  document.addEventListener('click', (event) => {
    // Use composedPath to handle Shadow DOM
    const componentElement = findComponentElementFromEvent(event);

    if (componentElement) {
      const uuid = componentElement.getAttribute('data-component-uuid');
      if (uuid) {
        const rect = componentElement.getBoundingClientRect();
        sendMessageToParent({
          type: 'COMPONENT_CLICKED',
          payload: {
            uuid,
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          }
        });
      }
    }
  }, true);
}

/**
 * Find component element from event using composedPath for Shadow DOM support
 */
function findComponentElementFromEvent(event: Event): HTMLElement | null {
  // Use composedPath to get all elements including through Shadow DOM boundaries
  const path = event.composedPath();

  for (const element of path) {
    if (element instanceof HTMLElement) {
      if (element.hasAttribute('data-component-uuid')) {
        return element;
      }
    }
  }

  // Fallback to traditional DOM traversal
  return findComponentElement(event.target as HTMLElement);
}

/**
 * Find the closest parent element that is a component
 */
function findComponentElement(element: HTMLElement | null): HTMLElement | null {
  let searchCount = 0;
  while (element && searchCount < 50) {
    searchCount++;
    if (element.hasAttribute && element.hasAttribute('data-component-uuid')) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

/**
 * Set up hover detection for components
 */
function setupHoverDetection() {
  let lastHoveredUuid: string | null = null;

  document.addEventListener('mouseover', (event) => {
    // Use composedPath for Shadow DOM support
    const componentElement = findComponentElementFromEvent(event);

    if (componentElement) {
      const uuid = componentElement.getAttribute('data-component-uuid');
      if (uuid && uuid !== lastHoveredUuid) {
        lastHoveredUuid = uuid;
        const rect = componentElement.getBoundingClientRect();
        sendMessageToParent({
          type: 'COMPONENT_HOVERED',
          payload: {
            uuid,
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          }
        });
      }
    }
  }, true);

  document.addEventListener('mouseout', (event) => {
    const relatedTarget = (event as MouseEvent).relatedTarget as HTMLElement;
    const componentElement = findComponentElement(relatedTarget);

    // Only clear if we're leaving to a non-component element
    if (!componentElement) {
      lastHoveredUuid = null;
      sendMessageToParent({
        type: 'COMPONENT_HOVERED',
        payload: { uuid: null, rect: null }
      });
    }
  }, true);
}

// Auto-initialize if we're in iframe preview mode
if (typeof window !== 'undefined' && (window as any).__IS_IFRAME_PREVIEW__) {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePreviewBridge);
  } else {
    initializePreviewBridge();
  }
}
