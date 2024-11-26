import type { ComponentElement } from "$store/component/interface.ts";
import { $components } from "$store/component/component-sotre.ts";
import { $currentPageId, $pages } from "$store/page.ts";
import type { PageElement } from "$store/handlers/pages/interfaces/interface.ts";

export function moveDraggedComponent(
  dropInComponentId: string,
  draggedComponentId: string
) {
  const components: ComponentElement[] = $components.get();

  // Find the dragged component and its parent (if it's a child component)
  let draggedComponent: ComponentElement | undefined;
  let parentDraggedComponent: ComponentElement | undefined;
  parentDraggedComponent = components.find((c) => c.childrenIds?.includes(draggedComponentId));

  // Find the draggedComponent and parentDraggedComponent in the root array and within children.
  function findComponentsRecursively(component: ComponentElement) {
    if (component.uuid === draggedComponentId) {
      draggedComponent = component;
    }
    if (!draggedComponent || !parentDraggedComponent) {
      // If both components are not found yet, continue searching in children.
      if (component.childrenIds) {
        for (const childId of component.childrenIds) {
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
  if (draggedComponent && draggedComponent.uuid !== dropInComponentId) {
    // Check if draggedComponent is already in the components list.
    const isDraggedComponentInList = components.some(
      (component) => component.uuid === draggedComponentId
    );

    if (!isDraggedComponentInList) {
      // If it's not in the list, add it.
      components.push(draggedComponent);
    }

    // Find the index of the dropInComponent in the main page.
    const pageIndex = $pages.get().findIndex(
      (page: PageElement) => page.uuid === $currentPageId.get()
    );
    if (pageIndex >= 0) {
      const page = $pages.get()[pageIndex];
      const dropInComponentIndex = page.component_ids.findIndex(
        (componentId: string) => componentId === dropInComponentId
      );

      // Remove draggedComponent from its previous parent (if any).
      if (parentDraggedComponent && parentDraggedComponent.childrenIds) {
        parentDraggedComponent.childrenIds = parentDraggedComponent.childrenIds.filter(
          (childId) => childId !== draggedComponentId
        );
      }

      // If dropInComponent is in the main page, update its position.
      if (dropInComponentIndex >= 0) {
        // Insert draggedComponent at the same level as dropInComponent.
        page.component_ids.splice(
          dropInComponentIndex,
          0,
          draggedComponentId
        );
      } else {
        // If dropInComponent is not in the main page, it means it's a child component.
        // Add draggedComponent at the same level as dropInComponent.
        const parentDropInComponentId = parentDraggedComponent?.uuid;

        if (parentDropInComponentId) {
          const parentDropInComponent = components.find(
            (component) => component.uuid === parentDropInComponentId
          );

          if (parentDropInComponent && parentDropInComponent.childrenIds) {
            const dropInComponentPosition = parentDropInComponent.childrenIds.findIndex(
              (childId) => childId === dropInComponentId
            );

            if (dropInComponentPosition >= 0) {
              parentDropInComponent.childrenIds.splice(
                dropInComponentPosition,
                0,
                draggedComponentId
              );
            }
          }
        }
      }

      // Set the updated components list and pages.
      $components.set([...components]);
      $pages.set([...$pages.get()]);
    }
  }
}