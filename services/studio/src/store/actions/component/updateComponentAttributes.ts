// Filename: update-component-attributes.ts

import { $components } from "$store/component/store.ts";
import type { ComponentElement } from "$store/component/interface.ts";
import { eventDispatcher } from "../../../utils/change-detection.ts";
import { updateComponentHandler } from "$store/handlers/components/update-component.handler.ts";
import type { UpdateType } from "$store/actions/component.ts";
import { getVar } from "$store/context.ts";
import deepEqual from "fast-deep-equal"; // Import fast-deep-equal for deep comparison

export function updateComponentAttributes(
  applicationId: string,
  componentId: string,
  updateType: UpdateType,
  updatedAttributes: Record<string, any>, // Define a more specific type
  save = true,
) {
  // Retrieve the currentPlatform from global context
  const currentPlatform = getVar("global", "currentPlatform")?.value ?? {
    platform: "desktop",
    isMobile: false,
  };
  // Retrieve the global components store
  const componentsStore = $components.get();
  const applicationComponents = componentsStore[applicationId] || [];
  const componentIndex = applicationComponents.findIndex(
    (component: ComponentElement) => component.uuid === componentId,
  );

  if (componentIndex !== -1) {
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
      if ((updateType === "style" || (updateType === "input" && updatedAttributes.type !=="handler")) && currentPlatform.platform !== "desktop") {
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
            // Otherwise, set/update the attribute in the breakpoint
           
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

      // Directly update the component in the store
      $components.setKey(`${applicationId}[${componentIndex}]`, componentToUpdate);

      // Optionally save the update to persistent store / DB
      if (save) {
        setTimeout(() => {
          updateComponentHandler(componentToUpdate, applicationId);
        }, 0);
      }
    } else {
      // No update needed
      // console.log('Attributes are the same, no update needed:', updatedAttributes);
    }
  }

  // Trigger a refresh event for any listeners
  eventDispatcher.emit("component:refresh");
}