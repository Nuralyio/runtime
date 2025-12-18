/**
 * Preview IFrame Bridge
 *
 * This module handles communication between the iframe preview and the parent editor.
 * It should be imported in the preview route.
 */

import { $applicationComponents, $currentApplication } from '@nuraly/runtime/redux/store';
import { ExecuteInstance } from '@nuraly/runtime';
import { eventDispatcher } from '@nuraly/runtime/utils';

export interface PreviewMessage {
  type: 'COMPONENTS_UPDATE' | 'COMPONENT_SELECTED' | 'SET_MODE' | 'SELECT_COMPONENT' | 'READY' | 'COMPONENT_CLICKED' | 'COMPONENT_UPDATED';
  payload?: any;
}

/**
 * Initialize the iframe bridge for communication with parent editor
 */
export function initializePreviewBridge() {
  // Only initialize if we're in an iframe
  if (window.self === window.top) {
    return;
  }

  // Set up message listener for parent communication
  window.addEventListener('message', handleParentMessage);

  // Set up click listener for component selection
  setupClickToSelect();

  // Notify parent that iframe is ready
  sendMessageToParent({ type: 'READY' });

  // Listen for component updates and forward to parent
  eventDispatcher.on('component:updated', (data) => {
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
      // Update components from parent
      if (message.payload) {
        const appId = $currentApplication.get()?.uuid;
        if (appId) {
          $applicationComponents(appId).set(message.payload);
          eventDispatcher.emit('component:updated', {});
        }
      }
      break;

    case 'SELECT_COMPONENT':
      // Select a component from parent
      if (message.payload?.uuid) {
        const appId = $currentApplication.get()?.uuid;
        if (appId) {
          const components = $applicationComponents(appId).get();
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
    const target = event.target as HTMLElement;

    // Find the closest component element with data-component-uuid
    const componentElement = findComponentElement(target);

    if (componentElement) {
      const uuid = componentElement.getAttribute('data-component-uuid');
      if (uuid) {
        sendMessageToParent({
          type: 'COMPONENT_CLICKED',
          payload: { uuid }
        });
      }
    }
  }, true);
}

/**
 * Find the closest parent element that is a component
 */
function findComponentElement(element: HTMLElement | null): HTMLElement | null {
  while (element) {
    if (element.hasAttribute && element.hasAttribute('data-component-uuid')) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
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
