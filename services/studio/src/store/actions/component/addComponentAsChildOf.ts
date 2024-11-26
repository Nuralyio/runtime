import { $components, type ComponentStore } from "$store/component/store.ts";
import type { ComponentElement } from "$store/component/interface.ts";
import { updateComponentHandler } from "$store/handlers/components/update-component.handler.ts";

export function addComponentAsChildOf(componentId: string, parentComponentId: string, applicationId: string) {
  const componentsStore: ComponentStore = $components.get();
  const components: ComponentElement[] = componentsStore[applicationId] || [];

  // Find the parent component
  const parentComponent = components.find((component) => component.uuid === parentComponentId);

  if (parentComponent) {
    // Ensure the parent component has a childrenIds array
    if (!parentComponent.childrenIds) {
      parentComponent.childrenIds = [];
    }

    // Add the new component ID to the parent's childrenIds array
    parentComponent.childrenIds.push(componentId);
    setTimeout(() => {
      updateComponentHandler(parentComponent, applicationId);
    }, 0);
    // Update the components store
    componentsStore[applicationId] = [...components];
    $components.set(componentsStore);
  } else {
    console.error(`Parent component with ID ${parentComponentId} not found.`);
  }
}