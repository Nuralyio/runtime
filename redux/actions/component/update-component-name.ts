// Filename: update-component-name.ts

import { $components } from '../../store/component/store.ts';
import type { ComponentElement } from '../../store/component/component.interface.ts';
import { eventDispatcher } from "../../../utils/change-detection.ts";
import { updateComponentHandler } from '../../handlers/components/update-component.handler.ts';
import deepEqual from "fast-deep-equal"; // Import fast-deep-equal for deep comparison
import { $pages, refreshPageStoreVar } from '../../store/page.ts';
import { setVar } from '../../store/context.ts';
import { ExecuteInstance } from '../../../state/runtime-context';

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
      // Note: deepMap.setKey doesn't support array index notation, so we update the entire array
      const updatedComponents = [...applicationComponents];
      updatedComponents[componentIndex] = componentToUpdate;
      $components.setKey(application_id, updatedComponents);

      // Optionally save the update to persistent store / DB
      if (save) {
        setTimeout(() => {
          updateComponentHandler(componentToUpdate, application_id);
        }, 0);
      }

      // Update pages store
      const pagesStore = $pages.get()
      Object.keys(pagesStore).forEach((key) => {
        setVar(key, `${key}.appPages`, pagesStore[key]);
        ExecuteInstance.VarsProxy[`${key}.appPages`] = [...pagesStore[key]];
      });

      // Trigger a refresh event for any listeners - ONLY when actual update occurred
      eventDispatcher.emit("component:updated", { uuid: componentId });
      refreshPageStoreVar()
    } else {
      // No update needed, log a message or handle accordingly
      // console.log('Name is the same, no update needed:', updatedName);
    }
  }
}