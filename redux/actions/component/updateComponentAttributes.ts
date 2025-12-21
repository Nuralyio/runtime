// Filename: update-component-attributes.ts

import { $components } from '../../store/component/store.ts';
import type { ComponentElement } from '../../store/component/component.interface.ts';
import { eventDispatcher } from "../../../../runtime/utils/change-detection.ts";
import { updateComponentHandler } from '../../handlers/components/update-component.handler.ts';
import type { UpdateType } from '../component.ts';
import deepEqual from "fast-deep-equal"; // Import fast-deep-equal for deep comparison
import { ExecuteInstance } from '../../../state/runtime-context';
import { validateComponentHandlers } from '../../../../runtime/utils/handler-validator.ts';
import { formatValidationErrors } from '../../../../runtime/utils/validation-error-formatter.ts';
export function updateComponentAttributes(
  application_id: string,
  componentId: string,
  updateType: UpdateType,
  updatedAttributes: Record<string, any>, // Define a more specific type
  save = true,
) {
  
  // Retrieve the currentPlatform from global context
  const currentPlatform = ExecuteInstance.Vars.currentPlatform ?? {
    platform: "desktop",
    isMobile: false,
  };
  // Retrieve the global components store
  const componentsStore = $components.get();
  const applicationComponents = componentsStore[application_id] || [];
  const componentIndex = applicationComponents.findIndex(
    (component: ComponentElement) => component.uuid === componentId,
  );

  if (componentIndex !== -1) {
    // Get the component to update
    const componentToUpdate = applicationComponents[componentIndex];

    // Decide how to read currentAttributes (e.g., from breakpoints for non-desktop style updates)
    let currentAttributes: Record<string, any> = {};
    let desktopAttributes: Record<string, any> = {};

    if (updateType === "style" || updateType === "input") {
      // Retrieve desktop attributes for comparison
      desktopAttributes = componentToUpdate[updateType] || {};
  
      if (currentPlatform.platform !== "desktop") {
          // Ensure breakpoints structure is properly set up
          componentToUpdate.breakpoints = componentToUpdate.breakpoints || {};
          componentToUpdate.breakpoints[currentPlatform.width] =
              componentToUpdate.breakpoints[currentPlatform.width] || {};
  
          componentToUpdate.breakpoints[currentPlatform.width][updateType] =
              componentToUpdate.breakpoints[currentPlatform.width][updateType] ?? {};
  
          // For style or input updates on non-desktop, operate on the breakpoint attributes
          currentAttributes = componentToUpdate.breakpoints[currentPlatform.width][updateType];
      } else {
          // For desktop, operate on the top-level style or input
          currentAttributes = componentToUpdate[updateType] || {};
      }
  } else {
      // For non-style and non-input updates, no breakpoint handling is assumed
      currentAttributes = componentToUpdate[updateType] || {};
  }
  
  // Determine if an update is necessary by checking if any updatedAttribute differs
  let needsUpdate = false;
  for (const key of Object.keys(updatedAttributes)) {
      if (!deepEqual(currentAttributes[key], updatedAttributes[key])) {
          needsUpdate = true;
          break;
      }
  }

    if (needsUpdate) {
      // FIRST: Save original state for potential rollback
      // Using 'in' operator to check if property exists regardless of value (including null/undefined)
      const hasOriginalUpdateType = updateType in componentToUpdate;
      const hasOriginalBreakpoints = 'breakpoints' in componentToUpdate;
      const originalState = {
        [updateType]: hasOriginalUpdateType ? structuredClone(componentToUpdate[updateType]) : undefined,
        breakpoints: hasOriginalBreakpoints ? structuredClone(componentToUpdate.breakpoints) : undefined,
        hasUpdateType: hasOriginalUpdateType,
        hasBreakpoints: hasOriginalBreakpoints,
      };

      // SECOND: Apply the updates directly to the component
      //@todo: need more tests here.
      // Check if any of the updated attributes is a handler (nested: { propName: { type: 'handler', value: '...' } })
      const hasHandlerAttribute = updateType === "input" &&
        Object.values(updatedAttributes).some((attr: any) => attr && typeof attr === 'object' && attr.type === 'handler');

      if ((updateType === "style" || (updateType === "input" && !hasHandlerAttribute)) && currentPlatform.platform !== "desktop") {
        // Initialize breakpoints if not already
        componentToUpdate.breakpoints = componentToUpdate.breakpoints || {};
        componentToUpdate.breakpoints[currentPlatform.width] =
          componentToUpdate.breakpoints[currentPlatform.width] || {};
      
        // Process each updated attribute
        for (const [key, value] of Object.entries(updatedAttributes)) {
          if (deepEqual(value, desktopAttributes[key])) {
            // If the updated attribute matches the desktop attribute, remove it from the breakpoint
            delete componentToUpdate.breakpoints[currentPlatform.width][updateType][key];
          } else {
            if(value.type === "handler"){
              componentToUpdate[updateType][key] = value;
            }else{
              componentToUpdate.breakpoints[currentPlatform.width][updateType] =
              componentToUpdate.breakpoints[currentPlatform.width][updateType] || {};
            componentToUpdate.breakpoints[currentPlatform.width][updateType][key] = value;
            }
          }
        }
      
        // After processing, check if the breakpoint has any attributes left
        const breakpointAttributes = componentToUpdate.breakpoints[currentPlatform.width];
        if (Object.keys(breakpointAttributes).every(type => Object.keys(breakpointAttributes[type]).length === 0)) {
          delete componentToUpdate.breakpoints[currentPlatform.width];
        }
      
        // If no breakpoints remain, optionally remove the breakpoints object
        if (Object.keys(componentToUpdate.breakpoints).length === 0) {
          delete componentToUpdate.breakpoints;
        }
      } else {
        // For desktop or non-style/input updates, update the regular property
        componentToUpdate[updateType] = {
          ...currentAttributes,
          ...updatedAttributes,
        };
      }

      // THIRD: Validate the modified component
      const validationResult = validateComponentHandlers(componentToUpdate);

      if (!validationResult.valid) {
        // Validation failed - revert to original state
        if (originalState.hasUpdateType) {
          componentToUpdate[updateType] = originalState[updateType];
        } else {
          delete componentToUpdate[updateType];
        }
        
        if (originalState.hasBreakpoints) {
          componentToUpdate.breakpoints = originalState.breakpoints;
        } else {
          delete componentToUpdate.breakpoints;
        }

        // Format errors and show to user
        const errorMessage = formatValidationErrors(validationResult.errors);

        // Emit validation error event for UI notifications
        eventDispatcher.emit("component:validation-error", {
          componentId: componentToUpdate.uuid,
          errors: validationResult.errors,
          message: errorMessage
        });

        // Log to console for debugging
        eventDispatcher.emit("kernel:log", {
          type: "error",
          message: "Handler Validation Failed",
          details: errorMessage,
          errors: validationResult.errors
        });

        console.error("Handler validation failed:", validationResult.errors);

        // DO NOT save to store - validation failed
        return;
      }

      // FOURTH: Save the validated component to the store
      $components.setKey(`${application_id}[${componentIndex}]`, componentToUpdate);

      // Optionally save the update to persistent store / DB
      if (save) {
        setTimeout(() => {
          updateComponentHandler(componentToUpdate, application_id);
        }, 0);
      }

      // Update selected components if needed
      const selectedComponents = ExecuteInstance.VarsProxy.selectedComponents;
      const index = selectedComponents.findIndex((c: ComponentElement) => c.uuid === componentToUpdate.uuid);
      if (index !== -1) {
          ExecuteInstance.VarsProxy.selectedComponents[index] = componentToUpdate;
      }

      // Trigger a refresh event for any listeners - ONLY when actual update occurred
      eventDispatcher.emit("component:updated", { uuid: componentId });
      eventDispatcher.emit(`component-updated:${String(componentId)}`);
    } else {
      // No update needed
      // console.log('Attributes are the same, no update needed:', updatedAttributes);
    }
  }
}