/**
 * Preview IFrame Bridge
 *
 * This module handles communication between the iframe preview and the parent editor.
 * It should be imported in the preview route.
 */

import { $currentApplication, $components } from '@nuraly/runtime/redux/store';
import { ExecuteInstance } from '@nuraly/runtime';
import { eventDispatcher } from '@nuraly/runtime/utils';

export interface PreviewMessage {
  type: 'COMPONENTS_UPDATE' | 'COMPONENT_UPDATE_SINGLE' | 'COMPONENT_DELETED' | 'COMPONENT_SELECTED' | 'SET_MODE' | 'SELECT_COMPONENT' | 'READY' | 'COMPONENT_CLICKED' | 'COMPONENT_UPDATED' | 'COMPONENT_HOVERED' | 'SET_PAGE' | 'SET_LOCALE';
  payload?: any;
}

// Track UUIDs of components being updated from parent to prevent loops
const updatesFromParent = new Set<string>();

/**
 * Strip non-serializable properties from a component before sending to parent.
 * Properties like Instance (Proxy), parent (circular ref), children (circular ref) cannot be cloned.
 */
function sanitizeComponentForParent(component: any): any {
  if (!component) return component;
  const { Instance, parent, children, __microAppContext, ...serializableProps } = component;
  return serializableProps;
}

/**
 * Initialize the iframe bridge for communication with parent editor
 */
export function initializePreviewBridge() {
  // Only initialize if we're in an iframe
  if (globalThis.self === globalThis.top) {
    return;
  }

  // Default to edit mode - parent will override if needed
  ExecuteInstance.VarsProxy.currentEditingMode = 'edit';

  // Set up message listener for parent communication
  globalThis.addEventListener('message', handleParentMessage);

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

    // Get the full updated component from store and send to parent
    const appId = $currentApplication.get()?.uuid;
    if (appId && data?.uuid) {
      const components = $components.get()[appId] || [];
      const updatedComponent = components.find(c => c.uuid === data.uuid);
      if (updatedComponent) {
        sendMessageToParent({
          type: 'COMPONENT_UPDATED',
          payload: {
            uuid: data.uuid,
            component: sanitizeComponentForParent(updatedComponent)
          }
        });
        return;
      }
    }

    // Fallback: send just the data (for cases without uuid)
    sendMessageToParent({
      type: 'COMPONENT_UPDATED',
      payload: data
    });
  });
}

function handleParentMessage(event: MessageEvent) {
  if (event.origin !== globalThis.location.origin) {
    return;
  }

  const message = event.data as PreviewMessage;
  if (!message || typeof message !== 'object' || !message.type) {
    return;
  }

  switch (message.type) {
    case 'SET_MODE':
      handleSetMode(message.payload);
      break;
    case 'SET_PAGE':
      handleSetPage(message.payload);
      break;
    case 'COMPONENTS_UPDATE':
      handleComponentsUpdate(message.payload);
      break;
    case 'COMPONENT_UPDATE_SINGLE':
      handleComponentUpdateSingle(message.payload);
      break;
    case 'SELECT_COMPONENT':
      handleSelectComponent(message.payload);
      break;
    case 'SET_LOCALE':
      handleSetLocale(message.payload);
      break;
  }
}

function handleSetMode(payload: string | undefined) {
  if (payload) {
    ExecuteInstance.VarsProxy.currentEditingMode = payload;
  }
}

function handleSetPage(payload: string | undefined) {
  if (payload) {
    ExecuteInstance.VarsProxy.currentPage = payload;
  }
}

function handleSetLocale(payload: string | undefined) {
  if (payload) {
    ExecuteInstance.VarsProxy.previewLocale = payload;
    // Emit event to trigger component re-renders
    eventDispatcher.emit('Vars:previewLocale', payload);
  }
}

function handleComponentsUpdate(payload: any[] | undefined) {
  if (!payload) return;

  const appId = $currentApplication.get()?.uuid;
  if (!appId) return;

  $components.setKey(appId, payload);
  payload.forEach((c: any) => updatesFromParent.add(c.uuid));
  queueMicrotask(() => {
    eventDispatcher.emit('component:updated', {});
    payload.forEach((c: any) => updatesFromParent.delete(c.uuid));
  });
}

function handleComponentUpdateSingle(payload: any | undefined) {
  if (!payload) return;

  const appId = $currentApplication.get()?.uuid;
  if (!appId) return;

  const currentComponents = $components.get()[appId] || [];
  const index = currentComponents.findIndex(c => c.uuid === payload.uuid);
  if (index !== -1) {
    const newComponents = [...currentComponents];
    newComponents[index] = payload;
    $components.setKey(appId, newComponents);
  }

  updatesFromParent.add(payload.uuid);
  queueMicrotask(() => {
    eventDispatcher.emit('component:updated', { uuid: payload.uuid });
  });
}

function handleSelectComponent(payload: { uuid?: string } | undefined) {
  if (!payload?.uuid) return;

  const appId = $currentApplication.get()?.uuid;
  if (!appId) return;

  const components = $components.get()[appId] || [];
  const component = components.find(c => c.uuid === payload.uuid);
  if (component) {
    ExecuteInstance.VarsProxy.selectedComponents = [component];
  }
}

function sendMessageToParent(message: PreviewMessage) {
  if (globalThis.parent && globalThis.parent !== globalThis) {
    globalThis.parent.postMessage(message, globalThis.location.origin);
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
      const uuid = componentElement.dataset.componentUuid;
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
      if (element.dataset.componentUuid) {
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
    if (element.dataset?.componentUuid) {
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
      const uuid = componentElement.dataset.componentUuid;
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

  document.addEventListener('mouseout', (event: MouseEvent) => {
    const relatedTarget = event.relatedTarget as HTMLElement;
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
if (typeof globalThis !== 'undefined' && (globalThis as any).__IS_IFRAME_PREVIEW__) {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePreviewBridge);
  } else {
    initializePreviewBridge();
  }
}
