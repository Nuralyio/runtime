import type { AddComponentAction } from "$store/interfaces/component.interfaces.ts";
import { getVar } from "$store/context.ts";
import { $components } from "$store/component/store.ts";
import { type ComponentElement, ComponentType, type ComponentStore } from "$store/component/interface.ts";
import { v4 as uuidv4 } from "uuid";
import { addComponentHandler } from "$store/handlers/components/add-component.handler.ts";

import { addComponentAsChildOf } from "$store/actions/component/addComponentAsChildOf.ts";
import { addComponentToCurrentPageAction } from "$store/actions/component/addComponentToCurrentPageAction.ts";
import { updateComponentHandler } from "$store/handlers/components/update-component.handler.ts";
import { eventDispatcher } from "@utils/change-detection.ts"; // Ensure this handler is imported

/** Actions*/
export const addComponentAction = (
  component: AddComponentAction,
  uuid: string, // page uuid
  currentApplicationId: string
) => {
  const currentComponentId = getVar("global", "selectedComponents")?.value[0];
  const componentsStore: ComponentStore = $components.get();
  const components: ComponentElement[] = componentsStore[currentApplicationId] || [];

  const currentComponent = components.find((comp) => comp.uuid === currentComponentId);
  const componentId = uuidv4();
  const newComponent: ComponentElement = {
    ...component,
    uuid: componentId,
    pageId: uuid,
    application_id: currentApplicationId,
    childrenIds: [], // Initialize childrenIds if necessary
  };

  if (
    !currentComponentId ||
    (currentComponent?.component_type !== ComponentType.Container &&
      currentComponent?.component_type !== ComponentType.Collection)
  ) {
    newComponent.root = true;
  }

  if (currentComponentId) {
    if (
      currentComponent?.component_type === ComponentType.Container ||
      currentComponent?.component_type === ComponentType.Collection
    ) {
      // Add as child of the current component
      //addComponentAsChildOf(componentId, currentComponentId, currentApplicationId);
        // Update parent component's childrenIds
      const parentComponent = components.find((comp) => comp.uuid === currentComponentId);
      if (parentComponent) {
        if (!parentComponent.childrenIds) {
          parentComponent.childrenIds = [];
        }
        parentComponent.childrenIds.push(componentId);

        // Update the components store with the modified parent component
        componentsStore[currentApplicationId] = components.map((comp) =>
          comp.uuid === currentComponentId ? parentComponent : comp
        );

        // Persist the updated parent component
        setTimeout(() => {
          updateComponentHandler(parentComponent, currentApplicationId);
        }, 0);
      }
    } else {
      // If the current component is not a container or collection, add to current page
      addComponentToCurrentPageAction(componentId);
    }
  } else {
    // If no current component is selected, add to the current page
    addComponentToCurrentPageAction(componentId);
  }

  // Add the new component to the store
  componentsStore[currentApplicationId] = [...components, newComponent];
  $components.set(componentsStore);

  // Handle any additional logic after adding the component
  setTimeout(() => {
    addComponentHandler({ component: newComponent }, currentApplicationId);
  }, 10);

  eventDispatcher.emit("component:refresh");
};