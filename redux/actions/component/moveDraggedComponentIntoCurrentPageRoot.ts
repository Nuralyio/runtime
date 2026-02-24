export function moveDraggedComponentIntoCurrentPageRoot(
  draggedComponentId: string
) {
  /*
    let components: ComponentStore = $components.get();
    // Find the component to be moved (draggedComponent) and the target component (dropInComponent).
    let draggedComponent: ComponentElement | undefined;
    let parentDraggedComponent: ComponentElement | undefined;

    // Find draggedComponent and dropInComponent in the root array and within children.
    function findComponentsRecursively(component: ComponentElement) {

      if (component.uuid === draggedComponentId) {
        draggedComponent = component;
      }
      parentDraggedComponent = components.find((c) => c.children_ids?.includes(draggedComponentId));
      if (!draggedComponent) {
        // If both components are not found yet, continue searching in children.
        if (component.children_ids) {
          for (const childId of component.children_ids) {
            const child = components.find((c) => c.uuid === childId);
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

    // If both components are found, update their relationship.
    if (draggedComponent) {


      addComponentToCurrentPageAction(draggedComponentId);

      if (parentDraggedComponent && parentDraggedComponent.children_ids) {
        parentDraggedComponent.children_ids = parentDraggedComponent.children_ids.filter(
          (childId) => childId !== draggedComponentId
        );
      }
    }
    $components.set([...components]);
    */
}