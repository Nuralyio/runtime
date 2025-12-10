import { $components, type ComponentStore } from '../../store/component/store';
import type { ComponentElement } from '../../store/component/component.interface';
import { updateComponentHandler } from '../../handlers/components/update-component.handler';

export function addComponentAsChildOf(componentId: string, parentComponentId: string, application_id: string) {
  const componentsStore: ComponentStore = $components.get();
  const components: ComponentElement[] = componentsStore[application_id] || [];

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
      updateComponentHandler(parentComponent, application_id);
    }, 0);
    // Update the components store
    componentsStore[application_id] = [...components];
    $components.set(componentsStore);
  } else {
    console.error(`Parent component with ID ${parentComponentId} not found.`);
  }
}