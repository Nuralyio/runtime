import { $components } from "$store/component/store.ts";
import type { ComponentElement } from "$store/component/interface.ts";
import { eventDispatcher } from "../../../utils/change-detection.ts";
import { updateComponentHandler } from "$store/handlers/components/update-component.handler.ts";
import type { UpdateType } from "$store/actions/component.ts";

export function updateComponentAttributes(
  applicationId: string,
  componentId: string,
  updateType: UpdateType,
  updatedAttributes: any,
  save = true
) {
  //console.time("updateComponentAttributesExecutionTime"); // Start the timer
  //console.log("updateComponentAttributes", applicationId, componentId, updateType, updatedAttributes, save);
  const componentsStore = $components.get();
  const applicationComponents = componentsStore[applicationId] || [];
  const componentIndex = applicationComponents.findIndex(
    (component: ComponentElement) => component.uuid === componentId
  );

  if (componentIndex !== -1) {
    const componentToUpdate = applicationComponents[componentIndex];

    // Get the current attributes of the specified type
    const currentAttributes = componentToUpdate[updateType] || {};

    // Check deep equality between current and updated attributes
    const needsUpdate = JSON.stringify(currentAttributes) !== JSON.stringify(updatedAttributes);

    if (needsUpdate) {
      // Update the specified attribute of the component
      componentToUpdate[updateType] = {
        ...currentAttributes,
        ...updatedAttributes
      };

      // Directly update the component in the store
      $components.setKey(`${applicationId}[${componentIndex}]`, componentToUpdate);



      if (save) {
        setTimeout(() => {
          updateComponentHandler(componentToUpdate, applicationId);
        }, 0);
      }
    } else {
      // console.log('Attributes are the same, no update needed.', updatedAttributes);
    }
  }
  eventDispatcher.emit("component:refresh");
  // console.timeEnd("updateComponentAttributesExecutionTime"); // End the timer and log the execution time
}