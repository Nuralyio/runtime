// Filename: update-component-name.ts

import { $components } from "@shared/redux/store/component/store.ts";
import type { ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { eventDispatcher } from "../../../utils/change-detection.ts";
import { updateComponentHandler } from "@shared/redux/handlers/components/update-component.handler.ts";
import deepEqual from "fast-deep-equal"; // Import fast-deep-equal for deep comparison
import { $pages, refreshPageStoreVar } from "@shared/redux/store/page.ts";
import { setVar } from "@shared/redux/store/context.ts";
import { ExecuteInstance } from "@runtime/Kernel.ts";

export function updateComponentName(
  application_id: string,
  componentId: string,
  updatedName: string,
  save = true
) {

  
  // Retrieve the global components store
  const componentsStore = $components.get();
  const applicationComponents = componentsStore[application_id] || [];
  const componentIndex = applicationComponents.findIndex(
    (component: ComponentElement) => component.uuid === componentId
  );

  if (componentIndex !== -1) {
    const componentToUpdate = applicationComponents[componentIndex];

    // Get the current name (if any) of the component
    const currentName: string = componentToUpdate.name || "";

    // Determine if an update is necessary by comparing the current and updated names
    if (!deepEqual(currentName, updatedName)) {
      // Update the component name
      componentToUpdate.name = updatedName;

      // Directly update the component in the store
      $components.setKey(`${application_id}[${componentIndex}]`, componentToUpdate);

      // Optionally save the update to persistent store / DB
      if (save) {
        setTimeout(() => {
          updateComponentHandler(componentToUpdate, application_id);
        }, 0);
      }
    } else {
      // No update needed, log a message or handle accordingly
      // console.log('Name is the same, no update needed:', updatedName);
    }
  }

  const pagesStore = $pages.get()
    Object.keys(pagesStore).forEach((key) => {
    setVar(key, `${key}.appPages`, pagesStore[key]);
        ExecuteInstance.VarsProxy[`${key}.appPages`] = [...pagesStore[key]];

    });

  // Trigger a refresh event for any listeners
 eventDispatcher.emit("component:updated");
 refreshPageStoreVar()
}