import type { ComponentElement } from '../../store/component/component.interface';
import { $components } from '../../store/component/store';

import { removeComponentToCurrentPageAction } from '../page/removeComponentToCurrentPageAction';

export function moveDraggedComponentInside(
  dropInComponentId: string,
  draggedComponentId: string
) {
  let components: ComponentElement[] = $components.get();
  // Find the component to be moved (draggedComponent) and the target component (dropInComponent).
  let draggedComponent: ComponentElement | undefined;
  let parentDraggedComponent: ComponentElement | undefined;
  let dropInComponent: ComponentElement | undefined;

  // Find draggedComponent and dropInComponent in the root array and within children.
  function findComponentsRecursively(component: ComponentElement) {
    if (component.uuid === draggedComponentId) {
      draggedComponent = component;
    }
    if (component.uuid === dropInComponentId) {
      dropInComponent = component;
    }
    parentDraggedComponent = components.find((c) => c.children_ids?.includes(draggedComponentId));
    if (!draggedComponent || !dropInComponent) {
      // If both components are not found yet, continue searching in children.
      if (component.children_ids) {
        for (const childId of component.children_ids) {
          const child = components.find((c) => c.id === childId);
          if (child) {
            findComponentsRecursively(child);
          }
        }
      }
    }
  }

  // Start the recursive search.
  for (const component of components) {
    findComponentsRecursively(component);
  }

  // If both components are found and they are not the same, and draggedComponent is not already in dropInComponent, update their relationship.
  if (draggedComponent && dropInComponent && draggedComponent !== dropInComponent) {
    if (!dropInComponent.children_ids) {
      dropInComponent.children_ids = [];
    }

    // Check if draggedComponent is not already in dropInComponent.
    if (!dropInComponent.children_ids.includes(draggedComponentId)) {
      dropInComponent.children_ids.push(draggedComponentId);

      removeComponentToCurrentPageAction(draggedComponentId);

      if (parentDraggedComponent && parentDraggedComponent.children_ids) {
        parentDraggedComponent.children_ids = parentDraggedComponent.children_ids.filter(
          (childId) => childId !== draggedComponentId
        );
      }

      $components.set([...components]);
    }
  }
}