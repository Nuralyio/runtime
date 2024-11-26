import { $components } from "$store/component/store.ts";
import type { ComponentElement } from "$store/component/interface.ts";
import { updateComponentHandler } from "$store/handlers/components/update-component.handler.ts";
import { deleteComponentActionHandler } from "$store/handlers/components/delete-component.handler.ts";
import { eventDispatcher } from "../../../utils/change-detection.ts";
import { removeComponentToCurrentPageAction } from "$store/actions/page/removeComponentToCurrentPageAction.ts";

export async function deleteComponentAction(componentId: string, applicationId: string) {
  const components = $components.get()[applicationId];

  const componentToDelete = components.find(
    (component: ComponentElement) => component.uuid === componentId
  );
  if (componentToDelete) {
    if (componentToDelete.root) {
      removeComponentToCurrentPageAction(componentId);
    } else {
      // Traverse all components and remove the componentId from their childrenIds arrays
      components.forEach((component) => {
        if (component.childrenIds) {
          const originalChildrenIds = [...component.childrenIds];
          component.childrenIds = component.childrenIds.filter(
            (childId) => childId !== componentId
          );

          // If the componentId was removed, dispatch the handler
          if (originalChildrenIds.length !== component.childrenIds.length) {
            updateComponentHandler(component, applicationId);  // Dispatch the handler
          }
        }
      });

      // Save the updated components to the store
      $components.set({
        ...$components.get(),
        [applicationId]: components
      });
    }

    // Remove the component from the components store
    $components.set({
      ...$components.get(),
      [applicationId]: components.filter(
        (component: ComponentElement) => component.uuid !== componentId
      )
    });
    await deleteComponentActionHandler(componentId);
    eventDispatcher.emit("component:refresh");
  }
}