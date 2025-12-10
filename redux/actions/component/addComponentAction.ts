import { $components, type ComponentStore } from '../../store/component/store';
import { type ComponentElement, ComponentType } from '../../store/component/component.interface';
import { v4 as uuidv4 } from "uuid";
import { addComponentHandler } from '../../handlers/components/add-component.handler';

import { addComponentToCurrentPageAction } from './addComponentToCurrentPageAction';
import { updateComponentHandler } from '../../handlers/components/update-component.handler';
import { eventDispatcher } from '../../../utils/change-detection'; // Ensure this handler is imported
import { ExecuteInstance } from '../../../state/runtime-context';

/** Actions*/
export const addComponentAction = (
  component: any,
  pageUUID: string, // page uuid
  currentApplicationId: string,
  updateParent = true
) => {
  const currentComponentId = ExecuteInstance.Vars.selectedComponents?.[0]?.uuid;
  const componentsStore: ComponentStore = $components.get();
  const components: ComponentElement[] = componentsStore[currentApplicationId] || [];

  const currentComponent = components.find((comp) => comp.uuid === currentComponentId);
  const componentId = component.uuid ??  uuidv4();
  const newComponent: ComponentElement = {
    ...component,
    uuid:componentId,
    pageId: pageUUID,
    application_id: currentApplicationId,
    childrenIds: component.childrenIds ?? [], // Initialize childrenIds if necessary
  };

  if (
    !currentComponentId ||
    (currentComponent?.component_type !== ComponentType.Container &&
      currentComponent?.component_type !== ComponentType.Collection&&
      currentComponent?.component_type !== ComponentType.Link)
  ) {
    newComponent.root = true;
  }

  if (currentComponentId) {
    if (
      currentComponent?.component_type === ComponentType.Container ||
      currentComponent?.component_type === ComponentType.Dropdown ||
      currentComponent?.component_type === ComponentType.Link ||
      currentComponent?.component_type === ComponentType.Collection
    ) {
      // Add as child of the current component
      //addComponentAsChildOf(componentId, currentComponentId, currentApplicationId);
      // Update parent component's childrenIds
      if (updateParent) {
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