// Filename: update-component-attributes.ts

import { $components } from '../../store/component/store.ts';
import type { ComponentElement } from '../../store/component/component.interface.ts';
import { eventDispatcher } from "../../../../runtime/utils/change-detection.ts";
import { updateComponentHandler } from '../../handlers/components/update-component.handler.ts';
import type { UpdateType } from '../component.ts';
import deepEqual from "fast-deep-equal";
import { ExecuteInstance } from '../../../state/runtime-context';
import { validateComponentHandlers } from '../../../../runtime/utils/handler-validator.ts';
import { formatValidationErrors } from '../../../../runtime/utils/validation-error-formatter.ts';

// Debounce timers for component update events (prevents rapid re-renders during typing)
const componentUpdateTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
// Debounce timers for HTTP save operations
const componentSaveTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
// Debounce timer for store setKey (batches rapid updates)
let storeUpdateTimer: ReturnType<typeof setTimeout> | null = null;
const pendingStoreUpdates: Set<string> = new Set();

/**
 * Emit component update events with debouncing to prevent UI freezes during rapid input
 */
function emitComponentUpdatedDebounced(componentId: string) {
  const existingTimer = componentUpdateTimers.get(componentId);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    eventDispatcher.emit("component:updated", { uuid: componentId });
    eventDispatcher.emit(`component-updated:${String(componentId)}`);
    componentUpdateTimers.delete(componentId);
  }, 16); // ~1 frame at 60fps

  componentUpdateTimers.set(componentId, timer);
}

/**
 * Save component to server with debouncing to prevent excessive HTTP requests during typing
 */
function saveComponentDebounced(component: any, applicationId: string) {
  const existingTimer = componentSaveTimers.get(component.uuid);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    updateComponentHandler(component, applicationId);
    componentSaveTimers.delete(component.uuid);
  }, 300); // 300ms debounce for HTTP saves

  componentSaveTimers.set(component.uuid, timer);
}

export function updateComponentAttributes(
  application_id: string,
  componentId: string,
  updateType: UpdateType,
  updatedAttributes: Record<string, any>,
  save = true,
) {
  const currentPlatform = ExecuteInstance.Vars.currentPlatform ?? {
    platform: "desktop",
    isMobile: false,
  };

  const componentsStore = $components.get();
  const applicationComponents = componentsStore[application_id] || [];
  const componentIndex = applicationComponents.findIndex(
    (component: ComponentElement) => component.uuid === componentId,
  );

  if (componentIndex === -1) return;

  const originalComponent = applicationComponents[componentIndex];

  // Determine current attributes based on platform/breakpoints
  let currentAttributes: Record<string, any> = {};
  let desktopAttributes: Record<string, any> = {};

  if (updateType === "style" || updateType === "input") {
    desktopAttributes = originalComponent[updateType] || {};

    if (currentPlatform.platform !== "desktop") {
      originalComponent.breakpoints = originalComponent.breakpoints || {};
      originalComponent.breakpoints[currentPlatform.width] =
        originalComponent.breakpoints[currentPlatform.width] || {};
      originalComponent.breakpoints[currentPlatform.width][updateType] =
        originalComponent.breakpoints[currentPlatform.width][updateType] ?? {};
      currentAttributes = originalComponent.breakpoints[currentPlatform.width][updateType];
    } else {
      currentAttributes = originalComponent[updateType] || {};
    }
  } else {
    currentAttributes = originalComponent[updateType] || {};
  }

  // Check if update is necessary
  let needsUpdate = false;
  for (const key of Object.keys(updatedAttributes)) {
    if (!deepEqual(currentAttributes[key], updatedAttributes[key])) {
      needsUpdate = true;
      break;
    }
  }

  if (!needsUpdate) return;

  // Save original state for potential rollback
  const hasOriginalUpdateType = updateType in originalComponent;
  const hasOriginalBreakpoints = 'breakpoints' in originalComponent;
  const originalState = {
    [updateType]: hasOriginalUpdateType ? structuredClone(originalComponent[updateType]) : undefined,
    breakpoints: hasOriginalBreakpoints ? structuredClone(originalComponent.breakpoints) : undefined,
    hasUpdateType: hasOriginalUpdateType,
    hasBreakpoints: hasOriginalBreakpoints,
  };

  // Check if any of the updated attributes is a handler
  const hasHandlerAttribute = updateType === "input" &&
    Object.values(updatedAttributes).some((attr: any) => attr && typeof attr === 'object' && attr.type === 'handler');

  const isNonDesktopStyleOrInput = (updateType === "style" || (updateType === "input" && !hasHandlerAttribute)) &&
    currentPlatform.platform !== "desktop";

  let updatedComponent: ComponentElement;

  if (isNonDesktopStyleOrInput) {
    // Non-desktop: mutate breakpoints in place (creates new component for immutability)
    updatedComponent = {
      ...originalComponent,
      breakpoints: { ...originalComponent.breakpoints }
    };
    updatedComponent.breakpoints![currentPlatform.width] = {
      ...updatedComponent.breakpoints![currentPlatform.width]
    };

    for (const [key, value] of Object.entries(updatedAttributes)) {
      if (deepEqual(value, desktopAttributes[key])) {
        delete updatedComponent.breakpoints![currentPlatform.width][updateType]?.[key];
      } else if ((value as any)?.type === "handler") {
        updatedComponent[updateType] = { ...updatedComponent[updateType], [key]: value };
      } else {
        updatedComponent.breakpoints![currentPlatform.width][updateType] = {
          ...updatedComponent.breakpoints![currentPlatform.width][updateType],
          [key]: value
        };
      }
    }

    // Clean up empty breakpoints
    const breakpointAttrs = updatedComponent.breakpoints![currentPlatform.width];
    if (Object.keys(breakpointAttrs).every(type =>
      !breakpointAttrs[type] || Object.keys(breakpointAttrs[type]).length === 0)) {
      delete updatedComponent.breakpoints![currentPlatform.width];
    }
    if (Object.keys(updatedComponent.breakpoints!).length === 0) {
      delete updatedComponent.breakpoints;
    }
  } else {
    // Desktop or non-style/input: create new component with merged attributes
    updatedComponent = {
      ...originalComponent,
      [updateType]: {
        ...currentAttributes,
        ...updatedAttributes,
      }
    };
  }

  // Validate the updated component
  const validationResult = validateComponentHandlers(updatedComponent);

  if (!validationResult.valid) {
    const errorMessage = formatValidationErrors(validationResult.errors);

    eventDispatcher.emit("component:validation-error", {
      componentId: originalComponent.uuid,
      errors: validationResult.errors,
      message: errorMessage
    });

    eventDispatcher.emit("kernel:log", {
      type: "error",
      message: "Handler Validation Failed",
      details: errorMessage,
      errors: validationResult.errors
    });

    return;
  }

  // Commit: replace the component in the array with the new object
  applicationComponents[componentIndex] = updatedComponent;

  // Debounced store update to trigger subscribers
  pendingStoreUpdates.add(application_id);
  if (storeUpdateTimer) {
    clearTimeout(storeUpdateTimer);
  }
  storeUpdateTimer = setTimeout(() => {
    for (const appId of pendingStoreUpdates) {
      const store = $components.get();
      const components = store[appId];
      if (components) {
        $components.setKey(appId, [...components]);
      }
    }
    pendingStoreUpdates.clear();
    storeUpdateTimer = null;
  }, 100);

  // Save to server
  if (save) {
    saveComponentDebounced(updatedComponent, application_id);
  }

  // Update selectedComponents with the new reference
  const selectedComponents = ExecuteInstance.Vars.selectedComponents;
  if (selectedComponents) {
    const index = selectedComponents.findIndex((c: ComponentElement) => c.uuid === updatedComponent.uuid);
    if (index !== -1) {
      selectedComponents[index] = updatedComponent;
    }
  }

  // Emit update event
  emitComponentUpdatedDebounced(componentId);
}
