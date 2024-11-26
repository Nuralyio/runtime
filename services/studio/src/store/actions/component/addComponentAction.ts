import type { AddComponentAction } from "$store/interfaces/component.interfaces.ts";
import { getVar } from "$store/context.ts";
import { $components } from "$store/component/store.ts";
import { type ComponentElement, ComponentType } from "$store/component/interface.ts";
import { v4 as uuidv4 } from "uuid";
import { addComponentHandler } from "$store/handlers/components/add-component.handler.ts";

import { addComponentAsChildOf } from "$store/actions/component/addComponentAsChildOf.ts";
import { addComponentToCurrentPageAction } from "$store/actions/component/addComponentToCurrentPageAction.ts";

/** Actions*/
export const addComponentAction = (component: AddComponentAction, uuid: string/* page uuid */, currentApplicatinId) => {
  const currentComponentId = getVar("global", "selectedComponents")?.value[0];
  const currentComponent = $components.get()[currentApplicatinId].find((component: ComponentElement) => component.uuid === currentComponentId);
  const componentId = uuidv4();
  const newComponent = {
    ...component,
    uuid: componentId,
    pageId: uuid,
    applicationId: currentApplicatinId

  } as ComponentElement;
  if (!currentComponentId || (currentComponent?.component_type != ComponentType.VerticalContainer && currentComponent?.component_type != ComponentType.Collection)) {
    newComponent.root = true;
  }

  // Add component to the application's components
  $components.set({
    ...$components.get(),
    [currentApplicatinId]: [
      ...($components.get()[currentApplicatinId] || []), newComponent

    ]
  });


  if (currentComponentId) {
    // or ComponentType.Collection
    if (currentComponent?.component_type === ComponentType.VerticalContainer || currentComponent?.component_type === ComponentType.Collection) {
      addComponentAsChildOf(componentId, currentComponentId, currentApplicatinId);
    } else {
      addComponentToCurrentPageAction(componentId);
    }
  } else {
    addComponentToCurrentPageAction(componentId);
  }

  setTimeout(() => {
    addComponentHandler({ component: newComponent }, currentApplicatinId);
  }, 0);
};